<div align="center">
  <img src="misc/obot.png" alt="logo_obot" width="20%"/>
</div>

# OBot
:bell: Facebook Messenger Bot

Bot developed in **python** and `Flask` the minimalist web framework.
OBot's work is to help users to make a trip with sharing bikes. He can advise users while they want to pick up a bike or when they want to drop a bike off.

## Demo

Sample conversation:

<div align="center">
  <img src="misc/obot_test.gif" alt="demo" width="40%"/>
</div>

## Dependencies
```
pip install -r requirements.txt
```

## Development

```sh
$ docker-compose up -d
$ docker exec -it obot_server_1 bash
```

Then you can launch the app :
```sh
$ python obot/main.py
```

## Running Docker container in production

### Build container

```sh
$ docker build --rm -t obotainer -f Dockerfile .
```

### Run container

```sh
$ docker run -i -t obotainer
```
