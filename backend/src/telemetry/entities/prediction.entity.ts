import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Asset } from '../../assets/entities/asset.entity';

@Entity('predictions')
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'asset_id' })
  assetId: string;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ name: 'model_version', length: 50 })
  modelVersion: string;

  @Column({ name: 'rul_days', type: 'float', nullable: true })
  rulDays: number;

  @Column({ name: 'failure_prob', type: 'float', nullable: true })
  failureProb: number;

  @Column({ name: 'health_trend', nullable: true })
  healthTrend: string;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
