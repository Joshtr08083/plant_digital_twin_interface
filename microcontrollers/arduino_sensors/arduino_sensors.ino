const int SERIAL_OUTPUT_SIZE = 64;

class TOUCH_SENSOR {
  private:
    int id;
    int pin;
    
  public: 
    TOUCH_SENSOR(int d, int p) {
      id = d;
      pin = p;
      pinMode(p, INPUT);
    }

    int getId() {
      return id;
    }

    int getReading() {
      return analogRead(pin);
    }
};

TOUCH_SENSOR sensors[] = {
  TOUCH_SENSOR(0, A8)
  // TOUCH_SENSOR(1, A7),
  // TOUCH_SENSOR(2, A6),
  // TOUCH_SENSOR(3, A5)
};
const int numSensors = sizeof(sensors) / sizeof(sensors[0]);

void setup() {
  Serial2.begin(115200);
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);

}

void loop() {
  char buf[SERIAL_OUTPUT_SIZE];
  int offset = 0;
  

  offset += snprintf(buf + offset, sizeof(buf) - offset, "{");

  for (int i = 0; i < numSensors; i++) {
    if (offset < (int)sizeof(buf) - 2) {
      offset += snprintf(buf + offset, sizeof(buf) - offset, 
                         "%s\"%d\":%d", 
                         (i == 0 ? "" : ","), 
                         sensors[i].getId(), 
                         sensors[i].getReading());
    }
  }
  
  if (offset < (int)sizeof(buf)) {
    snprintf(buf + offset, sizeof(buf) - offset, "}");
  }

  Serial2.println(buf); 
  Serial.println(buf);
  digitalWrite(LED_BUILTIN, HIGH);
  delay(60);
  digitalWrite(LED_BUILTIN, LOW);
  delay(60);
}
