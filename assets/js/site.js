(function () {
  "use strict";

  /* ---- live open/closed, in each house's own time zone ---- */
  var VENUES = {
    ar: { tz: "Asia/Dubai", hours: [[8, 25], [8, 25], [8, 25], [8, 25], [8, 25], [8, 25], [8, 25]] },
    palm: { tz: "Asia/Dubai", hours: [[7, 24], [7, 24], [7, 24], [7, 24], [7, 25], [7, 25], [7, 24]] },
    hasselt: { tz: "Europe/Brussels", hours: [[9, 25], [9, 25], [9, 25], [9, 25], [9, 25], [9, 25], [9, 25]] }
  };

  function localParts(tz) {
    try {
      var fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, hour12: false,
        weekday: "short", hour: "2-digit", minute: "2-digit"
      });
      var parts = {};
      fmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return {
        day: days[parts.weekday],
        mins: parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10)
      };
    } catch (e) { return null; }
  }

  function state(key) {
    var v = VENUES[key];
    var now = localParts(v.tz);
    if (!now || typeof now.day !== "number") return null;

    // a window may run past midnight: check today's and yesterday's
    function within(dayIdx, offsetMins) {
      var h = v.hours[dayIdx];
      if (!h) return false;
      var start = h[0] * 60, end = h[1] * 60;
      var t = now.mins + offsetMins;
      return t >= start && t < end;
    }
    var yday = (now.day + 6) % 7;
    if (within(now.day, 0)) return { open: true, closes: v.hours[now.day][1] };
    if (within(yday, 24 * 60)) return { open: true, closes: v.hours[yday][1] };
    return { open: false, opens: v.hours[now.day][0] };
  }

  function hhmm(h) { var x = h % 24; return (x < 10 ? "0" : "") + x + ":00"; }

  document.querySelectorAll(".status[data-venue]").forEach(function (el) {
    var s = state(el.getAttribute("data-venue"));
    var txt = el.querySelector(".state");
    if (!s) { el.classList.add("shut"); txt.textContent = "See opening hours"; return; }
    if (s.open) {
      el.classList.add("open");
      txt.textContent = "Open now · until " + hhmm(s.closes);
    } else {
      el.classList.add("shut");
      txt.textContent = "Closed · opens " + hhmm(s.opens);
    }
  });

  /* ---- menus: the real menu pages, as a two-page preview and a full-screen reader ---- */
  var MENU_PAGES = {
    "ar-breakfast": [
      "/assets/img/menu-ar-breakfast-01.webp",
      "/assets/img/menu-ar-breakfast-02.webp"
    ],
    "ar-lunch": [
      "/assets/img/menu-ar-lunch-01.webp",
      "/assets/img/menu-ar-lunch-02.webp",
      "/assets/img/menu-ar-lunch-03.webp",
      "/assets/img/menu-ar-lunch-04.webp",
      "/assets/img/menu-ar-lunch-05.webp",
      "/assets/img/menu-ar-lunch-06.webp",
      "/assets/img/menu-ar-lunch-07.webp",
      "/assets/img/menu-ar-lunch-08.webp",
      "/assets/img/menu-ar-lunch-09.webp",
      "/assets/img/menu-ar-lunch-10.webp",
      "/assets/img/menu-ar-lunch-11.webp",
      "/assets/img/menu-ar-lunch-12.webp",
      "/assets/img/menu-ar-lunch-13.webp",
      "/assets/img/menu-ar-lunch-14.webp",
      "/assets/img/menu-ar-lunch-15.webp",
      "/assets/img/menu-ar-lunch-16.webp",
      "/assets/img/menu-ar-lunch-17.webp",
      "/assets/img/menu-ar-lunch-18.webp",
      "/assets/img/menu-ar-lunch-19.webp",
      "/assets/img/menu-ar-lunch-20.webp"
    ],
    "palm-breakfast": [
      "/assets/img/menu-palm-breakfast-01.webp",
      "/assets/img/menu-palm-breakfast-02.webp"
    ],
    "palm-lunch": [
      "/assets/img/menu-palm-lunch-01.webp",
      "/assets/img/menu-palm-lunch-02.webp",
      "/assets/img/menu-palm-lunch-03.webp",
      "/assets/img/menu-palm-lunch-04.webp",
      "/assets/img/menu-palm-lunch-05.webp",
      "/assets/img/menu-palm-lunch-06.webp",
      "/assets/img/menu-palm-lunch-07.webp",
      "/assets/img/menu-palm-lunch-08.webp",
      "/assets/img/menu-palm-lunch-09.webp",
      "/assets/img/menu-palm-lunch-10.webp",
      "/assets/img/menu-palm-lunch-11.webp",
      "/assets/img/menu-palm-lunch-12.webp",
      "/assets/img/menu-palm-lunch-13.webp",
      "/assets/img/menu-palm-lunch-14.webp",
      "/assets/img/menu-palm-lunch-15.webp",
      "/assets/img/menu-palm-lunch-16.webp",
      "/assets/img/menu-palm-lunch-17.webp",
      "/assets/img/menu-palm-lunch-18.webp",
      "/assets/img/menu-palm-lunch-19.webp"
    ],
    "hasselt-breakfast": [
      "/assets/img/menu-hasselt-breakfast-01.webp",
      "/assets/img/menu-hasselt-breakfast-02.webp"
    ],
    "hasselt-lunch": [
      "/assets/img/menu-hasselt-lunch-01.webp",
      "/assets/img/menu-hasselt-lunch-02.webp",
      "/assets/img/menu-hasselt-lunch-03.webp",
      "/assets/img/menu-hasselt-lunch-04.webp",
      "/assets/img/menu-hasselt-lunch-05.webp",
      "/assets/img/menu-hasselt-lunch-06.webp",
      "/assets/img/menu-hasselt-lunch-07.webp",
      "/assets/img/menu-hasselt-lunch-08.webp",
      "/assets/img/menu-hasselt-lunch-09.webp",
      "/assets/img/menu-hasselt-lunch-10.webp",
      "/assets/img/menu-hasselt-lunch-11.webp"
    ],
    "hasselt-drinks": [
      "/assets/img/menu-hasselt-drinks-01.webp",
      "/assets/img/menu-hasselt-drinks-02.webp",
      "/assets/img/menu-hasselt-drinks-03.webp",
      "/assets/img/menu-hasselt-drinks-04.webp",
      "/assets/img/menu-hasselt-drinks-05.webp",
      "/assets/img/menu-hasselt-drinks-06.webp",
      "/assets/img/menu-hasselt-drinks-07.webp",
      "/assets/img/menu-hasselt-drinks-08.webp",
      "/assets/img/menu-hasselt-drinks-09.webp"
    ]
  };
  var MENU_TITLES = { breakfast: "Breakfast", lunch: "Lunch & dinner", drinks: "Drinks" };
  var HOUSE_NAMES = { ar: "Arabian Ranches", palm: "voco The Palm", hasselt: "Hasselt" };
  var typeOf = { ar: "lunch", palm: "lunch", hasselt: "lunch" };
  var spreadAt = {};

  function bookPages(loc) { return MENU_PAGES[loc + "-" + typeOf[loc]] || []; }

  function renderBook(loc) {
    var book = document.querySelector('.mn-book[data-loc="' + loc + '"]');
    if (!book) return;
    var pages = bookPages(loc), type = typeOf[loc], key = loc + "-" + type;
    var at = spreadAt[key] || 0;
    book.setAttribute("data-type", type);
    var btns = book.querySelectorAll(".mn-pg");
    [0, 1].forEach(function (n) {
      var i = at + n, b = btns[n], im = b.querySelector("img");
      if (i < pages.length) {
        b.hidden = false; b.setAttribute("data-page", i);
        im.src = pages[i];
        im.alt = HOUSE_NAMES[loc] + " " + MENU_TITLES[type].toLowerCase() + " menu, page " + (i + 1);
        b.setAttribute("aria-label", "Open page " + (i + 1) + " in the reader");
      } else { b.hidden = true; }
    });
    var last = Math.min(at + 2, pages.length);
    book.querySelector(".mn-count").textContent = (at + 1 === last ? "Page " + last : "Pages " + (at + 1) + " - " + last) + " of " + pages.length;
    book.querySelector('[data-dir="-1"]').disabled = at <= 0;
    book.querySelector('[data-dir="1"]').disabled = at + 2 >= pages.length;
  }
  function renderBooks() { Object.keys(HOUSE_NAMES).forEach(renderBook); }

  function setType(loc, type) {
    if (!MENU_PAGES[loc + "-" + type]) return;
    typeOf[loc] = type;
    var panel = document.querySelector('.mn-panel[data-loc="' + loc + '"]');
    if (panel) panel.querySelectorAll("[data-menu-tab]").forEach(function (t) {
      t.setAttribute("aria-pressed", String(t.getAttribute("data-menu-tab") === type));
    });
    renderBook(loc);
  }

  document.querySelectorAll("[data-menu-tab]").forEach(function (t) {
    t.addEventListener("click", function () {
      var panel = t.closest(".mn-panel");
      if (panel) setType(panel.getAttribute("data-loc"), t.getAttribute("data-menu-tab"));
    });
  });
  document.querySelectorAll(".mn-book").forEach(function (book) {
    var loc = book.getAttribute("data-loc");
    book.querySelectorAll(".mn-nav").forEach(function (nb) {
      nb.addEventListener("click", function () {
        var key = loc + "-" + typeOf[loc];
        var next = (spreadAt[key] || 0) + 2 * parseInt(nb.getAttribute("data-dir"), 10);
        spreadAt[key] = Math.max(0, Math.min(next, Math.max(0, bookPages(loc).length - 1)));
        renderBook(loc);
      });
    });
    book.querySelectorAll(".mn-pg").forEach(function (pg) {
      pg.addEventListener("click", function () { openReader(loc, parseInt(pg.getAttribute("data-page"), 10) || 0); });
    });
  });
  document.querySelectorAll("[data-read]").forEach(function (b) {
    b.addEventListener("click", function () { openReader(b.getAttribute("data-read"), 0); });
  });

  /* full-screen reader */
  var reader = document.getElementById("menuReader");
  var rLoc = "ar", rPage = 0, lastFocus = null;
  if (reader) {
    var rImg = document.getElementById("rImg"), rCount = document.getElementById("rCount"),
        rPrev = document.getElementById("rPrev"), rNext = document.getElementById("rNext"),
        rStage = document.getElementById("rStage"), rThumbs = document.getElementById("rThumbs"),
        rTitle = document.getElementById("rTitle");
    function rPages() { return bookPages(rLoc); }
    function buildThumbs() {
      rThumbs.innerHTML = "";
      rPages().forEach(function (_, i) {
        var b = document.createElement("button");
        b.className = "thumb"; b.type = "button"; b.textContent = String(i + 1);
        b.addEventListener("click", function () { showPage(i); });
        rThumbs.appendChild(b);
      });
    }
    function showPage(i) {
      var pages = rPages();
      rPage = Math.max(0, Math.min(pages.length - 1, i));
      rImg.src = pages[rPage];
      rImg.alt = HOUSE_NAMES[rLoc] + " " + MENU_TITLES[typeOf[rLoc]].toLowerCase() + " menu, page " + (rPage + 1) + " of " + pages.length;
      rCount.textContent = "Page " + (rPage + 1) + " of " + pages.length;
      rPrev.disabled = rPage === 0;
      rNext.disabled = rPage === pages.length - 1;
      Array.prototype.forEach.call(rThumbs.children, function (t, k) { t.setAttribute("aria-current", String(k === rPage)); });
      rStage.scrollTop = 0;
      if (rPage + 1 < pages.length) { var n = new Image(); n.src = pages[rPage + 1]; }
    }
    function readerChrome() {
      rTitle.textContent = HOUSE_NAMES[rLoc] + " \u00B7 " + MENU_TITLES[typeOf[rLoc]];
      reader.querySelectorAll("[data-rtype]").forEach(function (b) {
        var t = b.getAttribute("data-rtype");
        b.hidden = !MENU_PAGES[rLoc + "-" + t];
        b.setAttribute("aria-current", String(t === typeOf[rLoc]));
      });
    }
    window.openReader = function (loc, page) {
      lastFocus = document.activeElement;
      rLoc = loc;
      reader.hidden = false;
      document.body.style.overflow = "hidden";
      readerChrome(); buildThumbs(); showPage(page || 0);
      document.getElementById("rClose").focus();
    };
    function closeReader() {
      reader.hidden = true;
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    reader.querySelectorAll("[data-rtype]").forEach(function (b) {
      b.addEventListener("click", function () {
        setType(rLoc, b.getAttribute("data-rtype"));
        readerChrome(); buildThumbs(); showPage(0);
      });
    });
    rPrev.addEventListener("click", function () { showPage(rPage - 1); });
    rNext.addEventListener("click", function () { showPage(rPage + 1); });
    document.getElementById("rClose").addEventListener("click", closeReader);
    reader.addEventListener("click", function (e) { if (e.target === reader || e.target === rStage) closeReader(); });
    document.addEventListener("keydown", function (e) {
      if (reader.hidden) return;
      if (e.key === "Escape") closeReader();
      else if (e.key === "ArrowRight") showPage(rPage + 1);
      else if (e.key === "ArrowLeft") showPage(rPage - 1);
    });
    var x0 = null;
    rStage.addEventListener("touchstart", function (e) { x0 = e.changedTouches[0].clientX; }, { passive: true });
    rStage.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) showPage(rPage + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  }
  renderBooks();

  /* ---- menus: choose a house ---- */
  var mnBtns = document.querySelectorAll(".mn-loc");
  var mnPanels = document.querySelectorAll(".mn-panel");
  function selectMenuHouse(loc) {
    mnBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-menu-loc") === loc)); });
    mnPanels.forEach(function (pn) { pn.hidden = pn.getAttribute("data-loc") !== loc; });
  }
  mnBtns.forEach(function (b) {
    b.addEventListener("click", function () { selectMenuHouse(b.getAttribute("data-menu-loc")); });
  });
  document.querySelectorAll("a[data-menu-loc]").forEach(function (a) {
    a.addEventListener("click", function () { selectMenuHouse(a.getAttribute("data-menu-loc")); });
  });

  /* ---- weekly overview: venue filter + today marker ---- */
  var buttons = document.querySelectorAll(".filter");
  var days = document.querySelectorAll(".wk-day");
  function applyFilter(want) {
    days.forEach(function (day) {
      var shown = 0, vis = [];
      day.querySelectorAll(".wk-item").forEach(function (it) {
        var show = want === "all" || it.getAttribute("data-venue") === want;
        it.style.display = show ? "" : "none";
        it.classList.remove("is-first", "is-last");
        if (show) { shown++; vis.push(it); }
      });
      if (vis.length) { vis[0].classList.add("is-first"); vis[vis.length - 1].classList.add("is-last"); }
      day.querySelector(".wk-none").hidden = shown > 0;
    });
  }
  var wkReserve = document.getElementById("wkReserve");
  function setReserve(which) {
    if (which === "palm") {
      wkReserve.href = "https://widget.servmeco.com/?oid=1564";
      wkReserve.target = "_blank"; wkReserve.rel = "noopener";
    } else {
      wkReserve.href = "/#book";
      wkReserve.removeAttribute("target"); wkReserve.removeAttribute("rel");
    }
  }
  buttons.forEach(function (b) {
    b.addEventListener("click", function () {
      buttons.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
      applyFilter(b.getAttribute("data-filter"));
      setReserve(b.getAttribute("data-filter"));
    });
  });
  applyFilter(buttons.length ? "ar" : "all");
  var dow = String(new Date().getDay());
  days.forEach(function (day) {
    if (day.getAttribute("data-dow") === dow) day.querySelector(".wk-today").hidden = false;
  });

  /* ---- voco The Palm promotion pop-up ---- */
  var PROMOS = {
    dejeuner: {
      title: "Le Déjeuner at the Maison", when: "Monday to Friday, 12:00 - 15:00",
      intro: ["Enjoy a delicious 2-course lunch at the Maison for just AED 139, including still water and 1 soft drink."],
      sections: [{ rows: [["2-course lunch", "Including still water and 1 soft drink", "139"]] }]
    },
    roast: {
      title: "Sunday Roast", when: "Every Sunday, 13:00 - 21:00",
      intro: [
        "Sunday’s calling for the perfect roast, now with irresistible new sides to match. Indulge in a portion of tenderly slow-roasted beef, lamb, or chicken, served with traditional garnishes, Yorkshire pudding, and a selection of savoury sauces.",
        "Plant lovers, we’ve got you covered with a selection of tasty vegan options.",
        "Whether you’re sipping on refreshing beverages or going for unlimited drinks, your taste buds are in for a treat."
      ],
      sections: [
        { heading: "Our packages", rows: [
          ["Roast + soft drink", "", "129"],
          ["Roast + house drink", "", "149"],
          ["Roast + 2 sides + 2 hours of house beverages", "Unlimited", "249"],
          ["Unlimited house grapes, hops and spirits", "Three hours", "460"]
        ] },
        { heading: "Alcohol add-ons", rows: [
          ["2 European beers", "", "89"],
          ["2 glasses of wine", "", "79"]
        ] }
      ]
    },
    happy: {
      title: "Sip and Snack Happy Hour", when: "Daily, 16:00 - 19:00",
      intro: ["Escape the everyday grind with our Happy Hour. The best hours of your day are waiting."],
      sections: [
        { rows: [
          ["Drinks", "Starting from", "35"],
          ["Snack platter", "3 bites + 1 drink, made to share", "149"],
          ["Oysters + Aperol Spritz", "4 fresh Dibba Bay oysters + an Aperol Spritz", "69"]
        ] },
        { heading: "Sweet finale", note: "End your Happy Hour indulgence with Tiramisu Jar, Churros with Chocolate, and our tempting Sweet Trio." }
      ]
    },
    ribs: {
      title: "Monday’s Ribs Feast", when: "Every Monday, 13:00 - 21:00",
      intro: ["Join us every Monday for an incredible pork rib extravaganza! Relish in unlimited pork ribs for a whole 2 hours from the moment you arrive.",
              "It’s the perfect way to satisfy your cravings and embark on a feast like no other!"],
      sections: [{ rows: [
        ["The Rib Fix", "Half rack pork ribs + side + 1 soft drink", "99"],
        ["The Rib Feast", "Unlimited pork ribs + side + 1 house drink", "149"],
        ["The Rib & Beer Ritual", "Unlimited pork ribs + 3 bottled beers", "199"],
        ["The Big Monday Feast", "Unlimited pork ribs + 2 hours unlimited house drinks + 1 dessert", "249"]
      ] }]
    },
    tacos: {
      title: "Taco & Margarita Tuesday", when: "Every Tuesday, 13:00 - 21:00",
      intro: ["Turn your midweek into a flavour-packed fiesta with our Taco Tuesdays at Maison Mathis. Enjoy a delicious combination of freshly made tacos with three different flavours to pair with crispy fries, and a classic margarita. Perfect for a laid-back afternoon or evening treat."],
      sections: [{ rows: [["3 tacos + fries + 1 margarita", "Choose from: beef taco, chicken taco, fish taco", "109"]] }]
    },
    mussels: {
      title: "Mussels & Mates", when: "Every Wednesday, 13:00 - 21:00",
      intro: ["Indulge in the rich and savoury flavours of the ocean with our exquisite mussels at Maison Mathis. Each bite promises a taste of the sea, perfectly complemented by your choice of house grapes, hops, or a selection of fine spirits.",
              "Whether you’re a wine connoisseur, a craft beer enthusiast, or someone who appreciates a fine spirit, we have the perfect pairing to enhance your dining experience."],
      sections: [{ heading: "Our packages", rows: [
        ["The Light Pot", "½ kg mussels + unlimited frites + 1 non-alcoholic drink", "99"],
        ["The Classic Pot", "½ kg mussels + unlimited frites + 1 house drink", "139"],
        ["The Mussels Feast", "1 kg mussels + unlimited frites + 1 house drink", "169"],
        ["The Social Feast", "1 kg mussels + unlimited frites + 2 house drinks", "229"]
      ] }]
    },
    bits: {
      title: "Thursday Bits & Bites", when: "Thursday, 13:00 - 21:00",
      intro: ["Ease into the weekend early, your after-work escape filled with bold flavours and effortless flair awaits.",
              "Crafted cocktails, curated bites, and cool company, all in one delicious deal. Gather your crew and let’s make Thursdays the new Friday."],
      sections: [{ rows: [
        ["3 chef’s bites + 2 house drinks", "Or 1 sourdough pizza + 2 house drinks", "195"],
        ["5 chef’s bites + 4 house drinks", "Or 2 sourdough pizzas + 4 house drinks", "299"]
      ] }]
    },
    brunch: {
      title: "Brunch at the Maison", when: "Every Saturday, 13:30 - 17:00",
      intro: ["Step into an elevated Saturday brunch at Maison Mathis, where bold flavours, generous sharing boards and family-friendly moments blend seamlessly in a setting that feels both relaxed and refined.",
              "Enjoy live entertainment by Natalie the Singer and Alex the Saxophonist, adding rhythm and atmosphere throughout the afternoon."],
      sections: [{ heading: "Choose your brunch package", rows: [
        ["Soft Package", "", "199"],
        ["House Package", "", "249"],
        ["Premium Package", "", "449"],
        ["Kids Package (6 - 12 years)", "Includes one choice of main course and one choice of dessert from the Kids Menu", "50"]
      ] }]
    }
  };

  var dlg = document.getElementById("promoDialog");
  if (dlg) {
    var pdBody = document.getElementById("pdBody");
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }
    function openPromo(key) {
      var d = PROMOS[key]; if (!d) return;
      document.getElementById("pdTitle").textContent = d.title;
      document.getElementById("pdWhen").textContent = d.when;
      pdBody.textContent = "";
      d.intro.forEach(function (t) { pdBody.appendChild(el("p", "", t)); });
      d.sections.forEach(function (s) {
        if (s.heading) pdBody.appendChild(el("h4", "", s.heading));
        if (s.note) pdBody.appendChild(el("p", "", s.note));
        if (s.rows) {
          var ul = el("ul", "pd-rows");
          s.rows.forEach(function (r) {
            var li = el("li");
            var main = el("div", "pd-row-main");
            main.appendChild(el("span", "pd-row-name", r[0]));
            if (r[1]) main.appendChild(el("span", "pd-row-detail", r[1]));
            li.appendChild(main);
            var price = el("span", "pd-row-price", r[2] + " ");
            price.appendChild(el("small", "", "AED"));
            li.appendChild(price);
            ul.appendChild(li);
          });
          pdBody.appendChild(ul);
        }
      });
      pdBody.scrollTop = 0;
      document.body.style.overflow = "hidden";
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    }
    document.querySelector(".week").addEventListener("click", function (e) {
      var b = e.target.closest(".wk-more");
      if (b) openPromo(b.getAttribute("data-promo"));
    });
    document.getElementById("pdClose").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", function () { document.body.style.overflow = ""; });
  }

  /* ---- deep links such as /#menus-palm open that house's menus ---- */
  function menuHash() {
    var m = /^#menus-(ar|palm|hasselt|emaar)$/.exec(location.hash);
    if (!m) return;
    selectMenuHouse(m[1]);
    var t = document.getElementById("menus");
    if (t) t.scrollIntoView();
  }
  window.addEventListener("hashchange", menuHash);
  menuHash();

  var wwTabs = document.querySelectorAll(".ww-tab");
  wwTabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var v = t.getAttribute("data-venue");
      var LEADS = {
        ar: "Carollers \u00b7 Santa\u2019s Grotto \u00b7 Christmas & NYE brunches \u00b7 Festive food specials",
        palm: "Our festive programme will be announced shortly",
        emaar: "Tree lighting \u00b7 Carollers \u00b7 Santa\u2019s Grotto \u00b7 Christmas brunch \u00b7 New Year\u2019s Eve"
      };
      document.getElementById("wwLead").textContent = LEADS[v];
      wwTabs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === t)); });
      document.querySelectorAll(".ww-panel").forEach(function (pn) {
        pn.hidden = pn.getAttribute("data-venue") !== v;
      });
    });
  });

  var wwHash = /^#(ar|palm|emaar)$/.exec(location.hash);
  if (wwHash) { var wt = document.querySelector('.ww-tab[data-venue="' + wwHash[1] + '"]'); if (wt) wt.click(); }

  /* ---- house photo slideshow ---- */
  var GALLERIES = {
    ar: { name: "Arabian Ranches", imgs: [
      "/assets/img/maison-mathis-arabian-ranches-1.webp",
      "/assets/img/maison-mathis-arabian-ranches-2.webp",
      "/assets/img/maison-mathis-arabian-ranches-3.jpg"
    ] },
    palm: { name: "voco The Palm", imgs: [
      "/assets/img/maison-mathis-voco-the-palm-1.webp",
      "/assets/img/maison-mathis-voco-the-palm-2.webp",
      "/assets/img/maison-mathis-voco-the-palm-3.webp"
    ] },
    hasselt: { name: "Hasselt", imgs: [
      "/assets/img/maison-mathis-hasselt-1.webp",
      "/assets/img/maison-mathis-hasselt-2.webp",
      "/assets/img/maison-mathis-hasselt-3.webp",
      "/assets/img/maison-mathis-hasselt-4.webp"
    ] },
    emaar: { name: "Dubai South", imgs: [
      "/assets/img/maison-mathis-dubai-south-1.webp",
      "/assets/img/maison-mathis-dubai-south-2.webp"
    ] },
    almouj: { name: "Al Mouj", imgs: [
      "/assets/img/maison-mathis-al-mouj-1.webp",
      "/assets/img/maison-mathis-al-mouj-2.webp"
    ] },
    pullman: { name: "Pullman JLT", imgs: [
      "/assets/img/maison-mathis-pullman-jlt-1.webp"
    ] },
  };

  var gDlg = document.getElementById("galleryDialog");
  if (gDlg) {
    var gImg = document.getElementById("gImg"), gThumbs = document.getElementById("gThumbs");
    var gKey = null, gIdx = 0;
    function gShow(i) {
      var set = GALLERIES[gKey]; if (!set) return;
      gIdx = (i + set.imgs.length) % set.imgs.length;
      gImg.src = set.imgs[gIdx];
      gImg.alt = "Maison Mathis " + set.name + ", photo " + (gIdx + 1) + " of " + set.imgs.length;
      document.getElementById("gCount").textContent = (gIdx + 1) + " / " + set.imgs.length;
      [].forEach.call(gThumbs.children, function (b, n) { b.setAttribute("aria-current", String(n === gIdx)); });
      var multi = set.imgs.length > 1;
      document.getElementById("gPrev").hidden = !multi;
      document.getElementById("gNext").hidden = !multi;
    }
    function gOpen(key, idx) {
      var set = GALLERIES[key]; if (!set) return;
      gKey = key;
      document.getElementById("gTitle").textContent = set.name;
      gThumbs.textContent = "";
      set.imgs.forEach(function (src, n) {
        var b = document.createElement("button"); b.type = "button";
        b.setAttribute("aria-label", "Show photo " + (n + 1));
        var t = document.createElement("img"); t.src = src; t.alt = "";
        b.appendChild(t);
        b.addEventListener("click", function () { gShow(n); });
        gThumbs.appendChild(b);
      });
      gThumbs.hidden = set.imgs.length < 2;
      gShow(idx || 0);
      document.body.style.overflow = "hidden";
      if (gDlg.showModal) gDlg.showModal(); else gDlg.setAttribute("open", "");
    }
    document.querySelectorAll("[data-gallery]").forEach(function (b) {
      b.addEventListener("click", function () { gOpen(b.getAttribute("data-gallery"), parseInt(b.getAttribute("data-index"), 10) || 0); });
    });
    document.getElementById("gPrev").addEventListener("click", function () { gShow(gIdx - 1); });
    document.getElementById("gNext").addEventListener("click", function () { gShow(gIdx + 1); });
    document.getElementById("gClose").addEventListener("click", function () { gDlg.close(); });
    gDlg.addEventListener("click", function (e) { if (e.target === gDlg) gDlg.close(); });
    gDlg.addEventListener("close", function () { document.body.style.overflow = ""; gImg.src = ""; });
    gDlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { gShow(gIdx - 1); e.preventDefault(); }
      else if (e.key === "ArrowRight") { gShow(gIdx + 1); e.preventDefault(); }
    });
    var sx = null, stage = document.getElementById("gStage");
    stage.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) gShow(gIdx + (dx < 0 ? 1 : -1));
    });
  }

  /* ---- franchise enquiry: sent to the site's form handler (Netlify Forms), with an email fallback ---- */
  var franchiseForm = document.getElementById("franchiseForm");
  if (franchiseForm) {
    var TO = "info@creneauhospitality.com";
    franchiseForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = franchiseForm.querySelector('button[type="submit"]');
      var note = document.getElementById("franchiseNote");
      var fd = new FormData(franchiseForm);
      var val = function (k) { return String(fd.get(k) || "").trim(); };
      btn.disabled = true; note.textContent = "Sending...";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fd).toString()
      }).then(function (r) {
        if (!r.ok) throw new Error("status " + r.status);
        window.location.href = franchiseForm.getAttribute("action") || "/franchise/thank-you/";
      }).catch(function () {
        btn.disabled = false;
        var body = [
          "Franchise pack request from the Maison Mathis website", "",
          "Name: " + val("name"), "Email: " + val("email"), "Phone: " + val("phone"),
          "Market or territory: " + val("market"), "Existing F&B units: " + val("units"),
          "Capital available: " + val("capital"), "Target opening: " + val("opening")
        ].join("\r\n");
        var href = "mailto:" + TO + "?subject=" + encodeURIComponent("Franchise pack request - " + val("name") + ", " + val("market")) + "&body=" + encodeURIComponent(body);
        note.textContent = "Sorry, that did not send. Please try again, or ";
        var fb = document.createElement("a"); fb.href = href; fb.textContent = "email us directly";
        note.appendChild(fb); note.appendChild(document.createTextNode("."));
      });
    });
  }

})();