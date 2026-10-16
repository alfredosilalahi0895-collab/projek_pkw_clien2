"use strict";

/* Helpers aman (tidak throw jika elemen hilang) */
function $(id) {
  return document.getElementById(id);
}

function on(el, evt, fn, opts) {
  if (el) el.addEventListener(evt, fn, opts);
}

/* ---------- Tahun footer ---------- */
(function initYear() {
  var y = $("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();

/* ---------- Menu HP ---------- */
(function initMenu() {
  var hamb = $("hamb");
  var links = $("navLinks");
  if (!hamb || !links) return;

  function setOpen(open) {
    links.classList.toggle("show", open);
    hamb.setAttribute("aria-expanded", open ? "true" : "false");
    hamb.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  }

  on(hamb, "click", function () {
    setOpen(!links.classList.contains("show"));
  });

  links.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("show")) {
      setOpen(false);
      hamb.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 920 && links.classList.contains("show")) {
      setOpen(false);
    }
  });
})();

/* ---------- Status operasional ---------- */
(function initStatus() {
  function updateStatus() {
    var st = $("statusText");
    if (st) st.textContent = "Buka Setiap Hari";
    var dot = $("statusDot");
    if (dot) dot.classList.remove("closed");
    var t2 = $("statusText2");
    if (t2) {
      t2.textContent = "Buka — Setiap Hari";
      t2.style.color = "#15803d";
    }
  }
  updateStatus();
})();

/* ---------- Header berbayang + tombol ke atas ---------- */
(function initScroll() {
  var header = document.querySelector("header");
  var toTop = $("toTop");
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle("scrolled", y > 8);
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  on(toTop, "click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

/* ---------- Link navigasi aktif ---------- */
(function initActiveNav() {
  var links = $("navLinks");
  if (!links) return;
  var navAnchors = Array.from(links.querySelectorAll("a"));
  if (!navAnchors.length) return;
  var observed = ["tentang", "produk", "fasilitas", "galeri", "kontak"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (!("IntersectionObserver" in window) || !observed.length) return;
  var navObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  observed.forEach(function (s) { navObs.observe(s); });
})();

/* ---------- Animasi reveal ---------- */
(function initReveal() {
  if (!("IntersectionObserver" in window)) return; // tanpa JS/IO: konten tetap terlihat
  var revealTargets = document.querySelectorAll(
    ".sec-head, .card, .feature, .room, .gal, .stats, .steps, .cta-banner, .map-frame, .hero-copy > *, .hero-media"
  );
  if (!revealTargets.length) return;
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });
  var revObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealTargets.forEach(function (el) { revObs.observe(el); });
})();

/* ---------- Lightbox ---------- */
(function initLightbox() {
  var lightbox = $("lightbox");
  var lbImg = $("lbImg");
  var lbCap = $("lbCap");
  var lbClose = $("lbClose");
  var lbPrev = $("lbPrev");
  var lbNext = $("lbNext");
  if (!lightbox || !lbImg || !lbCap) return;

  var lbList = [];
  var lbIndex = 0;
  var lastFocus = null;

  function captionFor(img) {
    var fig = img.closest("figure");
    if (fig) {
      var cap = fig.querySelector("figcaption");
      if (cap) return cap.textContent.trim();
    }
    var card = img.closest(".room");
    if (card) {
      var h = card.querySelector("h3");
      var p = card.querySelector("p");
      return [h && h.textContent.trim(), p && p.textContent.trim()]
        .filter(Boolean)
        .join(" — ");
    }
    return img.getAttribute("alt") || "";
  }

  function renderLightbox() {
    var item = lbList[lbIndex];
    if (!item) return;
    lbImg.setAttribute("src", item.src);
    lbImg.setAttribute("alt", item.cap || "Pratinjau foto kos");
    lbCap.textContent = item.cap || "";
  }

  function openLightbox(list, index) {
    if (!list.length) return;
    lastFocus = document.activeElement;
    lbList = list;
    lbIndex = (index + list.length) % list.length;
    renderLightbox();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
    lbImg.setAttribute("alt", "Pratinjau foto kos");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function stepLightbox(dir) {
    if (!lbList.length) return;
    lbIndex = (lbIndex + dir + lbList.length) % lbList.length;
    renderLightbox();
  }

  function groupFor(img) {
    var galGrid = img.closest(".gal-grid");
    if (galGrid) {
      return Array.from(galGrid.querySelectorAll("img")).map(function (im) {
        return { src: im.currentSrc || im.src, cap: captionFor(im) };
      });
    }
    var grid = img.closest("#produk .grid2");
    if (grid) {
      return Array.from(grid.querySelectorAll("img")).map(function (im) {
        return { src: im.currentSrc || im.src, cap: captionFor(im) };
      });
    }
    return [{ src: img.currentSrc || img.src, cap: captionFor(img) }];
  }

  function openFromImg(img) {
    var list = groupFor(img);
    var current = img.currentSrc || img.src;
    var idx = list.findIndex(function (it) { return it.src === current; });
    openLightbox(list, Math.max(idx, 0));
  }

  document
    .querySelectorAll(".gal img, #produk .room-img img, .hero-card img")
    .forEach(function (img) {
      img.style.cursor = "zoom-in";
      img.setAttribute("tabindex", "0");
      img.addEventListener("click", function () { openFromImg(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openFromImg(img);
        }
      });
    });

  on(lbClose, "click", closeLightbox);
  on(lbPrev, "click", function (e) { e.stopPropagation(); stepLightbox(-1); });
  on(lbNext, "click", function (e) { e.stopPropagation(); stepLightbox(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
})();
