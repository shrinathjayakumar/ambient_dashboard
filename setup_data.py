import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ambient_dashboard.settings')
django.setup()

from dashboard.models import Sound

sounds = [
    {"name": "Rain", "icon": "🌧", "audio_url": "https://actions.google.com/sounds/v1/water/rain.ogg"},
    {"name": "Thunder", "icon": "⚡", "audio_url": "https://actions.google.com/sounds/v1/weather/thunder_crack.ogg"},
    {"name": "Forest", "icon": "🌲", "audio_url": "https://actions.google.com/sounds/v1/water/stream_and_birds.ogg"},
    {"name": "Train", "icon": "🚂", "audio_url": "https://actions.google.com/sounds/v1/transportation/train_pass_by.ogg"},
    {"name": "Wind", "icon": "💨", "audio_url": "https://actions.google.com/sounds/v1/weather/wind_howl.ogg"}
]

for s in sounds:
    Sound.objects.get_or_create(**s)

print("Added sounds!")
