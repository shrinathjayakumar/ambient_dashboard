from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.db import models
from .models import Sound, Playlist, Theme

@login_required
def dashboard_view(request):
    sounds = Sound.objects.filter(models.Q(allowed_users=request.user) | models.Q(user=request.user)).distinct()
    playlists = Playlist.objects.filter(models.Q(allowed_users=request.user) | models.Q(user=request.user)).distinct()
    themes = Theme.objects.filter(allowed_users=request.user).distinct()
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
        return redirect('dashboard')

    return render(request, 'dashboard/index.html', {
        'sounds': sounds, 
        'playlists': playlists,
        'default_playlist': default_playlist,
        'themes': themes
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

