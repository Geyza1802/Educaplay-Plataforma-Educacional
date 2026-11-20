# EducaPlay — Plataforma Educacional Gamificada

Plataforma web educativa voltada para o ensino de matemática de forma lúdica, com acompanhamento parental, controle de tempo diário e sistema de conquistas.

## Funcionalidades

- **6 Jogos Educativos:** Adição, Subtração, Multiplicação, Divisão, Comparação Numérica e Operações Mistas.
- **Mascote Interativo:** Guia visual e feedback imediato durante os desafios.
- **Dificuldade Progressiva por Nível:** Evolução automática entre *Fácil*, *Médio* e *Difícil* conforme a pontuação acumulada (a cada 50 pontos).
- **Perfis e Autenticação com Token:** Acesso simplificado por nome para crianças e área protegida por e-mail, senha, PIN de 4 dígitos e token para responsáveis.
- **Gestão de Crianças:** Cadastro e exclusão de perfis infantis vinculados ao responsável.
- **Controle de Tempo Diário:** Limite automático de **40 minutos por dia** por criança.
- **Relatório e Histórico (7 dias):** Acompanhamento de precisão por matéria, tempo de uso e sessões recentes.
- **Medalhas e Conquistas:** 16 medalhas desbloqueáveis por acertos, estrelas, domínio de operações e constância.

## Tecnologias

- **Frontend:** Angular (Standalone Components, Signals)
- **Backend:** Node.js, Express, SQLite (`node:sqlite`), `bcryptjs`

## Como Rodar o Projeto

### Opção rápida (Windows)
Execute o arquivo `iniciar.bat` na raiz do projeto[cite: 8].

### Manualmente

**1. Backend**
```bash
cd backend
npm install
node index.js