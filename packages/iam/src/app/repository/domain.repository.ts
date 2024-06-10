import { Injectable } from "@nestjs/common";
import { PrismaService } from "@pisces/backend";
import { Page, PageRequest, paginator } from "@pisces/common";
import { Provider } from "@pisces/musubi/server";
import { Domain } from '@prisma/client';
import { DomainDomainService, DomainQuery } from "../domain/domain.entity";

@Injectable()
export class DomainRepository implements Provider<DomainDomainService> {
  constructor(
    private prisma: PrismaService,
  ) {
  }

  async deleteDomain(id: bigint) {
    await this.prisma.domain.delete({ where: { id: id } });
  }

  async pageDomain(pageRequest: PageRequest<Domain>, query?: DomainQuery): Promise<Page<Domain>> {
    return await paginator(pageRequest)(this.prisma.domain, { where: query, include:{product: true}});
  }

  async createDomain(domain: Domain) {
    await this.prisma.domain.create({ data: domain });
  }

  async updateDomain(domain: Domain) {
    await this.prisma.domain.update({ where: { id: domain.id }, data: domain });
  }
}
