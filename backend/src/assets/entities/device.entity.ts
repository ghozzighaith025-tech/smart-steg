import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from './asset.entity';

export type DeviceStatus = 'online' | 'offline' | 'maintenance' | 'error';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @ManyToOne(() => Asset, (asset) => asset.devices)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ unique: true, length: 100 })
  serial: string;

  @Column({ name: 'firmware_version', nullable: true })
  firmwareVersion: string;

  @Column({ name: 'hardware_version', default: 'G1' })
  hardwareVersion: string;

  @Column({ type: 'enum', enum: ['online', 'offline', 'maintenance', 'error'], default: 'offline' })
  status: DeviceStatus;

  @Column({ name: 'last_seen_at', nullable: true })
  lastSeenAt: Date;

  @Column({ name: 'mqtt_topic', nullable: true })
  mqttTopic: string;

  @Column({ type: 'jsonb', default: {} })
  config: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
