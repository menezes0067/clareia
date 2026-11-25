# Clareia Backend (Java 21 + Spring Boot)

API REST para a plataforma odontológica Clareia, construída em **Java 21**, **Spring Boot 3.4**, **Spring Security + JWT**, **Spring Data JPA**, **Flyway** e **PostgreSQL 16**.

## Variáveis de ambiente (Segurança)

Todas as configurações sensíveis e variáveis de ambiente são carregadas do arquivo `.env` na **raiz do repositório** (ignorado pelo `.gitignore`).

1. Copie o arquivo de exemplo na raiz do projeto:
   ```bash
   cp .env-example .env
   ```
2. Preencha os valores reais no `.env` (em especial `JWT_SECRET`, credenciais do PostgreSQL e configurações de demo).
3. Em produção, defina `CLAREIA_DEMO_ENABLED=false` e `CLAREIA_DEMO_SEED_ON_STARTUP=false`.

## Como executar

### Com Docker Compose (recomendado — sobe PostgreSQL 16 + Backend)
Na raiz do repositório:
```bash
docker compose up --build
```

### Localmente com JDK 21 + Maven
Com um PostgreSQL rodando conforme `DB_URL` no `.env`:
```bash
cd backend
mvn spring-boot:run
```

Ou usando o profile opcional `local` (banco H2 em arquivo, sem PostgreSQL):
```bash
cd backend
SPRING_PROFILES_ACTIVE=local mvn spring-boot:run
```

## Testes

```bash
cd backend
mvn test
```

## Documentação interativa (OpenAPI / Swagger)

Com o servidor rodando em `http://localhost:8080`:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Healthcheck: `http://localhost:8080/actuator/health`
