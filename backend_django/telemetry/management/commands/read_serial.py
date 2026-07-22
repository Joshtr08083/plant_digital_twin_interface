import serial, time, json
from datetime import timedelta
from django.core.management.base import BaseCommand
from telemetry.models import SensorReading
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class Command(BaseCommand):
    help = 'Read data from ESP32 Serial and write to db'

    def add_arguments(self, parser):
        parser.add_argument('--port', default='/dev/ttyUSB0')
        parser.add_argument('--baud', type=int, default=115200)
        parser.add_argument('--retention-seconds', type=int, default=10)
        parser.add_argument('--broadcast-interval', type=float, default=0.1)
        parser.add_argument('--db-batch-size', type=int, default=50)
        parser.add_argument('--prune-interval', type=float, default=2.0)

    def handle(self, *args, **options):
        self.decoder = json.JSONDecoder()
        channel_layer = get_channel_layer()
        buffer = []
        last_broadcast = time.monotonic()
        last_prune = time.monotonic()

        while True:
            try:
                ser = serial.Serial(options['port'], options['baud'], timeout=1)
                time.sleep(2)
                ser.reset_input_buffer()
                self.stdout.write(f"Serial listening on {options['port']} (buffer flushed)...")

                while True:
                    line = ser.readline().decode('utf-8', errors='ignore').strip()
                    if not line:
                        continue

                    status, data, error = self.parse_line(ser, line)

                    buffer.append(SensorReading(
                        raw_line=line,
                        data=data,
                        status=status,
                        error=error,
                    ))
                    if len(buffer) >= options['db_batch_size']:
                        SensorReading.objects.bulk_create(buffer)
                        buffer.clear()

                    now = time.monotonic()
                    if now - last_broadcast >= options['broadcast_interval']:
                        async_to_sync(channel_layer.group_send)(
                            "live_readings",
                            {
                                "type": "send_reading",
                                "reading": {
                                    "timestamp": timezone.now().isoformat(),
                                    "raw": line,
                                    "data": data,
                                    "status": status,
                                    "error": error,
                                },
                            }
                        )
                        last_broadcast = now

                    if now - last_prune >= options['prune_interval']:
                        cutoff = timezone.now() - timedelta(seconds=options['retention_seconds'])
                        deleted, _ = SensorReading.objects.filter(timestamp__lt=cutoff).delete()
                        if deleted:
                            self.stdout.write(f"Pruned {deleted} old readings")
                        last_prune = now

                    if status != 200:
                        self.stderr.write(f"Sensor error: {error} (raw: {line})")

            except serial.SerialException as e:
                self.stderr.write(f"Serial error: {e}")
                time.sleep(1)

    def parse_line(self, ser, line):
        try:
            data, end_index = self.decoder.raw_decode(line)
            if end_index < len(line):
                ser.reset_input_buffer()
                self.stderr.write(
                    f"Concatenated line detected, flushed buffer "
                    f"({len(line) - end_index} trailing chars discarded)"
                )
            return data.get('status'), data.get('data'), data.get('error')
        except (json.JSONDecodeError, AttributeError):
            return None, None, f"unparseable line: {line[:100]}"