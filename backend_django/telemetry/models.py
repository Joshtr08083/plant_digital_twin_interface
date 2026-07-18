from django.db import models
from django.utils import timezone

class SensorReading(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    raw_line = models.TextField()
    value = models.FloatField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']