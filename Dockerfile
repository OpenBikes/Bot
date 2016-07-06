# Dockerfile to build obnode container

FROM node:4.2.1
MAINTAINER Axel Bellec

ENV NODE_ENV development

# default port defined in ./app/config/index.js
EXPOSE 3000
