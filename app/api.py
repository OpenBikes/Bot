import json
import os
import pickle

from flask import Blueprint, jsonify, request
import apiai
import datetime as dt
import obpy
import redis
import uuid

from app import app
from app import ai
from app.bot import Bot
from app import config
from app import logging
from app import util
from app import NAMESPACE
from app import conversation as conv

FB_VERIFY_TOKEN = config.FB_VERIFY_TOKEN

broker = redis.Redis(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT
)

bot = Bot(config.FB_ACCESS_TOKEN)

log = logging.tracer(NAMESPACE)


@app.route('/ping', methods=['GET'])
def ping():
    return jsonify({'ping': 'pong'}), 200


@app.route('/', methods=['GET'])
def verify():
    # When the endpoint is registered as a webhook, it must echo back
    # the 'hub.challenge' value it receives in the query arguments
    if request.args.get('hub.mode') == 'subscribe' and request.args.get('hub.challenge'):
        if not request.args.get('hub.verify_token') == FB_VERIFY_TOKEN:
            log.error('verification token mismatch')
            return 'Verification token mismatch', 403
        return request.args['hub.challenge'], 200
    log.info('valid authentification')
    return 'Valid authentification', 200


@app.route('/', methods=['POST'])
def webhook():

    # Processing incoming messaging events
    data = request.get_json()
    log.info('incoming messaging events', data=data)

    if data['object'] == 'page':

        for entry in data['entry']:
            for messaging_event in entry['messaging']:

                if messaging_event.get('message'):
                    # The facebook ID of the person sending you the message
                    sender_id = messaging_event['sender']['id']
                    log.info('sender id', sender_id=sender_id)

                    # Is user already known ?
                    if not broker.get(sender_id):
                        print('not known')

                        broker.set(
                            sender_id,
                            pickle.dumps(
                                dict(city_slug=None, city_name=None,
                                     kind=None, date=None, location=None,
                                     predict=None, conversation_done=None)
                            )
                        )
                    else:
                        print('already known')

                    # Someone sent us his location
                    if bot.has_location_payload(messaging_event):
                        coordinates = bot.get_location_payload(messaging_event)
                        closest_city = obpy.get_closest_city(
                            coordinates['lat'], coordinates['long']).json()
                        bot.send_fb_msg(sender_id, 'Vous êtes à {} 😇'.format(closest_city['name']))

                        util.update_broker_record(
                            broker,
                            sender_id,
                            'city_slug',
                            closest_city['slug']
                        )

                        util.update_broker_record(
                            broker,
                            sender_id,
                            'city_name',
                            closest_city['name']
                        )

                        util.update_broker_record(
                            broker,
                            sender_id,
                            'location',
                            coordinates
                        )

                    if bot.has_quick_reply(messaging_event):
                        quick_reply_text = bot.get_quick_reply(messaging_event)
                        if quick_reply_text == 'Maintenant':
                            moment = dt.datetime.now() + dt.timedelta(minutes=5)
                            util.update_broker_record(broker, sender_id, 'date', moment)
                        elif quick_reply_text == 'Dans 10 min.':
                            moment = dt.datetime.now() + dt.timedelta(minutes=10)
                            util.update_broker_record(broker, sender_id, 'date', moment)
                        elif quick_reply_text == 'Dans 30 min.':
                            moment = dt.datetime.now() + dt.timedelta(minutes=30)
                            util.update_broker_record(broker, sender_id, 'date', moment)
                        else:
                            action = quick_reply_text
                            util.update_broker_record(broker, sender_id, 'kind', action)

                    # Someone sent us a message
                    if not bot.has_location_payload(messaging_event) and not bot.has_quick_reply(messaging_event):

                        # The recipient's ID, which should be your page's facebook ID
                        recipient_id = messaging_event['recipient']['id']
                        # The message's text
                        message_text = messaging_event['message'].get('text')

                        if bot.has_sticker_payload(messaging_event):
                            log.info('user sent a sticker')
                        elif message_text.lower() == 'reset':
                            broker.delete(sender_id)
                        else:
                            ai_response = ai.get_ai_response(sender_id, message_text)
                            if ai_response['status']['code'] != 200:
                                print("Je crains ne pas avoir compris ce que vous vouliez dire.")
                            elif ai_response['result'].get('parameters', {}).get('welcome'):
                                fullname = bot.get_user_fullname(sender_id)

                                welcome_sentence = conv.welcome_sentence(fullname['first_name'])
                                bot.send_fb_msg(sender_id, welcome_sentence)
                            else:
                                bot_response = ai_response['result']['fulfillment']['speech']

                                bot.send_fb_msg(sender_id, bot_response)

                                if ai.has_kind_value(ai_response):
                                    action = ai_response['result']['parameters']['kind']
                                    util.update_broker_record(broker, sender_id, 'kind', action)

                    if broker.get(sender_id):

                        user_data = pickle.loads(broker.get(sender_id))
                        print(user_data)

                        if not user_data['kind']:
                            bot.send_kind_msg(sender_id, msg=conv.select_action_sentence())
                        elif not user_data['city_slug'] or not user_data['location']:

                            bot.send_location_msg(sender_id, msg=conv.share_location_sentence())
                        elif not user_data['date']:
                            bot.send_moment_msg(sender_id, msg=conv.ask_when_sentence())
                        elif not user_data['predict']:
                            bot.send_fb_msg(
                                sender_id,
                                "J'ai tout ce qu'il me faut, je vais trouver les stations les plus proches..."
                            )

                            stations = obpy.get_filtered_stations(
                                limit=3,
                                desired_quantity=1,
                                city_slug=user_data['city_slug'],
                                latitude=user_data['location']['lat'],
                                longitude=user_data['location']['long'],
                                kind='bikes' if user_data['kind'] == 'prendre' else 'spaces',
                                moment=user_data['date'].timestamp()
                            )

                            bot.send_fb_msg(
                                sender_id, "Et voilà ;)")

                            station_cards = []
                            for station in stations.json():
                                forecast = obpy.get_forecast(
                                    city_slug=user_data['city_slug'],
                                    station_slug=station['slug'],
                                    kind='bikes' if user_data['kind'] == 'prendre' else 'spaces',
                                    moment=user_data['date'].timestamp()
                                )
                                pred = forecast.json()[
                                    'predicted'] if forecast.status_code == 200 else ''

                                url = util.generate_maps_link(user_data['location']['lat'], user_data['location'][
                                    'long'], station['latitude'], station['longitude'])

                                haversine_dist = util.haversine(
                                    user_data['location']['lat'],
                                    user_data['location']['long'],
                                    station['latitude'],
                                    station['longitude']
                                )
                                distance = util.format_haversine_dist(haversine_dist)

                                station_cards.append({
                                    'title': station['name'],
                                    'subtitle': '[{distance}] - Prédiction : {pred}'.format(distance=distance, pred=pred),
                                    'image_url': util.generate_map_url(lat=station['latitude'], lon=station['longitude']),
                                    'buttons': [{
                                        'type': 'web_url',
                                        'url': url,
                                        'title': 'Go !'
                                    }],
                                })

                            bot.send_card_msg(sender_id, station_cards)

                            util.update_broker_record(
                                broker,
                                sender_id,
                                'predict',
                                True
                            )

                            util.update_broker_record(
                                broker,
                                sender_id,
                                'conversation_done',
                                False
                            )

                        elif not util.dict_has_none_values(user_data) and not user_data['conversation_done']:
                            bot.send_fb_msg(
                                sender_id,
                                'Bonne route ;)'
                            )

                            util.update_broker_record(
                                broker,
                                sender_id,
                                'conversation_done',
                                True
                            )

                            # Delivery confirmation
                if messaging_event.get('delivery'):
                    pass

                # Optin confirmation
                if messaging_event.get('optin'):
                    pass

                # User clicked 'postback' button in earlier message
                if messaging_event.get('postback'):
                    pass

    return 'ok', 200
