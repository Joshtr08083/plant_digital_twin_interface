from django.db import models
from django.utils import timezone

class SensorReading(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    raw_line = models.TextField()
    value = models.FloatField(null=True, blank=True)
    status = models.IntegerField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']