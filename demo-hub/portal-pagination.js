(function () {
  const DEFAULT_ITEMS_PER_PAGE = 24;
  const DEFAULT_QUERY_PARAM = "page";

  function parsePositiveInteger(value, fallback = 1) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }
    return parsed;
  }

  function clampPage(page, totalPages) {
    const safeTotalPages = Math.max(1, parsePositiveInteger(totalPages, 1));
    const safePage = parsePositiveInteger(page, 1);
    return Math.min(Math.max(safePage, 1), safeTotalPages);
  }

  function getPageFromUrl(options) {
    const config = options && typeof options === "object" ? options : {};
    const queryParam = String(config.queryParam || DEFAULT_QUERY_PARAM);
    const params = new URLSearchParams(window.location.search || "");
    return parsePositiveInteger(params.get(queryParam), 1);
  }

  function buildRelativeUrlForPage(page, options) {
    const config = options && typeof options === "object" ? options : {};
    const queryParam = String(config.queryParam || DEFAULT_QUERY_PARAM);
    const url = new URL(window.location.href);
    const normalizedPage = parsePositiveInteger(page, 1);

    if (normalizedPage <= 1) {
      url.searchParams.delete(queryParam);
    } else {
      url.searchParams.set(queryParam, String(normalizedPage));
    }

    return `${url.pathname}${url.search}${url.hash}`;
  }

  function syncPageInUrl(page, options) {
    const config = options && typeof options === "object" ? options : {};
    const replace = Boolean(config.replace);
    const nextRelativeUrl = buildRelativeUrlForPage(page, config);
    const currentRelativeUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextRelativeUrl === currentRelativeUrl) {
      return nextRelativeUrl;
    }

    const state = {
      ...(window.history.state && typeof window.history.state === "object"
        ? window.history.state
        : {}),
      [String(config.queryParam || DEFAULT_QUERY_PARAM)]: parsePositiveInteger(page, 1),
    };

    if (replace) {
      window.history.replaceState(state, "", nextRelativeUrl);
    } else {
      window.history.pushState(state, "", nextRelativeUrl);
    }

    return nextRelativeUrl;
  }

  function paginateItems(items, requestedPage, itemsPerPage) {
    const source = Array.isArray(items) ? items : [];
    const perPage = Math.max(1, parsePositiveInteger(itemsPerPage, DEFAULT_ITEMS_PER_PAGE));
    const totalItems = source.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    const normalizedRequestedPage = parsePositiveInteger(requestedPage, 1);
    const currentPage = clampPage(normalizedRequestedPage, totalPages);

    if (totalItems === 0) {
      return {
        items: [],
        totalItems,
        perPage,
        totalPages,
        requestedPage: normalizedRequestedPage,
        currentPage,
        startIndex: 0,
        endIndexExclusive: 0,
        startItemNumber: 0,
        endItemNumber: 0,
        hasPrevious: false,
        hasNext: false,
        wasClamped: currentPage !== normalizedRequestedPage,
      };
    }

    const startIndex = (currentPage - 1) * perPage;
    const endIndexExclusive = Math.min(startIndex + perPage, totalItems);

    return {
      items: source.slice(startIndex, endIndexExclusive),
      totalItems,
      perPage,
      totalPages,
      requestedPage: normalizedRequestedPage,
      currentPage,
      startIndex,
      endIndexExclusive,
      startItemNumber: startIndex + 1,
      endItemNumber: endIndexExclusive,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
      wasClamped: currentPage !== normalizedRequestedPage,
    };
  }

  function buildPageModel(currentPage, totalPages) {
    const safeTotalPages = Math.max(1, parsePositiveInteger(totalPages, 1));
    const safeCurrentPage = clampPage(currentPage, safeTotalPages);

    if (safeTotalPages <= 1) {
      return [];
    }

    const pages = new Set([1, safeTotalPages, safeCurrentPage, safeCurrentPage - 1, safeCurrentPage + 1]);
    if (safeCurrentPage <= 3) {
      pages.add(2);
      pages.add(3);
      pages.add(4);
    }
    if (safeCurrentPage >= safeTotalPages - 2) {
      pages.add(safeTotalPages - 1);
      pages.add(safeTotalPages - 2);
      pages.add(safeTotalPages - 3);
    }

    const sortedPages = Array.from(pages)
      .filter((page) => page >= 1 && page <= safeTotalPages)
      .sort((left, right) => left - right);

    const items = [];
    sortedPages.forEach((page, index) => {
      const previousPage = sortedPages[index - 1];
      if (index > 0 && page - previousPage > 1) {
        items.push({
          type: "ellipsis",
          key: `gap-${previousPage}-${page}`,
        });
      }

      items.push({
        type: "page",
        key: `page-${page}`,
        page,
        active: page === safeCurrentPage,
      });
    });

    return items;
  }

  function formatRangeSummary(paginationState, options) {
    const state =
      paginationState && typeof paginationState === "object" ? paginationState : {};
    const config = options && typeof options === "object" ? options : {};
    const singularLabel = String(config.singularLabel || "item");
    const pluralLabel = String(config.pluralLabel || `${singularLabel}s`);
    const totalItems = Math.max(0, Number(state.totalItems || 0));

    if (totalItems === 0) {
      return `Mostrando 0 de 0 ${pluralLabel}`;
    }

    const startItemNumber = Math.max(1, Number(state.startItemNumber || 1));
    const endItemNumber = Math.max(startItemNumber, Number(state.endItemNumber || startItemNumber));
    const noun = totalItems === 1 ? singularLabel : pluralLabel;

    return `Mostrando ${startItemNumber}\u2013${endItemNumber} de ${totalItems} ${noun}`;
  }

  window.portalPagination = Object.freeze({
    DEFAULT_ITEMS_PER_PAGE,
    parsePositiveInteger,
    clampPage,
    getPageFromUrl,
    buildRelativeUrlForPage,
    syncPageInUrl,
    paginateItems,
    buildPageModel,
    formatRangeSummary,
  });
})();
