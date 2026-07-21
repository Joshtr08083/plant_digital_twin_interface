#include <WiFi.h>
#include <esp_now.h>

const int LED_BUILTIN = 2;
const int DATA_SIZE = 64; // this has to equal what it is on the sender and arduino (its called SERIAL_OUTPUT_SIZE on arduino)
const int SERIAL_OUTPUT_SIZE = 256;

typedef struct struct_message {
  char data[DATA_SIZE];
} struct_message;

volatile bool newDataAvailable = false;
char latestData[DATA_SIZE] = {0};
unsigned long lastPrint = 0;
const unsigned long PRINT_INTERVAL_MS = 100;

portMUX_TYPE mux = portMUX_INITIALIZER_UNLOCKED;

// covert data into a fixed-length JSON string to print to Serial
void printSerial(int status, const char* data, const char* error) {
  char buf[SERIAL_OUTPUT_SIZE];
  const char* jsonObject = (data && strlen(data) > 0) ? data : "{}";
  snprintf(buf, sizeof(buf),
           "{\"status\":%d,\"data\":%s,\"error\":\"%s\"}",
           status, jsonObject, error);
  Serial.println(buf);
}

// safe copy data onto latestData and update newDataAvailable
void OnDataRecv(const esp_now_recv_info_t *info, const uint8_t *incomingData, int len) {
  char temp[DATA_SIZE] = {0};

  int n = (len < DATA_SIZE - 1) ? len : (DATA_SIZE - 1);
  memcpy(temp, incomingData, n);
  temp[n] = '\0';

  portENTER_CRITICAL_ISR(&mux);
  memcpy(latestData, temp, DATA_SIZE);
  newDataAvailable = true;
  portEXIT_CRITICAL_ISR(&mux);

  digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN)); 
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  pinMode(LED_BUILTIN, OUTPUT);

  Serial.print("Receiver MAC: ");
  Serial.println(WiFi.macAddress());

  if (esp_now_init() != ESP_OK) {
    printSerial(500, "", "ESP-NOW init failed on receiver");
    return;
  }
  
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
  }

  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  unsigned long now = millis();
  if (newDataAvailable && (now - lastPrint >= PRINT_INTERVAL_MS)) {
    char localCopy[DATA_SIZE];
    lastPrint = now;

    portENTER_CRITICAL(&mux);
    memcpy(localCopy, latestData, DATA_SIZE);
    newDataAvailable = false;
    portEXIT_CRITICAL(&mux);

    printSerial(200, localCopy, "");
  }
}