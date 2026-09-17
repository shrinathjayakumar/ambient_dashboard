from django.contrib import admin
from django.contrib.auth.models import Group, User
from django.contrib.auth.admin import UserAdmin
from .models import Sound, Playlist, Theme

# Customize Admin Headers
admin.site.site_header = "Application Manager"
admin.site.site_title = "Application Manager Portal"
admin.site.index_title = "Welcome to the Application Manager"

# Remove Group from Admin
admin.site.unregister(Group)

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name', 'css_class', 'background_color_hex')
    search_fields = ('name',)
    filter_horizontal = ('allowed_users',)

@admin.register(Sound)
class SoundAdmin(admin.ModelAdmin):
    list_display = ('name', 'icon', 'user')
    list_filter = ('user',)
    search_fields = ('name',)
    filter_horizontal = ('allowed_users',)

@admin.register(Playlist)
class PlaylistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_default')
    list_filter = ('user', 'is_default')
    search_fields = ('name',)
    filter_horizontal = ('allowed_users',)

