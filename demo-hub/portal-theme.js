tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      },
      colors: {
        sidebar: "#f9fafc",
        "sidebar-hover": "#eef2f8",
        "sidebar-active": "#e5ebf5",
        accent: "#3b5bdb",
        "accent-light": "#e8edff",
        surface: "#f8f9fc",
        border: "#e4e7ef",
        muted: "#8b92a9"
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const SIDEBAR_STATE_STORAGE_KEY = "portal_sidebar_collapsed";
  const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

  const sidebar = document.querySelector("aside.fixed.top-0.left-0.h-screen");
  const content =
    document.querySelector("body > div.ml-60.flex-1") ||
    document.querySelector("body > div[class*='ml-60']");

  if (!sidebar || !content) {
    return;
  }

  const body = document.body;
  body.classList.add("portal-layout");
  sidebar.classList.add("portal-sidebar");
  content.classList.add("portal-content");

  const currentPage = (() => {
    const pathParts = String(window.location.pathname || "").split("/");
    const rawPage = pathParts[pathParts.length - 1] || "index.html";
    return String(rawPage).split("#")[0].split("?")[0].trim().toLowerCase() || "index.html";
  })();

  const safeStorageGet = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  };

  const safeStorageSet = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // noop
    }
  };

  const sidebarHeader = sidebar.querySelector(".h-16");
  if (!sidebarHeader) {
    return;
  }

  sidebarHeader.classList.add("portal-sidebar-header");

  const brandLink = sidebarHeader.querySelector("a");
  if (brandLink) {
    brandLink.classList.add("portal-brand-link");
    if (!brandLink.querySelector(".portal-brand-text")) {
      const brandText = document.createElement("span");
      brandText.className = "portal-brand-text";
      while (brandLink.firstChild) {
        brandText.appendChild(brandLink.firstChild);
      }
      brandLink.appendChild(brandText);
    }
    if (!brandLink.querySelector(".portal-brand-short")) {
      const brandShort = document.createElement("span");
      brandShort.className = "portal-brand-short";
      brandShort.textContent = "PA";
      brandShort.setAttribute("aria-hidden", "true");
      brandLink.appendChild(brandShort);
    }
  }

  let sidebarToggle = sidebarHeader.querySelector(".portal-sidebar-toggle");
  if (!sidebarToggle) {
    sidebarToggle = document.createElement("button");
    sidebarToggle.type = "button";
    sidebarToggle.className = "portal-sidebar-toggle";
    sidebarToggle.setAttribute("aria-label", "Recolher menu lateral");
    sidebarToggle.setAttribute("title", "Recolher menu");
    sidebarToggle.innerHTML =
      '<span class="material-symbols-outlined" aria-hidden="true">chevron_left</span>';
    sidebarHeader.appendChild(sidebarToggle);
  }

  sidebar
    .querySelectorAll("nav > div.border-t, nav > div[class*='border-t']")
    .forEach((divider) => {
      divider.classList.add("portal-sidebar-divider");
    });

  const navItems = sidebar.querySelectorAll(".sidebar-item");
  navItems.forEach((item) => {
    const wasMarkedActive = item.classList.contains("bg-sidebar-active");
    const iconEl = item.querySelector(".material-symbols-outlined");
    const iconText = iconEl ? iconEl.textContent.trim() : "";
    const rawText = item.textContent.replace(/\s+/g, " ").trim();
    let labelText = rawText;
    if (iconText) {
      if (labelText.startsWith(iconText)) {
        labelText = labelText.slice(iconText.length).trim();
      } else {
        labelText = labelText.replace(iconText, "").trim();
      }
    }

    if (!item.querySelector(".sidebar-label")) {
      Array.from(item.childNodes).forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          node.remove();
        }
      });
      const label = document.createElement("span");
      label.className = "sidebar-label";
      label.textContent = labelText;
      item.appendChild(label);
    }

    const normalizedHref = String(item.getAttribute("href") || "")
      .split("#")[0]
      .split("?")[0]
      .trim()
      .toLowerCase();
    const isActive = wasMarkedActive || (normalizedHref && normalizedHref === currentPage);

    item.classList.remove(
      "bg-sidebar-active",
      "text-white",
      "text-muted",
      "hover:bg-sidebar-hover",
      "hover:text-white",
      "font-medium"
    );
    item.classList.add("portal-sidebar-item");
    item.classList.toggle("is-active", isActive);

    if (isActive) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }

    item.dataset.sidebarLabel = labelText;
    item.setAttribute("title", labelText);
  });

  const desktopMedia =
    typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_MEDIA_QUERY) : null;
  let isCollapsed = safeStorageGet(SIDEBAR_STATE_STORAGE_KEY) === "1";

  const syncToggleState = () => {
    if (!sidebarToggle) {
      return;
    }

    const icon = sidebarToggle.querySelector(".material-symbols-outlined");
    const sidebarIsCollapsed = body.classList.contains("sidebar-collapsed");
    if (icon) {
      icon.textContent = sidebarIsCollapsed ? "chevron_right" : "chevron_left";
    }

    if (sidebarIsCollapsed) {
      sidebarToggle.setAttribute("aria-label", "Expandir menu lateral");
      sidebarToggle.setAttribute("title", "Expandir menu");
    } else {
      sidebarToggle.setAttribute("aria-label", "Recolher menu lateral");
      sidebarToggle.setAttribute("title", "Recolher menu");
    }
  };

  const applySidebarState = () => {
    const isDesktop = !desktopMedia || desktopMedia.matches;
    body.classList.toggle("sidebar-collapsed", isDesktop && isCollapsed);
    syncToggleState();
  };

  sidebarToggle.addEventListener("click", () => {
    isCollapsed = !isCollapsed;
    safeStorageSet(SIDEBAR_STATE_STORAGE_KEY, isCollapsed ? "1" : "0");
    applySidebarState();
  });

  if (desktopMedia) {
    const onMediaChange = () => {
      applySidebarState();
    };

    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", onMediaChange);
    } else if (typeof desktopMedia.addListener === "function") {
      desktopMedia.addListener(onMediaChange);
    }
  }

  applySidebarState();
});
