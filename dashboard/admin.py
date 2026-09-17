from django.contrib import admin
from .models import Sound, Playlist

@admin.register(Sound)
class SoundAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'user')
    list_filter = ('user',)
    search_fields = ('name',)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_default')
    list_filter = ('user', 'is_default')
    search_fields = ('name',)
