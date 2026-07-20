import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';

@Injectable()
export class SitesService {
  constructor(@InjectRepository(Site) private sitesRepo: Repository<Site>) {}

  findByOrg(orgId: string): Promise<Site[]> {
    return this.sitesRepo.find({
      where: { orgId },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, orgId: string): Promise<Site> {
    const site = await this.sitesRepo.findOne({ where: { id, orgId } });
    if (!site) throw new NotFoundException('Site not found');
    return site;
  }

  async create(orgId: string, dto: CreateSiteDto): Promise<Site> {
    const site = this.sitesRepo.create({ ...dto, orgId });
    return this.sitesRepo.save(site);
  }
}
