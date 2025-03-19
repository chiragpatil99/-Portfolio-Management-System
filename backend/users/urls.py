from django.urls import include, path, re_path, path
from . import views
from django.contrib import admin
from .views import test_user, UserRegister, UserLogin, UserLogout, get_user_details


urlpatterns = [
	path('register/', views.UserRegister.as_view(), name='register'),
	path('login/', views.UserLogin.as_view(), name='login'),
	path('logout/', views.UserLogout.as_view(), name='logout'),
	re_path('user/', views.test_user, name='user')]
