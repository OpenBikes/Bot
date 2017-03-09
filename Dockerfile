############################################################
# Dockerfile
############################################################

FROM python:3.5

MAINTAINER Axel Bellec

# Get the pip packages and clean up
COPY requirements.txt /tmp/requirements.txt
RUN pip install requests
RUN pip install -r /tmp/requirements.txt && rm -rf /root/.cache/pip/*

COPY . /obot

CMD ["python", "obot/main.py"]
