from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/latest/', views.latest_readings, name='latest_readings'),
]