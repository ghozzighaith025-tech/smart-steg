import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TelemetryService } from './telemetry.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AssetsService } from '../assets/assets.service';

@ApiTags('Telemetry')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TelemetryController {
  constructor(
    private telemetryService: TelemetryService,
    private assetsService: AssetsService,
  ) {}

  @Get('assets/:assetId/telemetry')
  @ApiOperation({ summary: 'Get aggregated telemetry for asset primary device' })
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'interval', required: false, example: '1 minute' })
  async getAssetTelemetry(
    @Param('assetId') assetId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval: string,
    @Request() req: { user: { orgId: string } },
  ) {
    const asset = await this.assetsService.findOne(assetId, req.user.orgId);
    const device = asset.devices?.[0];
    if (!device) return { data: [], message: 'No device linked to asset' };

    const data = await this.telemetryService.getTelemetry(
      device.id,
      new Date(from),
      new Date(to),
      interval ?? '1 minute',
    );
    return { assetId, deviceId: device.id, data };
  }

  @Get('devices/:deviceId/telemetry/latest')
  @ApiOperation({ summary: 'Get latest telemetry reading' })
  getLatest(@Param('deviceId') deviceId: string) {
    return this.telemetryService.getLatest(deviceId);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'List alerts for organization' })
  getAlerts(@Request() req: { user: { orgId: string } }) {
    return this.telemetryService.findAlerts(req.user.orgId);
  }
}
