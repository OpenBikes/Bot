import random


def welcome_sentence(user_fullname):
    sentences = [
        'Hey ! Salut {} :)'.format(user_fullname),
        'Bonjour {} :)'.format(user_fullname),
        'Yo {} :)'.format(user_fullname),
        'Hello {} :)'.format(user_fullname)
    ]
    return random.choice(sentences)


def share_location_sentence():
    sentences = [
        'Pouvez-vous me partager votre localisation ?',
        'Veuillez partager votre localisation :',
        'J\'ai besoin de savoir ou vous êtes pour trouver les stations les plus proches de vous :)'
    ]
    return random.choice(sentences)


def select_action_sentence():
    sentences = [
        'Comment puis-je vous aider ?',
        'Que puis-je faire pour vous ?',
        'Que voulez-vous faire ?'
    ]
    return random.choice(sentences)


def ask_when_sentence():
    sentences = [
        'Dans combien de temps voulez-vous partir ?',
        'Vous partez quand ?'
    ]
    return random.choice(sentences)
