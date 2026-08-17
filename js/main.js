/* =========================================================================
   js/main.js
   Bootstrap del dashboard: carga D3, ejecuta las figuras, activa reveal-on-beat.
   ========================================================================= */

(function () {
  "use strict";

  // Reveal-on-beat con IntersectionObserver
  function setupReveal() {
    const els = document.querySelectorAll(".revealable");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  }

  // Resize handler para D3 (re-render simple)
  let resizeTimer;
  function setupResize() {
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        // Re-render figuras (limpiamos los SVG existentes y los reconstruimos)
        const containers = ["#fig1", "#fig2", "#fig3", "#fig4", "#fig5", "#fig6", "#fig7"];
        containers.forEach((c) => {
          const el = document.querySelector(c);
          if (el) el.innerHTML = "";
        });
        if (window.MP.figures && window.MP.figures.init) {
          window.MP.figures.init();
        }
      }, 200);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupReveal();
    setupResize();
    if (window.MP && window.MP.figures && window.MP.figures.init) {
      window.MP.figures.init();
    }
  });
})();
