(function () {
  var STORAGE_KEY = "star-tek-theme";
  var THEME_COLORS = { dark: "#111113", light: "#f1f5f9" };

  function getStoredTheme() {
    try {
      var theme = localStorage.getItem(STORAGE_KEY);
      if (theme === "light" || theme === "dark") {
        return theme;
      }
    } catch (error) {
      /* localStorage may be unavailable */
    }

    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      /* ignore storage failures */
    }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", THEME_COLORS[theme]);
    }
  }

  function syncToggleInput(theme) {
    var input = document.querySelector(".theme-toggle-input");
    if (!input) return;

    var isDark = theme === "dark";
    input.checked = isDark;
    input.setAttribute("aria-checked", isDark ? "true" : "false");
    input.setAttribute(
      "aria-label",
      isDark ? "Dark mode on. Switch to light mode." : "Light mode on. Switch to dark mode."
    );
  }

  applyTheme(getStoredTheme());

  function initThemeToggle() {
    var input = document.querySelector(".theme-toggle-input");
    if (!input) return;

    syncToggleInput(document.documentElement.getAttribute("data-theme") || "dark");

    input.addEventListener("change", function () {
      var nextTheme = input.checked ? "dark" : "light";
      applyTheme(nextTheme);
      syncToggleInput(nextTheme);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
