# VIA TESTIUM: THE APOSTLES' TRAIL (O CAMINHO DO TESTEMUNHO)
## Technical Game Design Document (GDD) — Core Gameplay Systems

---

### 1. Visão Geral e Filosofia de Design

*Via Testium* é um RPG tático, narrativo e de sobrevivência histórica ambientado no século I d.C. (28 d.C. – 100 d.C.). O jogo rejeita o heroísmo anacrônico ou a fantasia mágica hollywoodiana: a experiência é pautada pelo rigor histórico greco-romano e levantino, solenidade bíblica e pelo peso existencial do testemunho (*martyria*).

O jogador experimenta o nascimento da Igreja Primitiva não através do poder militar, mas através da resiliência comunitária, fidelidade doutrinária, persuasão retórica e sacrifício.

---

### 2. O Loop Central de Gameplay (The Core Loop)

O ciclo de jogo opera em três camadas interligadas em tempo real ou pausas táticas:

```
                  ┌──────────────────────────────┐
                  │    FASE DE EVANGELIZAÇÃO     │
                  │   (Pregação / Diálogo /      │
                  │     Kerygma / Debate)        │
                  └──────────────┬───────────────┘
                                 │
                 Gera Graça/Fé   │   Gera Alerta/Hostilidade
                 (Pneuma / Fides)│   (Notitia / Persecutio)
                                 ▼
┌─────────────────────────────┐      ┌─────────────────────────────┐
│  SUSTENTAÇÃO COMUNITÁRIA    │      │     AMEAÇA E INQUISIÇÃO     │
│   (Koinonia & Diakonia)     │◄────►│     (Furtividade / Fuga /   │
│ Casa-Igreja, Apoio a Órfãos,│ Reduz│     Defesa Tática Não-Letal)│
│ Catacumbas, Moral do Rebanho│Alerta│                             │
└─────────────────────────────┘      └─────────────────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │  CLÍMAX DO CAPÍTULO & MORTE  │
                  │        (O MARTÍRIO)          │
                  │   Consagração no Metagame    │
                  │      "CANON ROMANO"          │
                  └──────────────────────────────┘
```

---

### 3. Mecânica 1: Evangelismo e Pontos de Fé (*Pneuma & Kerygma*)

Em vez de mana ou pontos de magia convencionais, as interações espirituais e retóricas utilizam dois recursos:

#### A. **Pneuma (Sopro / Graça Divina)**
- **Natureza:** Recurso sagrado não regenerável por poções. Recuperado exclusivamente por oração coletiva, jejum comunitário ou confissão de pecados em locais consagrados (cenáculos, catacumbas, margens de rios).
- **Usos em Gameplay:**
  - *Sustentar a Fé (Parrhesia):* Desbloqueia opções de diálogo ousadas perante magistrados romanos e o Sinédrio.
  - *Consolação Apostólica:* Reduz o pânico de neófitos em fuga durante invasões de soldados.
  - *Cura e Milagres Históricos:* Executados estritamente em momentos canônicos (e.g., Pedro na Porta Formosa, Paulo em Malta). Não são feitiços lançados em combate comum; exigem alinhamento ético e oração fervorosa.

#### B. **Kerygma (A Força da Palavra / Árvore Teológica)**
- Nos diálogos, o jogador nunca "ataca" verbalmente para destruir o oponente com sarcasmo. O sistema de diálogo é baseado em **Três Pilares de Persuasão Retórica**:
  1. **Logos da Escritura (Citações Proféticas):** Eficaz contra escribas, fariseus e judeus helenistas.
  2. **Apologia Racional (Filosofia e Justiça Natural):** Eficaz perante juízes romanos, procônsules e filósofos gregos (e.g., Areópago de Atenas).
  3. **Caritas / Testemunho Vivo (Compaixão Ativa):** Eficaz com plebeus gentios, escravos, leprosos e soldados rasos.
- **Risco de Desvio Doutrinário:** Escolhas fáceis ou concessões idolátricas para salvar a própria vida reduzem o *Kerygma* e introduzem sementes de heresia na comunidade, diminuindo a coesão da Igreja local nas fases futuras.

---

### 4. Mecânica 2: Nível de Alerta — Sinédrio e Império Romano (*Notitia & Persecutio*)

O mundo ao redor dos Apóstolos não é neutro; ele reage ativamente ao crescimento da mensagem cristã. O medidor de Alerta é subdividido em dois vetores:

| Vetor de Alerta | Gatilho de Elevação | Consequências Práticas em Jogo |
| :--- | :--- | :--- |
| **Alerta Religioso / Sinédrio (*Zelos*)** | Pregação em praça aberta perto de sinagogas, curas públicas no Shabat, acusações de blasfêmia. | • Espiões fariseus se infiltram nas casas.<br>• Agitadores de rua mobilizam apedrejamento popular.<br>• Mandados de prisão assinados pelos sumos sacerdotes. |
| **Alerta Imperial / Romano (*Maiestas*)** | Afirmar que "Jesus é o Senhor (Kyrios)" em vez de César, recusa em queimar incenso aos deuses de Roma, perturbação da ordem pública (*pax romana*). | • Patrulhas de legionários montam barreiras nos portões da cidade.<br>• Cobrança abusiva de impostos (*fiscus iudaicus*).<br>• Incursões da guarda pretoriana com tochas e cães de caça.<br>• Execuções sumárias por sedição política. |

#### Furtividade Social e Evasão:
- **Disfarces Históricos:** O jogador pode vestir túnicas de pescador, roupas de carpinteiro, mantos de viajante ou vestes de curtidor para atravessar mercados e alfândegas.
- **Sinais Secretos (*Ichthys* e Criptogramas):** Marcar paredes discretamente com o peixe (*Ichthys*) ou âncoras para orientar fiéis sobre onde será o próximo culto sem alertar os guardas.
- **Resolução de Conflito Não-Letal:** O combate corporal dos Apóstolos é estritamente defensivo: empurrões táticos, desarmamento de agressors, quebra de tochas para criar brechas de escuridão e fuga rápida. "Quem vive pela espada, pela espada perecerá" é uma regra dura do sistema: tirar sangue de um perseguidor drena o *Pneuma* do protagonista e atrai repressão brutal sobre a casa-igreja.

---

### 5. Mecânica 3: Sustentação Comunitária (*Koinonia & Diakonia*)

Em cada cidade (Jerusalém, Antioquia, Corinto, Éfeso, Roma), o Apóstolo deve fundar ou sustentar uma **Casa-Igreja (*Domus Ecclesiae*)**.

1. **Gestão do Rebanho:**
   - **Distribuição Diária de Alimentos (*Diakonia*):** Garantir que viúvas, escravos desamparados e órfãos recebam pão. A negligência gera divisões internas (como narrado em Atos 6).
   - **Moral da Comunidade (*Spes*):** Quando prisões e execuções ocorrem na cidade, o terror se espalha. Se a moral zerar, membros amedrontados denunciam a liderança ou apostatam (*lapsi*).
   - **Acolhimento Clandestino:** Esconder mensageiros da fé, abrigar forasteiros batizados e proteger cópias dos Evangelhos e epístolas manuscritas.

2. **Rotas e Naufrágios (*Itinerarium*):**
   - Viagens entre províncias imperiais envolvem sobrevivência climática, contratação de barcos mercantes fenícios, perigos de salteadores em desfiladeiros e febre. O mapa de viagem exige gerenciar rações, água e cartas de recomendação episcopal.

---

### 6. Sistema Metagame: O Quadro do "Canon Romano" (*Canon Romanum*)

O jogo não tem tela convencional de "Game Over" ao final das fases. **A morte do Apóstolo é o ápice vitorioso do testemunho.**

Ao final de cada uma das 14 fases, quando o Apóstolo sela sua jornada com o martírio (ou transição celestial no caso de João):
1. **O Retrato do Apóstolo** é inserido solenemente no grande retábulo de mosaico bizantino/romano chamado **Canon Romano** (*Canon Missae*).
2. **Florescimento dos Mártires Contemporâneos:**
   - Conforme a perseguição se acentua, o quadro se expande dinamicamente: novos rostos de santos históricos contemporâneos — canonizados pela Igreja Católica e que viveram durante o período apostólico — acendem-se ao redor do Apóstolo.
   - Demonstra visualmente o princípio de Tertuliano: *"Sanguis martyrum semen christianorum"* (O sangue dos mártires é a semente de novos cristãos).
3. **Herança Espiritual (*Charismata* para a Próxima Fase):**
   - Cada santo entronizado no Canon Romano concede uma relíquia espiritual imaterial permanente para a campanha:
     - Exemplo: O martírio de Estêvão (desbloqueado no final da Fase 2 e início da 13) concede a bênção *"Perdão aos Executores"*, reduzindo o estresse psicológico em interrogatórios.
     - O martírio de Pedro e Paulo em Roma concede a graça *"Pilar Firme"*, impedindo a dispersão das casas-igrejas em províncias de alto risco.
