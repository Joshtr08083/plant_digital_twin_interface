from django.db import models
from django.utils import timezone

class SensorReading(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    raw_line = models.TextField()
    data = models.JSONField(null=True, blank=True)
    status = models.IntegerField(null=True, blank=True)
    error = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        
    def __str__(self):
        return f"Sensor readings timestamp={self.timestamp}, raw_line={self.raw_line}, data={self.data}, status={self.status}, error={self.error}"
        
class Settings(models.Model):
    key = models.TextField(unique=True)
    threshold = models.FloatField(null=True, blank=True)
    min_value = models.FloatField(null=True, blank=True)
    max_value = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return f"Threshold/Limits {self.key}: threshold={self.threshold}, range=[{self.min_value}, {self.max_value}]"

class Configs(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.TextField()
    
    def __str__(self):
        return f"Configs {self.key}:{self.value}"