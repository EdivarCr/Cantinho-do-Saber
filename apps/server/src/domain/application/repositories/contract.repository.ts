import { ContractEntity } from '../../enterprise/entities/contract.entity';

export interface IContractRepository {
  create(contract: ContractEntity): Promise<boolean>;
  findById(id: string): Promise<ContractEntity | null>;
  update(contract: ContractEntity): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}

export const CONTRACT_REPOSITORY_TOKEN = Symbol('ContractRepository');
