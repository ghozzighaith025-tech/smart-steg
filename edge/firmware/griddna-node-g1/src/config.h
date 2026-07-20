#pragma once

// ============================================================
// GridDNA Node G1 — Configuration
// Copy to config.local.h and override for your deployment
// ============================================================

#ifndef GRIDDNA_WIFI_SSID
#define GRIDDNA_WIFI_SSID "YOUR_WIFI_SSID"
#endif

#ifndef GRIDDNA_WIFI_PASSWORD
#define GRIDDNA_WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#endif

#ifndef GRIDDNA_MQTT_BROKER
#define GRIDDNA_MQTT_BROKER "192.168.1.100"
#endif

#ifndef GRIDDNA_MQTT_PORT
#define GRIDDNA_MQTT_PORT 1883
#endif

#ifndef GRIDDNA_DEVICE_SERIAL
#define GRIDDNA_DEVICE_SERIAL "G1-001-DEMO"
#endif

#ifndef GRIDDNA_MQTT_TOPIC
#define GRIDDNA_MQTT_TOPIC "griddna/demo/G1-001-DEMO/telemetry"
#endif

#ifndef GRIDDNA_PUBLISH_INTERVAL_MS
#define GRIDDNA_PUBLISH_INTERVAL_MS 5000
#endif

// Pin assignments (ESP32)
#define PIN_PZEM_RX 16
#define PIN_PZEM_TX 17
#define PIN_DHT 4
#define PIN_ONEWIRE 5
#define PIN_STATUS_LED 2

#define DHT_TYPE DHT22
