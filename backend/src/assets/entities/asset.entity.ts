import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Site } from '../../sites/entities/site.entity';
import { Device } from './device.entity';

export type AssetType = 'transformer' | 'motor' | 'panel' | 'meter' | 'hvac' | 'generator' | 'other';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'site_id' })
  siteId: string;

  @ManyToOne(() => Site, (site) => site.assets)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ['transformer', 'motor', 'panel', 'meter', 'hvac', 'generator', 'other'], default: 'other' })
  type: AssetType;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  model: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'install_date', type: 'date', nullable: true })
  installDate: Date;

  @Column({ name: 'rated_power_kw', type: 'float', nullable: true })
  ratedPowerKw: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;

  @Column({ name: 'health_score', type: 'float', default: 100 })
  healthScore: number;

  @OneToMany(() => Device, (device) => device.asset)
  devices: Device[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
