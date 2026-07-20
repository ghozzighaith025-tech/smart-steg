import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';
import { Device } from '../../assets/entities/device.entity';

export type AlertSeverity = 'info' | 'warning' | 'critical';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @ManyToOne(() => Device, { nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'enum', enum: ['info', 'warning', 'critical'], default: 'warning' })
  severity: AlertSeverity;

  @Column({ length: 100 })
  type: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ name: 'anomaly_score', type: 'float', nullable: true })
  anomalyScore: number;

  @Column({ name: 'shap_explanation', type: 'jsonb', nullable: true })
  shapExplanation: Record<string, unknown>;

  @Column({ default: false })
  acknowledged: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
