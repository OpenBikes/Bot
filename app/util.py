import math
import pickle

from motionless import DecoratedMap, LatLonMarker
from app import config


def update_broker_record(broker, recipient_id, key, value):
    user_data = pickle.loads(broker.get(recipient_id))
    user_data[key] = value
    broker.setex(recipient_id, pickle.dumps(user_data), config.EXPIRATION_TIME)
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


def _toRad(x):
    return x * math.pi / 180


def haversine(lon1, lat1, lon2, lat2):
    dlat = _toRad(lat2 - lat1)
    dlon = _toRad(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(_toRad(lat1)) * \
        math.cos(_toRad(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    return 12742 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def format_haversine_dist(dist):
    return '{}m'.format(round(dist * 1000)) if dist < 1 else '{}km'.format(round(dist, 1))
