import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { ContractEntity } from 'apps/server/src/domain/enterprise/entities/contract.entity';
import { ContractSchema } from '../schemas/contract.schema';

export interface ContractPersistenceDTO {
  id: string;
  signatureDate: Date;
  dueDate: Date | null;
  documentUrl: string | null;
  monthlyAmount: number;
  createdAt: Date;
  deletedAt: Date | null;
}

export class ContractMapper {
  static toDomain(raw: ContractSchema): ContractEntity {
    return ContractEntity.create(
      {
        signatureDate: raw.signatureDate,
        dueDate: raw.dueDate,
        documentUrl: raw.documentUrl,
        monthlyAmount: raw.monthlyAmount,
        createdAt: raw.createdAt,
        deletedAt: raw.deletedAt,
      },
      new UniqueEntityId(raw.id),
    );
  }

  static toDatabase(entity: ContractEntity): ContractPersistenceDTO {
    return {
      id: entity.id.toString(),
      signatureDate: entity.signatureDate,
      dueDate: entity.dueDate,
      documentUrl: entity.documentUrl,
      monthlyAmount: entity.monthlyAmount,
      createdAt: entity.createdAt,
      deletedAt: entity.deletedAt,
    };
  }
}
