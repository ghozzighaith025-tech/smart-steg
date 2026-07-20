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
import { Organization } from '../../organizations/entities/organization.entity';
import { Asset } from '../../assets/entities/asset.entity';

export type SiteType = 'factory' | 'building' | 'utility' | 'hotel' | 'hospital' | 'other';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization, (org) => org.sites)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'enum', enum: ['factory', 'building', 'utility', 'hotel', 'hospital', 'other'], default: 'factory' })
  type: SiteType;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'float', nullable: true })
  latitude: number;

  @Column({ type: 'float', nullable: true })
  longitude: number;

  @Column({ default: 'Africa/Tunis' })
  timezone: string;

  @OneToMany(() => Asset, (asset) => asset.site)
  assets: Asset[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
