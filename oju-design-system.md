# Sistema de Design OJU — Documento de Referência

**Origem:** extraído e normalizado a partir do código do OJU Packshot (`catalogo.html`, `hero.html`, `head.html`).
**Objetivo:** consolidar decisões de design já tomadas e aprovadas, corrigindo inconsistências encontradas no código, para servir de base tanto à revisão do Packshot quanto à construção do site principal da OJU.
**Status:** documento de referência (decisões em português, sem código). Uma vez aprovado, pode ser convertido em CSS real.

---

## 1. Tipografia

### 1.1 Fontes

| Uso | Fonte | Fallback | Variável CSS |
|---|---|---|---|
| Títulos (H1, H2, H3, hero, destaques) | Okomito Next (bold) | Helvetica Neue, Arial, sans-serif | `--font-display` |
| Corpo de texto, parágrafos, botões, legendas | system-ui (fonte nativa do sistema) | -apple-system, 'Segoe UI', Roboto, Arial, sans-serif | `--font-body` |

**Decisão (confirmada):** o corpo de texto usa a pilha de fontes nativas do sistema (`system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif`) — é o padrão que já era usado no OJU Packshot e deve ser **o único padrão em todo o site**, substituindo qualquer declaração antiga de `'Helvetica Neue'` como fonte primária. Toda página deve declarar `--font-body` com exatamente essa pilha (ver `agencia.html` para referência de implementação).

**Achado na auditoria:** o arquivo fonte (`Okomito-Bold.woff2`) está sendo declarado três vezes com pesos diferentes (700, 800, 900) apontando para o **mesmo arquivo físico** — ou seja, hoje não existe variação real de peso, é o mesmo arquivo "fingindo" ser 3 pesos.

**Decisão (confirmada):** até que existam arquivos reais para os pesos 700/800/900, todos os títulos usam **peso único 800**. A tabela de escala na seção 1.2 já reflete essa decisão.

### 1.2 Escala tipográfica (normalizada)

**Achado na auditoria:** o código usa três escalas `clamp()` diferentes e desconectadas para títulos (hero: 40–90px, catálogo: 34–72px, intro: 26–46px), sem relação matemática entre elas.

**Regra normalizada — escala de 5 níveis:**

| Nível | Uso | Tamanho (mobile → desktop) | Peso | Variável CSS |
|---|---|---|---|---|
| Display | Hero principal (1 por página) | 40px → 90px | 800 | `--tipo-display` |
| Título 1 | Títulos de seção grandes (ex: "SEU CATÁLOGO") | 34px → 72px | 800 | `--tipo-titulo-1` |
| Título 2 | Subtítulos de bloco (ex: "Produção e performance...") | 26px → 46px | 800 | `--tipo-titulo-2` |
| Título 3 | Títulos de card / item | 18px → 26px | 800 | `--tipo-titulo-3` |
| Corpo | Texto corrido, parágrafos | 14px → 19px | 400 | `--tipo-corpo` |

Cada nível usa `clamp(mínimo, valor-fluido, máximo)` com o mesmo padrão de unidade fluida (`vw`), evitando que cada bloco invente sua própria curva de escala. **Toda página nova deve declarar essas 5 variáveis em `:root` com os valores exatos acima** — nenhum título/subtítulo deve usar um `clamp()` "solto" fora dessas 5 variáveis, garantindo que a proporção entre títulos e subtítulos seja sempre a mesma em todas as páginas do site.

### 1.3 Estilo de texto

- Títulos: caixa alta (uppercase), letter-spacing levemente negativo em Display/Título 1 (`-0.02em`), neutro nos demais.
- Corpo: caixa normal, line-height 1.4–1.45.
- Subtítulos/legendas: uppercase, letter-spacing positivo (`.06em`), cor secundária (ver seção 2).

---

## 2. Cores

**Achado na auditoria:** o código usa preto/branco hard-coded em múltiplos formatos (`#000`, `rgba(0,0,0,.74)`, `rgba(0,0,0,.65)`, `rgba(0,0,0,.18)`, `rgba(0,0,0,.38)`) sem nomenclatura ou critério — cada bloco "inventa" sua própria opacidade de preto.

**Paleta normalizada:**

| Token | Valor | Uso |
|---|---|---|
| `cor-texto-principal` | `#000000` | Títulos, texto de alto contraste |
| `cor-texto-secundario` | `rgba(0,0,0,0.74)` | Parágrafos de corpo |
| `cor-texto-terciario` | `rgba(0,0,0,0.65)` | Subtítulos, legendas, texto de apoio |
| `cor-borda` | `#000000` | Bordas de botões e cards |
| `cor-fundo-primario` | `#FFFFFF` | Fundo padrão das páginas |
| `cor-fundo-secundario` | `#F4F4F5` | Fundo de cards, blocos de destaque |
| `cor-overlay-escuro` | `rgba(0,0,0,0.38)` | Overlays sobre imagem (badges, hover) |
| `cor-destaque` | `#FEC200` | Cor de marca (logo OJU) — estados ativos, seleção, pequenos realces |

Cada opacidade usada no código deve mapear para um desses tokens — nenhuma opacidade "solta" fora dessa lista.

**Uso de `cor-destaque` (#FEC200):** essa é a cor oficial da marca, extraída da logo. Usar com moderação — não substitui a base preto/branco do Packshot, funciona como realce: bordas de itens selecionados, indicador de progresso (sliders), estado ativo de abas/botões secundários, badges de destaque. Evitar usar como cor de fundo de blocos grandes ou como cor de texto corrido (baixo contraste em fundo branco).

---

## 3. Componentes

### 3.1 Botões

**Achado na auditoria:** existem 2 implementações de botão com a mesma intenção visual (preto sólido ou contornado, inverte cor no hover), mas com código duplicado e pequenas diferenças de padding/borda entre `hero__intro-button` e `catalog__center-cta`.

**Regra normalizada — 1 componente de botão, 2 variantes:**

| Variante | Fundo | Borda | Texto | Hover |
|---|---|---|---|---|
| Primário | Preto | Preto | Branco | Inverte (fundo branco, texto preto) |
| Secundário | Branco | Preto (1px) | Preto | Inverte (fundo preto, texto branco) |

Especificação comum às duas variantes:
- Altura mínima: `clamp(54px, 6vw, 68px)`
- Padding: `14px 18px`
- Texto: uppercase, peso 700, letter-spacing `.08em`
- Transição: `background .2s ease, color .2s ease`

### 3.2 Cards

Padrão único de card (visto em `catalogo.html`, aplicável a Produção/Agência/Hub):
- Borda 1px sólida (`cor-borda`)
- Fundo `cor-fundo-secundario`
- Mídia (imagem/vídeo) em `aspect-ratio: 16/9`
- Overlay no hover: gradiente escuro de baixo para cima + label uppercase com borda branca semi-transparente
- Transição de escala na mídia ao hover: `scale(1.04)`

### 3.3 Hero

- Vídeo de fundo full-bleed (`object-fit: cover`) com overlay gradiente claro (branco) para garantir legibilidade do texto à esquerda.
- Título em Display (ver 1.2), subtítulo em uppercase com letter-spacing.
- Estrutura de "stack" de cards rotativos (visto no Packshot) é um componente interativo válido e reutilizável — pode servir de referência para o carrossel de serviços da página de Produção (Decisão 11).

---

### 3.4 Navegação (header fixo)

Padrão único em todas as páginas internas (referência de implementação: `agencia.html`):
- Header fixo no topo, 64px de altura, fundo branco sólido, borda inferior sutil (`rgba(0,0,0,.08)`).
- Logo "OJU" em pastilha amarela (`cor-destaque`) à esquerda, linkando para a página de entrada (`index-portal.html`).
- Links: Produção · Agência · Hub · Orçamento · Packshot — a página atual recebe `is-current` (texto preto + sublinhado amarelo fixo).
- CTA "+ Fale com a gente" à direita (revela o footer via scroll).
- Mobile (≤760px): menu burger em tela cheia com fundo preto.
- Como o header é fixo, a primeira seção da página precisa compensar os 64px (`margin-top: 64px`).

### 3.5 Footer revelado (curtain reveal)

Padrão único em todas as páginas internas (referência: `agencia.html`):
- O conteúdo vive numa `.page-shell` (z-index 1, cantos inferiores arredondados) que cobre um palco escuro fixo (`.reveal-stage`) e o footer fixo (`.reveal-footer`, ambos z-index 0).
- **Regra estrutural importante:** o espaço de scroll da zona de revelação é criado por um `div.reveal-spacer` transparente **em fluxo, depois da shell** — nunca por `margin-bottom` (o navegador ignora margem no cálculo da área rolável) nem por `padding-bottom` (o fundo branco da shell pintaria por cima do footer).
- A altura do spacer (`1.35 × altura do footer`) e o parallax são calculados via JS; páginas com mídia que carrega tarde (vídeos, widgets externos como Cal.com) devem recalcular a medição com `ResizeObserver` na shell.
- Conteúdo do footer: lead "VAMOS CRIAR JUNTOS." + CTA pílula amarela, colunas Áreas/Redes/Contato, marca d'água "OJU" e barra inferior de copyright.

## 4. Espaçamento e layout

**Achado na auditoria:** o espaçamento lateral do container (`--site-side`) já é tratado como variável centralizada no código — isso é uma boa prática existente, deve ser **mantida e estendida** (não substituída) no site principal.

**Regra normalizada:**
- Largura de conteúdo: `calc(100% - 2 * var(--site-side))`, com `--site-side` ajustando-se de forma fluida entre mobile e desktop.
- Espaçamento vertical entre blocos de seção: usar a mesma lógica `clamp()` já presente no código (ex: `clamp(20px, 3.2vh, 48px)`), padronizada em 3 níveis (pequeno/médio/grande) em vez de cada seção definir o seu.

---

## 5. Pendências para fase de implementação (fora do escopo deste documento)

- Converter este documento em variáveis CSS reais (tokens) — passo seguinte, após aprovação.
- Aplicar essa normalização tanto na revisão de código do Packshot quanto na construção do site principal — mesmo sistema, duas implementações.
- Caso a OJU obtenha arquivos reais de Okomito Next em múltiplos pesos no futuro, revisar a tabela da seção 1.2 para reintroduzir variação de peso.
