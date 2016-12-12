FROM ubuntu:16.04
MAINTAINER Team Seeding

# Supervisor installation
RUN apt-get update && apt-get install -y openssh-server apache2 supervisor
RUN apt-get -y install python-pip && apt-get -y install git

# Python requirements
COPY setup/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

CMD ["bash"]