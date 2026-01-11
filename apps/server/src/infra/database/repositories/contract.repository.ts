import { IContractRepository } from 'apps/server/src/domain/application/repositories/contract.repository';
import { ContractEntity } from 'apps/server/src/domain/enterprise/entities/contract.entity';
import { prisma } from 'packages/database/src/client';
import { singleton } from 'tsyringe';
import { ContractMapper } from '../mapper/contract.mapper';
import { ContractSchema } from '../schemas/contract.schema';

@singleton()
export class ContractRepository implements IContractRepository {
  async create(contract: ContractEntity): Promise<boolean> {
    try {
      const raw = ContractMapper.toDatabase(contract);
      await prisma.contract.create({ data: raw });
      return true;
    } catch (error) {
      console.error('[ContractRepository] Error creating contract:', error);
      return false;
    }
  }

  async findById(id: string): Promise<ContractEntity | null> {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { enrollments: true },
    });
    if (!contract || contract.deletedAt) return null;
    return ContractMapper.toDomain(contract as ContractSchema);
  }

  async update(contract: ContractEntity): Promise<boolean> {
    try {
      const raw = ContractMapper.toDatabase(contract);
      await prisma.contract.update({
        where: { id: raw.id },
        data: raw,
      });
      return true;
    } catch (error) {
      console.error('[ContractRepository] Error updating contract:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.contract.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      console.error('[ContractRepository] Error deleting contract:', error);
      return false;
    }
  }
}
