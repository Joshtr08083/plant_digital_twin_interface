import serial
import time
import json
import queue
import threading
from datetime import timedelta
from django.core.management.base import BaseCommand
from telemetry.models import SensorReading
from django.utils import timezone
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import DatabaseError, close_old_connections

class Command(BaseCommand):
    help = 'Read data from ESP32 Serial and write to db using decoupled threads'

    def add_arguments(self, parser):
        parser.add_argument('--port', default='/dev/ttyUSB0')
        parser.add_argument('--baud', type=int, default=115200)
        parser.add_argument('--retention-seconds', type=int, default=10)
        parser.add_argument('--broadcast-interval', type=float, default=0.1)
        parser.add_argument('--db-batch-size', type=int, default=50)
        parser.add_argument('--prune-interval', type=float, default=2.0)

    def handle(self, *args, **options):
        db_queue = queue.Queue()
        broadcast_queue = queue.Queue()

        serial_thread = threading.Thread(
            target=self.serial_reader_worker, 
            args=(options, db_queue, broadcast_queue),
            daemon=True
        )
        serial_thread.start()

        db_thread = threading.Thread(
            target=self.db_worker, 
            args=(options, db_queue),
            daemon=True
        )
        db_thread.start()

        broadcast_thread = threading.Thread(
            target=self.broadcast_worker, 
            args=(options, broadcast_queue),
            daemon=True
        )
        broadcast_thread.start()

        self.stdout.write("All background telemetry workers started successfully.")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write("Shutting down telemetry processes...")

    def serial_reader_worker(self, options, db_queue, broadcast_queue):
        decoder = json.JSONDecoder()
        
        while True:
            try:
                ser = serial.Serial(options['port'], options['baud'], timeout=1)
                time.sleep(2)
                ser.reset_input_buffer()
                self.stdout.write(f"Serial listening on {options['port']}...")

                while True:
                    raw_line = ser.readline().replace(b'\x00', b'')
                    line = raw_line.decode('utf-8', errors='ignore').strip()
                    if not line:
                        continue

                    try:
                        data, end_index = decoder.raw_decode(line)
                        if end_index < len(line):
                            ser.reset_input_buffer()
                        status, data_payload, error = data.get('status'), data.get('data'), data.get('error')
                    except (json.JSONDecodeError, AttributeError):
                        status, data_payload, error = None, None, f"unparseable line: {line[:100]}"

                    payload = {
                        "line": line,
                        "status": status,
                        "data": data_payload,
                        "error": error
                    }

                    db_queue.put(payload)
                    broadcast_queue.put(payload)

                    if status != 200:
                        self.stderr.write(f"Sensor error: {error} (raw: {line})")

            except serial.SerialException as e:
                self.stderr.write(f"Serial interface error: {e}")
                time.sleep(1)

    def db_worker(self, options, db_queue):
        close_old_connections()
        buffer = []
        last_prune = time.monotonic()
        last_flush = time.monotonic()

        while True:
            try:
                item = db_queue.get(timeout=1.0)
                buffer.append(SensorReading(
                    raw_line=item["line"],
                    data=item["data"],
                    status=item["status"],
                    error=item["error"],
                ))
            except queue.Empty:
                pass

            now = time.monotonic()
            
            if (len(buffer) >= options['db_batch_size']) or (buffer and now - last_flush >= 3.0): # flush if goes longer than 1s between serial
                try:
                    SensorReading.objects.bulk_create(buffer)
                except (ValueError, DatabaseError) as db_err:
                    self.stderr.write(f"Database insertion failed: {db_err}. Clearing buffer.")
                finally:
                    buffer.clear()
                    last_flush = now

            now = time.monotonic()
            if now - last_prune >= options['prune_interval']:
                try:
                    cutoff = timezone.now() - timedelta(seconds=options['retention_seconds'])
                    deleted, _ = SensorReading.objects.filter(timestamp__lt=cutoff).delete()
                    if deleted:
                        self.stdout.write(f"Pruned {deleted} old database readings")
                except DatabaseError as e:
                    self.stderr.write(f"Database pruning error: {e}")
                last_prune = now

    def broadcast_worker(self, options, broadcast_queue):
        channel_layer = get_channel_layer()
        last_broadcast = time.monotonic()

        while True:
            item = None
            try:
                while True:
                    item = broadcast_queue.get_nowait()
            except queue.Empty:
                pass

            if item:
                now = time.monotonic()
                if now - last_broadcast >= options['broadcast_interval']:
                    try:
                        async_to_sync(channel_layer.group_send)(
                            "live_readings",
                            {
                                "type": "send_reading",
                                "reading": {
                                    "timestamp": timezone.now().isoformat(),
                                    "raw": item["line"],
                                    "data": item["data"],
                                    "status": item["status"],
                                    "error": item["error"],
                                },
                            }
                        )
                    except Exception as redis_err:
                        self.stderr.write(f"Redis broadcast timeout/error skipped: {redis_err}")
                    last_broadcast = now
            
            time.sleep(0.01)
