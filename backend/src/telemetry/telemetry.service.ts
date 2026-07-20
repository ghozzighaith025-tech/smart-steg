import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as mqtt from 'mqtt';
import { Device } from '../assets/entities/device.entity';
import { Alert } from './entities/alert.entity';

export interface TelemetryPayload {
  device_serial: string;
  voltage?: number;
  current?: number;
  power?: number;
  energy?: number;
  frequency?: number;
  power_factor?: number;
  temperature?: number;
  humidity?: number;
  vibration_rms?: number;
  timestamp?: string;
}

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelemetryService.name);
  private mqttClient: mqtt.MqttClient | null = null;

  constructor(
    private config: ConfigService,
    private dataSource: DataSource,
    @InjectRepository(Device) private devicesRepo: Repository<Device>,
    @InjectRepository(Alert) private alertsRepo: Repository<Alert>,
  ) {}

  onModuleInit() {
    const brokerUrl = this.config.get<string>('MQTT_BROKER_URL');
    if (!brokerUrl) {
      this.logger.warn('MQTT_BROKER_URL not set — telemetry ingest disabled');
      return;
    }

    this.mqttClient = mqtt.connect(brokerUrl, {
      clientId: `griddna-backend-${Date.now()}`,
      username: this.config.get('MQTT_USERNAME'),
      password: this.config.get('MQTT_PASSWORD'),
    });

    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.mqttClient?.subscribe('griddna/+/+/telemetry', (err) => {
        if (err) this.logger.error('MQTT subscribe failed', err);
        else this.logger.log('Subscribed to griddna/+/+/telemetry');
      });
    });

    this.mqttClient.on('message', (_topic, payload) => {
      try {
        const data = JSON.parse(payload.toString()) as TelemetryPayload;
        void this.ingest(data);
      } catch (e) {
        this.logger.error('Failed to parse MQTT payload', e);
      }
    });

    this.mqttClient.on('error', (err) => this.logger.error('MQTT error', err));
  }

  onModuleDestroy() {
    this.mqttClient?.end();
  }

  async ingest(data: TelemetryPayload): Promise<void> {
    const device = await this.devicesRepo.findOne({
      where: { serial: data.device_serial },
    });
    if (!device) {
      this.logger.warn(`Unknown device: ${data.device_serial}`);
      return;
    }

    const time = data.timestamp ? new Date(data.timestamp) : new Date();

    await this.dataSource.query(
      `INSERT INTO telemetry (time, device_id, voltage, current, power, energy, frequency, power_factor, temperature, humidity, vibration_rms, raw_payload)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        time,
        device.id,
        data.voltage ?? null,
        data.current ?? null,
        data.power ?? null,
        data.energy ?? null,
        data.frequency ?? null,
        data.power_factor ?? null,
        data.temperature ?? null,
        data.humidity ?? null,
        data.vibration_rms ?? null,
        JSON.stringify(data),
      ],
    );

    await this.devicesRepo.update(device.id, {
      status: 'online',
      lastSeenAt: time,
    });
  }

  async getTelemetry(
    deviceId: string,
    from: Date,
    to: Date,
    interval = '1 minute',
  ) {
    return this.dataSource.query(
      `SELECT time_bucket($4::interval, time) AS bucket,
              AVG(voltage) AS voltage,
              AVG(current) AS current,
              AVG(power) AS power,
              MAX(energy) AS energy,
              AVG(frequency) AS frequency,
              AVG(power_factor) AS power_factor,
              AVG(temperature) AS temperature,
              AVG(humidity) AS humidity,
              AVG(vibration_rms) AS vibration_rms
       FROM telemetry
       WHERE device_id = $1 AND time >= $2 AND time <= $3
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [deviceId, from, to, interval],
    );
  }

  async getLatest(deviceId: string) {
    const rows = await this.dataSource.query(
      `SELECT * FROM telemetry WHERE device_id = $1 ORDER BY time DESC LIMIT 1`,
      [deviceId],
    );
    return rows[0] ?? null;
  }

  findAlerts(orgId: string) {
    return this.alertsRepo
      .createQueryBuilder('alert')
      .innerJoin('alert.asset', 'asset')
      .innerJoin('asset.site', 'site')
      .where('site.org_id = :orgId', { orgId })
      .orderBy('alert.created_at', 'DESC')
      .limit(100)
      .getMany();
  }
}
