import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ambient_dashboard.settings')
django.setup()
from dashboard.models import Sound

rain_sound = Sound.objects.get(name="Rain")
rain_sound.audio_url = "https://www.youtube.com/watch?v=eTeD8DAta4c"
rain_sound.save()

print("Updated Rain sound to YouTube URL.")
