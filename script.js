/* ==========================================================
   LE KHANG® — Interactions (Vanilla JS)
   ========================================================== */
(() => {
  "use strict";
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Typewriter ---------- */
  const typed = $("#typed");
  const TEXT = "LÊ KHANG";
  if (reduceMotion) {
    typed.textContent = TEXT;
  } else {
    let i = 0;
    const type = () => {
      const part = TEXT.slice(0, ++i);
      typed.innerHTML = part.replace("®", '<sup class="reg">®</sup>');
      if (i < TEXT.length) setTimeout(type, 110 + Math.random() * 60);
    };
    setTimeout(type, 500);
  }

  /* ---------- Navbar: scroll state + mobile menu ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const onScroll = () =>
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }),
  );

  /* Active link highlight */
  const links = $$(".nav__links a");
  const sectionObs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle(
            "is-active",
            l.getAttribute("href") === `#${e.target.id}`,
          ),
        );
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  ["about", "works", "contact"].forEach((id) =>
    sectionObs.observe(document.getElementById(id)),
  );

  /* ---------- Scroll reveal with stagger ---------- */
  const revealObs = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        revealObs.unobserve(e.target);
      }),
    { threshold: 0.12 },
  );
  $$(".reveal").forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    revealObs.observe(el);
  });

  /* ---------- Hero parallax ---------- */
  const figure = $("#heroFigure");
  if (!reduceMotion && figure) {
    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const y = Math.min(window.scrollY, window.innerHeight);
          figure.style.translate = `0 ${y * 0.12}px`;
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  /* ---------- Glass light reflection follows pointer ---------- */
  document.addEventListener(
    "pointermove",
    (e) => {
      const g = e.target.closest && e.target.closest(".glass");
      if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", `${e.clientX - r.left}px`);
      g.style.setProperty("--my", `${e.clientY - r.top}px`);
    },
    { passive: true },
  );

  /* ---------- Gallery filter ---------- */
  const gallery = $("#gallery");
  const cards = $$(".card", gallery);
  $$(".filter").forEach((btn) =>
    btn.addEventListener("click", () => {
      $$(".filter").forEach((b) => b.classList.toggle("is-active", b === btn));
      const f = btn.dataset.filter;
      gallery.classList.toggle("is-filtered", f !== "all");
      cards.forEach((c) => {
        const show = f === "all" || c.dataset.category.split(" ").includes(f);
        c.classList.toggle("is-hidden", !show);
        if (show) c.classList.add("is-visible");
      });
    }),
  );

  //   /* ---------- Lightbox ---------- */
  //   const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  //   let current = 0;
  //   const visible = () => cards.filter((c) => !c.classList.contains("is-hidden"));
  //   const show = (idx) => {
  //     const list = visible();
  //     current = (idx + list.length) % list.length;
  //     const card = list[current];
  //     const img = $("img", card);
  //     lbImg.src = img.src;
  //     lbImg.alt = img.alt;
  //     lbCap.textContent = `${$(".card__info span", card).textContent} — ${$("h3", card).textContent}`;
  //   };
  //   const open = (card) => {
  //     show(visible().indexOf(card));
  //     lb.classList.add("is-open");
  //     lb.setAttribute("aria-hidden", "false");
  //     document.body.style.overflow = "hidden";
  //   };
  //   const close = () => {
  //     lb.classList.remove("is-open");
  //     lb.setAttribute("aria-hidden", "true");
  //     document.body.style.overflow = "";
  //   };
  //   cards.forEach((c) => {
  //     c.tabIndex = 0;
  //     c.addEventListener("click", () => open(c));
  //     c.addEventListener("keydown", (e) => e.key === "Enter" && open(c));
  //   });
  //   $("#lbClose").addEventListener("click", close);
  //   $("#lbPrev").addEventListener("click", () => show(current - 1));
  //   $("#lbNext").addEventListener("click", () => show(current + 1));
  //   lb.addEventListener("click", (e) => e.target === lb && close());
  //   document.addEventListener("keydown", (e) => {
  //     if (!lb.classList.contains("is-open")) return;
  //     if (e.key === "Escape") close();
  //     if (e.key === "ArrowLeft") show(current - 1);
  //     if (e.key === "ArrowRight") show(current + 1);
  //   });
  // })();

  /* ---------- Gallery Albums + Lightbox ---------- */

  const lb = $("#lightbox");
  const lbImg = $("#lbImg");
  const lbCap = $("#lbCap");

  let currentAlbum = [];
  let currentIndex = 0;
  let currentTitle = "";

  // Danh sách ảnh của từng album
  // Ảnh đầu tiên là ảnh đại diện đang hiển thị ở Gallery.

  const albums = {
    pickleball: [
      "images/pickleball.jpg",
      "images/albums/pickleball/01.jpg",
      "images/albums/pickleball/02.jpg",
      "images/albums/pickleball/03.jpg",
    ],

    swimming: [
      "images/swimming.jpg",
      "images/albums/swimming/01.jpg",
      "images/albums/swimming/02.jpg",
      "images/albums/swimming/03.jpg",
      "images/albums/swimming/04.jpg",
      "images/albums/swimming/05.jpg",
      "images/albums/swimming/06.jpg",
      "images/albums/swimming/07.jpg",
    ],

    wedding: [
      "images/wedding.jpg",
      "images/albums/wedding/01.jpg",
      "images/albums/wedding/02.jpg",
      "images/albums/wedding/03.jpg",
    ],

    yearbook: [
      "images/yearbook.jpg",
      "images/albums/yearbook/01.jpg",
      "images/albums/yearbook/02.jpg",
      "images/albums/yearbook/03.jpg",
    ],

    pre_granduation: [
      "images/pre_granduation.jpg",
      "images/albums/pre_granduation/01.jpg",
      "images/albums/pre_granduation/02.jpg",
      "images/albums/pre_granduation/03.jpg",
    ],

   event: [
      "images/event.jpg",
      "images/albums/event/01.jpg",
      "images/albums/event/02.jpg",
      "images/albums/event/03.jpg",
    ],

    daily: [
      "images/daily.jpg",
      "images/albums/daily/01.jpg",
      "images/albums/daily/02.jpg",
      "images/albums/daily/03.jpg",
    ],
  };

  // Hiển thị ảnh trong album
  const showAlbumImage = (index) => {
    if (!currentAlbum.length) return;

    currentIndex = (index + currentAlbum.length) % currentAlbum.length;

    const image = currentAlbum[currentIndex];

    lbImg.src = image.src;
    lbImg.alt = image.alt;

    lbCap.textContent = `${currentTitle} · ${currentIndex + 1} / ${currentAlbum.length}`;
  };

  // Mở album
  const openAlbum = (card) => {
    const albumId = card.dataset.album;
    const mainImage = $("img", card);

    currentTitle = $("h3", card).textContent;

    // Lấy danh sách ảnh của album
    const imagePaths = albums[albumId] || [mainImage.src];

    currentAlbum = imagePaths.map((src, index) => ({
      src: new URL(src, document.baseURI).href,
      alt: index === 0 ? mainImage.alt : `${currentTitle} - Image ${index + 1}`,
    }));

    currentIndex = 0;

    showAlbumImage(0);

    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
  };

  // Đóng album
  const closeAlbum = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    lbImg.removeAttribute("src");
  };

  // Click vào ảnh đại diện
  cards.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute("role", "button");

    card.addEventListener("click", () => {
      openAlbum(card);
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAlbum(card);
      }
    });
  });

  // Điều hướng album
  $("#lbClose").addEventListener("click", closeAlbum);

  $("#lbPrev").addEventListener("click", () => {
    showAlbumImage(currentIndex - 1);
  });

  $("#lbNext").addEventListener("click", () => {
    showAlbumImage(currentIndex + 1);
  });

  // Click bên ngoài để đóng
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeAlbum();
  });

  // Phím tắt
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("is-open")) return;

    if (e.key === "Escape") closeAlbum();

    if (e.key === "ArrowLeft") {
      showAlbumImage(currentIndex - 1);
    }

    if (e.key === "ArrowRight") {
      showAlbumImage(currentIndex + 1);
    }
  });
})();
