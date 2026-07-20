# GridDNA Node G1 — Edge Device

Industrial IoT edge node for electrical and environmental monitoring.

## Hardware

| Component | Model | Interface |
|-----------|-------|-----------|
| MCU | ESP32-S3-DevKitC-1 (or ESP32) | — |
| Energy Meter | PZEM-004T v3 | UART (9600 baud) |
| Temperature | DS18B20 | 1-Wire (GPIO 5) |
| Humidity | DHT22 | Digital (GPIO 4) |
| Vibration | MPU6050 | I2C (Week 2) |

## Wiring (ESP32)

```
PZEM-004T TX  → GPIO 16 (RX)
PZEM-004T RX  → GPIO 17 (TX)
DHT22 DATA    → GPIO 4
DS18B20 DATA  → GPIO 5 (+ 4.7kΩ pull-up)
Status LED    → GPIO 2
```

## Configuration

Edit `src/config.h` or set build flags in `platformio.ini`:

- `GRIDDNA_WIFI_SSID` / `GRIDDNA_WIFI_PASSWORD`
- `GRIDDNA_MQTT_BROKER` (your PC IP or EMQX host)
- `GRIDDNA_DEVICE_SERIAL` (must match DB seed: `G1-001-DEMO`)
- `GRIDDNA_MQTT_TOPIC`

## Build & Flash

```bash
pio run -t upload
pio device monitor
```

## MQTT Payload

```json
{
  "device_serial": "G1-001-DEMO",
  "voltage": 230.5,
  "current": 4.82,
  "power": 1110.3,
  "energy": 12.45,
  "frequency": 50.0,
  "power_factor": 0.97,
  "temperature": 34.2,
  "humidity": 48.5,
  "vibration_rms": 0.0
}
```

Topic: `griddna/demo/G1-001-DEMO/telemetry`
