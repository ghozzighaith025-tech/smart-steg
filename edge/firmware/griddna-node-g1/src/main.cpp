/**
 * GridDNA Node G1 — Edge Firmware v0.1.0
 *
 * Collects electrical (PZEM-004T), environmental (DHT22, DS18B20),
 * and publishes telemetry via MQTT JSON to GridDNA platform.
 *
 * Hardware: ESP32 / ESP32-S3 + PZEM-004T v3
 * Protocol: MQTT (griddna/{org}/{device}/telemetry)
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <PZEM004Tv30.h>
#include <DHT.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "config.h"

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

HardwareSerial pzemSerial(2);
PZEM004Tv30 pzem(&pzemSerial, PIN_PZEM_RX, PIN_PZEM_TX);

DHT dht(PIN_DHT, DHT_TYPE);
OneWire oneWire(PIN_ONEWIRE);
DallasTemperature ds18b20(&oneWire);

unsigned long lastPublish = 0;
unsigned long lastWifiRetry = 0;

void setupMqtt() {
  mqtt.setServer(GRIDDNA_MQTT_BROKER, GRIDDNA_MQTT_PORT);
  mqtt.setBufferSize(512);
}

void connectWifi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.printf("[WiFi] Connecting to %s\n", GRIDDNA_WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(GRIDDNA_WIFI_SSID, GRIDDNA_WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.printf("\n[WiFi] Connected: %s\n", WiFi.localIP().toString().c_str());
  } else {
    Serial.println("\n[WiFi] Connection failed");
  }
}

void connectMqtt() {
  if (!mqtt.connected()) {
    String clientId = String("griddna-") + GRIDDNA_DEVICE_SERIAL;
    if (mqtt.connect(clientId.c_str())) {
      Serial.println("[MQTT] Connected");
    } else {
      Serial.printf("[MQTT] Failed, rc=%d\n", mqtt.state());
    }
  }
}

void readAndPublish() {
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();

  if (isnan(voltage)) voltage = 0;
  if (isnan(current)) current = 0;
  if (isnan(power)) power = 0;
  if (isnan(energy)) energy = 0;
  if (isnan(frequency)) frequency = 50.0;
  if (isnan(pf)) pf = 0.95;

  float humidity = dht.readHumidity();
  float dhtTemp = dht.readTemperature();

  ds18b20.requestTemperatures();
  float dsTemp = ds18b20.getTempCByIndex(0);
  float temperature = !isnan(dsTemp) && dsTemp != -127.0 ? dsTemp : dhtTemp;

  if (isnan(humidity)) humidity = 0;
  if (isnan(temperature)) temperature = 0;

  // Vibration placeholder — MPU6050 integration in Week 2
  float vibrationRms = 0.0;

  JsonDocument doc;
  doc["device_serial"] = GRIDDNA_DEVICE_SERIAL;
  doc["firmware"] = "0.1.0";
  doc["hardware"] = "G1";
  doc["voltage"] = round(voltage * 10) / 10.0;
  doc["current"] = round(current * 100) / 100.0;
  doc["power"] = round(power * 10) / 10.0;
  doc["energy"] = round(energy * 100) / 100.0;
  doc["frequency"] = round(frequency * 10) / 10.0;
  doc["power_factor"] = round(pf * 100) / 100.0;
  doc["temperature"] = round(temperature * 10) / 10.0;
  doc["humidity"] = round(humidity * 10) / 10.0;
  doc["vibration_rms"] = vibrationRms;
  doc["timestamp"] = millis();

  char payload[512];
  serializeJson(doc, payload, sizeof(payload));

  if (mqtt.publish(GRIDDNA_MQTT_TOPIC, payload)) {
    digitalWrite(PIN_STATUS_LED, HIGH);
    Serial.printf("[MQTT] Published: %s\n", payload);
    delay(50);
    digitalWrite(PIN_STATUS_LED, LOW);
  } else {
    Serial.println("[MQTT] Publish failed");
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_STATUS_LED, OUTPUT);

  pzemSerial.begin(9600, SERIAL_8N1, PIN_PZEM_RX, PIN_PZEM_TX);
  dht.begin();
  ds18b20.begin();

  setupMqtt();
  connectWifi();

  Serial.println("=================================");
  Serial.println(" GridDNA Node G1 — Edge Firmware");
  Serial.printf(" Device: %s\n", GRIDDNA_DEVICE_SERIAL);
  Serial.println("=================================");
}

void loop() {
  unsigned long now = millis();

  if (WiFi.status() != WL_CONNECTED && now - lastWifiRetry > 10000) {
    lastWifiRetry = now;
    connectWifi();
  }

  if (!mqtt.connected()) {
    connectMqtt();
  }
  mqtt.loop();

  if (now - lastPublish >= GRIDDNA_PUBLISH_INTERVAL_MS) {
    lastPublish = now;
    readAndPublish();
  }
}
