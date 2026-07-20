import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SitesModule } from './sites/sites.module';
import { AssetsModule } from './assets/assets.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { HealthModule } from './health/health.module';
import { Organization } from './organizations/entities/organization.entity';
import { User } from './auth/entities/user.entity';
import { Site } from './sites/entities/site.entity';
import { Asset } from './assets/entities/asset.entity';
import { Device } from './assets/entities/device.entity';
import { Alert } from './telemetry/entities/alert.entity';
import { Prediction } from './telemetry/entities/prediction.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Organization, User, Site, Asset, Device, Alert, Prediction],
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    OrganizationsModule,
    SitesModule,
    AssetsModule,
    TelemetryModule,
    HealthModule,
  ],
})
export class AppModule {}
