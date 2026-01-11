# Escola Cantinho do Saber — Monorepo com PNPM & Turborepo

Este projeto está estruturado como um **monorepo** usando [PNPM](https://pnpm.io/) e [Turborepo](https://turbo.build/), visando facilitar a organização, manutenção e produtividade no desenvolvimento colaborativo.

---

## Visão Geral

O objetivo do projeto é oferecer uma plataforma robusta para gerenciar as operações da Escola Cantinho do Saber, facilitando cadastro de usuários, gestão acadêmica, comunicação e muito mais.

---

## Tecnologias Utilizadas

- **PNPM**: Gerenciador de pacotes rápido e eficiente, ideal para monorepos.
- **Turborepo**: Orquestração de pipelines e tasks entre múltiplos pacotes.
- **TypeScript** & **JavaScript**: Linguagens principais para serviços, aplicações e utilitários.

---

## Estrutura do Monorepo

O projeto segue a estrutura padrão de monorepos com PNPM e Turborepo:

```
/
├── apps/         # Aplicações principais (frontend, backend, etc)
├── packages/     # Pacotes reutilizáveis (libs, UI, utils, etc)
├── package.json  # Configuração global, scripts e workspaces
├── pnpm-workspace.yaml # Define workspaces
├── turbo.json    # Configura pipelines/tasks do Turborepo
└── README.md
```

### Workspaces (package.json)

```json
{
  "name": "cantinho-do-saber",
  "private": true,
  "packageManager": "pnpm@10.18.2",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "start": "pnpm turbo run start",
    "dev": "pnpm turbo run dev",
    "build": "pnpm turbo run build",
    "lint": "pnpm turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.5.8",
    "typescript": "^5.9.3",
    "eslint": "^9.10.0",
    "prettier": "^3.3.0"
  }
}
```

---

## Configuração do Ambiente

### 1. Pré-requisitos

- [Node.js (LTS)](https://nodejs.org/)
- [PNPM](https://pnpm.io/):  
  ```bash
  npm install -g pnpm
  ```
- Git

### 2. Instalando dependências

```bash
pnpm install
```

---

## Comandos Essenciais

Todos os scripts abaixo já estão configurados no package.json e utilizam o Turborepo para rodar em todos os workspaces relevantes:

- `pnpm install` — Instala todas as dependências do projeto.
- `pnpm install --filter=server ou --filter=web` — Instala dependências de apenas um ambiente.
- `pnpm dev` — Inicia o modo desenvolvimento em todos os apps/pacotes com task "dev".
- `pnpm build` — Builda todos os apps/pacotes conforme pipeline turbo.
- `pnpm lint` — Roda lint (padronização de código) onde houver script "lint".
- `pnpm start` — Inicia aplicação front (apenas) no electron (requer o comando 'dev' rodando para consumo de features).

Você pode rodar comandos específicos em um determinado pacote/app, por exemplo:
```bash
pnpm dev --filter=server ou pnpm dev --filter=web
```

---

## Fluxos e Pipelines (turbo.json)

O turbo.json define pipelines compartilhados para tasks como build, lint, dev, etc:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!node_modules/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "persistent": true,
      "dependsOn": ["^start"]
    }
  }
}
```

- **dependsOn**: garante ordem de execução correta entre workspaces.
- **outputs**: define cache inteligente entre builds.
- **persistent**: mantém processos ativos (ideal para dev/start).

---

## Boas Práticas de Contribuição

- Sempre crie uma branch nova para cada feature ou correção ex: ```feat/new-feature``` ou ````fix/new-fix``` com os prefixos sendo fixos e os sufixos a depender do que será desenvolvido.
- Siga a estrutura de pastas e mantenha a organização dos workspaces.
- Utilize os comandos padrão via scripts do package.json, nunca altere dependências manualmente sem rodar `pnpm install` e commitar o pnpm-lock.yaml.
- Garanta que seu código passe pelo lint antes de abrir PR.
- Descreva bem seu Pull Request, relacione issues quando aplicável.

---

## Dicas

- Sempre sincronize sua branch com a `main` antes de abrir um PR.
- Prefira dependências internas (aliase via "workspace:...") para compartilhar código entre apps/pacotes.
- Consulte o turbo.json para entender o fluxo dos pipelines.
- Se adicionar novas tasks/scripts, mantenha a padronização e registre no README.

---

## 🗄️ Configuração do Banco de Dados

### Pré-requisitos
- PostgreSQL instalado e rodando
- Node.js e PNPM instalados

### Passo a Passo

1. **Configure o arquivo .env do servidor**
   ```bash
   cd apps/server
   cp .env.example .env
   ```

2. **Edite o arquivo .env com suas credenciais**
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/cantinho_saber?schema=public"
   EXPRESS_BACK_PORT=4000
   JWT_PRIVATE_KEY="your_private_key_here"
   JWT_PUBLIC_KEY="your_public_key_here"
   JWT_ALGORITHM=RS256
   ```

3. **Gere as chaves JWT** (opcional, para produção)
   ```bash
   # Gerar chave privada
   ssh-keygen -t rsa -b 4096 -m PEM -f jwt.key
   # Gerar chave pública
   openssl rsa -in jwt.key -pubout -outform PEM -out jwt.key.pub
   # Encode em base64 e adicione no .env
   ```

4. **Instale as dependências**
   ```bash
   pnpm install
   ```

5. **Execute as migrations do Prisma**
   ```bash
   cd packages/database
   pnpm init
   ```

6. **Popule o banco com dados de teste (seed)**
   ```bash
   pnpm seed
   ```

### Comandos do Banco de Dados

```bash
# Gerar o Prisma Client
pnpm --filter=@repo/database generate

# Criar migration inicial
pnpm --filter=@repo/database init

# Executar seed (popular banco)
pnpm --filter=@repo/database seed

# Resetar banco (cuidado!)
pnpm --filter=@repo/database reset
```

---

## 🚀 Como Rodar o Projeto

### Desenvolvimento

1. **Inicie o servidor backend**
   ```bash
   pnpm dev --filter=server
   ```
   O servidor estará disponível em: http://localhost:4000

2. **Inicie o frontend (em outro terminal)**
   ```bash
   pnpm dev --filter=web
   ```
   O frontend estará disponível em: http://localhost:5173

3. **Para iniciar ambos simultaneamente**
   ```bash
   pnpm dev
   ```

### Produção

1. **Build do projeto**
   ```bash
   pnpm build
   ```

2. **Inicie o servidor**
   ```bash
   pnpm start --filter=server
   ```

---

## 🔑 Credenciais de Teste

Após executar o seed do banco, você terá as seguintes credenciais:

### Administrador
- **Email:** admin@cantinho.com
- **Senha:** Admin@123

### Professores
- **Email:** maria.silva@cantinho.com
- **Senha:** Professor@123

- **Email:** joao.oliveira@cantinho.com
- **Senha:** Professor@123

- **Email:** ana.ferreira@cantinho.com
- **Senha:** Professor@123

---

## 📁 Estrutura do Projeto

```
/
├── apps/
│   ├── server/                 # Backend (Express + TypeScript)
│   │   ├── src/
│   │   │   ├── core/          # Core utilities and base classes
│   │   │   ├── domain/        # Domain layer (entities, use cases, repositories)
│   │   │   │   ├── application/
│   │   │   │   │   ├── repositories/  # Repository interfaces
│   │   │   │   │   └── use-cases/     # Business logic use cases
│   │   │   │   └── enterprise/
│   │   │   │       └── entities/      # Domain entities
│   │   │   ├── infra/         # Infrastructure layer
│   │   │   │   ├── auth/      # Authentication (Passport, JWT)
│   │   │   │   ├── database/  # Database implementations
│   │   │   │   │   ├── mapper/       # Data mappers
│   │   │   │   │   ├── repositories/ # Repository implementations
│   │   │   │   │   └── schemas/      # Prisma schemas
│   │   │   │   └── http/      # HTTP layer (controllers, presenters)
│   │   │   └── server.ts      # Express server setup
│   │   └── package.json
│   │
│   └── web/                    # Frontend (React + TypeScript + Vite)
│       ├── src/
│       │   ├── main/          # Electron main process
│       │   └── renderer/      # React application
│       │       ├── assets/
│       │       ├── components/
│       │       │   ├── common/      # Reusable UI components
│       │       │   ├── students/
│       │       │   ├── teachers/
│       │       │   ├── classes/
│       │       │   └── ...
│       │       ├── context/         # React contexts
│       │       ├── hooks/           # Custom React hooks
│       │       ├── pages/           # Page components
│       │       ├── services/        # API services
│       │       ├── styles/
│       │       └── utils/
│       └── package.json
│
├── packages/
│   └── database/              # Shared database package
│       ├── prisma/
│       │   ├── schema.prisma  # Prisma schema
│       │   └── seed.ts        # Database seeding script
│       └── src/
│           └── client.ts      # Prisma client export
│
├── API.md                     # API documentation
├── README.md                  # This file
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # PNPM workspace config
└── turbo.json                 # Turborepo config
```

---

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM and database toolkit
- **PostgreSQL** - Database
- **Passport.js** - Authentication
- **JWT** - Token-based authentication
- **TSyringe** - Dependency injection
- **Zod** - Schema validation
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS Modules** - Scoped styling
- **Electron** - Desktop application wrapper

### DevOps & Tools
- **PNPM** - Package manager
- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 📚 Features Implementadas

### Autenticação e Autorização
- ✅ Login com JWT
- ✅ Refresh token
- ✅ Recuperação de senha
- ✅ Níveis de acesso (ADMIN, PROFESSOR, COMUM)

### Gestão de Usuários
- ✅ Criar, editar e excluir usuários
- ✅ Associar perfis de acesso
- ✅ Buscar usuários por email

### Gestão de Alunos
- ✅ Cadastro completo de alunos
- ✅ Busca por nome
- ✅ Vinculação com responsáveis
- ✅ Endereços múltiplos
- ✅ Matrícula em turmas
- ✅ Contador de alunos

### Gestão de Professores
- ✅ Cadastro de professores
- ✅ Competências por série
- ✅ Informações de pagamento (PIX)
- ✅ Status (ATIVO/INATIVO)
- ✅ Criação automática de usuário

### Gestão de Turmas
- ✅ Criar e gerenciar turmas
- ✅ Turnos (Matutino/Vespertino)
- ✅ Séries múltiplas por turma
- ✅ Vinculação com professores
- ✅ Lista de alunos

### Aulas e Frequência
- ✅ Cadastro de aulas
- ✅ Horários de início e término
- ✅ Registro de frequência
- ✅ Status de presença (PRESENTE, AUSENTE, JUSTIFICADO)
- ✅ Histórico de frequência por aluno

### UI/UX
- ✅ Componentes reutilizáveis (Loading, Error, Empty State)
- ✅ Error Boundary para tratamento de erros
- ✅ Modais de confirmação
- ✅ Feedback visual (toasts)

---

## 🔗 Documentação Adicional

- [API Documentation](./API.md) - Documentação completa de todos os endpoints
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Guia de contribuição

---
