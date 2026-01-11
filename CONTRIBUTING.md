# Contributing to Cantinho do Saber

Obrigado por considerar contribuir com o projeto Escola Cantinho do Saber! 🎉

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
- [Processo de Pull Request](#processo-de-pull-request)
- [Estrutura de Branches](#estrutura-de-branches)
- [Mensagens de Commit](#mensagens-de-commit)
- [Testes](#testes)
- [Documentação](#documentação)

## Código de Conduta

Este projeto adere a um código de conduta. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamento inaceitável.

## Como Posso Contribuir?

### Reportando Bugs

Antes de criar um bug report, verifique se já não existe uma issue sobre o problema. Quando criar uma issue, inclua:

- **Descrição clara e detalhada** do problema
- **Passos para reproduzir** o comportamento
- **Comportamento esperado** vs. comportamento atual
- **Screenshots** se aplicável
- **Ambiente:** Sistema operacional, versão do Node.js, etc.

### Sugerindo Melhorias

Enhancement suggestions são rastreadas como GitHub issues. Crie uma issue e forneça:

- **Título claro e descritivo**
- **Descrição detalhada** da funcionalidade sugerida
- **Exemplos de uso** quando aplicável
- **Benefícios** que a mudança traria

### Contribuindo com Código

1. **Fork o repositório**
2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/Cantinho-do-Saber.git
   cd Cantinho-do-Saber
   ```

3. **Instale as dependências**
   ```bash
   pnpm install
   ```

4. **Configure o ambiente**
   - Copie `.env.example` para `.env` em `apps/server/`
   - Configure o banco de dados
   - Execute migrations e seed

5. **Crie uma branch** seguindo os padrões
   ```bash
   git checkout -b feat/nova-funcionalidade
   ```

6. **Faça suas alterações** seguindo os padrões de código

7. **Teste suas alterações**
   ```bash
   pnpm lint
   pnpm build
   ```

8. **Commit suas mudanças** com mensagens descritivas

9. **Push para seu fork**
   ```bash
   git push origin feat/nova-funcionalidade
   ```

10. **Abra um Pull Request**

## Padrões de Desenvolvimento

### Estilo de Código

- **TypeScript:** Use TypeScript strict mode
- **Formatação:** Use Prettier (executado automaticamente)
- **Linting:** Use ESLint e corrija todos os warnings
- **Imports:** Organize imports alfabeticamente
- **Nomenclatura:** 
  - `camelCase` para variáveis e funções
  - `PascalCase` para classes e componentes
  - `UPPER_SNAKE_CASE` para constantes

### Estrutura de Arquivos

#### Backend
```
apps/server/src/
├── core/                 # Utilitários core
├── domain/
│   ├── application/
│   │   ├── repositories/  # Interfaces de repositórios
│   │   └── use-cases/     # Casos de uso (lógica de negócio)
│   └── enterprise/
│       └── entities/      # Entidades de domínio
└── infra/
    ├── auth/             # Autenticação
    ├── database/         # Implementações de banco
    │   ├── mapper/
    │   ├── repositories/
    │   └── schemas/
    └── http/
        ├── controllers/  # Controllers HTTP
        └── presenters/   # Presenters (formatação de resposta)
```

#### Frontend
```
apps/web/src/renderer/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── students/        # Componentes específicos
│   └── ...
├── context/             # React contexts
├── hooks/               # Custom hooks
├── pages/               # Páginas/rotas
├── services/            # Serviços de API
└── utils/               # Utilitários
```

### Padrões de Código

#### Use Cases
```typescript
@singleton()
export class CreateStudentUseCase {
  constructor(
    @inject(STUDENT_REPOSITORY_TOKEN)
    private readonly studentRepository: IStudentRepository,
  ) {}

  async execute(data: CreateStudentDTO): Promise<Either<Error, Student>> {
    // Lógica de negócio aqui
  }
}
```

#### Controllers
```typescript
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
    // Validação e chamada do use case
  }
}
```

#### Serviços Frontend
```typescript
/**
 * Creates a new student
 * @param payload - Student data
 * @returns Created student with ID
 */
export async function createStudent(payload: CreateStudentDTO) {
  const { data } = await api.post('/students', payload);
  return data;
}
```

#### Componentes React
```typescript
interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className={styles.container}>
      <h1>{title}</h1>
    </div>
  );
}
```

### CSS Modules

- Use CSS Modules para escopo local
- Nomeie classes em `camelCase`
- Organize propriedades CSS alfabeticamente

```css
.container {
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}
```

## Processo de Pull Request

1. **Título descritivo** seguindo padrões de commit
2. **Descrição detalhada** das mudanças
3. **Checklist de validação:**
   - [ ] Código segue os padrões do projeto
   - [ ] Comentários foram adicionados em código complexo
   - [ ] Documentação foi atualizada
   - [ ] Nenhum warning no lint
   - [ ] Build executado com sucesso
   - [ ] Funcionalidade testada manualmente
   - [ ] Sem dados mock/hardcoded

4. **Aguarde review** - Pelo menos uma aprovação necessária
5. **Responda feedback** construtivamente
6. **Merge:** Será feito por maintainers após aprovação

## Estrutura de Branches

- `main` - Branch principal (protegida)
- `develop` - Branch de desenvolvimento
- `feat/feature-name` - Nova funcionalidade
- `fix/bug-description` - Correção de bug
- `docs/documentation` - Documentação
- `refactor/component-name` - Refatoração
- `chore/task-name` - Tarefas de manutenção

## Mensagens de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Tipos:
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, missing semi-colons, etc.
- `refactor:` Refatoração de código
- `test:` Adição de testes
- `chore:` Manutenção, dependências

### Exemplos:
```
feat(students): add bulk import functionality
fix(api): correct authentication token validation
docs(readme): add database setup instructions
refactor(services): remove localStorage mock data
```

## Testes

### Backend
```bash
# Executar testes (quando implementados)
pnpm test --filter=server
```

### Frontend
```bash
# Executar testes (quando implementados)
pnpm test --filter=web
```

### Checklist Manual
- [ ] Funcionalidade funciona conforme esperado
- [ ] Não quebra funcionalidades existentes
- [ ] UI responsiva (se aplicável)
- [ ] Tratamento de erros implementado
- [ ] Loading states implementados

## Documentação

- **Código:** Use JSDoc para funções públicas
- **API:** Atualize `API.md` para novos endpoints
- **README:** Atualize para novas features
- **CHANGELOG:** Documente mudanças significativas

### JSDoc Exemplo:
```typescript
/**
 * Creates a new student in the system
 * 
 * @param data - Student creation data
 * @param data.name - Full name of the student
 * @param data.birthDate - Birth date in ISO format
 * @returns Promise resolving to created student
 * @throws {ValidationError} If data is invalid
 * @throws {DatabaseError} If database operation fails
 * 
 * @example
 * const student = await createStudent({
 *   name: "João Silva",
 *   birthDate: "2015-03-20"
 * });
 */
export async function createStudent(data: CreateStudentDTO): Promise<Student> {
  // implementation
}
```

## Perguntas?

Tem dúvidas? Abra uma issue com a tag `question` ou entre em contato com os maintainers.

Obrigado por contribuir! 🚀
