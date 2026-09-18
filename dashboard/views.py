from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.db import models
from .models import Sound, Playlist, Theme, Preset
import json

@login_required
def dashboard_view(request):
    sounds = Sound.objects.filter(models.Q(allowed_users=request.user) | models.Q(user=request.user)).distinct()
    playlists = Playlist.objects.filter(models.Q(allowed_users=request.user) | models.Q(user=request.user)).distinct()
    themes = Theme.objects.filter(allowed_users=request.user).distinct()
    presets = Preset.objects.filter(user=request.user)
    default_playlist = playlists.filter(is_default=True).first()
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            name = request.POST.get('name')
            url = request.POST.get('url')
            if name and url:
                p = Playlist.objects.create(name=name, url=url, user=request.user)
                p.allowed_users.add(request.user)
        elif action == 'set_default':
            pk = request.POST.get('pk')
            playlists.update(is_default=False)
            playlists.filter(pk=pk).update(is_default=True)
        elif action == 'add_sound':
            name = request.POST.get('name')
            icon = request.POST.get('icon')
            url = request.POST.get('url')
            if name and url and icon:
                s = Sound.objects.create(name=name, icon=icon, audio_url=url, user=request.user)
                s.allowed_users.add(request.user)
        elif action == 'save_preset':
            name = request.POST.get('preset_name')
            settings_str = request.POST.get('preset_settings')
            if name and settings_str:
                try:
                    settings = json.loads(settings_str)
                    Preset.objects.create(user=request.user, name=name, settings=settings)
                except Exception:
                    pass
        elif action == 'delete_preset':
            pk = request.POST.get('preset_id')
            if pk:
                Preset.objects.filter(pk=pk, user=request.user).delete()
                
        return redirect('dashboard')

    return render(request, 'dashboard/index.html', {
        'sounds': sounds, 
        'playlists': playlists,
        'default_playlist': default_playlist,
        'themes': themes,
        'presets': presets
    })

@login_required
def delete_playlist(request, pk):
    if request.method == 'POST':
        Playlist.objects.filter(pk=pk, user=request.user).delete()
    return redirect('dashboard')

@login_required
def edit_playlist(request, pk):
    playlist = get_object_or_404(Playlist, pk=pk, user=request.user)
    if request.method == 'POST':
        playlist.name = request.POST.get('name')
        playlist.url = request.POST.get('url')
        playlist.save()
        return redirect('dashboard')
    return render(request, 'dashboard/edit_playlist.html', {'playlist': playlist})

@login_required
def delete_sound(request, pk):
    if request.method == 'POST':
        Sound.objects.filter(pk=pk).delete()
    return redirect('dashboard')

@login_required
def edit_sound(request, pk):
    sound = get_object_or_404(Sound, pk=pk)
    if request.method == 'POST':
        sound.name = request.POST.get('name')
        sound.icon = request.POST.get('icon')
        sound.audio_url = request.POST.get('url')
        sound.save()
        return redirect('dashboard')
    return render(request, 'dashboard/edit_sound.html', {'sound': sound})

def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'dashboard/auth.html', {'form': form, 'title': 'Register', 'is_login': False})

def login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('dashboard')
    else:
        form = AuthenticationForm()
    return render(request, 'dashboard/auth.html', {'form': form, 'title': 'Login', 'is_login': True})

def logout_view(request):
    if request.method == 'POST':
        logout(request)
    return redirect('login')

def sw_js(request):
    return render(request, 'dashboard/sw.js', content_type='application/javascript')


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
            email = request.POST.get('email', '')
            password = request.POST.get('password')
            is_admin = request.POST.get('is_admin') == 'yes'
            if username and password:
                if not User.objects.filter(username=username).exists():
                    user = User.objects.create_user(username=username, email=email, password=password)
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
        elif action == 'update_all_themes_access':
            for theme in all_themes:
                allowed_users = request.POST.getlist(f'theme_{theme.id}_users')
                theme.allowed_users.set(allowed_users)
            messages.success(request, "Themes access updated successfully!")
            
        elif action == 'update_all_sounds_access':
            for sound in all_sounds:
                allowed_users = request.POST.getlist(f'sound_{sound.id}_users')
                sound.allowed_users.set(allowed_users)
            messages.success(request, "Sounds access updated successfully!")
            
        elif action == 'update_all_playlists_access':
            for playlist in all_playlists:
                allowed_users = request.POST.getlist(f'playlist_{playlist.id}_users')
                playlist.allowed_users.set(allowed_users)
            messages.success(request, "Playlists access updated successfully!")
            
        return redirect('app_manager')

    return render(request, 'dashboard/app_manager.html', {
        'users': users,
        'all_themes': all_themes,
        'all_sounds': all_sounds,
        'all_playlists': all_playlists
    })

@user_passes_test(lambda u: u.is_superuser)
def edit_user(request, user_id):
    target_user = get_object_or_404(User, id=user_id)
    all_themes = Theme.objects.all()
    all_sounds = Sound.objects.all()
    all_playlists = Playlist.objects.all()

    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'delete_user':
            username = target_user.username
            target_user.delete()
            messages.success(request, f"User {username} has been deleted.")
            return redirect('app_manager')
            
        elif action == 'update_permissions':
            theme_ids = request.POST.getlist('themes')
            sound_ids = request.POST.getlist('sounds')
            playlist_ids = request.POST.getlist('playlists')

            target_user.theme_set.set(theme_ids)
            target_user.sound_set.set(sound_ids)
            target_user.playlist_set.set(playlist_ids)

            messages.success(request, f"Permissions updated for {target_user.username}.")
            return redirect('app_manager')

        elif action == 'change_password':
            new_password = request.POST.get('new_password')
            if new_password:
                target_user.set_password(new_password)
                target_user.save()
                messages.success(request, f"Password successfully changed for {target_user.username}.")
            else:
                messages.error(request, "Password cannot be empty.")
            return redirect('edit_user', user_id=target_user.id)

    return render(request, 'dashboard/edit_user.html', {
        'target_user': target_user,
        'all_themes': all_themes,
        'all_sounds': all_sounds,
        'all_playlists': all_playlists
    })

def _manage_access_generic(request, obj, pk, redirect_name, item_name, back_hash):
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'grant':
            user_ids = request.POST.getlist('user_ids')
            if user_ids:
                obj.allowed_users.add(*user_ids)
                messages.success(request, f"Access granted to {len(user_ids)} user(s).")
        elif action == 'revoke':
            user_id = request.POST.get('user_id')
            if user_id:
                obj.allowed_users.remove(user_id)
                messages.success(request, "Access revoked.")
        return redirect(redirect_name, pk=pk)
        
    allowed_users = obj.allowed_users.all().order_by('username')
    unassigned_users = User.objects.exclude(id__in=allowed_users.values_list('id', flat=True)).order_by('username')
    
    return render(request, 'dashboard/manage_access.html', {
        'item_name': item_name,
        'allowed_users': allowed_users,
        'unassigned_users': unassigned_users,
        'back_hash': back_hash
    })

@user_passes_test(lambda u: u.is_superuser)
def manage_theme_access(request, pk):
    theme = get_object_or_404(Theme, pk=pk)
    return _manage_access_generic(request, theme, pk, 'manage_theme_access', f"Theme: {theme.name}", '#themes')

@user_passes_test(lambda u: u.is_superuser)
def manage_sound_access(request, pk):
    sound = get_object_or_404(Sound, pk=pk)
    return _manage_access_generic(request, sound, pk, 'manage_sound_access', f"Sound: {sound.name}", '#sounds')

@user_passes_test(lambda u: u.is_superuser)
def manage_playlist_access(request, pk):
    playlist = get_object_or_404(Playlist, pk=pk)
    return _manage_access_generic(request, playlist, pk, 'manage_playlist_access', f"Playlist: {playlist.name}", '#playlists')
