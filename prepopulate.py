import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ambient_dashboard.settings')
django.setup()

from dashboard.models import Theme, Sound, Playlist
from django.contrib.auth.models import User

# Create themes
themes = [
    {'name': 'Midnight Teal', 'css_class': 'midnight', 'background_color_hex': '#0B1117'},
    {'name': 'Forest Sage', 'css_class': 'forest', 'background_color_hex': '#0B1210'},
    {'name': 'Storm Ocean', 'css_class': 'storm', 'background_color_hex': '#07141D'},
]

users = User.objects.all()

for t in themes:
    theme, created = Theme.objects.get_or_create(css_class=t['css_class'], defaults=t)
    if not created:
        theme.name = t['name']
        theme.background_color_hex = t['background_color_hex']
        theme.save()
    for u in users:
        theme.allowed_users.add(u)

for s in Sound.objects.all():
    for u in users:
        s.allowed_users.add(u)

for p in Playlist.objects.all():
    for u in users:
        p.allowed_users.add(u)

print('Prepopulated themes and granted access to existing items.')

