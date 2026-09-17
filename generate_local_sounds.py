import wave
import struct
import random
import math
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ambient_dashboard.settings')
django.setup()
from dashboard.models import Sound

os.makedirs('media/sounds', exist_ok=True)

def generate_noise(filename, duration=5, volume=32767.0, is_brown=False):
    sample_rate = 44100
    num_samples = duration * sample_rate
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        last_val = 0
        for _ in range(num_samples):
            if is_brown:
                val = last_val + random.uniform(-1000, 1000)
                val = max(min(val, volume), -volume)
                last_val = val
            else:
                val = random.uniform(-volume, volume)
            
            wav_file.writeframes(struct.pack('h', int(val)))

def generate_tone(filename, duration=5, frequency=440.0, volume=32767.0):
    sample_rate = 44100
    num_samples = duration * sample_rate
    
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        
        for i in range(num_samples):
            val = volume * math.sin(2 * math.pi * frequency * i / sample_rate)
            wav_file.writeframes(struct.pack('h', int(val)))

generate_noise('media/sounds/rain.wav', is_brown=True)
generate_noise('media/sounds/wind.wav', is_brown=False)
generate_tone('media/sounds/thunder.wav', frequency=100.0)
generate_tone('media/sounds/train.wav', frequency=300.0)
generate_tone('media/sounds/forest.wav', frequency=800.0)

# Update database
Sound.objects.all().delete()
sounds = [
    {"name": "Rain", "icon": "🌧", "audio_url": "/media/sounds/rain.wav"},
    {"name": "Thunder", "icon": "⚡", "audio_url": "/media/sounds/thunder.wav"},
    {"name": "Forest", "icon": "🌲", "audio_url": "/media/sounds/forest.wav"},
    {"name": "Train", "icon": "🚂", "audio_url": "/media/sounds/train.wav"},
    {"name": "Wind", "icon": "💨", "audio_url": "/media/sounds/wind.wav"}
]

for s in sounds:
    Sound.objects.create(**s)

print("Generated local sounds and updated database.")
