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

## 🗄️ Configuração do Banco de Dados

### Pré-requisitos
- [PostgreSQL 14+](https://www.postgresql.org/download/) instalado e rodando
- Acesso ao terminal/shell do PostgreSQL

### Passo a Passo

#### 1. Criar o banco de dados

Abra o terminal do PostgreSQL:
```bash
# Linux/Mac
sudo -u postgres psql

# Windows (PowerShell como Admin)
psql -U postgres
```

Execute:
```sql
CREATE DATABASE cantinho_saber;
\c cantinho_saber
\q
```

#### 2. Configurar variáveis de ambiente

```bash
# Copiar template do servidor
cp apps/server/.env.example apps/server/.env

# Copiar template do frontend
cp apps/web/.env.example apps/web/.env

# Editar apps/server/.env com suas credenciais do PostgreSQL
# Especialmente a linha DATABASE_URL
```

⚠️ **Importante:** Substitua `user` e `password` na `DATABASE_URL` pelas suas credenciais do PostgreSQL.

#### 3. Gerar Prisma Client

```bash
pnpm db:generate
```

#### 4. Rodar Migrations

```bash
pnpm db:run
```

#### 5. Popular com Dados de Teste

```bash
pnpm --filter=@repo/database run seed
```

### ✅ Credenciais de Teste

Após rodar o seed, você pode fazer login com:

**Administrador:**
- Email: `admin@cantinho.com`
- Senha: `Admin@123`

**Professores:**
- Email: `maria.silva@cantinho.com` | Senha: `senha123`
- Email: `joao.santos@cantinho.com` | Senha: `senha123`
- Email: `ana.costa@cantinho.com` | Senha: `senha123`

### 🛠️ Comandos Úteis do Banco

```bash
# Abrir Prisma Studio (GUI para o banco)
pnpm --filter=@repo/database run studio

# Resetar banco (apaga tudo e roda seed novamente)
pnpm --filter=@repo/database run reset

# Gerar novo client após mudanças no schema
pnpm db:generate
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
