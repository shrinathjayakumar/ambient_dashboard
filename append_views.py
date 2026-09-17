import os

with open('dashboard/views.py', 'r') as f:
    code = f.read()

if 'django.contrib import messages' not in code:
    code = code.replace('from django.shortcuts import render, redirect, get_object_or_404', 'from django.shortcuts import render, redirect, get_object_or_404\nfrom django.contrib import messages')

app_manager_code = '''
from django.contrib.auth.models import User
from django.contrib.auth.decorators import user_passes_test

@user_passes_test(lambda u: u.is_superuser)
def app_manager(request):
    users = User.objects.all().order_by('username')
    all_themes = Theme.objects.all()
    all_sounds = Sound.objects.all()
    all_playlists = Playlist.objects.all()

    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add_user':
            username = request.POST.get('username')
            password = request.POST.get('password')
            is_admin = request.POST.get('is_admin') == 'yes'
            if username and password:
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(username=username, password=password)
                    user.is_superuser = is_admin
                    user.is_staff = is_admin
                    user.save()
                    messages.success(request, f"User {username} created successfully!")
                else:
                    messages.error(request, "Username already exists!")
        elif action == 'toggle_admin':
            user_id = request.POST.get('user_id')
            user = get_object_or_404(User, id=user_id)
            user.is_superuser = not user.is_superuser
            user.is_staff = user.is_superuser
            user.save()
            messages.success(request, f"Admin status toggled for {user.username}")
        elif action == 'update_theme_access':
            theme_id = request.POST.get('theme_id')
            allowed_users = request.POST.getlist('allowed_users')
            theme = get_object_or_404(Theme, id=theme_id)
            theme.allowed_users.set(allowed_users)
            messages.success(request, f"Access updated for {theme.name}")
        elif action == 'update_sound_access':
            sound_id = request.POST.get('sound_id')
            allowed_users = request.POST.getlist('allowed_users')
            sound = get_object_or_404(Sound, id=sound_id)
            sound.allowed_users.set(allowed_users)
            messages.success(request, f"Access updated for sound: {sound.name}")
        elif action == 'update_playlist_access':
            playlist_id = request.POST.get('playlist_id')
            allowed_users = request.POST.getlist('allowed_users')
            playlist = get_object_or_404(Playlist, id=playlist_id)
            playlist.allowed_users.set(allowed_users)
            messages.success(request, f"Access updated for playlist: {playlist.name}")
            
        return redirect('app_manager')

    return render(request, 'dashboard/app_manager.html', {
        'users': users,
        'all_themes': all_themes,
        'all_sounds': all_sounds,
        'all_playlists': all_playlists
    })
'''

if 'def app_manager(' not in code:
    code += app_manager_code

with open('dashboard/views.py', 'w') as f:
    f.write(code)
