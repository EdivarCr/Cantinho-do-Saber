import { Entity } from 'apps/server/src/core/entities/entity';
import { UniqueEntityId } from 'apps/server/src/core/entities/unique-entity-id';
import { Optional } from 'apps/server/src/core/types/optional';

export interface ContractProps {
  signatureDate: Date;
  dueDate: Date | null;
  documentUrl: string | null;
  monthlyAmount: number; // Valor mensal da mensalidade

  createdAt: Date;
  deletedAt: Date | null;
}

export class ContractEntity extends Entity<ContractProps> {
  get signatureDate() {
    return this.props.signatureDate;
  }

  get dueDate() {
    return this.props.dueDate;
  }

  get documentUrl() {
    return this.props.documentUrl;
  }

  get monthlyAmount() {
    return this.props.monthlyAmount;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  static create(
    props: Optional<ContractProps, 'createdAt' | 'deletedAt' | 'dueDate' | 'documentUrl'>,
    id?: UniqueEntityId,
  ): ContractEntity {
    const contract = new ContractEntity(
      {
        ...props,
        dueDate: props.dueDate ?? null,
        documentUrl: props.documentUrl ?? null,
        createdAt: props.createdAt ?? new Date(),
        deletedAt: props.deletedAt ?? null,
      },
      id,
    );
    return contract;
  }
}
