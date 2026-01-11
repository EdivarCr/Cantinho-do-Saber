import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { injectable } from 'tsyringe';
import { checkJwt } from '../../../auth/auth.middleware';
import { validateBody } from '../../../http-body-validator/validator.middleware';
import { CreateStudentUseCase } from 'apps/server/src/domain/application/use-cases/student/create-student.use-case';
import { CannotCreateError } from 'apps/server/src/core/errors/cannot-create.error';
import { Kinship, SchoolGrade } from 'apps/server/src/core/types/school-enums';

const addressSchema = z.object({
  street: z.string().trim().nonempty(),
  number: z.string().trim().nonempty(),
  district: z.string().trim().nonempty(),
  complement: z.string().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

const guardianSchema = z.object({
  name: z.string(),
  kinship: z.enum(Kinship),
  phone: z.string(),
  email: z.string().nullable(),
});

const createStudentBodySchema = z.object({
  name: z.string().trim().nonempty(),
  birthDate: z.string().transform((val) => {
    const [day, month, year] = val.split('/');

    const date = new Date(`${year}-${month}-${day}T00:00:00`);

    if (isNaN(date.getTime())) {
      throw new Error('Formato inválido, esperado: DD/MM/YYYY');
    }

    return date;
  }),
  classId: z.string().trim().nonempty(),
  currentGrade: z.enum(SchoolGrade),
  studentAddress: addressSchema,
  guardianAddress: addressSchema,
  guardian: guardianSchema,
});

type CreateStudentBodySchema = z.infer<typeof createStudentBodySchema>;

const bodyValidationPipe = validateBody(createStudentBodySchema);

@injectable()
export class CreateStudentController {
  public readonly router: Router;

  constructor(private readonly createStudentUseCase: CreateStudentUseCase) {
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes(): void {
    this.router.post('/students', checkJwt, bodyValidationPipe, this.handle.bind(this));
  }

  async handle(req: Request, res: Response) {
    try {
      console.log('[CreateStudentController] ========== START ==========');
      console.log('[CreateStudentController] Request body:', JSON.stringify(req.body, null, 2));

      const { birthDate, classId, currentGrade, guardian, guardianAddress, name, studentAddress } =
        req.body as CreateStudentBodySchema;

      console.log('[CreateStudentController] Parsed data:', { 
        name, 
        birthDate, 
        classId, 
        currentGrade,
        hasGuardian: !!guardian,
        hasStudentAddress: !!studentAddress,
        hasGuardianAddress: !!guardianAddress
      });

      const result = await this.createStudentUseCase.execute({
        birthDate,
        classId,
        currentGrade,
        guardian,
        guardianAddress,
        name,
        studentAddress,
      });

      if (result.isFail()) {
        const exception = result.value;
        const message = exception.message;

        console.error('[CreateStudentController] ❌ Use case FAILED:', exception);

        switch (exception.constructor) {
          case CannotCreateError:
            return res.status(400).json({ message });
          default:
            return res.status(500).json({ message });
        }
      }

      const { studentId } = result.value;

      console.log('[CreateStudentController] ✅ SUCCESS - Student ID:', studentId);
      console.log('[CreateStudentController] ========== END ==========');

      return res.status(201).json({ 
        message: 'Student created successfully',
        studentId 
      });
    } catch (error) {
      console.error('[CreateStudentController] ❌ EXCEPTION:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
