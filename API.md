# API Documentation - Cantinho do Saber

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### POST `/auth/login`
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "admin@cantinho.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "01H...",
    "name": "Administrador",
    "email": "admin@cantinho.com",
    "profile": {
      "accessLevel": "ADMIN"
    }
  }
}
```

### POST `/auth/refresh`
Refresh an expired token.

### POST `/auth/forgot-password`
Request a password reset code.

### POST `/auth/reset-password`
Reset password with code.

---

## 👤 User Endpoints

### POST `/users`
Create a new user. 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "João Silva",
  "email": "joao.silva@example.com",
  "password": "Senha@123",
  "profileId": "01H..."
}
```

### GET `/users/:email`
Find a user by email. 🔒 Requires authentication.

### GET `/users/me`
Get current logged-in user. 🔒 Requires authentication.

### PUT `/users/:id`
Update a user. 🔒 Requires authentication.

### DELETE `/users/:id`
Delete a user (soft delete). 🔒 Requires authentication.

---

## 👨‍🎓 Student Endpoints

### GET `/students/search`
Search students by name. 🔒 Requires authentication.

**Query Parameters:**
- `studentName` (string): Name to search for (empty string returns all)

**Response:**
```json
[
  {
    "id": "01H...",
    "name": "Lucas Gabriel Santos",
    "birthDate": "2017-03-15T00:00:00.000Z",
    "currentGrade": "PRIMEIRO_ANO",
    "classId": "01H...",
    "addresses": [...],
    "guardians": [...]
  }
]
```

### GET `/students/:id`
Get a student by ID. 🔒 Requires authentication.

### POST `/students`
Create a new student. 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "Maria Silva",
  "birthDate": "2015-05-20",
  "currentGrade": "TERCEIRO_ANO",
  "classId": "01H...",
  "addresses": [
    {
      "street": "Rua das Flores",
      "number": "123",
      "district": "Centro",
      "city": "São Paulo",
      "state": "SP"
    }
  ],
  "guardians": [
    {
      "name": "José Silva",
      "email": "jose@email.com",
      "phone": "11999887766",
      "kinship": "PAI_MAE"
    }
  ]
}
```

### PUT `/student/:studentId`
Update a student. 🔒 Requires authentication.

### DELETE `/students/:id`
Delete a student (soft delete). 🔒 Requires authentication.

### GET `/students/count`
Get total count of active students. 🔒 Requires authentication.

**Response:**
```json
{
  "count": 42
}
```

---

## 👨‍🏫 Teacher Endpoints

### GET `/teachers`
List all teachers. 🔒 Requires authentication.

**Query Parameters:**
- `page` (number, optional): Page number for pagination
- `query` (string, optional): Search query
- `status` (string, optional): Filter by status (ATIVO/INATIVO)

**Response:**
```json
{
  "teachers": [
    {
      "id": "01H...",
      "name": "Maria da Silva Santos",
      "taxId": "12345678901",
      "phone": "11987654321",
      "email": "maria.silva@cantinho.com",
      "pixKey": "maria.silva@pix.com",
      "expertise": "Educação Infantil e Fundamental I",
      "qualifiedGrades": ["PRIMEIRO_ANO", "SEGUNDO_ANO"],
      "startDate": "2024-01-15T00:00:00.000Z",
      "status": "ATIVO"
    }
  ]
}
```

### GET `/teachers/:id`
Get a teacher by ID. 🔒 Requires authentication.

### POST `/teachers`
Create a new teacher (automatically creates associated user). 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "Ana Carolina Ferreira",
  "taxId": "34567890123",
  "phone": "11987654323",
  "email": "ana.ferreira@cantinho.com",
  "pixKey": "ana.ferreira@pix.com",
  "expertise": "Língua Portuguesa e Literatura",
  "qualifiedGrades": ["SEXTO_ANO", "SETIMO_ANO"],
  "startDate": "15/01/2024"
}
```

**Response:**
```json
{
  "teacherId": "01H...",
  "userEmail": "ana.ferreira@cantinho.com",
  "password": "Auto-generated-password"
}
```

### PUT `/teachers/:id`
Update a teacher. 🔒 Requires authentication.

---

## 🏫 Class Endpoints

### GET `/classes`
List all classes. 🔒 Requires authentication.

**Response:**
```json
{
  "classes": [
    {
      "id": "01H...",
      "name": "1º Ano A - Matutino",
      "shift": "MATUTINO",
      "grades": ["PRIMEIRO_ANO"],
      "teacherId": "01H...",
      "students": [...],
      "lessons": [...]
    }
  ]
}
```

### GET `/class/:classId`
Get a class by ID. 🔒 Requires authentication.

### POST `/class`
Create a new class. 🔒 Requires authentication.

**Request Body:**
```json
{
  "name": "4º Ano B - Vespertino",
  "shift": "VESPERTINO",
  "grades": ["QUARTO_ANO"],
  "teacherId": "01H..."
}
```

**Enums:**
- `shift`: `MATUTINO` | `VESPERTINO`
- `grades`: Array of `PRIMEIRO_ANO` | `SEGUNDO_ANO` | `TERCEIRO_ANO` | `QUARTO_ANO` | `QUINTO_ANO` | `SEXTO_ANO` | `SETIMO_ANO` | `OITAVO_ANO` | `NONO_ANO`

### PUT `/class/:classId`
Update a class. 🔒 Requires authentication.

### DELETE `/class/:classId`
Delete a class (soft delete). 🔒 Requires authentication.

---

## 📚 Lesson Endpoints

### GET `/lessons`
List all lessons. 🔒 Requires authentication.

**Response:**
```json
{
  "lessons": [
    {
      "id": "01H...",
      "date": "2024-01-10T00:00:00.000Z",
      "startTime": "13:00",
      "endTime": "14:30",
      "duration": "1h30m",
      "classId": "01H...",
      "attendances": [...]
    }
  ]
}
```

### GET `/classes/:classId/lessons`
Get all lessons for a specific class. 🔒 Requires authentication.

### GET `/lessons/:lessonId`
Get a lesson by ID. 🔒 Requires authentication.

### POST `/lessons`
Create a new lesson. 🔒 Requires authentication.

**Request Body:**
```json
{
  "classId": "01H...",
  "date": "2024-01-15",
  "startTime": "14:00",
  "endTime": "16:00",
  "duration": "2h"
}
```

### PUT `/lessons/:lessonId`
Update a lesson. 🔒 Requires authentication.

### DELETE `/lessons/:lessonId`
Delete a lesson (soft delete). 🔒 Requires authentication.

---

## ✅ Attendance Endpoints

### POST `/attendances`
Register student attendance for a lesson. 🔒 Requires authentication.

**Request Body:**
```json
{
  "studentId": "01H...",
  "lessonId": "01H...",
  "status": "PRESENTE"
}
```

**Enums:**
- `status`: `PRESENTE` | `AUSENTE` | `JUSTIFICADO`

### GET `/attendances/:id`
Get an attendance record by ID. 🔒 Requires authentication.

### GET `/students/:studentId/attendances`
Get attendance history for a student. 🔒 Requires authentication.

**Response:**
```json
{
  "attendances": [
    {
      "id": "01H...",
      "status": "PRESENTE",
      "studentId": "01H...",
      "lessonId": "01H...",
      "lesson": {
        "date": "2024-01-10T00:00:00.000Z",
        "startTime": "13:00",
        "endTime": "14:30"
      }
    }
  ]
}
```

### PUT `/attendances/:id`
Update an attendance record. 🔒 Requires authentication.

### DELETE `/attendances/:id`
Delete an attendance record. 🔒 Requires authentication.

---

## 👪 Guardian Endpoints

### GET `/guardians/:id`
Get a guardian by ID. 🔒 Requires authentication.

### PUT `/guardians/:id`
Update a guardian. 🔒 Requires authentication.

### DELETE `/guardians/:id`
Delete a guardian (soft delete). 🔒 Requires authentication.

### POST `/students/:studentId/guardians/:guardianId`
Link a guardian to a student. 🔒 Requires authentication.

**Request Body:**
```json
{
  "kinship": "PAI_MAE"
}
```

**Enums:**
- `kinship`: `PAI_MAE` | `AVOS` | `TIOS` | `IRMAOS` | `OUTRO`

---

## Error Responses

All endpoints follow a consistent error response format:

**400 Bad Request:**
```json
{
  "message": "Invalid request data"
}
```

**401 Unauthorized:**
```json
{
  "message": "Sessão expirada. Faça login novamente."
}
```

**404 Not Found:**
```json
{
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Internal server error"
}
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
- All IDs are ULIDs (Universally Unique Lexicographically Sortable Identifier)
- Soft deletes are used throughout the system (records are marked as deleted but not removed from the database)
- The API uses Portuguese enums to match business requirements
