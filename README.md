# Clareia — Gestão Odontológica

Plataforma full-stack (SaaS multi-tenant) para gestão de clínicas odontológicas, com controle de permissões por perfil: a dona da clínica acompanha toda a operação (equipe, pacientes, agenda e indicadores), enquanto cada dentista acessa apenas os próprios pacientes e a própria agenda.

---

## Funcionalidades

- **Landing page & Onboarding em 2 etapas (`/cadastro`)**: criação atômica da conta da dona da clínica e da clínica, com validação de CNPJ (dígitos verificadores), CRO, telefone com DDD e senha criptografada com BCrypt.
- **Autenticação & Controle de Acesso (RBAC + Multi-tenant)**: login com JWT (`Authorization: Bearer`), isolamento estrito por `clinicId` derivado do token e revogação imediata quando um dentista é desativado.
- **Visão geral (`/app`)**: dashboard adaptado ao perfil (`owner` acompanha ocupação global, equipe, retornos e cancelamentos; `dentist` acompanha seu dia, sua semana e seus pacientes).
- **Agenda semanal (`/app/agenda`)**: grade semanal com faixas de 30 min, filtro por profissional (dona), agendamento, confirmação, conclusão, reagendamento, cancelamento e reativação.
- **Pacientes (`/app/pacientes`)**: busca, filtros por status e dentista, cadastro/edição, ficha individual com histórico de consultas e observações clínicas, além de arquivamento (*soft delete*) com reativação.
- **Equipe (`/app/equipe`, exclusivo da dona)**: cadastro e edição de dentistas (CRO, especialidade, apresentação, senha de acesso) e ativação/desativação de contas.
- **Configurações (`/app/configuracoes`)**: dados da clínica (edição restrita à dona), resumo do espaço e detalhes da conta logada.
- **Busca rápida (`⌘K` / `Ctrl+K`)**: navegação instantânea por páginas, ações e pacientes permitidos.

---

## Stack

### Frontend (`frontend/`)
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** + **shadcn/ui (Radix)**
- **React Router 7**
- **React Hook Form** + **Zod**
- **date-fns (pt-BR)**, **Lucide**, **Sonner**
- **Vitest** + **Testing Library** + **Oxlint**

### Backend (`backend/`)
- **Java 21** + **Spring Boot 3.4** (Maven)
- **Spring Security** + **JWT (`jjwt`)** + **BCrypt**
- **Spring Data JPA** + **PostgreSQL 16** (+ **H2** para testes e profile `local`)
- **Flyway** para migrações SQL versionadas
- **Springdoc OpenAPI (Swagger UI)** + erros padronizados **RFC 7807 (`ProblemDetail`)**
- **Docker** + **Docker Compose**

---

## Estrutura do Repositório

```text
clareia/
├── .env-example               # Modelo de variáveis de ambiente (valores fictícios)
├── docker-compose.yml         # PostgreSQL 16 + Backend Spring Boot
├── backend/                   # API REST em Java 21 + Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   ├── README.md
│   └── src/
│       ├── main/java/com/clareia/backend/
│       │   ├── config/        # Security, CORS, OpenAPI, Web, Properties
│       │   ├── domain/        # Entidades, enums, converters JPA, validadores e formatadores
│       │   ├── repository/    # Repositórios Spring Data JPA
│       │   ├── security/      # JwtService, JwtAuthenticationFilter, AuthenticatedDentist
│       │   ├── service/       # Regras de negócio, permissões e seed opcional
│       │   └── web/           # Controllers REST, DTOs e GlobalExceptionHandler
│       ├── main/resources/
│       │   ├── application.yml
│       │   └── db/migration/  # V1__init_schema.sql (Flyway)
│       └── test/              # Testes unitários e de integração (MockMvc)
└── frontend/                  # Aplicação web em React + TypeScript + Vite
    ├── README.md
    ├── vite.config.ts
    └── src/
        ├── components/        # Layout, primitivos compartilhados e shadcn/ui
        ├── data/              # api-client, clinic-reducer e ClinicProvider
        ├── domain/            # Tipos, permissões, conflitos, CNPJ e schemas Zod
        ├── features/          # Landing, onboarding, auth, dashboard, agenda, pacientes, equipe, configurações
        └── lib/               # Datas, formatação e utilitários
```

---

## Modelo de Domínio e Regras de Negócio

| Entidade | Principais regras |
| --- | --- |
| **`Clinic`** | ID `clinic-...`, nome (3–80), endereço, CNPJ válido (14 dígitos + dígitos verificadores, salvo formatado `12.345.678/0001-95`), telefone formatado, e-mail em minúsculas, `ownerDentistId`. |
| **`Dentist`** | ID `dent-...` / `dentist-...`, e-mail único (usado no login), senha em BCrypt, CRO normalizado (`CRO-UF 12.345`), `role` (`owner` \| `dentist`, exatamente 1 `owner` por clínica), `status` (`active` \| `inactive`). Inativo perde acesso imediatamente; `owner` não pode ser desativado. |
| **`Patient`** | ID `patient-...`, vinculado à clínica e a um dentista responsável, e-mail único por clínica, `birthDate` (`yyyy-MM-dd`, não pode estar no futuro), `notes` (até 1200 chars), `status` (`active` \| `archived` — *soft delete*). |
| **`Appointment`** | ID `appointment-...`, `date` (`yyyy-MM-dd`), `startTime` (`HH:mm`), `durationMinutes` (15–240; padrão por procedimento: 30/45/60/90/120), 8 tipos (`evaluation`, `cleaning`, `return`, `root_canal`, `orthodontics`, `implant`, `whitening`, `urgency`) e 5 status (`scheduled`, `confirmed`, `completed`, `cancelled`, `no_show`). Bloqueia horários passados e conflitos de agenda do **dentista e do paciente** (ignorando `cancelled` e revalidando ao reativar). |

---

## Variáveis de Ambiente e Segurança

Todas as credenciais e configurações sensíveis ficam fora do código, em um arquivo `.env` na **raiz do repositório** (ignorado pelo `.gitignore`).

1. Copie o template na raiz:
   ```bash
   cp .env-example .env
   ```
2. Ajuste os valores no `.env`:
   - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — conexão com o PostgreSQL.
   - `JWT_SECRET` — chave secreta com **no mínimo 32 bytes** (o backend recusa iniciar se ausente ou curta).
   - `CORS_ALLOWED_ORIGINS` — origens permitidas (ex.: `http://localhost:5173`).
   - `CLAREIA_DEMO_ENABLED` / `CLAREIA_DEMO_SEED_ON_STARTUP` / `CLAREIA_DEMO_DEFAULT_PASSWORD` — em produção, mantenha os dois primeiros como `false`.
   - `VITE_API_PROXY_TARGET` / `VITE_API_URL` — integração do Vite com a API.

> **Importante**: nunca commite o arquivo `.env`. Apenas `.env-example` (com dados fictícios) deve ser versionado.

---

## Como Executar

### Pré-requisitos
- **Docker** (com Docker Compose) — para subir PostgreSQL 16 + Backend Spring Boot
- **Node.js 20+** e **pnpm** (ou `corepack pnpm`) — para rodar o frontend
- *(Opcional)* **JDK 21** + **Maven** caso prefira rodar o backend fora do Docker

### 1. Subir o Backend + PostgreSQL
Na raiz do repositório (após criar o `.env`):

```bash
docker compose up -d --build
```

Serviços disponíveis:
- **API Backend**: `http://localhost:8080`
- **Healthcheck**: `http://localhost:8080/actuator/health`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **PostgreSQL 16**: `localhost:5432`

### 2. Subir o Frontend
Em outro terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Acesse `http://localhost:5173`. O Vite redireciona automaticamente as chamadas `/api/*` para o backend configurado em `VITE_API_PROXY_TARGET`.

*(No Windows com PowerShell restrito, você pode usar `corepack.cmd pnpm install` e `npm.cmd run dev`.)*

---

## Principais Endpoints da API (`/api/v1`)

| Grupo | Rotas |
| --- | --- |
| **Auth & Workspace** | `POST /auth/login`, `POST /auth/register-clinic`, `GET /auth/me`, `GET /workspace` |
| **Clínica** | `GET /clinic`, `PUT /clinic` *(apenas owner)* |
| **Equipe** | `GET /dentists`, `GET /dentists/{id}`, `POST /dentists` *(owner)*, `PUT /dentists/{id}` *(owner)*, `PATCH /dentists/{id}/status` *(owner)* |
| **Pacientes** | `GET /patients`, `GET /patients/{id}`, `POST /patients`, `PUT /patients/{id}`, `PATCH /patients/{id}/archive`, `PATCH /patients/{id}/restore` |
| **Consultas** | `GET /appointments`, `GET /appointments/{id}`, `POST /appointments`, `PUT /appointments/{id}`, `PATCH /appointments/{id}/status` |

A especificação completa e interativa pode ser explorada em `http://localhost:8080/swagger-ui.html`.

---

## Testes e Qualidade

### Backend (Java 21 + JUnit 5 + MockMvc)
Via Docker (sem precisar de Maven instalado localmente):
```bash
docker run --rm -v "${PWD}/backend:/app" -w /app maven:3.9.9-eclipse-temurin-21 mvn -B test
```
Ou localmente com Maven + JDK 21:
```bash
cd backend
mvn test
```

### Frontend (Vitest + Oxlint + TypeScript)
```bash
cd frontend
pnpm test
pnpm lint
pnpm build
```
