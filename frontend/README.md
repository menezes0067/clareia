# Clareia — gestão odontológica (demo front-end)

Demonstração completa de um SaaS de gestão para clínicas odontológicas. O projeto
traz uma landing page editorial, login simulado e uma aplicação com permissões
reais por perfil: a dona da clínica vê tudo; cada dentista vê apenas seus
pacientes, sua agenda e seus indicadores.

Tudo roda no navegador, sem backend. Os dados são fictícios e ficam em
`localStorage`, com opção de restaurar a demonstração a qualquer momento.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 e componentes shadcn/ui (Radix)
- React Router 7
- React Hook Form + Zod
- date-fns (pt-BR), Lucide, Sonner
- Vitest para testes de domínio e dados

## Como executar

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:5173`.

Outros comandos:

```bash
pnpm build      # typecheck + build de produção
pnpm lint       # oxlint
pnpm test       # vitest (modo único)
pnpm test:watch # vitest em modo watch
```

## Cadastro da clínica (onboarding)

Além da demonstração pronta, a landing page tem o fluxo **Criar minha clínica**
(`/cadastro`), em duas etapas:

1. **Dona** — nome, e-mail, telefone, CRO e especialidade.
2. **Clínica** — nome, CNPJ, endereço, telefone e e-mail de contato.

Os campos de telefone e CNPJ recebem máscara enquanto você digita. O CNPJ é
validado pelos dígitos verificadores; e-mails são normalizados para minúsculas,
CRO é normalizado para maiúsculas e datas/horários são conferidos pelos schemas
Zod antes de salvar.

Ao final, o sistema cria duas entidades vinculadas (`Clinic` e `Dentist` com
perfil de dono), salva no localStorage, autentica a dona e abre um workspace
vazio — sem pacientes, dentistas ou consultas. A partir daí os formulários da
aplicação já usam os dados da clínica cadastrada (barra lateral, dashboard e
ficha em Configurações). A senha deste cadastro é a senha demo `demo123`.

## Contas demo

Todas as contas usam a senha `demo123`.

| E-mail | Perfil | O que vê |
| --- | --- | --- |
| `marina@clareia.app` | Dona da clínica | Toda a clínica: equipe, pacientes, agenda e dashboard global |
| `rafael@clareia.app` | Dentista | Apenas seus pacientes, sua agenda e seus indicadores |
| `camila@clareia.app` | Dentista | Apenas seus pacientes, sua agenda e seus indicadores |
| `bruno@clareia.app` | Inativo | Não consegue entrar (usado para testar desativação) |

Na tela de login você pode clicar em qualquer card de conta para entrar
diretamente. A landing page também tem atalhos com o e-mail já preenchido.

## O que está implementado

### Landing page

- Hero com mockup da agenda construído em CSS/SVG (sem fotos de estoque).
- Alternância entre a visão da dona e a visão do dentista.
- Seções de para quem é, recursos, manifesto, passos e CTA final.
- Navegação responsiva com menu mobile e animações sutis.

### Aplicação

- **Visão geral**: dashboard role-aware. A dona acompanha ocupação, equipe,
  retornos e cancelamentos; o dentista vê seu dia, sua semana e seus pacientes.
- **Agenda**: grade semanal com 7 colunas, faixas de 30 minutos, blocos
  posicionados por duração, filtro por dentista (só para a dona) e lista diária
  no mobile. Clique em um horário livre para agendar; clique em uma consulta
  para ver detalhes, confirmar, concluir, cancelar, reagendar ou excluir.
- **Pacientes**: busca, filtros por status e dentista, cadastro/edição em
  sheet, arquivamento com confirmação e reativação. A ficha individual mostra
  dados de contato, responsável, observações clínicas e histórico de consultas.
- **Equipe** (somente dona): cadastro e edição de dentistas, CRO,
  especialidade, bio, status ativo/inativo e indicadores por profissional.
- **Configurações**: dados da clínica (edição apenas pela dona), resumo da
  conta, senha demo, encerramento de sessão e restauração da base demo.
- **Busca rápida** (`⌘K` / `Ctrl+K`): páginas, ações e pacientes permitidos.
- **Permissões**: além de esconder a navegação, as regras são aplicadas nas
  consultas aos dados e nas ações de edição. Um dentista não consegue ver,
  editar ou agendar nada de outro dentista.

### Regras de negócio

- Conflito de agenda é bloqueado para o mesmo dentista **e** para o mesmo
  paciente, ignorando consultas canceladas.
- Horários passados não podem ser agendados.
- A duração padrão muda conforme o procedimento, mas pode ser ajustada.
- Paciente arquivado mantém histórico e pode ser reativado.
- A dona não pode ser desativada; dentistas inativos perdem o acesso pela
  sessão.

## Arquitetura

```
src/
├── components/
│   ├── layout/     # shell, sidebar, topbar, command palette
│   ├── shared/     # primitives visuais: avatar, charts, badges, fields...
│   └── ui/         # componentes shadcn/ui
├── data/           # repositório localStorage, reducer, provider e seed
├── domain/         # tipos, criação da clínica, permissões, conflitos, schemas Zod
├── features/       # landing, onboarding, auth, dashboard, agenda, pacientes, equipe...
├── lib/            # datas, formatação, tons, ids, utilitários
├── App.tsx         # rotas e divisão de código por página
└── main.tsx        # providers e ponto de entrada
```

A separação segue o sentido de dependência: `features` e `data` dependem de
`domain`, que não conhece React nem persistência. O `ClinicRepository` é uma
interface; a implementação atual é `LocalClinicRepository`, que pode ser
substituída por uma versão HTTP sem alterar as regras de domínio.

### Persistência

- `clareia:clinic:v1` — estado da clínica (versão, clínica, dentistas,
  pacientes, consultas).
- `clareia:session:v1` — id do dentista logado.

Se o localStorage estiver indisponível ou corrompido, a aplicação cria uma base
demo nova e continua funcionando em memória. Restaurar a demo reconecta você
como a dona da clínica original.

## Escopo

Este é um MVP de demonstração de front-end. Não há backend, autenticação real,
pagamentos, anexos, prontuário eletrônico certificado nem integração com
SSS/ANS. A senha é fixa e os dados são apenas locais a este navegador.
