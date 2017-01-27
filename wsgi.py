import sys, os, logging
logging.basicConfig(stream=sys.stderr)

sys.path.insert(0, '/var/www/obot')
os.chdir('/var/www/obot')

from app import app

application = app

if __name__ == "__main__":
        application.run()
