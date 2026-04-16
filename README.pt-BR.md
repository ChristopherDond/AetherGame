# AETHER

[English version](README.md)

AETHER e um jogo de sobrevivencia 2D top-down em um planeta alienigena hostil.
Voce e um explorador que caiu com a nave e precisa sobreviver enquanto minera, constroi, pesquisa e expande sua base.

O projeto foi feito com HTML, CSS e modulos JavaScript puros.
Sem framework, sem build step, com foco em iteracao rapida.

## O Que Ja Esta Implementado

- Geracao procedural de mundo com seed deterministica
- Clusters de recursos distribuidos por tipo de terreno
- Loop de mineracao com feedback de progresso
- Inventario com uso de consumiveis e descarte por quantidade
- Sistema de construcao com custo, colisao e validacao de terreno
- Simulacao de geracao e consumo de energia
- Receitas de craft com requisitos de energia e proximidade de estrutura
- Arvore de pesquisa com prerequisitos e bonus permanentes
- Raio de seguranca do habitat (recuperacao de O2 e HP)
- Ciclo de dia/noite afetando producao de energia
- Controles touch para mobile
- Save/load automatico via local storage do navegador
- Efeitos sonoros leves via Web Audio API

## Loop Principal

1. Explore e localize clusters de recursos.
2. Minere materiais perto do personagem.
3. Construa estruturas para melhorar producao e sobrevivencia.
4. Gerencie energia para craft e progresso de pesquisa.
5. Faça craft de itens de suporte (O2 Pack, Medkit, Battery, Alloy).
6. Desbloqueie upgrades de pesquisa e aumente seu tempo de sobrevivencia.

## Controles

### Desktop

- Movimento: WASD ou Setas
- Minerar: E
- Abrir painel de construcao: B
- Abrir painel de craft: C
- Abrir painel de inventario: I
- Abrir painel de pesquisa: R
- Pausar/Retomar: P
- Cancelar posicionamento / fechar paineis: Escape

### Mobile

- D-pad virtual no lado esquerdo
- Botoes de acao no lado direito (mineracao e atalhos de paineis)

## Como Rodar Localmente

Como o jogo usa modulos ES, execute em um servidor local.

Opcao A (Python):

```bash
python -m http.server 8080
```

Depois abra:

```text
http://localhost:8080
```

Opcao B (VS Code Live Server):

1. Abra a pasta do projeto.
2. Inicie o Live Server.
3. Abra a pagina servida.

## Estrutura do Projeto

- `index.html`: Telas principais, HUD e paineis
- `css/style.css`: Estilo visual, layout responsivo e controles touch
- `js/constants.js`: Dados de tiles, mundo, recursos, estruturas e pesquisas
- `js/utils.js`: Utilitarios matematicos e randomico deterministico
- `js/worldgen.js`: Geracao de terreno e recursos
- `js/game.js`: Loop principal, renderizacao, UI, input, sistemas, save/load e audio

## Resumo dos Sistemas

### Mundo

- Grade do mapa: 80 x 60 tiles
- Tamanho do tile: 40 px
- Geracao deterministica a partir de seed

### Sobrevivencia

- O2 drena fora da area de protecao do habitat
- HP drena quando o O2 chega a zero
- Habitat regenera O2 e HP quando o jogador esta proximo

### Economia e Progressao

- Estruturas consomem recursos do inventario para construcao
- Painel solar e turbina dependem do ciclo dia/noite
- Gerador nuclear fornece energia estavel
- Fazenda e extrator de agua consomem energia para produzir recursos ao longo do tempo
- Pesquisas concedem bonus permanentes (velocidade de mineracao, O2 maximo, HP maximo)

### Sistema de Save

O auto-save roda durante a partida e em transicoes importantes.
Os dados ficam na chave `aether_save_v1` do local storage e incluem:

- Contadores de tempo e ciclo
- Seed do mundo e entidades geradas
- Estruturas construidas
- Estado do jogador e inventario
- Pesquisas desbloqueadas

## Status Atual

Protótipo jogavel em desenvolvimento ativo.
O foco atual esta nos sistemas centrais: sobrevivencia, construcao, craft, pesquisa e save/load.

## Ideias de Roadmap

- Cadeias de craft e producao mais profundas
- Melhor balanceamento de energia e progressao
- Hazards, inimigos e eventos dinamicos
- Condicao de vitoria / sequencia de fim de jogo (escape)
- Sistema de conquistas e progressao de longo prazo

## Licenca

Ainda nao existe arquivo de licenca no repositorio.
Se for distribuir ou aceitar contribuicoes, adicione uma licenca explicita.

## Creditos

Projeto desenvolvido como uma experiencia evolutiva de sobrevivencia no navegador, com foco em exploracao, progressao sistemica e construcao de base.