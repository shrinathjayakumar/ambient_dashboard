import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ambient_dashboard.settings')
django.setup()
from dashboard.models import Sound

updates = {
    "Thunder": "https://www.youtube.com/watch?v=gVKEM4K8J8A",
    "Forest": "https://www.youtube.com/watch?v=29XymHesxa0",
    "Train": "https://www.youtube.com/watch?v=en5alw6jmRA",
    "Wind": "https://www.youtube.com/watch?v=vplX-qr4AIE"
}

for name, url in updates.items():
    try:
        sound = Sound.objects.get(name=name)
        sound.audio_url = url
        sound.save()
        print(f"Updated {name}")
    except Sound.DoesNotExist:
        print(f"Sound {name} not found")

print("Finished updating sounds.")
