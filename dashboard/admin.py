from django.contrib import admin
from .models import Sound

admin.site.register(Sound)

from .models import Playlist
admin.site.register(Playlist)
