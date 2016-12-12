import pickle

from motionless import DecoratedMap, LatLonMarker
from app import config


def update_broker_record(broker, recipient_id, key, value):
    user_data = pickle.loads(broker.get(recipient_id))
    user_data[key] = value
    broker.set(recipient_id, pickle.dumps(user_data))
    # broker.expire(sender_id, config.EXPIRATION_TIME)
    print(user_data)


def generate_map_url(lat, lon):
    dmap = DecoratedMap()
    dmap.add_marker(LatLonMarker(lat=lat, lon=lon))
    return dmap.generate_url()


def generate_maps_link(source_lat, source_lon, dest_lat, dest_lon):
    return 'http://maps.google.com/maps?saddr={source_lat},{source_lon}&daddr={dest_lat},{dest_lon}&directionsmode=walking'.format(
        source_lat=source_lat,
        source_lon=source_lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon
    )


def dict_has_none_values(d):
    for _, value in d.items():
        if value is None:
            return True
    return False
