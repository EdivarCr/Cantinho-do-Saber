import { Either, fail, succeed } from 'apps/server/src/core/either';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { inject, singleton } from 'tsyringe';
import { StudentEntity } from '../../../enterprise/entities/student.entity';
import { AddressEntity } from '../../../enterprise/entities/address.entity';
import { GuardianEntity } from '../../../enterprise/entities/guardian.entity';
import { StudentGuardianEntity } from '../../../enterprise/entities/student-guardian.entity';

import {
  IStudentRepository,
  STUDENT_REPOSITORY_TOKEN,
} from '../../repositories/student.repository';
import {
  ADDRESS_REPOSITORY_TOKEN,
  IAddressRepository,
} from '../../repositories/address.repository';
import {
  IGuardianRepository,
  GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/guardian.repository';
import {
  IStudentGuardianRepository,
  STUDENT_GUARDIAN_REPOSITORY_TOKEN,
} from '../../repositories/student-guardian.repository';

import { Kinship, SchoolGrade } from 'apps/server/src/core/types/school-enums';

type CreateStudentAddress = {
  street: string;
  number: string;
  district: string;
  complement?: string;
  city?: string;
  state?: string;
};

type CreateStudentUseCaseRequest = {
  name: string;
  birthDate: Date;
  classId: string;
  currentGrade: SchoolGrade;
  studentAddress: CreateStudentAddress;
  guardianAddress: CreateStudentAddress;
  guardian: {
    name: string;
    kinship: Kinship;
    phone: string;
    email: string | null;
  };
};

type CreateStudentUseCaseResponse = Either<CannotCreateError, { studentId: string }>;

@singleton()
export class CreateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
    @inject(ADDRESS_REPOSITORY_TOKEN)
    private readonly addressRepository: IAddressRepository,
    @inject(GUARDIAN_REPOSITORY_TOKEN)
    private readonly guardianRepository: IGuardianRepository,
    @inject(STUDENT_GUARDIAN_REPOSITORY_TOKEN)
    private readonly studentGuardianRepository: IStudentGuardianRepository,
  ) {}

  async execute({
    name,
    birthDate,
    classId,
    currentGrade,
    studentAddress,
    guardianAddress,
    guardian,
  }: CreateStudentUseCaseRequest): Promise<CreateStudentUseCaseResponse> {
    try {
      console.log('[CreateStudentUseCase] Starting student creation...');
      console.log('[CreateStudentUseCase] Student name:', name);
      console.log('[CreateStudentUseCase] Class ID:', classId);
      
      const areAddressesEqual = AddressEntity.compareAddresses({
        studentAddress,
        guardianAddress,
      });

      // 1. Criar/reutilizar endereço do aluno
      const studentAddrEntity = AddressEntity.create(studentAddress);
      console.log('[CreateStudentUseCase] Student address created:', studentAddrEntity.id.toString());
      
      const existingStudentAddr = await this.addressRepository.findDuplicate(studentAddrEntity);
      const finalStudentAddr =
        existingStudentAddr ?? (await this.createAndReturnAddress(studentAddrEntity));
      console.log('[CreateStudentUseCase] Final student address ID:', finalStudentAddr.id.toString());

      // 2. Criar/reutilizar endereço do responsável
      let finalGuardianAddr = finalStudentAddr;
      if (!areAddressesEqual) {
        const guardianAddrEntity = AddressEntity.create(guardianAddress);
        const existingGuardianAddr = await this.addressRepository.findDuplicate(guardianAddrEntity);
        finalGuardianAddr =
          existingGuardianAddr ?? (await this.createAndReturnAddress(guardianAddrEntity));
      }
      console.log('[CreateStudentUseCase] Final guardian address ID:', finalGuardianAddr.id.toString());

      // 3. Criar Guardian
      const guardianEntity = GuardianEntity.create({
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone,
      });
      console.log('[CreateStudentUseCase] Guardian entity created:', guardianEntity.id.toString());

      const canCreateGuardian = await this.guardianRepository.create(guardianEntity);
      if (!canCreateGuardian) {
        console.error('[CreateStudentUseCase] Failed to create guardian');
        return fail(new CannotCreateError('Guardian'));
      }
      console.log('[CreateStudentUseCase] Guardian created successfully');

      // 4. Vincular endereço ao guardian
      await this.addressRepository.linkToGuardian(
        finalGuardianAddr.id.toString(),
        guardianEntity.id.toString(),
      );
      console.log('[CreateStudentUseCase] Address linked to guardian');

      // 5. Criar Student
      const studentEntity = StudentEntity.create({
        name,
        birthDate,
        classId,
        currentGrade,
        addressIds: [finalStudentAddr.id.toString()],
        guardianIds: [],
        enrollmentIds: [],
        attendanceIds: [],
      });
      console.log('[CreateStudentUseCase] Student entity created:', studentEntity.id.toString());

      const canCreateStudent = await this.studentRepository.create(studentEntity);
      if (!canCreateStudent) {
        console.error('[CreateStudentUseCase] Failed to create student');
        return fail(new CannotCreateError('Student'));
      }
      console.log('[CreateStudentUseCase] Student created successfully');

      // 6. Criar vínculo Student-Guardian
      const linkEntity = StudentGuardianEntity.create({
        studentId: studentEntity.id.toString(),
        guardianId: guardianEntity.id.toString(),
        kinship: guardian.kinship,
      });

      const canCreateLink = await this.studentGuardianRepository.create(linkEntity);
      if (!canCreateLink) {
        console.error('[CreateStudentUseCase] Failed to create student-guardian link');
        return fail(new CannotCreateError('Student-Guardian Link'));
      }
      console.log('[CreateStudentUseCase] Student-Guardian link created successfully');

      return succeed({ studentId: studentEntity.id.toString() });
    } catch (error) {
      console.error('[CreateStudentUseCase] Error:', error);
      return fail(new Error('Cannot create student: ' + (error as Error).message));
    }
  }

  private async createAndReturnAddress(addressEntity: AddressEntity): Promise<AddressEntity> {
    await this.addressRepository.create(addressEntity);
    // Pequena otimização: se acabou de criar, não precisa buscar no banco se confiar no ID gerado,
    // mas buscar garante que persistiu.
    const created = await this.addressRepository.findById(addressEntity.id.toString());
    if (!created) throw new Error('Failed to persist address');
    return created;
  }
}
