#include <esp_now.h>
#include <WiFi.h>

const int LED_BUILTIN = 2;
const int DATA_SIZE = 64;

uint8_t receiverMac[] = {0x38, 0x18, 0x2B, 0xB2, 0x1A, 0x40};

typedef struct struct_message {
  char data[DATA_SIZE];
} struct_message;

struct_message packetData;
volatile bool lastSendOk = false;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  lastSendOk = (status == ESP_NOW_SEND_SUCCESS);
  digitalWrite(LED_BUILTIN, lastSendOk ? HIGH : LOW);
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  Serial.begin(115200);
  Serial2.begin(115200, SERIAL_8N1, 18, 19);
  Serial2.setTimeout(20);

  WiFi.mode(WIFI_STA);
  Serial.print("Sender MAC: ");
  Serial.println(WiFi.macAddress());

  if (esp_now_init() != ESP_OK) {
    Serial.println("Error Initializing ESP-NOW");
    return;
  }

  esp_now_register_send_cb(OnDataSent);

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, receiverMac, 6);
  peerInfo.channel = 0;
  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }

  digitalWrite(LED_BUILTIN, HIGH);
  delay(2000);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("Setup success");
  delay(1000);
}

void loop() {
  char latestLine[DATA_SIZE] = {0};

  if (Serial2.available() > 0) {
    int bytesRead = Serial2.readBytesUntil('\n', latestLine, DATA_SIZE - 1);
    if (bytesRead > 0) {
      latestLine[bytesRead] = '\0';
      
      if (bytesRead > 0 && latestLine[bytesRead - 1] == '\r') {
        latestLine[bytesRead - 1] = '\0';
      }

      snprintf(packetData.data, DATA_SIZE, "%s", latestLine);
      esp_err_t r = esp_now_send(receiverMac, (uint8_t*)&packetData, sizeof(packetData));
    }
  }
}