from django.db import models
from django.contrib.auth.models import User

class Sound(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=10, help_text="Emoji for the sound, e.g. 🌧")
    audio_url = models.URLField(help_text="URL to the audio file")

    def __str__(self):
        return self.name

class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    url = models.URLField(help_text="YouTube or Spotify Playlist URL")
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} ({self.user.username if self.user else 'Global'})"
