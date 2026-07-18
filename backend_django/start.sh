#!/bin/bash

trap "kill 0" EXIT

python3 manage.py runserver 0.0.0.0:8000