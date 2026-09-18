from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),
    path('playlist/edit/<int:pk>/', views.edit_playlist, name='edit_playlist'),
    path('playlist/delete/<int:pk>/', views.delete_playlist, name='delete_playlist'),
    path('sound/edit/<int:pk>/', views.edit_sound, name='edit_sound'),
    path('sound/delete/<int:pk>/', views.delete_sound, name='delete_sound'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('sw.js', views.sw_js, name='sw_js'),
    path('app-manager/', views.app_manager, name='app_manager'),
    path('app-manager/user/<int:user_id>/edit/', views.edit_user, name='edit_user'),
]
