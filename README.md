
# Plant Sensor Digital Twin Interface  
 
The purpose of this project is to provide a digital twin interface for plant sensors to detect mechanical stimuli and in the future other environmental factors
&nbsp;  
&nbsp;  


## Installation/Setup
>&nbsp;  
>This asssumes hardware is setup correctly, with one arduino/esp32 reading sensors and another esp32 connected via usb to the server, and the microcontrollers have the correct software. **You will also need Docker installed.**
>&nbsp;  
> &nbsp;  
  
### Linux

#### 1. Create a directory, such as 
```bash
mkdir pdigtwinterface && cd pdigtwinterface
```
&nbsp;  

#### 2. From [Github](https://github.com/Joshtr08083/plant_digital_twin_interface) download `env.example` and `compose.yml`
```bash
curl -O https://raw.githubusercontent.com/Joshtr08083/plant_digital_twin_interface/main/compose.yml
curl -O https://raw.githubusercontent.com/Joshtr08083/plant_digital_twin_interface/main/.env.example
```
&nbsp;  

#### 3. Edit the following in .env.example, and then rename to .env   

| key               | desc                              |
|:------------------|-----------------------------------|
| POSTGRES_PASSWORD | secure completely random password |
| DJANGO_SECRET_KEY | another new secure password       |
| REDIS_PASSWORD    | secure password                   |
| SERIAL_PORT       | USB port ESP32 is connected to    |  
  
&nbsp;  
To find ESP32 port run this (if you have multiple to just guess):
```bash
ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
```
&nbsp;  

#### 4. Pull image from dockerhub 
```bash
docker compose pull
```
Then start the container
```bash
docker compose up -d
```
**The server might need 10-15s before it can actually handle connections**

&nbsp;  
#### 5. Visit port 8000 in your browswer
If everything worked correctly, go to [http://localhost:8000](http://localhost:8000)  to view the dashboard

&nbsp;  

### Windows/Mac
>&nbsp;   
> Docker on Windows/Mac can't natively read Serial devices. The main difference is instead of running telemetry container, you can run the telemetetry python script natively.
>&nbsp;  
>&nbsp;  

#### 1. Download [Python 3.14+](https://www.python.org/downloads/)
#### 2. Download [Github repository](https://github.com/Joshtr08083/plant_digital_twin_interface) 
#### 3. Setup `.env.example` and rename to `.env`
Linux section discusses this, its the same process, rename to .env. 
- On windows you can find pport in Device Manager > Ports
- On MacOS you *should* be able to run `ls /dev/tty.*` to find it (I haven't tested this I just looked it up)

&nbsp;  
#### 4. Rename `.env.windows.example` to `.env.windows`
This *should* apply to MacOS too, but bear with me as I haven't been able to test it on MacOS yet (because I don't have a MacBook).

&nbsp;  

#### 5. Pull docker image `joshtr083/pdigtwinterface:latest`
Using Docker CLI you can run (first use `cd`to navigate to the root directory of the project):
```bash
docker compose -f compose.yml -f compose.windows.yml pull
```
&nbsp;  
#### 6. Run docker containers
```bash
docker compose -f compose.yml -f compose.windows.yml up -d
```
&nbsp;  
#### 8. Install python dependencies
1. Create venv:
```
python -m pip venv venv
```
2. Activate venv
```
(Windows) .\venv\Scripts\Activate.ps1
(MacOS) ./venv/bin/activate
```
> &nbsp;  
> If windows has error for Execution Policies, run:  
> Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
> &nbsp;  
> &nbsp;  

3. Upgrade pip and install from backend_django/requirements.txt
```
python -m pip install --upgrade pip
python -m pip install -r ./backend_django/requirements.txt
```

#### 7. Start python script `run_telemetry_native.py`
```
python run_telemetry_native.py
```
If everything worked corrrectly, you should be able to visit [http://localhost:8000](htpp://localhost:8000)


&nbsp;  
&nbsp;  

## Components

### Hardware

| Component | Purpose |
|:----------|:--------|
| Arduino   | Data collection |
| ESP32 (A) | UART Serail communication with Arduino and wirelesss communication |
| ESP32 (B) | Wireless communication with ESP32 (A) and USB Serial communication with Server |
| Server    | USB Serial communication with ESP32 (B) and serving webpage to client |

&nbsp;  

### Software

#### Arduino `microcontrollers/arduino_sensors/`
The arduino uses a simple cpp program to read the sensors

####  ESP32 (Sender) `microcontrollers/esp32_sender/`
This ESP32 is directly connected over UART to the Arduino and then sends the sensor readings over ESP-NOW

#### ESP32 (Receiver) `microcontrollers/esp32_receiver/`
This ESP32 is wirelessly connected over ESP-NOW to receive sensor readings and send them to the server over USB/Serial

#### Server `backend_django/`
Django server hosted via Docker that serves sensor readings, persistent configurations, and static frontend files. This server can be really anything, ideally something running linux. It does **not** have to be the same device that accesses the web dashboard.

#### Frontend/React `frontend_react/`
React frontend compiled using Vite that displays plant model, sensor readings, chart, and table to the browser. It also performs computations for detecting stimuli and interacting with the database.



