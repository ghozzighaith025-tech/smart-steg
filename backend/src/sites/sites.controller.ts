import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Sites')
@Controller('sites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SitesController {
  constructor(private sitesService: SitesService) {}

  @Get()
  @ApiOperation({ summary: 'List all sites for organization' })
  findAll(@Request() req: { user: { orgId: string } }) {
    return this.sitesService.findByOrg(req.user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get site by ID' })
  findOne(@Param('id') id: string, @Request() req: { user: { orgId: string } }) {
    return this.sitesService.findOne(id, req.user.orgId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new site' })
  create(@Body() dto: CreateSiteDto, @Request() req: { user: { orgId: string } }) {
    return this.sitesService.create(req.user.orgId, dto);
  }
}
