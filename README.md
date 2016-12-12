<div align="center">
  <img src="misc/messenger_code.jpg" alt="obpy_messenger_code" width="20%"/>
</div>

# OBot
:bell: Facebook Messenger Bot

Bot developed in **python** and `Flask` the minimalist web framework.
OBot's work is to help users to make a trip with sharing bikes. He can advise users while they want to pick up a bike or when they want to drop a bike off.


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