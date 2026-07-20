import { Controller, Get, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Assets')
@Controller('assets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List assets (optionally by site)' })
  @ApiQuery({ name: 'site_id', required: false })
  findAll(
    @Request() req: { user: { orgId: string } },
    @Query('site_id') siteId?: string,
  ) {
    if (siteId) {
      return this.assetsService.findBySite(siteId, req.user.orgId);
    }
    return this.assetsService.findAllByOrg(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID with devices' })
  findOne(@Param('id') id: string, @Request() req: { user: { orgId: string } }) {
    return this.assetsService.findOne(id, req.user.orgId);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get asset health summary' })
  async health(@Param('id') id: string, @Request() req: { user: { orgId: string } }) {
    const asset = await this.assetsService.findOne(id, req.user.orgId);
    return {
      assetId: asset.id,
      name: asset.name,
      healthScore: asset.healthScore,
      deviceCount: asset.devices?.length ?? 0,
      devicesOnline: asset.devices?.filter((d) => d.status === 'online').length ?? 0,
    };
  }
}
