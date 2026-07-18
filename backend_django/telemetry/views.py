from django.shortcuts import render
from django.http import JsonResponse
from .models import SensorReading

def index(request):
    return render(request, 'telemetry/index.html')

def latest_readings(request):
    readings = SensorReading.objects.all()[:20]
    data = [
        {
            "timestamp": r.timestamp.isoformat(), 
            "raw": r.raw_line, 
            "value": r.value
        } for r in readings
    ]
    return JsonResponse({"readiings": data})