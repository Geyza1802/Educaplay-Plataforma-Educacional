# Documento de Especificação de Requisitos do Projeto

## 1. Classificação Geral dos Requisitos Iniciais

### Requisitos Funcionais (RF)
*   **RF01 - Cadastro de Perfis:** Permitir o registro gerenciado de múltiplos perfis infantis atrelados a uma conta de responsável.
*   **RF02 - Controle de Temporizador de Tela:** Disponibilizar mecanismo de contagem de tempo baseado nas diretrizes de saúde pública.
*   **RF03 - Minigame de Alfabetização:** Módulo interativo focado na associação de grafemas, fonemas e expansão de vocabulário.
*   **RF04 - Minigame de Matemática:** Módulo interativo dedicado a desafios lúdicos de contagem e raciocínio lógico-matemático.
*   **RF05 - Trilha da Cidadania:** Seção com narrativas ramificadas sobre dilemas éticos, meio ambiente e convívio social.
*   **RF06 - Dashboard de Progresso:** Painel analítico de uso e desempenho pedagógico exclusivo para o perfil dos responsáveis.
*   **RF07 - Sistema de Recompensas:** Gamificação por meio da atribuição de pontuação e estrelas digitais acumulativas.
*   **RF08 - Customização de Avatares:** Loja virtual lúdica para troca de pontos por itens cosméticos de personalização.

### Requisitos Não Funcionais (RNF)
*   **RNF01 - Segurança e Privacidade (Conformidade LGPD):** Toda a persistência de informações das crianças (nomes, idades e desempenho) processadas pela EducaPlay deve ser armazenada de forma criptografada, impedindo o vazamento de dados sensíveis a terceiros.
*   **RNF02 - Usabilidade e Design Responsivo (UX Infantil):** A interface da plataforma deve adaptar-se a resoluções entre 360px e 1920px sem perda de funcionalidade em computadores, tablets e smartphones. Os botões e mecânicas devem possuir tamanho adequado para o toque de crianças pequenas, priorizando ícones coloridos em vez de textos densos.
*   **RNF03 - Desempenho e Sincronismo do Timer:** O mecanismo do temporizador de uso de telas deve rodar de forma contínua com uma latência máxima de verificação de 1 segundo, assegurando que o bloqueio aconteça de maneira exata no tempo programado pelos pais.

---

## 2. Backlog do Projeto: 8 Histórias de Usuário (Rastreadas)

### **US01 - Cadastro Gerenciado de Perfis (Alta Prioridade) | Rastreabilidade: RF01**
> **Como** pai ou mãe preocupado com a rotina,
> **Quero** cadastrar o perfil do meu filho com a sua respectiva faixa etária na EducaPlay,
> **Para** que o sistema filtre conteúdos adequados ao nível de desenvolvimento dele.

### **US02 - Bloqueio por Gestão de Tempo - Timer SBP (Alta Prioridade) | Rastreabilidade: RF02, RNF03**
> **Como** responsável que busca seguir as orientações de saúde pública,
> **Quero** configurar um temporizador que trave o aplicativo após o limite estabelecido, 
> **Para** evitar que meu filho faça o uso excessivo e prejudicial de telas.

### **US03 - Módulo de Alfabetização Ativa (Alta Prioridade) | Rastreabilidade: RF03**
> **Como** uma criança em fase de alfabetização,
> **Quero** acessar mini-jogos lúdicos de associação de vogais e fonemas na EducaPlay,
> **Para** expandir meu vocabulário e aprender brincando.

### **US04 - Desafios de Matemática Inicial (Alta Prioridade) | Rastreabilidade: RF04**
> **Como** uma criança explorando o raciocínio lógico,
> **Quero** resolver quests interativas de contagem de objetos,
> **Para** compreender as quatro operações básicas de forma visual.

### **US05 - Trilha Interativa da Cidadania (Alta Prioridade) | Rastreabilidade: RF05**
> **Como** pai ou mãe que busca educar além das matérias básicas,
> **Quero** que meu filho acesse mini-histórias sobre respeito e meio ambiente,
> **Para** que ele desenvolva valores de cidadania desde cedo.

### **US06 - Dashboard de Evolução Pedagógica (Média Prioridade) | Rastreabilidade: RF06**
> **Como** pai ou mãe que deseja apoiar a aprendizagem,
> **Quero** visualizar um relatório simples de acertos e tempo de uso do meu filho,
> **Para** identificar onde ele precisa de mais estímulo na rotina.

### **US07 - Sistema de Pontuação e Recompensas (Média Prioridade) | Rastreabilidade: RF07**
> **Como** uma criança jogando a plataforma,
> **Quero** ganhar estrelas digitais ao concluir as missões educativas,
> **Para** me manter motivada a continuar progredindo nos estudos.

### **US08 - Customização Lúdica de Avatar (Baixa Prioridade) | Rastreabilidade: RF08, RNF02**
> **Como** uma criança usuária do aplicativo,
> **Quero** personalizar um personagem animado com os pontos que ganhei,
> **Para** expressar minha identidade dentro do ambiente digital seguro da EducaPlay.

---

## 3. Critérios de Aceitação (Formato BDD: Dado / Quando / Então)

### **Critérios para a US01 (Cadastro de Perfis)**
* **Cenário 1: Cadastro realizado com sucesso**
    * **Dado que** o pai está na tela de configuração de perfil da EducaPlay;
    * **Quando** ele preencher o nome da criança e selecionar a idade entre 3 e 7 anos;
    * **Então** o perfil infantil deve ser criado com sucesso.
* **Cenário 2: Validação de faixa etária fora do escopo**
    * **Dado que** o pai tenta cadastrar uma idade fora do escopo pedagógico (ex: 15 anos);
    * **Quando** ele clicar em salvar;
    * **Então** o sistema deve exibir uma mensagem informando que a plataforma é exclusiva para a infância básica.
* **Cenário 3: Proteção de acesso**
    * **Dado que** o perfil infantil está ativo;
    * **Quando** a criança tentar acessar a área de edição do cadastro;
    * **Então** o sistema deve exibir o PIN de segurança dos pais para liberar o acesso.

### **Critérios para a US02 (Bloqueio por Tempo - SBP)**
* **Cenário 1: Acionamento exato do Timer**
    * **Dado que** o temporizador foi configurado pelos pais para o limite de 60 minutos;
    * **Quando** a criança atingir exatamente 60 minutos de uso contínuo;
    * **Então** o aplicativo deve bloquear o acesso à EducaPlay em até 1 segundo após atingir o limite configurado.
* **Cenário 2: Exibição de tela de bloqueio pedagógica**
    * **Quando** o tempo estourar e o app travar;
    * **Então** deve ser exibida uma animação amigável orientando a criança a descansar os olhos e brincar longe das telas.
* **Cenário 3: Tentativa de burlar o bloqueio**
    * **Dado que** a tela de bloqueio do timer está ativa;
    * **Quando** a criança tentar fechar e reabrir o aplicativo;
    * **Então** o sistema deve retornar direto para a tela de bloqueio até que o PIN do responsável seja inserido.

### **Critérios para a US03 (Módulo de Alfabetização)**
* **Cenário 1: Feedback de acerto**
    * **Dado que** a criança está no desafio de arrastar a vogal correspondente ao som da palavra "Abelha";
    * **Quando** ela arrastar a letra "A" para o campo correto;
    * **Então** o sistema deve emitir um som alegre e computar os pontos na tela.
* **Cenário 2: Ajuda visual após erros consecutivos**
    * **Dado que** a criança erra a letra por três vezes seguidas;
    * **Quando** ocorrer o terceiro erro;
    * **Então** o jogo deve piscar a resposta correta de forma sutil para ajudá-la, sem aplicar punições severas.
* **Cenário 3: Salvamento de progresso forçado**
    * **Dado que** o jogo é interrompido repentinamente pelo timer da SBP;
    * **Quando** a sessão for encerrada;
    * **Então** a fase atual e a pontuação da trilha de letras devem ser salvas no banco de dados automaticamente.

### **Critérios para a US07 (Sistemas de Pontuação e Recompensas)**
* **Cenário 1: Atribuição de estrelas**
    * **Dado que** a criança concluiu um minigame com 100% de acertos;
    * **Quando** a tela de vitória carregar;
    * **Então** o sistema deve adicionar 3 estrelas ao saldo do perfil dela.
* **Cenário 2: Acúmulo de pontos**
    * **Dado que** a criança já possui 5 estrelas no perfil;
    * **Quando** ela ganhar mais 2 estrelas em uma nova fase;
    * **Então** o saldo total deve ser updated para 7 estrelas imediatamente.
* **Cenário 3: Sincronização com o painel dos pais**
    * **Quando** a pontuação da criança for atualizada;
    * **Então** essa nova pontuação deve ser refletida em tempo real no Dashboard de Evolução dos pais.
