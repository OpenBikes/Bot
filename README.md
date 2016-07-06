# OBot
:bell: Facebook Messenger Bot

Bot developed in **node.js** and `express` the minimalist web framework.
OBot's work is to help users to make a trip with sharing bikes. He can advise users while they want to pick up a bike or when they want to drop a bike off.

![obot](obot.png)


## Docker

Build container :
```sh
docker build --rm -t obot/dev -f Dockerfile .
```

Run container :
```sh
docker run -i -t obot/dev
```