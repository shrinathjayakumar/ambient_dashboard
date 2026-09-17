with open(r'C:\Users\SHRINATH\Alphabet_Shrinath\ambient_dashboard\ambient_dashboard\settings.py', 'r') as f:
    lines = f.readlines()

new_lines = lines[:94] # Up to USE_I18N = True
new_lines.extend([
    "\nUSE_TZ = True\n\n",
    "STATIC_URL = 'static/'\n",
    "STATIC_ROOT = BASE_DIR / 'staticfiles'\n\n",
    "DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'\n\n",
    "import os\n",
    "MEDIA_URL = '/media/'\n",
    "MEDIA_ROOT = os.path.join(BASE_DIR, 'media')\n\n",
    "LOGIN_URL = 'login'\n",
    "LOGIN_REDIRECT_URL = 'dashboard'\n",
    "LOGOUT_REDIRECT_URL = 'login'\n"
])

with open(r'C:\Users\SHRINATH\Alphabet_Shrinath\ambient_dashboard\ambient_dashboard\settings.py', 'w') as f:
    f.writelines(new_lines)
