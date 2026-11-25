# Clareia — Frontend (React + TypeScript + Vite)

Interface web da plataforma de gestão odontológica **Clareia**, conectada à API REST Spring Boot (Java 21 + PostgreSQL) em `../backend`.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 e componentes shadcn/ui (Radix)
- React Router 7
- React Hook Form + Zod
- date-fns (pt-BR), Lucide, Sonner
- Vitest + Testing Library

## Configuração

As variáveis de ambiente do projeto ficam no arquivo `.env` na **raiz do repositório** (veja `../.env-example`):

- `VITE_API_PROXY_TARGET` — destino do proxy `/api` em desenvolvimento (padrão `http://localhost:8080`)
- `VITE_API_URL` — prefixo da API consumida pelo cliente HTTP (padrão `/api/v1`)

## Como executar

1. Suba o backend (na raiz do repositório):
   ```bash
   docker compose up -d --build
   ```
2. Instale e inicie o frontend:
   ```bash
   pnpm install
   pnpm dev
   ```

Abra `http://localhost:5173`.

## Outros comandos

```bash
pnpm build      # typecheck + build de produção
pnpm lint       # oxlint
pnpm test       # vitest (modo único)
pnpm test:watch # vitest em modo watch
```

## Arquitetura

```text
src/
├── components/
│   ├── layout/     # shell, sidebar, topbar, command palette
│   ├── shared/     # primitives visuais: avatar, charts, badges, fields...
│   └── ui/         # componentes shadcn/ui
├── data/           # cliente HTTP (api-client), reducer e provider
├── domain/         # tipos, permissões, conflitos, CNPJ, schemas Zod
├── features/       # landing, onboarding, auth, dashboard, agenda, pacientes, equipe, configurações
├── lib/            # datas, formatação, tons, utilitários
├── App.tsx         # rotas e divisão de código por página
└── main.tsx        # providers e ponto de entrada
```

Toda autenticação (JWT Bearer) e persistência (clínica, dentistas, pacientes e consultas) ocorre via backend em `/api/v1/*`, com isolamento multi-tenant por clínica e controle de permissões por perfil (`owner` / `dentist`).
