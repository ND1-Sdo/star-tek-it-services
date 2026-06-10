(function () {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".nav-mobile");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      const open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileNav.classList.contains("is-open")) {
        mobileNav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
        toggle.focus();
      }
    });
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-desktop a[href], .nav-mobile a[href]").forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;

    const linkPage = href.split("#")[0].split("/").pop();
    const isHome = (currentPage === "" || currentPage === "index.html") && (linkPage === "index.html" || linkPage === "");
    const isMatch = linkPage === currentPage || isHome;

    if (isMatch) {
      link.classList.add("nav-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const service = form.querySelector('[name="service"]').value;
      const message = form.querySelector('[name="message"]').value.trim();

      const subject = encodeURIComponent("Star-Tek IT Services enquiry — " + service);
      const body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Service: " + service + "\n\n" +
        message
      );

      const emailTo = (window.STAR_TEK_SITE && window.STAR_TEK_SITE.email) || "ltdstartek@gmail.com";
      window.location.href = "mailto:" + emailTo + "?subject=" + subject + "&body=" + body;
    });
  }

  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
