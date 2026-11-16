# 🌸 EducaPlay — Plataforma Educacional Gamificada

> Uma plataforma educativa de **matemática para crianças**, desenvolvida com **Angular** e **Node.js**, focada em aprendizado ativo e divertido, com acompanhamento em tempo real para os responsáveis.

---

## ✨ Identidade Visual & Aesthetica
- **Estilo:** *Kawaii Soft Pastel* 🌸✨
- **Paleta de Cores:** Tons pastéis suaves (Rosa pastel `#ffb7c5`, Azul céu `#7bdff2`, Lilás `#b28dff`, Amarelo suave `#ffe066`).
- **Design System:** Cartões flutuantes estilo nuvem translúcida com efeito Glassmorphism (`backdrop-filter: blur`), bordas arredondadas e ícones interativos.
- **Mascote e logo:** um cérebro fofinho com óculos e livro, que acompanha a criança pela plataforma.
- **Números e símbolos:** desenhos próprios, feitos para o projeto.

---

## 🎮 Funcionalidades Principais

### 👧 Perfil Infantil
- **Acesso descomplicado:** a criança entra só com o nome, sem senha.
- **Jogos matemáticos:** desafios gamificados de adição, subtração e geometria.
- **Feedback visual:** animações e mascote interativo, com pontuação em estrelas.
- **Níveis e conquistas:** a criança sobe de nível conforme acerta os desafios.
- **Tempo saudável de uso:** limite de 40 minutos de jogo por dia, controlado pelo servidor.

### 👨‍👩‍👧 Perfil do Responsável
- **Segurança:** acesso protegido por e-mail, senha e PIN (senha guardada com hash bcrypt).
- **Painel de desempenho:** gráficos e indicadores de progresso por matéria.
- **Métricas de uso:** controle e relatório do tempo diário jogado.
- **Gerenciamento de crianças:** cadastro e acompanhamento de vários perfis infantis.

### 📊 Relatório de Sessão Detalhado
- Dashboard pastel com nível do aluno, estrelas, conquistas, taxa de precisão por matéria e histórico completo de partidas.

---

## 🛠️ Tecnologias Utilizadas

**Frontend**
- Angular (Standalone Components) e TypeScript
- HTML5 e CSS3 (Flexbox, Grid, Animações CSS)
- Signals na tela do relatório
- Arquitetura CSS global centralizada e responsiva

**Backend**
- Node.js + Express
- SQLite embutido do Node (`node:sqlite`)
- bcryptjs (hash de senhas) e cors

---

## 🚀 Como rodar

**Requisito:** Node.js 22.13 ou mais novo.

> Cada projeto tem uma pasta dupla (uma de fora e uma de dentro com o mesmo nome). Rode os comandos **na pasta de dentro**, onde ficam o `package.json` e o `angular.json` (frontend) ou o `index.js` (backend).

**1. Backend** (porta 3000)
```bash
npm install
npm start
```

**2. Frontend** (porta 4200)
```bash
npm install
npm start
```

Depois, abra `http://localhost:4200` no navegador.

---

## 🔑 Login de teste

| Perfil | Dados |
|---|---|
| **Responsável** | e-mail: `responsavel@email.com` · senha: `12345678` · PIN: `1234` |
| **Criança** | qualquer nome (exemplo: `Lucas`) |

Para voltar ao estado inicial: pare o backend, apague o arquivo `educaplay.db` e inicie de novo.

---

## 🔌 Rotas da API

| Método | Rota | Para que serve |
|---|---|---|
| POST | `/api/responsaveis` | Cadastro do responsável |
| POST | `/api/responsaveis/login` | Login (e-mail, senha e PIN) |
| GET | `/api/responsaveis/:id/perfis` | Perfis infantis do responsável |
| POST | `/api/perfis/entrar` | Entrada da criança pelo nome |
| POST | `/api/sessoes` | Inicia uma sessão |
| PUT | `/api/sessoes/:id` | Atualiza o tempo da sessão (limite diário de 40 min) |
| POST | `/api/perfis/:id/desafios` | Registra um desafio (acertou ou errou, e pontos) |
| GET | `/api/perfis/:id/progresso` | Progresso do perfil |
| GET | `/api/perfis/:id/relatorio` | Relatório completo do perfil |

---

## 🗄️ Banco de dados
Tabelas: `responsavel`, `perfil_infantil`, `registro_sessao`, `progresso_matematica` e `desafio`.

---

## 📌 Status do projeto

| Item | Situação |
|---|---|
| Login do responsável (e-mail, senha e PIN) | ✅ Pronto |
| Entrada da criança pelo nome | ✅ Pronto |
| Controle de tempo e limite diário | ✅ Pronto |
| Registro de desafios, níveis e estrelas | ✅ Pronto (backend) |
| Relatório com dados reais do banco | ✅ Pronto |
| Jogos de adição, subtração e geometria | 🚧 Em desenvolvimento |
| Gráficos e histórico de partidas | 🔜 Planejado |
| Tela de cadastro de crianças | 🔜 Planejado |
| Autenticação por token nas rotas do relatório | 🔜 Planejado |
| Manter o login após recarregar a página | 🔜 Planejado |
