import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Alert } from './entities/alert.entity';
import { Prediction } from './entities/prediction.entity';
import { Device } from '../assets/entities/device.entity';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, Prediction, Device]),
    AssetsModule,
  ],
  controllers: [TelemetryController],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
