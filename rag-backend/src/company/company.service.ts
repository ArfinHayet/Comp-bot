import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {}

  findAll(userId: string): Promise<Company[]> {
    return this.repo.find({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string, userId: string): Promise<Company> {
    const c = await this.repo.findOne({ where: { id, userId } });
    if (!c) throw new NotFoundException(`Company ${id} not found`);
    return c;
  }

  create(dto: CreateCompanyDto, userId: string): Promise<Company> {
    return this.repo.save(this.repo.create({ ...dto, userId }));
  }

  async update(id: string, userId: string, dto: UpdateCompanyDto): Promise<Company> {
    const c = await this.findOne(id, userId);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string, userId: string): Promise<void> {
    const c = await this.findOne(id, userId);
    await this.repo.remove(c);
  }

  /** Returns the most-recently updated company for this user, or null. Used by ChatService. */
  getActive(userId: string): Promise<Company | null> {
    return this.repo.findOne({ where: { userId }, order: { updatedAt: 'DESC' } });
  }
}
