# AETHER

[English version](README.md)

AETHER é um jogo de sobrevivência 2D top-down em um planeta alienígena hostil.
Você é um explorador que caiu com a nave e precisa sobreviver tempo suficiente para minerar, construir, pesquisar e expandir sua base.

O projeto foi feito com HTML, CSS e módulos JavaScript puros, com foco em iteração rápida e gameplay fluido no navegador.

## Destaques

- Geração procedural de terreno com aleatoriedade baseada em seed
- Loop de mineração com barra de progresso
- Inventário com descarte e uso de consumíveis
- Sistema de construção com validação de posicionamento e custos
- Pesquisas que melhoram sobrevivência e eficiência
- Painel de craft com receitas dependentes de energia
- Economia de energia com comportamento de dia e noite
- Habitat com recuperação de O2 e vida por proximidade
- Ciclo de dia/noite com variação visual
- Minimapa e HUD para consciência situacional
- Controles touch para mobile
- Save/load local
- Efeitos sonoros leves via Web Audio API

## Loop Principal

1. Explore o terreno gerado.
2. Minere recursos próximos.
3. Construa estruturas para melhorar a base.
4. Gere e administre energia.
5. Faça craft de itens de suporte (como O2 Pack e Medkit).
6. Pesquise upgrades para evoluir o personagem.
7. Sobreviva o máximo possível e aumente o score.

## Controles

### Desktop

- Movimento: WASD ou Setas
- Minerar: E
- Painel de construção: B
- Painel de craft: C
- Painel de inventário: I
- Painel de pesquisa: R
- Pausar: P
- Cancelar posicionamento / fechar painéis: Escape

### Mobile

- D-pad virtual à esquerda
- Botões de ação à direita (mineração e painéis)

## Como Executar

Como o jogo usa módulos JavaScript, rode em um servidor local.

Opção A: Python

    python -m http.server 8080

Depois abra:

    http://localhost:8080

Opção B: VS Code Live Server

- Abra a pasta do projeto
- Inicie uma extensão de servidor local
- Abra a página servida

## Estrutura do Projeto

- index.html: Shell principal de UI e painéis
- css/style.css: Estilo visual, responsividade e touch UI
- js/constants.js: Constantes e tabelas de dados
- js/utils.js: Utilitários
- js/worldgen.js: Geração de mundo e recursos
- js/game.js: Runtime principal, render, gameplay, UI, save/load e áudio

## Visão dos Sistemas

### Geração de Mundo

Terreno e recursos são gerados por padrões de ruído determinísticos e clusters para distribuição mais natural.

### Sobrevivência

- O2 drena fora da proteção do habitat
- Vida é drenada quando o O2 zera
- Habitat recupera O2 e vida em raio próximo

### Economia

- Estruturas têm custo de construção
- Energia é gerada por estruturas específicas de acordo com o ciclo dia/noite
- Craft consome recursos e energia
- Algumas estruturas produzem recursos ao longo do tempo

### Progressão

Pesquisas desbloqueiam bônus permanentes e podem avançar automaticamente via laboratório quando há energia.

## Dados de Save

O jogo salva automaticamente no local storage do navegador.

Inclui:

- Seed e dados de tiles do mundo
- Recursos e estruturas construídas
- Status do jogador e inventário
- Pesquisas desbloqueadas
- Contadores de progresso da sessão

## Status Atual

O projeto está em desenvolvimento ativo e já está jogável.
Atualizações recentes incluem:

- Geração de recursos mais natural
- Spawn inicial com habitat e início mais seguro
- Descarte de inventário e uso de consumíveis
- Painel de craft e integração de energia
- Renderização amigável para HiDPI
- Controles touch e painéis responsivos

## Ideias de Roadmap

- Cadeias de craft e produção mais profundas
- Interações e balance de energia mais avançados
- Inimigos, eventos climáticos e hazards
- Condição de vitória e sequência de escape
- Achievements e progressão de longo prazo
- Quebra adicional do runtime em módulos menores

## Licença

Ainda não há arquivo de licença incluído.
Se for distribuir o projeto, adicione uma licença explícita.

## Créditos

Projeto desenhado e implementado como uma experiência evolutiva de sobrevivência no navegador, inspirada em exploração, progressão sistêmica e construção de base.