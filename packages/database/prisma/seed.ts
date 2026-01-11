import { PrismaClient, SchoolGrade, Shift, AccessLevel, AttendanceStatus, Kinship } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ulid } from 'ulid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.attendance.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.studentHasGuardian.deleteMany();
  await prisma.student.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.address.deleteMany();
  await prisma.class.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.user.deleteMany();
  await prisma.profile.deleteMany();
  console.log('✅ Existing data cleaned\n');

  // ============================================
  // 1. CREATE ADMIN USER
  // ============================================
  console.log('👤 Creating admin user...');
  const adminProfile = await prisma.profile.create({
    data: {
      id: ulid(),
      accessLevel: AccessLevel.ADMIN,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: ulid(),
      email: 'admin@cantinho.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Administrador',
      profileId: adminProfile.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}\n`);

  // ============================================
  // 2. CREATE TEACHERS (with users)
  // ============================================
  console.log('👨‍🏫 Creating teachers...');
  
  // Teacher 1 - Maria Silva
  const mariaProfile = await prisma.profile.create({
    data: {
      id: ulid(),
      accessLevel: AccessLevel.PROFESSOR,
    },
  });

  const mariaUser = await prisma.user.create({
    data: {
      id: ulid(),
      email: 'maria.silva@cantinho.com',
      password: await bcrypt.hash('senha123', 10),
      name: 'Maria Silva',
      profileId: mariaProfile.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const mariaSilva = await prisma.teacher.create({
    data: {
      id: ulid(),
      name: 'Maria Silva',
      email: 'maria.silva@cantinho.com',
      taxId: '12345678901',
      phone: '(11) 98765-4321',
      pixKey: 'maria.silva@cantinho.com',
      expertise: 'Alfabetização e Letramento',
      qualifiedGrades: [SchoolGrade.PRIMEIRO_ANO, SchoolGrade.SEGUNDO_ANO, SchoolGrade.TERCEIRO_ANO],
      startDate: new Date('2024-02-01'),
      status: 'ATIVO',
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Teacher 2 - João Santos
  const joaoProfile = await prisma.profile.create({
    data: {
      id: ulid(),
      accessLevel: AccessLevel.PROFESSOR,
    },
  });

  const joaoUser = await prisma.user.create({
    data: {
      id: ulid(),
      email: 'joao.santos@cantinho.com',
      password: await bcrypt.hash('senha123', 10),
      name: 'João Santos',
      profileId: joaoProfile.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const joaoSantos = await prisma.teacher.create({
    data: {
      id: ulid(),
      name: 'João Santos',
      email: 'joao.santos@cantinho.com',
      taxId: '98765432109',
      phone: '(11) 97654-3210',
      pixKey: '11976543210',
      expertise: 'Matemática e Ciências',
      qualifiedGrades: [SchoolGrade.QUARTO_ANO, SchoolGrade.QUINTO_ANO, SchoolGrade.SEXTO_ANO],
      startDate: new Date('2024-03-15'),
      status: 'ATIVO',
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Teacher 3 - Ana Costa
  const anaProfile = await prisma.profile.create({
    data: {
      id: ulid(),
      accessLevel: AccessLevel.PROFESSOR,
    },
  });

  const anaUser = await prisma.user.create({
    data: {
      id: ulid(),
      email: 'ana.costa@cantinho.com',
      password: await bcrypt.hash('senha123', 10),
      name: 'Ana Costa',
      profileId: anaProfile.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const anaCosta = await prisma.teacher.create({
    data: {
      id: ulid(),
      name: 'Ana Costa',
      email: 'ana.costa@cantinho.com',
      taxId: '11122233344',
      phone: '(11) 96543-2109',
      pixKey: '11965432109',
      expertise: 'Língua Portuguesa e História',
      qualifiedGrades: [SchoolGrade.SETIMO_ANO, SchoolGrade.OITAVO_ANO, SchoolGrade.NONO_ANO],
      startDate: new Date('2024-01-20'),
      status: 'ATIVO',
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  console.log(`✅ Teachers created: Maria Silva, João Santos, Ana Costa\n`);

  // ============================================
  // 3. CREATE CLASSES
  // ============================================
  console.log('🏫 Creating classes...');

  const class1A = await prisma.class.create({
    data: {
      id: ulid(),
      name: '1º Ano A',
      shift: Shift.MATUTINO,
      grades: [SchoolGrade.PRIMEIRO_ANO],
      teacherId: mariaSilva.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const class4B = await prisma.class.create({
    data: {
      id: ulid(),
      name: '4º Ano B',
      shift: Shift.VESPERTINO,
      grades: [SchoolGrade.QUARTO_ANO],
      teacherId: joaoSantos.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const class7A = await prisma.class.create({
    data: {
      id: ulid(),
      name: '7º Ano A',
      shift: Shift.MATUTINO,
      grades: [SchoolGrade.SETIMO_ANO],
      teacherId: anaCosta.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  console.log(`✅ Classes created: 1º Ano A, 4º Ano B, 7º Ano A\n`);

  // ============================================
  // 4. CREATE ADDRESSES
  // ============================================
  console.log('🏠 Creating addresses...');

  const addresses = await Promise.all([
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Rua das Flores',
        number: '123',
        district: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        complement: 'Apto 12',
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Av. Paulista',
        number: '1000',
        district: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        complement: null,
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Rua da Paz',
        number: '456',
        district: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        complement: 'Casa 2',
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Rua das Acácias',
        number: '789',
        district: 'Vila Mariana',
        city: 'São Paulo',
        state: 'SP',
        complement: null,
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Av. Brasil',
        number: '2000',
        district: 'Jardim América',
        city: 'São Paulo',
        state: 'SP',
        complement: 'Bloco B',
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
    prisma.address.create({
      data: {
        id: ulid(),
        street: 'Rua dos Pinheiros',
        number: '321',
        district: 'Pinheiros',
        city: 'São Paulo',
        state: 'SP',
        complement: null,
        createdAt: new Date(),
        deletedAt: null,
      },
    }),
  ]);

  console.log(`✅ Addresses created: ${addresses.length}\n`);

  // ============================================
  // 5. CREATE GUARDIANS
  // ============================================
  console.log('👨‍👩‍👧 Creating guardians...');

  const carlosSilva = await prisma.guardian.create({
    data: {
      id: ulid(),
      name: 'Carlos Silva',
      email: 'carlos.silva@email.com',
      phone: '(11) 99999-1111',
      addresses: {
        connect: { id: addresses[0].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const fernandaSantos = await prisma.guardian.create({
    data: {
      id: ulid(),
      name: 'Fernanda Santos',
      email: null,
      phone: '(11) 99999-2222',
      addresses: {
        connect: { id: addresses[1].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const robertoCosta = await prisma.guardian.create({
    data: {
      id: ulid(),
      name: 'Roberto Costa',
      email: 'roberto.costa@email.com',
      phone: '(11) 99999-3333',
      addresses: {
        connect: { id: addresses[2].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  console.log(`✅ Guardians created: Carlos Silva, Fernanda Santos, Roberto Costa\n`);

  // ============================================
  // 6. CREATE STUDENTS
  // ============================================
  console.log('🎓 Creating students...');

  // Turma 1A (4 students)
  const pedroSilva = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Pedro Silva',
      birthDate: new Date('2018-03-15'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: class1A.id,
      addresses: {
        connect: { id: addresses[0].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const juliaSantos = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Júlia Santos',
      birthDate: new Date('2018-05-20'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: class1A.id,
      addresses: {
        connect: { id: addresses[1].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const lucasCosta = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Lucas Costa',
      birthDate: new Date('2018-07-10'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: class1A.id,
      addresses: {
        connect: { id: addresses[2].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const marianaOliveira = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Mariana Oliveira',
      birthDate: new Date('2018-09-25'),
      currentGrade: SchoolGrade.PRIMEIRO_ANO,
      classId: class1A.id,
      addresses: {
        connect: { id: addresses[3].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Turma 4B (3 students)
  const gabrielLima = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Gabriel Lima',
      birthDate: new Date('2014-01-12'),
      currentGrade: SchoolGrade.QUARTO_ANO,
      classId: class4B.id,
      addresses: {
        connect: { id: addresses[4].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const sofiaAlmeida = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Sofia Almeida',
      birthDate: new Date('2014-04-08'),
      currentGrade: SchoolGrade.QUARTO_ANO,
      classId: class4B.id,
      addresses: {
        connect: { id: addresses[5].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const rafaelSouza = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Rafael Souza',
      birthDate: new Date('2014-06-18'),
      currentGrade: SchoolGrade.QUARTO_ANO,
      classId: class4B.id,
      addresses: {
        connect: { id: addresses[0].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Turma 7A (3 students)
  const isabellaPereira = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Isabella Pereira',
      birthDate: new Date('2011-02-14'),
      currentGrade: SchoolGrade.SETIMO_ANO,
      classId: class7A.id,
      addresses: {
        connect: { id: addresses[1].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const matheusRocha = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Matheus Rocha',
      birthDate: new Date('2011-08-22'),
      currentGrade: SchoolGrade.SETIMO_ANO,
      classId: class7A.id,
      addresses: {
        connect: { id: addresses[2].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const beatrizMartins = await prisma.student.create({
    data: {
      id: ulid(),
      name: 'Beatriz Martins',
      birthDate: new Date('2011-11-30'),
      currentGrade: SchoolGrade.SETIMO_ANO,
      classId: class7A.id,
      addresses: {
        connect: { id: addresses[3].id },
      },
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  console.log(`✅ Students created: 10 students distributed across classes\n`);

  // ============================================
  // 7. CREATE STUDENT-GUARDIAN RELATIONSHIPS
  // ============================================
  console.log('🔗 Creating student-guardian relationships...');

  await prisma.studentHasGuardian.createMany({
    data: [
      // Turma 1A
      { studentId: pedroSilva.id, guardianId: carlosSilva.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: juliaSantos.id, guardianId: fernandaSantos.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: lucasCosta.id, guardianId: robertoCosta.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: marianaOliveira.id, guardianId: carlosSilva.id, kinship: Kinship.AVOS, createdAt: new Date(), deletedAt: null },
      // Turma 4B
      { studentId: gabrielLima.id, guardianId: fernandaSantos.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: sofiaAlmeida.id, guardianId: robertoCosta.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: rafaelSouza.id, guardianId: carlosSilva.id, kinship: Kinship.TIOS, createdAt: new Date(), deletedAt: null },
      // Turma 7A
      { studentId: isabellaPereira.id, guardianId: fernandaSantos.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: matheusRocha.id, guardianId: robertoCosta.id, kinship: Kinship.PAI_MAE, createdAt: new Date(), deletedAt: null },
      { studentId: beatrizMartins.id, guardianId: carlosSilva.id, kinship: Kinship.IRMAOS, createdAt: new Date(), deletedAt: null },
    ],
  });

  console.log(`✅ Student-guardian relationships created\n`);

  // ============================================
  // 8. CREATE LESSONS (last 7 days)
  // ============================================
  console.log('📚 Creating lessons...');

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const fourDaysAgo = new Date(today);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  // Turma 1A - 2 lessons
  const lesson1A_1 = await prisma.lesson.create({
    data: {
      id: ulid(),
      date: yesterday,
      startTime: '13:00',
      endTime: '14:00',
      duration: '1h',
      classId: class1A.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const lesson1A_2 = await prisma.lesson.create({
    data: {
      id: ulid(),
      date: twoDaysAgo,
      startTime: '14:00',
      endTime: '15:00',
      duration: '1h',
      classId: class1A.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Turma 4B - 2 lessons
  const lesson4B_1 = await prisma.lesson.create({
    data: {
      id: ulid(),
      date: twoDaysAgo,
      startTime: '13:00',
      endTime: '14:30',
      duration: '1h30min',
      classId: class4B.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  const lesson4B_2 = await prisma.lesson.create({
    data: {
      id: ulid(),
      date: threeDaysAgo,
      startTime: '15:00',
      endTime: '16:30',
      duration: '1h30min',
      classId: class4B.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  // Turma 7A - 1 lesson
  const lesson7A_1 = await prisma.lesson.create({
    data: {
      id: ulid(),
      date: fourDaysAgo,
      startTime: '13:00',
      endTime: '15:00',
      duration: '2h',
      classId: class7A.id,
      createdAt: new Date(),
      deletedAt: null,
    },
  });

  console.log(`✅ Lessons created: 5 lessons in the last week\n`);

  // ============================================
  // 9. CREATE ATTENDANCES
  // ============================================
  console.log('✅ Creating attendance records...');

  // Distribution: 60% PRESENTE (12), 30% AUSENTE (6), 10% JUSTIFICADO (2) = 20 records
  const attendanceData = [
    // Lesson 1A_1 (yesterday) - 4 students
    { studentId: pedroSilva.id, lessonId: lesson1A_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: juliaSantos.id, lessonId: lesson1A_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: lucasCosta.id, lessonId: lesson1A_1.id, status: AttendanceStatus.AUSENTE },
    { studentId: marianaOliveira.id, lessonId: lesson1A_1.id, status: AttendanceStatus.PRESENTE },
    
    // Lesson 1A_2 (2 days ago) - 4 students
    { studentId: pedroSilva.id, lessonId: lesson1A_2.id, status: AttendanceStatus.PRESENTE },
    { studentId: juliaSantos.id, lessonId: lesson1A_2.id, status: AttendanceStatus.AUSENTE },
    { studentId: lucasCosta.id, lessonId: lesson1A_2.id, status: AttendanceStatus.PRESENTE },
    { studentId: marianaOliveira.id, lessonId: lesson1A_2.id, status: AttendanceStatus.JUSTIFICADO },
    
    // Lesson 4B_1 (2 days ago) - 3 students
    { studentId: gabrielLima.id, lessonId: lesson4B_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: sofiaAlmeida.id, lessonId: lesson4B_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: rafaelSouza.id, lessonId: lesson4B_1.id, status: AttendanceStatus.PRESENTE },
    
    // Lesson 4B_2 (3 days ago) - 3 students
    { studentId: gabrielLima.id, lessonId: lesson4B_2.id, status: AttendanceStatus.AUSENTE },
    { studentId: sofiaAlmeida.id, lessonId: lesson4B_2.id, status: AttendanceStatus.PRESENTE },
    { studentId: rafaelSouza.id, lessonId: lesson4B_2.id, status: AttendanceStatus.AUSENTE },
    
    // Lesson 7A_1 (4 days ago) - 6 students (adding 3 more to reach 20 total)
    { studentId: isabellaPereira.id, lessonId: lesson7A_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: matheusRocha.id, lessonId: lesson7A_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: beatrizMartins.id, lessonId: lesson7A_1.id, status: AttendanceStatus.AUSENTE },
    { studentId: pedroSilva.id, lessonId: lesson7A_1.id, status: AttendanceStatus.PRESENTE },
    { studentId: gabrielLima.id, lessonId: lesson7A_1.id, status: AttendanceStatus.JUSTIFICADO },
    { studentId: sofiaAlmeida.id, lessonId: lesson7A_1.id, status: AttendanceStatus.AUSENTE },
  ];

  await prisma.attendance.createMany({
    data: attendanceData.map(att => ({
      id: ulid(),
      ...att,
      createdAt: new Date(),
      deletedAt: null,
    })),
    skipDuplicates: true, // Skip if combination already exists
  });

  console.log(`✅ Attendance records created: ${attendanceData.length} records\n`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log('🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 1 Admin user');
  console.log('  - 3 Teachers (with users)');
  console.log('  - 3 Classes');
  console.log('  - 6 Addresses');
  console.log('  - 3 Guardians');
  console.log('  - 10 Students');
  console.log('  - 10 Student-Guardian relationships');
  console.log('  - 5 Lessons');
  console.log('  - 20 Attendance records');
  console.log('\n✅ You can now login with:');
  console.log('  Admin: admin@cantinho.com / Admin@123');
  console.log('  Teachers:');
  console.log('    - maria.silva@cantinho.com / senha123');
  console.log('    - joao.santos@cantinho.com / senha123');
  console.log('    - ana.costa@cantinho.com / senha123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
