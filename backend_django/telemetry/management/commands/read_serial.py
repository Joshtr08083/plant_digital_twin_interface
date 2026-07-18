import serial, time
from django.core.management.base import BaseCommand
from telemetry.models import SensorReading

class Command(BaseCommand):
    help = 'Read data from ESP32 Serial and write to db'
    
    def add_arguments(self, parser):
        parser.add_argument('--port', default='/dev/ttyUSB0')
        parser.add_argument('--baud', type=int, default=115200)
        
    def handle(self, *args, **kwargs):
        ser = serial.Serial(kwargs['port'], kwargs['baud'], timeout=1)
        time.sleep(2)
        self.stdout.write(f"Serial listening on {kwargs['port']}...")
        
        while True:
            try:
                line = ser.readline().decode('utf-8', errors='ignore').strip()
                if not line:
                    continue
                try:
                    value = float(line)
                except ValueError:
                    value = None
                    
                SensorReading.objects.create(raw_line=line, value=value)
                self.stdout.write(f"Saved: {line}")
                
            except serial.SerialException as e:
                self.stderr.write(f"Serial error: {e}")
                time.sleep(1)