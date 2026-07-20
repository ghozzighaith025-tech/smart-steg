import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Device } from './entities/device.entity';
import { SitesService } from '../sites/sites.service';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private assetsRepo: Repository<Asset>,
    @InjectRepository(Device) private devicesRepo: Repository<Device>,
    private sitesService: SitesService,
  ) {}

  async findBySite(siteId: string, orgId: string): Promise<Asset[]> {
    await this.sitesService.findOne(siteId, orgId);
    return this.assetsRepo.find({
      where: { siteId },
      relations: ['devices'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, orgId: string): Promise<Asset> {
    const asset = await this.assetsRepo.findOne({
      where: { id },
      relations: ['devices', 'site'],
    });
    if (!asset || asset.site.orgId !== orgId) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async findAllByOrg(orgId: string): Promise<Asset[]> {
    return this.assetsRepo
      .createQueryBuilder('asset')
      .innerJoin('asset.site', 'site')
      .where('site.org_id = :orgId', { orgId })
      .leftJoinAndSelect('asset.devices', 'devices')
      .orderBy('asset.name', 'ASC')
      .getMany();
  }

  async getDevices(assetId: string, orgId: string): Promise<Device[]> {
    const asset = await this.findOne(assetId, orgId);
    return asset.devices ?? [];
  }
}
