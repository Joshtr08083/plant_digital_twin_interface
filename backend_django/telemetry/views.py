from django.shortcuts import render
from django.http import JsonResponse
from .models import SensorReading, Settings, Configs
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@ensure_csrf_cookie
def index(request):
    return render(request, 'telemetry/index.html')

@csrf_exempt
@require_http_methods(["GET", "POST"])
def settings_view(request):
    # returns settings for all sensors by id
    if request.method == "GET":
        settings = {
            s.key: {"threshold": s.threshold, "min": s.min_value, "max": s.max_value}
            for s in Settings.objects.all()
        }
        return JsonResponse({"settings": settings})
    
    body = json.loads(request.body)
    key = body.get("id") # key and id are the same, its just called key to avoid primary key issues
    
    setting, created = Settings.objects.get_or_create(key=key)
    if "threshold" in body:
        setting.threshold = body["threshold"]
    if "min" in body:
        setting.min_value = body["min"]
    if "max" in body:
        setting.max_value = body["max"]
    setting.save()
    
    return JsonResponse({
        "key": setting.key,
        "threshold": setting.threshold,
        "min": setting.min_value,
        "max": setting.max_value,
    })

def latest_readings(request):
    readings = SensorReading.objects.all()[:20]
    data = [
        {
            "timestamp": r.timestamp.isoformat(),
            "raw": r.raw_line,
            "data": r.data,
            "status": r.status,
            "error": r.error,
        }
        for r in readings
    ]
    return JsonResponse({"readings": data})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def configs_view(request):
    if request.method == "GET":
        configs = {c.key: c.value for c in Configs.objects.all()}
        return JsonResponse({"configs": configs})
    
    body = json.loads(request.body)
    key = body.get("key")
    value = body.get("value")
    
    if key is None or value is None:
        return JsonResponse({"error": "key and value are required"}, status=400)
    
    setting, _ = Configs.objects.update_or_create(key=key, defaults={"value": value})
    
    return JsonResponse({"key": setting.key, "value": setting.value})