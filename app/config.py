import os

# Flask settings
# Secret key for generating tokens
SECRET_KEY = 'd0a3bc38-be11-11e6-a98e-ac293aa0f972'
# DEBUG has to be False in production for security reasons
DEBUG = True

# Broker settings
EXPIRATION_TIME = 2 * 60
REDIS_HOST = os.environ.get('__BROKER_HOST__', 'localhost')
REDIS_PORT = os.environ.get('__BROKER_PORT__', '6379')

# Credentials
# API AI
APIAI_CLIENT_ACCESS_TOKEN = os.environ.get('APIAI_CLIENT_ACCESS_TOKEN')

# FB GRAPH API
FB_ACCESS_TOKEN = os.environ.get('FB_ACCESS_TOKEN')
FB_VERIFY_TOKEN = os.environ.get('FB_VERIFY_TOKEN')
FB_GRAPH_API_VERSION = 2.6
