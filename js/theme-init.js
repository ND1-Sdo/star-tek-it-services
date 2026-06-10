(function () {
  var STORAGE_KEY = "star-tek-theme";
  var theme = localStorage.getItem(STORAGE_KEY);

  if (theme !== "light" && theme !== "dark") {
    theme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  document.documentElement.setAttribute("data-theme", theme);
})();
