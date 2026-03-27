# Gestor de Finanças · Personal Finance Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Repository: [github.com/Kakaichi/gestor_financas](https://github.com/Kakaichi/gestor_financas)

**Languages:** [Português (BR)](#português) · [English](#english)

---

## Português

Aplicação web para controle de finanças pessoais: cadastro de transações, categorias, resumos, gráficos e suporte a despesas recorrentes. Stack com React (Vite) no cliente e API REST com Bun (Elysia) e SQLite.

### Aviso: uso apenas para estudos

Este projeto é publicado **somente como material de aprendizado e experimentação**. O código e a arquitetura **não estão preparados para uso em produção** do jeito que se apresentam aqui: faltam requisitos comuns em ambientes reais (por exemplo autenticação robusta, endurecimento de segurança da API, políticas de backup, observabilidade, revisão de desempenho sob carga e adequação a regras de negócio e de compliance).

O stack com Docker na documentação serve para você **reproduzir o projeto na sua máquina**, não como recomendação de implantação definitiva em servidores ou para dados sensíveis de terceiros. Se for evoluir para algo sério, trate isto como ponto de partida e projete deploy, segurança e operações de forma explícita.

O projeto como está agora, funciona perfeitamente como uma forma de gerenciar suas finanças localmente em seu computador ou em sua rede privada.

### Sobre o projeto

O frontend oferece painel com listagem, criação e edição de lançamentos, cartões de resumo e visão por categoria. O backend persiste os dados em SQLite e expõe endpoints REST para CRUD e operações de recorrência.

### Funcionalidades

- Lançamentos de receitas e despesas com categoria e data
- Dashboard com resumo e gráfico por categoria
- Despesas recorrentes com controle de mês pago e encerramento de recorrência

### Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI (shadcn), TanStack Query, React Router, Recharts |
| Backend | Bun, Elysia, `@elysiajs/cors`, SQLite (`bun:sqlite`) |
| Deploy local | Docker Compose, Nginx (imagem de produção do cliente) |

### Pré-requisitos

**Executar com Docker:** [Docker Engine](https://docs.docker.com/engine/install/) e [Docker Compose](https://docs.docker.com/compose/install/) (plugin `docker compose`).

**Desenvolvimento sem Docker:** [Node.js](https://nodejs.org/) (LTS; o build da imagem do cliente usa Node 22) com npm, e [Bun](https://bun.sh) para a API em `server/`.

### Como rodar o projeto

**1. Clonar o repositório**

```bash
git clone https://github.com/Kakaichi/gestor_financas.git
cd gestor_financas
```

**2.A Produção local com Docker (recomendado)**

Na raiz do repositório (onde está o `docker-compose.yml`):

```bash
docker compose up --build -d
```

Acesse **http://localhost:8081**. O Nginx serve o frontend e encaminha `/api` para o container da API. Os dados do SQLite ficam no volume **`api-data`**.

Comandos úteis:

```bash
docker compose down
docker compose down -v
```

O segundo comando remove também o volume e **apaga o banco de dados** persistido.

**2.B Desenvolvimento local (sem Docker)**

**Ordem:** suba a API primeiro; depois o frontend.

**Terminal 1** (API):

```bash
cd server
bun install
bun run dev
```

A API sobe em **http://localhost:3000** (porta padrão; pode ser alterada com a variável `PORT`).

**Terminal 2** (frontend, a partir da raiz do repositório):

```bash
npm install
npm run dev
```

O Vite usa **http://localhost:8080** e encaminha `/api` para **http://localhost:3000**.

### Scripts úteis (raiz do repositório)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Estrutura (resumo)

- `src/` Frontend React
- `server/src/` API Elysia e camada SQLite (`db.ts`)
- `docker-compose.yml`, `Dockerfile`, `nginx.conf` Stack Docker do cliente e proxy `/api`

### API

Todas as rotas REST estão prefixadas com `/api`. Implementação e contratos no arquivo **`server/src/index.ts`**.

### Licença

Este projeto está licenciado sob os termos da **licença MIT**. O texto completo está no arquivo [LICENSE](LICENSE).

Consulte a definição oficial da licença MIT em [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).

### Autor

**Hicaro Junior**

---

## English

Web app for personal finance: transactions, categories, summaries, charts, and recurring expenses. Client stack is React (Vite); the REST API runs on Bun (Elysia) with SQLite.

### Disclaimer: study use only

This project is shared **for learning and experimentation only**. The code and architecture are **not production-ready** as shipped: typical real-world pieces are missing (for example strong authentication, API hardening, backup policies, observability, load testing, and business or compliance rules).

The Docker-based workflow is meant to **run the project on your machine**, not as guidance for final deployment on public servers or for sensitive third-party data. If you move toward a serious deployment, treat this as a starting point and design deployment, security, and operations explicitly.

As it stands, the app is well suited to **managing your finances locally** on your computer or private network.

### About the project

The frontend provides a dashboard to list, create, and edit entries, summary cards, and a category view. The backend stores data in SQLite and exposes REST endpoints for CRUD and recurrence workflows.

### Features

- Income and expense entries with category and date
- Dashboard with summary and chart by category
- Recurring expenses with per-month paid tracking and option to stop recurrence

### Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI (shadcn), TanStack Query, React Router, Recharts |
| Backend | Bun, Elysia, `@elysiajs/cors`, SQLite (`bun:sqlite`) |
| Local deploy | Docker Compose, Nginx (production-style static client image) |

### Prerequisites

**Run with Docker:** [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) (`docker compose` plugin).

**Develop without Docker:** [Node.js](https://nodejs.org/) LTS with npm (the client image build uses Node 22), and [Bun](https://bun.sh) for the API under `server/`.

### How to run

**1. Clone the repository**

```bash
git clone https://github.com/Kakaichi/gestor_financas.git
cd gestor_financas
```

**2.A Local production-like stack with Docker (recommended)**

From the repository root (where `docker-compose.yml` lives):

```bash
docker compose up --build -d
```

Open **http://localhost:8081**. Nginx serves the frontend and proxies `/api` to the API container. SQLite data lives in the **`api-data`** volume.

Useful commands:

```bash
docker compose down
docker compose down -v
```

The second command also drops the volume and **deletes persisted database files**.

**2.B Local development (without Docker)**

**Order:** start the API first, then the frontend.

**Terminal 1** (API):

```bash
cd server
bun install
bun run dev
```

The API listens on **http://localhost:3000** by default (override with the `PORT` env var).

**Terminal 2** (frontend, from repository root):

```bash
npm install
npm run dev
```

Vite serves **http://localhost:8080** and proxies `/api` to **http://localhost:3000**.

### Useful scripts (repository root)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Repository layout (summary)

- `src/` React frontend
- `server/src/` Elysia API and SQLite layer (`db.ts`)
- `docker-compose.yml`, `Dockerfile`, `nginx.conf` client Docker stack and `/api` proxy

### API

All REST routes are under the `/api` prefix. See **`server/src/index.ts`** for handlers and payloads.

### License

This project is released under the **MIT License**. Full text in [LICENSE](LICENSE).

Official license terms: [opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).

### Author

**Hicaro Junior**
