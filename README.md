
# Plant Sensor Digital Twin Interface  

## Summary  
The purpose of this project is to provide a digital twin interface for plant sensors to detect mechanical stimuli and in the future other environmental factors

## Hardware
1. Arduino &nbsp; | &nbsp; Data collection and processing 
2. ESP32&nbsp; &nbsp; &nbsp; | &nbsp; Wireless communication
    *Two ESP32s are used for ESPNOW communication for wireless arduino -> servo communication

## Software

### Arduino
The arduino uses a simple cpp program to detect stimuli by % differences in readings
```cpp
    int touchReading = analogRead(TOUCH_ONE);
    float perDiff = (float)(((touchReading - pastReading) * 100.00) / pastReading);
    pastReading = touchReading;

    if (abs(perDiff) > threshold) {
        Serial.println("Mechanical stimuli");
    }
    delay(50);
```

### Server
The server runs Django, which communicates with the esp32 network and serves the React frontend built using Vite

