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
from app import util
from app import config


FB_VERIFY_TOKEN = config.FB_VERIFY_TOKEN

broker = redis.Redis(
    host=config.REDIS_HOST,
    port=config.REDIS_PORT
)

bot = Bot(config.FB_ACCESS_TOKEN)


@app.route('/', methods=['GET'])
def verify():
    # When the endpoint is registered as a webhook, it must echo back
    # the 'hub.challenge' value it receives in the query arguments
    if request.args.get('hub.mode') == 'subscribe' and request.args.get('hub.challenge'):
        if not request.args.get('hub.verify_token') == FB_VERIFY_TOKEN:
            return 'Verification token mismatch', 403
        return request.args['hub.challenge'], 200

    return 'Valid authentification', 200


@app.route('/', methods=['POST'])
def webhook():

    # Processing incoming messaging events
    data = request.get_json()
    print(data)  # you may not want to log every incoming message in
    # production, but it's good for testing

    if data['object'] == 'page':

        for entry in data['entry']:
            for messaging_event in entry['messaging']:

                if messaging_event.get('message'):
                    # The facebook ID of the person sending you the message
                    sender_id = messaging_event['sender']['id']

                    # Is user already known ?
                    if not broker.get(sender_id):
                        print('not known')

                        broker.set(
                            sender_id,
                            pickle.dumps(
                                dict(city_slug=None, city_name=None,
                                     kind=None, date=None, location=None)
                            )
                        )
                    else:
                        print('already known')

                    # Someone sent us his location
                    if bot.has_location_payload(messaging_event):
                        coordinates = bot.get_location_payload(messaging_event)
                        closest_city = obpy.get_closest_city(
                            coordinates['lat'], coordinates['long']).json()
                        bot.send_fb_msg(sender_id, 'Vous êtes à {} 🏢'.format(closest_city['name']))

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
                        qr_payload = bot.get_quick_reply(messaging_event)
                        if qr_payload['payload'] == 'now':
                            moment = dt.datetime.now() + dt.timedelta(minutes=5)
                            util.update_broker_record(broker, sender_id, 'date', moment)
                        elif qr_payload['payload'] == '15_minutes':
                            moment = dt.datetime.now() + dt.timedelta(minutes=15)
                            util.update_broker_record(broker, sender_id, 'date', moment)
                        else:
                            action = qr_payload['payload']
                            util.update_broker_record(broker, sender_id, 'kind', action)

                    # Someone sent us a message
                    if not bot.has_location_payload(messaging_event) and not bot.has_quick_reply(messaging_event):

                        # The recipient's ID, which should be your page's facebook ID
                        recipient_id = messaging_event['recipient']['id']
                        # The message's text
                        message_text = messaging_event['message'].get('text')

                        if message_text == 'reset':
                            broker.delete(sender_id)

                        else:
                            ai_response = ai.get_ai_response(sender_id, message_text)
                            if ai_response['status']['code'] != 200:
                                print("Je crains ne pas avoir compris ce que vous vouliez dire.")
                            elif ai_response['result'].get('parameters', {}).get('welcome'):
                                fullname = bot.get_user_fullname(sender_id)
                                bot.send_fb_msg(sender_id, 'Hey ! Salut {} :)'.format(fullname['first_name']))
                            else:
                                bot_response = ai_response['result']['fulfillment']['speech']

                                bot.send_fb_msg(sender_id, bot_response)

                                if ai.has_kind_value(ai_response):
                                    action = ai_response['result']['parameters']['kind']
                                    util.update_broker_record(broker, sender_id, 'kind', action)

                    if broker.get(sender_id):

                        user_data = pickle.loads(broker.get(sender_id))

                        if not user_data['kind']:
                            bot.send_kind_msg(sender_id)
                        elif not user_data['city_slug'] or not user_data['location']:
                            bot.send_location_msg(sender_id)
                        elif not user_data['date']:
                            bot.send_moment_msg(sender_id)
                        elif not util.dict_has_none_values(user_data):
                            bot.send_fb_msg(
                                sender_id, "J'ai tout ce qu'il me faut, je vais trouver la station la plus proche...")

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

                                station_cards.append({
                                    'title': station['name'],
                                    'subtitle': '{city} - Prédiction :{pred}'.format(city=user_data['city_name'], pred=pred),
                                    'image_url': util.generate_map_url(lat=station['latitude'], lon=station['longitude']),
                                    'buttons': [{
                                        'type': 'web_url',
                                        'url': url,
                                        'title': 'Go !'
                                    }],
                                })

                            bot.send_card_msg(sender_id, station_cards)

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
