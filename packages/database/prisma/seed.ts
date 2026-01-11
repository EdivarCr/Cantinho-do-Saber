import { PrismaClient, SchoolGrade, Shift, AccessLevel, AttendanceStatus, Kinship } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  await prisma.attendance.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.studentHasGuardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.address.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();

  console.log('✅ Cleared existing data');

  // ============================================================================
  // 1. CRIAR ADMIN USER
  // ============================================================================
  const adminProfileId = ulid();
  const adminProfile = await prisma.profile.create({
    data: {
      id: adminProfileId,
      accessLevel: AccessLevel.ADMIN,
    },
  });

  const hashedAdminPassword = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.create({
    data: {
      id: ulid(),
      name: 'Administrador',
      email: 'admin@cantinho.com',
      password: hashedAdminPassword,
      profileId: adminProfile.id,
      createdAt: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // ============================================================================
  // 2. CRIAR 3 TEACHERS COM USERS
  // ============================================================================
  const teachersData = [
    {
      name: 'Maria da Silva Santos',
      taxId: '12345678901',
      phone: '11987654321',
      pixKey: 'maria.silva@pix.com',
      expertise: 'Educação Infantil e Fundamental I',
      email: 'maria.silva@cantinho.com',
      qualifiedGrades: [SchoolGrade.PRIMEIRO_ANO, SchoolGrade.SEGUNDO_ANO, SchoolGrade.TERCEIRO_ANO],
    },
    {
      name: 'João Pedro Oliveira',
      taxId: '23456789012',
      phone: '11987654322',
      pixKey: 'joao.oliveira@pix.com',
      expertise: 'Matemática e Ciências',
      email: 'joao.oliveira@cantinho.com',
      qualifiedGrades: [SchoolGrade.QUARTO_ANO, SchoolGrade.QUINTO_ANO],
    },
    {
      name: 'Ana Carolina Ferreira',
      taxId: '34567890123',
      phone: '11987654323',
      pixKey: 'ana.ferreira@pix.com',
      expertise: 'Língua Portuguesa e Literatura',
      email: 'ana.ferreira@cantinho.com',
      qualifiedGrades: [SchoolGrade.SEXTO_ANO, SchoolGrade.SETIMO_ANO, SchoolGrade.OITAVO_ANO],
    },
  ];

  const teachers = [];
  for (const teacherData of teachersData) {
    const profileId = ulid();
    await prisma.profile.create({
      data: {
        id: profileId,
        accessLevel: AccessLevel.PROFESSOR,
      },
    });

    const hashedPassword = await bcrypt.hash('Professor@123', 10);
    await prisma.user.create({
      data: {
        id: ulid(),
        name: teacherData.name,
        email: teacherData.email,
        password: hashedPassword,
        profileId: profileId,
        createdAt: new Date(),
      },
    });

    const teacher = await prisma.teacher.create({
      data: {
        id: ulid(),
        name: teacherData.name,
        taxId: teacherData.taxId,
        phone: teacherData.phone,
        pixKey: teacherData.pixKey,
        expertise: teacherData.expertise,
        email: teacherData.email,
        qualifiedGrades: teacherData.qualifiedGrades,
        startDate: new Date('2024-01-15'),
        status: 'ATIVO',
        createdAt: new Date(),
      },
    });

    teachers.push(teacher);
  }

  console.log(`✅ Created ${teachers.length} teachers with users`);

  // ============================================================================
  // 3. CRIAR 3 CLASSES (diferentes turnos e séries)
  // ============================================================================
  const classesData = [
    {
      name: '1º Ano A - Matutino',
      shift: Shift.MATUTINO,
      grades: [SchoolGrade.PRIMEIRO_ANO],
      teacherId: teachers[0].id,
    },
    {
      name: '4º/5º Ano - Vespertino',
      shift: Shift.VESPERTINO,
      grades: [SchoolGrade.QUARTO_ANO, SchoolGrade.QUINTO_ANO],
      teacherId: teachers[1].id,
    },
    {
      name: '6º/7º Ano - Vespertino',
      shift: Shift.VESPERTINO,
      grades: [SchoolGrade.SEXTO_ANO, SchoolGrade.SETIMO_ANO],
      teacherId: teachers[2].id,
    },
  ];

  const classes = [];
  for (const classData of classesData) {
    const classObj = await prisma.class.create({
      data: {
        id: ulid(),
        name: classData.name,
        shift: classData.shift,
        grades: classData.grades,
        teacherId: classData.teacherId,
        createdAt: new Date(),
      },
    });
    classes.push(classObj);
  }

  console.log(`✅ Created ${classes.length} classes`);

  // ============================================================================
  // 4. CRIAR 6 ADDRESSES (alguns compartilhados)
  // ============================================================================
  const addressesData = [
    {
      street: 'Rua das Flores',
      number: '123',
      district: 'Centro',
      complement: 'Apto 45',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      street: 'Av. Paulista',
      number: '1000',
      district: 'Bela Vista',
      complement: '',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      street: 'Rua dos Jardins',
      number: '456',
      district: 'Jardim Europa',
      complement: 'Casa',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      street: 'Rua Consolação',
      number: '789',
      district: 'Consolação',
      complement: 'Bloco B',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      street: 'Av. Faria Lima',
      number: '2000',
      district: 'Itaim Bibi',
      complement: 'Conj 12',
      city: 'São Paulo',
      state: 'SP',
    },
    {
      street: 'Rua Augusta',
      number: '567',
      district: 'Cerqueira César',
      complement: '',
      city: 'São Paulo',
      state: 'SP',
    },
  ];

  const addresses = [];
  for (const addrData of addressesData) {
    const address = await prisma.address.create({
      data: {
        id: ulid(),
        ...addrData,
        createdAt: new Date(),
      },
    });
    addresses.push(address);
  }

  console.log(`✅ Created ${addresses.length} addresses`);

  // ============================================================================
  // 5. CRIAR 3 GUARDIANS
  // ============================================================================
  const guardiansData = [
    {
      name: 'Carlos Alberto Santos',
      email: 'carlos.santos@email.com',
      phone: '11999887766',
      addressIds: [addresses[0].id],
    },
    {
      name: 'Patrícia Lima Oliveira',
      email: 'patricia.lima@email.com',
      phone: '11999887767',
      addressIds: [addresses[1].id],
    },
    {
      name: 'Roberto Silva Costa',
      email: 'roberto.costa@email.com',
      phone: '11999887768',
      addressIds: [addresses[2].id],
    },
  ];

  const guardians = [];
  for (const guardianData of guardiansData) {
    const guardian = await prisma.guardian.create({
      data: {
        id: ulid(),
        name: guardianData.name,
        email: guardianData.email,
        phone: guardianData.phone,
        createdAt: new Date(),
        addresses: {
          connect: guardianData.addressIds.map((id) => ({ id })),
        },
      },
    });
    guardians.push(guardian);
  }

  console.log(`✅ Created ${guardians.length} guardians`);

  // ============================================================================
  // 6. CRIAR 10 STUDENTS (distribuídos nas turmas)
  // ============================================================================
  const studentsData = [
    {
      name: 'Lucas Gabriel Santos',
      birthDate: new Date('2017-03-15'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: classes[0].id,
      addressIds: [addresses[0].id],
      guardianId: guardians[0].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Julia Fernanda Santos',
      birthDate: new Date('2018-07-20'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: classes[0].id,
      addressIds: [addresses[0].id],
      guardianId: guardians[0].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Pedro Henrique Lima',
      birthDate: new Date('2016-05-10'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: classes[0].id,
      addressIds: [addresses[1].id],
      guardianId: guardians[1].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Mariana Costa Oliveira',
      birthDate: new Date('2014-09-25'),
      currentGrade: SchoolGrade.QUARTO_ANO,
      classId: classes[1].id,
      addressIds: [addresses[1].id],
      guardianId: guardians[1].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Rafael Santos Silva',
      birthDate: new Date('2013-11-30'),
      currentGrade: SchoolGrade.QUINTO_ANO,
      classId: classes[1].id,
      addressIds: [addresses[2].id],
      guardianId: guardians[2].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Isabela Rodrigues Costa',
      birthDate: new Date('2014-02-18'),
      currentGrade: SchoolGrade.QUARTO_ANO,
      classId: classes[1].id,
      addressIds: [addresses[3].id],
      guardianId: guardians[2].id,
      kinship: Kinship.AVOS,
    },
    {
      name: 'Gabriel Alves Ferreira',
      birthDate: new Date('2012-04-12'),
      currentGrade: SchoolGrade.SEXTO_ANO,
      classId: classes[2].id,
      addressIds: [addresses[4].id],
      guardianId: guardians[0].id,
      kinship: Kinship.TIOS,
    },
    {
      name: 'Sofia Martins Pereira',
      birthDate: new Date('2011-08-08'),
      currentGrade: SchoolGrade.SETIMO_ANO,
      classId: classes[2].id,
      addressIds: [addresses[4].id],
      guardianId: guardians[1].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Miguel Souza Lima',
      birthDate: new Date('2012-01-22'),
      currentGrade: SchoolGrade.SEXTO_ANO,
      classId: classes[2].id,
      addressIds: [addresses[5].id],
      guardianId: guardians[2].id,
      kinship: Kinship.PAI_MAE,
    },
    {
      name: 'Laura Beatriz Almeida',
      birthDate: new Date('2011-12-05'),
      currentGrade: SchoolGrade.SETIMO_ANO,
      classId: classes[2].id,
      addressIds: [addresses[5].id],
      guardianId: guardians[2].id,
      kinship: Kinship.PAI_MAE,
    },
  ];

  const students = [];
  for (const studentData of studentsData) {
    const student = await prisma.student.create({
      data: {
        id: ulid(),
        name: studentData.name,
        birthDate: studentData.birthDate,
        currentGrade: studentData.currentGrade,
        classId: studentData.classId,
        createdAt: new Date(),
        addresses: {
          connect: studentData.addressIds.map((id) => ({ id })),
        },
      },
    });

    await prisma.studentHasGuardian.create({
      data: {
        studentId: student.id,
        guardianId: studentData.guardianId,
        kinship: studentData.kinship,
        createdAt: new Date(),
      },
    });

    students.push(student);
  }

  console.log(`✅ Created ${students.length} students with guardians`);

  // ============================================================================
  // 7. CRIAR 5 LESSONS (últimos 7 dias, respeitando horário 13:00-17:30)
  // ============================================================================
  const today = new Date();
  const lessonsData = [
    {
      classId: classes[0].id,
      date: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
      startTime: '13:00',
      endTime: '14:30',
      duration: '1h30m',
    },
    {
      classId: classes[0].id,
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      startTime: '13:00',
      endTime: '14:30',
      duration: '1h30m',
    },
    {
      classId: classes[1].id,
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      startTime: '14:00',
      endTime: '16:00',
      duration: '2h',
    },
    {
      classId: classes[2].id,
      date: new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      startTime: '15:00',
      endTime: '17:00',
      duration: '2h',
    },
    {
      classId: classes[2].id,
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      startTime: '15:30',
      endTime: '17:30',
      duration: '2h',
    },
  ];

  const lessons = [];
  for (const lessonData of lessonsData) {
    const lesson = await prisma.lesson.create({
      data: {
        id: ulid(),
        date: lessonData.date,
        startTime: lessonData.startTime,
        endTime: lessonData.endTime,
        duration: lessonData.duration,
        classId: lessonData.classId,
        createdAt: new Date(),
      },
    });
    lessons.push(lesson);
  }

  console.log(`✅ Created ${lessons.length} lessons`);

  // ============================================================================
  // 8. CRIAR 20 ATTENDANCE RECORDS (60% PRESENTE, 30% AUSENTE, 10% JUSTIFICADO)
  // ============================================================================
  const attendanceStatuses = [
    ...Array(12).fill(AttendanceStatus.PRESENTE), // 60%
    ...Array(6).fill(AttendanceStatus.AUSENTE),   // 30%
    ...Array(2).fill(AttendanceStatus.JUSTIFICADO), // 10%
  ];

  let attendanceCount = 0;
  for (const lesson of lessons) {
    // Get students from this lesson's class
    const classStudents = students.filter((s) => s.classId === lesson.classId);

    // Create attendance for each student (randomly pick status)
    for (const student of classStudents) {
      if (attendanceCount >= 20) break;

      const status = attendanceStatuses[attendanceCount % attendanceStatuses.length];

      await prisma.attendance.create({
        data: {
          id: ulid(),
          status: status,
          studentId: student.id,
          lessonId: lesson.id,
          createdAt: new Date(),
        },
      });

      attendanceCount++;
    }

    if (attendanceCount >= 20) break;
  }

  console.log(`✅ Created ${attendanceCount} attendance records`);

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📝 Summary:');
  console.log(`   - 1 Admin User (admin@cantinho.com / Admin@123)`);
  console.log(`   - ${teachers.length} Teachers with Users (password: Professor@123)`);
  console.log(`   - ${classes.length} Classes`);
  console.log(`   - ${students.length} Students`);
  console.log(`   - ${guardians.length} Guardians`);
  console.log(`   - ${addresses.length} Addresses`);
  console.log(`   - ${lessons.length} Lessons`);
  console.log(`   - ${attendanceCount} Attendance Records`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
