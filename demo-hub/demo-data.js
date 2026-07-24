// demo-data.js — dados 100% ficticios do "OJU Hub" (demonstracao publica).
// Nenhum nome/empresa/e-mail aqui corresponde a um cliente real.
// Recarregado do zero a cada carregamento de pagina (nada persiste entre visitas).

(function () {
  'use strict';

  // Ponto unico para trocar por midia real depois (thumbnails/videos de exemplo).
  // Preencher como: { 'arquivo-01': 'demo-hub/midia/exemplo.jpg' }
  var DEMO_THUMBNAIL_OVERRIDES = {};
  var DEMO_VIDEO_OVERRIDES = {};

  var CATEGORIES = [
    { id: 'cat-institucional', name: 'Institucional' },
    { id: 'cat-publicitario', name: 'Publicitário' },
    { id: 'cat-documentario', name: 'Documentário' },
    { id: 'cat-bastidores', name: 'Bastidores' },
    { id: 'cat-produto', name: 'Produto' },
    { id: 'cat-eventos', name: 'Eventos' },
  ];

  var TAGS = [
    { id: 'tag-evento', name: 'evento' },
    { id: 'tag-depoimento', name: 'depoimento' },
    { id: 'tag-bastidores', name: 'bastidores' },
    { id: 'tag-still', name: 'still' },
    { id: 'tag-making-of', name: 'making-of' },
    { id: 'tag-lancamento', name: 'lançamento' },
    { id: 'tag-equipe', name: 'equipe' },
    { id: 'tag-produto', name: 'produto' },
    { id: 'tag-treinamento', name: 'treinamento' },
    { id: 'tag-campanha', name: 'campanha' },
    { id: 'tag-externa', name: 'externa' },
    { id: 'tag-estudio', name: 'estúdio' },
    { id: 'tag-drone', name: 'drone' },
    { id: 'tag-cliente', name: 'cliente' },
  ];

  var PRODUCERS = [
    { id: 'prod-aurora', name: 'Produtora Aurora' },
    { id: 'prod-vetor', name: 'Produtora Vetor' },
    { id: 'prod-prisma', name: 'Produtora Prisma' },
    { id: 'prod-norte', name: 'Produtora Norte' },
    { id: 'prod-studio-livre', name: 'Studio Livre Produções' },
    { id: 'prod-quadro', name: 'Produtora Quadro' },
  ];

  var PROFILES = [
    { name: 'acervo', description: 'Acesso somente à página Acervo.' },
    { name: 'administrativo', description: 'Acesso às páginas Acervo e Gestão do Acervo.' },
    { name: 'master', description: 'Acesso completo a todas as páginas do sistema.' },
  ];

  var USERS = [
    { id: 'usr-01', name: 'Marina Alves', email: 'marina.alves@empresa-demo.com.br', profile: { name: 'master' }, status: 'ACTIVE', lastAccessAt: '2026-07-22T09:14:00.000Z' },
    { id: 'usr-02', name: 'Rafael Torres', email: 'rafael.torres@empresa-demo.com.br', profile: { name: 'administrativo' }, status: 'ACTIVE', lastAccessAt: '2026-07-21T16:40:00.000Z' },
    { id: 'usr-03', name: 'Juliana Prado', email: 'juliana.prado@empresa-demo.com.br', profile: { name: 'acervo' }, status: 'ACTIVE', lastAccessAt: '2026-07-20T11:02:00.000Z' },
    { id: 'usr-04', name: 'Bruno Ferreira', email: 'bruno.ferreira@empresa-demo.com.br', profile: { name: 'acervo' }, status: 'ACTIVE', lastAccessAt: '2026-07-18T14:55:00.000Z' },
    { id: 'usr-05', name: 'Camila Duarte', email: 'camila.duarte@empresa-demo.com.br', profile: { name: 'administrativo' }, status: 'BLOCKED', lastAccessAt: '2026-06-30T08:20:00.000Z' },
    { id: 'usr-06', name: 'Thiago Nunes', email: 'thiago.nunes@empresa-demo.com.br', profile: { name: 'acervo' }, status: 'ACTIVE', lastAccessAt: '2026-07-23T19:05:00.000Z' },
  ];

  var INTEGRATIONS = [
    { name: 'Google Drive', note: 'Armazenamento e sincronização de arquivos', type: 'STORAGE', status: 'CONNECTED' },
    { name: 'CRM de Relacionamento', note: 'Sincronização de contratos e contatos', type: 'CRM', status: 'CONNECTED' },
    { name: 'Sistema Financeiro', note: 'Fluxo de pagamento de produtoras', type: 'FINANCIAL', status: 'PENDING' },
  ];

  // Pastas do Drive simuladas — usadas só para popular driveFolder* nos arquivos,
  // a árvore de pastas da Gestão do Acervo é construída a partir dos próprios arquivos.
  var FOLDERS = {
    institucional: { id: 'fld-institucional', name: 'Institucional 2026', parentId: '' },
    institucionalBastidores: { id: 'fld-institucional-bastidores', name: 'Bastidores', parentId: 'fld-institucional' },
    institucionalMakingOf: { id: 'fld-institucional-makingof', name: 'Making-of', parentId: 'fld-institucional' },
    campanhas: { id: 'fld-campanhas', name: 'Campanhas', parentId: '' },
    campanhasLancamento: { id: 'fld-campanhas-lancamento', name: 'Lançamento Produto X', parentId: 'fld-campanhas' },
    eventos: { id: 'fld-eventos', name: 'Eventos', parentId: '' },
  };

  function folderFields(folder) {
    if (!folder) return {};
    return {
      driveFolderId: folder.id,
      driveFolderName: folder.name,
      driveFolderPath: folder.name,
      driveParentFolderId: folder.parentId || '',
      driveSyncStatus: 'PRESENT',
      driveLastSyncedAt: '2026-07-22T10:00:00.000Z',
      driveReviewRequired: false,
    };
  }

  function cat(id) { return CATEGORIES.find(function (c) { return c.id === id; }) || null; }
  function prod(id) { return PRODUCERS.find(function (p) { return p.id === id; }) || null; }
  function tagList() {
    var names = Array.prototype.slice.call(arguments);
    return names.map(function (name) {
      var found = TAGS.find(function (t) { return t.name === name; });
      return found ? { id: found.id, name: found.name } : { id: 'tag-' + name, name: name };
    });
  }

  // Modelo de cada item: { fileName, mediaType, categoryId, producerId, tags, date, folder }
  // categoryId/producerId podem ser null (arquivo pendente de classificação — estado real do sistema).
  var RAW_FILES = [
    { fileName: 'video_institucional_2026.mp4', mediaType: 'VIDEO', categoryId: 'cat-institucional', producerId: 'prod-aurora', tags: tagList('equipe', 'estudio'), date: '2026-07-20', folder: FOLDERS.institucional },
    { fileName: 'making_of_gravacao_01.mp4', mediaType: 'VIDEO', categoryId: 'cat-bastidores', producerId: 'prod-aurora', tags: tagList('making-of', 'bastidores'), date: '2026-07-19', folder: FOLDERS.institucionalMakingOf },
    { fileName: 'making_of_gravacao_02.mp4', mediaType: 'VIDEO', categoryId: 'cat-bastidores', producerId: 'prod-aurora', tags: tagList('making-of', 'bastidores', 'equipe'), date: '2026-07-19', folder: FOLDERS.institucionalMakingOf },
    { fileName: 'depoimento_cliente_final.mp4', mediaType: 'VIDEO', categoryId: 'cat-institucional', producerId: 'prod-vetor', tags: tagList('depoimento', 'cliente'), date: '2026-07-17', folder: FOLDERS.institucional },
    { fileName: 'still_equipe_estudio_01.jpg', mediaType: 'IMAGE', categoryId: 'cat-bastidores', producerId: 'prod-aurora', tags: tagList('still', 'bastidores', 'equipe'), date: '2026-07-16', folder: FOLDERS.institucionalBastidores },
    { fileName: 'still_equipe_estudio_02.jpg', mediaType: 'IMAGE', categoryId: 'cat-bastidores', producerId: 'prod-aurora', tags: tagList('still', 'bastidores'), date: '2026-07-16', folder: FOLDERS.institucionalBastidores },
    { fileName: 'roteiro_institucional_v3.pdf', mediaType: 'DOCUMENT', categoryId: 'cat-institucional', producerId: 'prod-aurora', tags: tagList('equipe'), date: '2026-07-14', folder: FOLDERS.institucional },
    { fileName: 'narracao_locucao_final.mp3', mediaType: 'AUDIO', categoryId: 'cat-institucional', producerId: null, tags: tagList('estudio'), date: '2026-07-13', folder: FOLDERS.institucional },

    { fileName: 'campanha_lancamento_teaser.mp4', mediaType: 'VIDEO', categoryId: 'cat-publicitario', producerId: 'prod-prisma', tags: tagList('campanha', 'lancamento'), date: '2026-07-12', folder: FOLDERS.campanhasLancamento },
    { fileName: 'campanha_lancamento_30s.mp4', mediaType: 'VIDEO', categoryId: 'cat-publicitario', producerId: 'prod-prisma', tags: tagList('campanha', 'lancamento'), date: '2026-07-12', folder: FOLDERS.campanhasLancamento },
    { fileName: 'still_produto_hero_01.jpg', mediaType: 'IMAGE', categoryId: 'cat-produto', producerId: 'prod-prisma', tags: tagList('still', 'produto'), date: '2026-07-11', folder: FOLDERS.campanhasLancamento },
    { fileName: 'still_produto_hero_02.jpg', mediaType: 'IMAGE', categoryId: 'cat-produto', producerId: 'prod-prisma', tags: tagList('still', 'produto'), date: '2026-07-11', folder: FOLDERS.campanhasLancamento },
    { fileName: 'still_produto_detalhe.png', mediaType: 'IMAGE', categoryId: 'cat-produto', producerId: 'prod-prisma', tags: tagList('still', 'produto'), date: '2026-07-10', folder: FOLDERS.campanhasLancamento },
    { fileName: 'brief_campanha_lancamento.pdf', mediaType: 'DOCUMENT', categoryId: 'cat-publicitario', producerId: 'prod-prisma', tags: tagList('campanha'), date: '2026-07-09', folder: FOLDERS.campanhas },
    { fileName: 'making_of_campanha.mp4', mediaType: 'VIDEO', categoryId: 'cat-bastidores', producerId: 'prod-prisma', tags: tagList('making-of', 'campanha'), date: '2026-07-08', folder: FOLDERS.campanhas },
    { fileName: 'aerea_drone_campanha.mp4', mediaType: 'VIDEO', categoryId: 'cat-publicitario', producerId: 'prod-norte', tags: tagList('drone', 'externa', 'campanha'), date: '2026-07-07', folder: FOLDERS.campanhas },

    { fileName: 'evento_abertura_2026.mp4', mediaType: 'VIDEO', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento'), date: '2026-07-05', folder: FOLDERS.eventos },
    { fileName: 'evento_cobertura_still_01.jpg', mediaType: 'IMAGE', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento', 'still'), date: '2026-07-05', folder: FOLDERS.eventos },
    { fileName: 'evento_cobertura_still_02.jpg', mediaType: 'IMAGE', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento', 'still'), date: '2026-07-05', folder: FOLDERS.eventos },
    { fileName: 'evento_cobertura_still_03.jpg', mediaType: 'IMAGE', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento', 'still'), date: '2026-07-04', folder: FOLDERS.eventos },
    { fileName: 'evento_depoimentos_convidados.mp4', mediaType: 'VIDEO', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento', 'depoimento'), date: '2026-07-04', folder: FOLDERS.eventos },
    { fileName: 'evento_trilha_sonora.mp3', mediaType: 'AUDIO', categoryId: 'cat-eventos', producerId: null, tags: tagList('evento'), date: '2026-07-03', folder: FOLDERS.eventos },

    { fileName: 'documentario_historia_marca.mp4', mediaType: 'VIDEO', categoryId: 'cat-documentario', producerId: 'prod-studio-livre', tags: tagList('depoimento', 'equipe'), date: '2026-06-28', folder: null },
    { fileName: 'documentario_entrevistas_raw.mp4', mediaType: 'VIDEO', categoryId: 'cat-documentario', producerId: 'prod-studio-livre', tags: tagList('depoimento'), date: '2026-06-27', folder: null },
    { fileName: 'ficha_tecnica_documentario.pdf', mediaType: 'DOCUMENT', categoryId: 'cat-documentario', producerId: 'prod-studio-livre', tags: tagList(), date: '2026-06-26', folder: null },

    { fileName: 'treinamento_onboarding_equipe.mp4', mediaType: 'VIDEO', categoryId: null, producerId: 'prod-vetor', tags: tagList('treinamento', 'equipe'), date: '2026-06-20', folder: null },
    { fileName: 'treinamento_slides_apoio.pdf', mediaType: 'DOCUMENT', categoryId: null, producerId: null, tags: tagList('treinamento'), date: '2026-06-19', folder: null },
    { fileName: 'still_produto_estudio_solto.jpg', mediaType: 'IMAGE', categoryId: null, producerId: 'prod-prisma', tags: tagList('still'), date: '2026-06-18', folder: null },
    { fileName: 'clipe_making_of_solto.mov', mediaType: 'VIDEO', categoryId: null, producerId: null, tags: tagList(), date: '2026-06-17', folder: null },

    { fileName: 'campanha_ano_anterior_still.jpg', mediaType: 'IMAGE', categoryId: 'cat-publicitario', producerId: 'prod-norte', tags: tagList('campanha', 'still'), date: '2026-05-30', folder: FOLDERS.campanhas },
    { fileName: 'campanha_ano_anterior_video.mp4', mediaType: 'VIDEO', categoryId: 'cat-publicitario', producerId: 'prod-norte', tags: tagList('campanha'), date: '2026-05-29', folder: FOLDERS.campanhas },
    { fileName: 'entrevista_externa_parceiro.mp4', mediaType: 'VIDEO', categoryId: 'cat-institucional', producerId: 'prod-vetor', tags: tagList('externa', 'depoimento'), date: '2026-05-15', folder: FOLDERS.institucional },
    { fileName: 'still_evento_encerramento.jpg', mediaType: 'IMAGE', categoryId: 'cat-eventos', producerId: 'prod-quadro', tags: tagList('evento', 'still'), date: '2026-05-10', folder: FOLDERS.eventos },
  ];

  function extensionOf(fileName) {
    var idx = fileName.lastIndexOf('.');
    return idx > 0 ? fileName.slice(idx + 1).toLowerCase() : '';
  }

  function buildFiles() {
    return RAW_FILES.map(function (item, index) {
      var n = index + 1;
      var id = 'arquivo-' + (n < 10 ? '0' + n : n);
      var file = {
        id: id,
        fileName: item.fileName,
        displayName: '',
        mediaType: item.mediaType,
        category: cat(item.categoryId),
        producer: prod(item.producerId),
        tags: item.tags,
        date: item.date + 'T12:00:00.000Z',
        format: extensionOf(item.fileName),
        isFavorite: index % 6 === 0,
      };
      Object.assign(file, folderFields(item.folder));
      // Um par de arquivos "ausentes no Drive", pra mostrar esse estado real do sistema.
      if (id === 'arquivo-03' || id === 'arquivo-19') {
        file.driveSyncStatus = 'MISSING';
      }
      if (id === 'arquivo-02') {
        file.driveReviewRequired = true;
      }
      return file;
    });
  }

  var seedFiles = buildFiles();
  var seedCategories = CATEGORIES.map(function (c) { return Object.assign({}, c); });
  var seedTags = TAGS.map(function (t) { return Object.assign({}, t); });
  var seedProducers = PRODUCERS.map(function (p) { return Object.assign({}, p); });
  var seedUsers = USERS.map(function (u) { return Object.assign({}, u, { profile: Object.assign({}, u.profile) }); });

  function deepCloneArray(arr) {
    return arr.map(function (item) { return JSON.parse(JSON.stringify(item)); });
  }

  var state = {
    files: deepCloneArray(seedFiles),
    categories: deepCloneArray(seedCategories),
    tags: deepCloneArray(seedTags),
    producers: deepCloneArray(seedProducers),
    users: deepCloneArray(seedUsers),
    profiles: deepCloneArray(PROFILES),
    integrations: deepCloneArray(INTEGRATIONS),
  };

  function resetToSeed() {
    state.files = deepCloneArray(seedFiles);
    state.categories = deepCloneArray(seedCategories);
    state.tags = deepCloneArray(seedTags);
    state.producers = deepCloneArray(seedProducers);
  }

  window.demoData = {
    state: state,
    resetToSeed: resetToSeed,
    thumbnailOverrides: DEMO_THUMBNAIL_OVERRIDES,
    videoOverrides: DEMO_VIDEO_OVERRIDES,
  };
})();
