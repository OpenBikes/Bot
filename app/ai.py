import os
import json

import apiai

from app import config


ai = apiai.ApiAI(config.APIAI_CLIENT_ACCESS_TOKEN)


def get_ai_response(sender_id, text_received):
    request = ai.text_request()
    request.lang = 'fr'
    request.session_id = sender_id
    request.query = text_received
    bytes_response = request.getresponse()
    response = json.loads(bytes_response.read().decode('utf-8'))
    return response


def has_kind_value(payload):
    try:
        _ = payload['result']['parameters']['kind']
        return True
    except:
        return False
