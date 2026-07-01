# CLAUDE.md — Site institucional OJU

## Grafo de conhecimento (Graphify)

O grafo atualizado deste projeto está em:
`/Users/renatomac/Desktop/RENATO OBSIDIAN VAULT/RENATO/03-empresa/portal-oju/graphify-out/graph.json`

Antes de ler arquivos do projeto, consulte o grafo com:
`graphify query "<sua pergunta>" --graph "/Users/renatomac/Desktop/RENATO OBSIDIAN VAULT/RENATO/03-empresa/portal-oju/graphify-out/graph.json"`

Relatório legível do projeto: `graphify-out/GRAPH_REPORT.md`

Contexto condensado de uma sessão de planejamento (wireframe + decisões de arquitetura de informação + design) feita em outro chat. Este arquivo resume o que já foi decidido, para que o trabalho de código continue de onde paramos, sem precisar redecidir o que já está fechado.

## O que é a OJU

Produtora/agência audiovisual. Tese central: unir criação, estratégia e produção no mesmo lugar, sem agência tradicional no meio. 5 anos de relacionamento real com a Brevant Sementes/Corteva (usado como prova social, não como narrativa principal do site).

## Arquitetura do portal (2 sites no mesmo ecossistema visual)

1. **Site principal da OJU** (este projeto) — institucional, com 4 pilares: Produção, Agência, OJU Hub, e uma chamada para o OJU Packshot.
2. **OJU Packshot** — site separado e já existente (repositório próprio, HTML/CSS/JS puro), focado em imagens de produto (catálogo). Tem identidade visual já aprovada (preto/branco, fonte Okomito Next) que foi usada como base para este projeto. Precisa de revisão de código (foi feito sessão por sessão, sem estrutura limpa) — projeto separado, fora do escopo deste.

## Estrutura de navegação do site principal

- **Home**: hero em vídeo full-screen + 4 pilares lado a lado (Produção/Agência/Hub/Packshot, este último leva ao site externo) + prova social (logos de clientes) + featured work (grade diversa, evitar parecer nichada) + case "Gente com História" em destaque + footer.
- **Produção**: 2 capacidades centrais que se complementam (Estrutura física de captação × Força de IA) → área de seleção/carrossel com 5 itens: Mídias Sociais, Podcast, Roteiro (serviço pontual), Comunicação Interna, e "Imagens de produto" (este último leva ao Packshot) → chamada para Planos de assinatura (sem calculadora aqui) → footer.
- **Agência**: tese de unificação criativa+produção → Célula Dedicada (apresentada como MODELO DE EXEMPLO customizável, nunca como oferta fixa) → Gestão de Influenciadores (topo da oferta) → prova social Brevant (peso proporcional, não dominante) → footer. NÃO incluir: comparativo "agência tradicional vs OJU" (decidiu-se que não fica em destaque no site), créditos anuais (isso é de Produção/Orçamento), gestão de produtoras locais (isso é do Hub, e só deve ser oferecido sob proposta a clientes com operação nacional — não em destaque público).
- **OJU Hub**: foco exclusivo em organização/curadoria de acervo de mídia bruta (vídeo/foto) → mídias sociais. NÃO mencionar gestão de produtoras locais/regionais no público geral. Ordem da página: Hero → Problema que resolve → O que isso permite (com vídeo de apresentação embutido) → botão de demo interativa (conteúdo da demo ainda não definido — pendência) → Como funciona (ativado por Captação avulsa OU Plano periódico — nunca vendido isolado; linha discreta de exceção para quem quer só a ferramenta, tratada via contato direto) → Escala de uso → footer.
- **Footer padrão** (Produção, Agência, Hub): widget completo do Calendly embutido direto no footer (não botão, não modal — o calendário interativo já aparece ali).

## As duas portas de orçamento (são formulários de intenção, NUNCA checkout/compra)

1. **Formulário Produção/Agência**: calculadora de Período (Mensal/Semestral/Anual — período maior = crédito mais barato) × Créditos (slider) → demonstração de entrega em 2 camadas (categorias de vídeo + elementos extras modulares, que se somam) → campos da empresa (nome, site/redes, descrição livre, contato) → agendamento de reunião EMBUTIDO e obrigatório como parte do envio do formulário.
2. **Formulário Catálogo** (no Packshot): tipo de material (Foto/Vídeo giratório/3D) → quantidade de produtos (mais produtos = plano melhor) → intenção de uso (só catálogo / campanha-promocional / não sei ainda — esse campo identifica se o caso conecta com o sistema de créditos de Produção) → dados da empresa → agendamento obrigatório.

Em ambos: a estimativa de valor é só referência de custo-benefício, nunca um preço fechado ou algo que o cliente "compra" ali. A decisão de negócio acontece na reunião.

## Sistema de design (ver `oju-design-system.md` neste pacote)

- Paleta: preto `#000000` / branco `#FFFFFF` / cinza `#F4F4F5` como base, com **`#FEC200`** (amarelo-âmbar, extraído da logo oficial) como cor de destaque, usada com moderação — nunca como fundo de blocos grandes.
- Tipografia: Okomito Next (peso único 800 por enquanto — os arquivos de peso 700/900 hoje apontam pro mesmo arquivo, então não usar variação de peso até ter arquivos reais), com escala normalizada em 5 níveis (ver documento).
- Botões: 1 componente, 2 variantes (primário preto sólido / secundário contornado), ambos invertem cor no hover.
- Grid de pilares/cards: bordas finas formando grade unificada (estilo editorial, não cards soltos com sombra).

## Estado atual do código

- `index.html` (Home) já está escrito em HTML/CSS/JS puro, sem framework — mesmo padrão do Packshot. Ainda precisa: vídeo real do hero, logos de clientes reais, imagens de featured work, ativação real do embed do Calendly (código já está comentado no arquivo, pronto pra ativar).
- Produção, Agência, Hub e os 2 formulários: ainda **não têm código real** — só existem como wireframes de baixa fidelidade (conceitual), aprovados estruturalmente, mas não construídos em HTML.

## Decisões de processo que vale manter

- O usuário (Renato) não é programador, prefere interfaces visuais a comandos de terminal quando possível.
- Ele quer aprovar a Home primeiro, lapidando até ficar definitiva, e SÓ DEPOIS replicar o padrão consolidado nas outras páginas — não construir todas em paralelo.
- Está em fase de experimentação de animação/navegação (estudou referência em awsmd.com: scroll suave tipo Lenis, e faixa de texto em loop/marquee) — eram experimentos, foram revertidos a pedido dele antes desta migração; ele pode querer retomá-los aqui.
- Pendência aberta: valores exatos de desconto por período (créditos) e por volume (catálogo) ainda não foram definidos — são decisão de precificação, não de código.
