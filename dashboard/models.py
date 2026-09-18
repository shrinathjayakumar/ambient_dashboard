from django.db import models
from django.contrib.auth.models import User

class Theme(models.Model):
    name = models.CharField(max_length=100)
    css_class = models.CharField(max_length=50, unique=True, help_text="e.g. 'midnight', 'forest', 'storm'")
    background_color_hex = models.CharField(max_length=20, default="#0B1117", help_text="Used for the dropdown option background")
    allowed_users = models.ManyToManyField(User, related_name='allowed_themes', blank=True)

    def __str__(self):
        return self.name

class Sound(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='created_sounds')
    allowed_users = models.ManyToManyField(User, related_name='allowed_sounds', blank=True)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, help_text="Emoji for the sound, e.g. 🌧")
    audio_url = models.URLField(help_text="URL to the audio file")

    def __str__(self):
        return self.name

class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='created_playlists')
    allowed_users = models.ManyToManyField(User, related_name='allowed_playlists', blank=True)
    name = models.CharField(max_length=100)
    url = models.URLField(help_text="YouTube or Spotify Playlist URL")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.user.username if self.user else 'Global'})"

class Preset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='presets')
    name = models.CharField(max_length=100)
    settings = models.JSONField(default=dict)

    def __str__(self):
        return f"{self.name} - {self.user.username}"
