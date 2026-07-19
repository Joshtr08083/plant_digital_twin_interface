import os
import subprocess
import sys
from dotenv import dotenv_values

env = os.environ.copy()
env.update(dotenv_values(".env"))

env.update(dotenv_values(".env.windows"))

cmd = [
    sys.executable, "./backend_django/manage.py", "read_serial",
    "--port", env["SERIAL_PORT"],
    "--baud", env["SERIAL_BAUD"],
    "--retention-seconds", env["RETENTION_SECONDS"],
    "--broadcast-interval", env["BROADCAST_INTERVAL"],
    "--db-batch-size", env["DB_BATCH_SIZE"],
    "--prune-interval", env["PRUNE_INTERVAL"],
]

subprocess.run(cmd, env=env)