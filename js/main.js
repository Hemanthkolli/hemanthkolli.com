// Small progressive enhancements. The site works fully without JavaScript.
(function () {
  const root = document.documentElement;

  // ---- Theme toggle (remembers choice per browser) ----
  const toggle = document.querySelector("[data-theme-toggle]");
  const stored = (() => { try { return localStorage.getItem("theme"); } catch { return null; } })();
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  const current = () =>
    root.getAttribute("data-theme") ||
    (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  const paint = () => {
    if (!toggle) return;
    const t = current();
    toggle.innerHTML = t === "dark" ? SUN : MOON;
    toggle.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
  };
  paint();

  toggle?.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
    paint();
  });

  // ---- Mobile menu ----
  const menuBtn = document.querySelector("[data-menu-toggle]");
  const links = document.querySelector(".nav-links");
  menuBtn?.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  links?.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      links.classList.remove("open");
      menuBtn?.setAttribute("aria-expanded", "false");
    }
  });

  // ---- Header border once the page is scrolled ----
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const headerEl = document.querySelector(".site-header");
  const onScroll = () => headerEl?.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ---- Reveal on scroll ----
  const els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    els.forEach((el) => io.observe(el));
  } else {
    els.forEach((el) => el.classList.add("visible"));
  }

  // ---- Blog filter (blog index only) ----
  const filter = document.querySelector("[data-filter]");
  if (filter) {
    const items = [...document.querySelectorAll("[data-post]")];
    const empty = document.querySelector("[data-empty]");
    filter.addEventListener("input", () => {
      const q = filter.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((li) => {
        const hit = li.textContent.toLowerCase().includes(q);
        li.hidden = !hit;
        if (hit) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }

  // ---- Tabs: groups with the same data-group stay in sync (e.g. pick your OS once) ----
  const tabGroups = [...document.querySelectorAll("[data-tabs]")];
  const load = (k) => { try { return localStorage.getItem("tab:" + k); } catch { return null; } };
  const save = (k, v) => { try { localStorage.setItem("tab:" + k, v); } catch {} };
  const select = (box, name) => {
    const buttons = [...box.querySelectorAll(".tab-list button")];
    if (!buttons.some((b) => b.dataset.tab === name)) name = buttons[0]?.dataset.tab;
    buttons.forEach((b) => {
      const on = b.dataset.tab === name;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
    });
    box.querySelectorAll(".tab-panel").forEach((p) => { p.hidden = p.dataset.tab !== name; });
  };
  tabGroups.forEach((box, i) => {
    box.classList.add("js-tabs");
    const group = box.dataset.group || "g" + i;
    const buttons = [...box.querySelectorAll(".tab-list button")];
    buttons.forEach((b) => {
      b.id = `tab-${i}-${b.dataset.tab}`;
      const panel = box.querySelector(`.tab-panel[data-tab="${b.dataset.tab}"]`);
      if (panel) { panel.setAttribute("role", "tabpanel"); panel.setAttribute("aria-labelledby", b.id); }
      b.addEventListener("click", () => {
        save(group, b.dataset.tab);
        tabGroups.filter((x) => (x.dataset.group || "") === group).forEach((x) => select(x, b.dataset.tab));
      });
      b.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const j = (buttons.indexOf(b) + (e.key === "ArrowRight" ? 1 : buttons.length - 1)) % buttons.length;
        buttons[j].click(); buttons[j].focus();
      });
    });
    let initial = load(group);
    if (!initial && group === "os") {
      const p = navigator.userAgent;
      initial = /Windows/.test(p) ? "windows" : /Mac/.test(p) ? "mac" : "linux";
    }
    select(box, initial);
  });

  // ---- Copy buttons on code blocks inside articles ----
  document.querySelectorAll(".article pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "copy-btn"; btn.textContent = "copy";
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "copied";
      } catch { btn.textContent = "select + ctrl-c"; }
      setTimeout(() => (btn.textContent = "copy"), 1500);
    });
    wrap.appendChild(btn);
  });

  // ---- Career map: click an area to highlight matching roles ----
  const map = document.querySelector(".skillmap");
  const roleList = document.querySelector(".jobs");
  if (map && roleList) {
    const areaBtns = [...map.querySelectorAll("[data-filter-area]")];
    const status = map.querySelector("[data-filter-status]");
    const label = map.querySelector("[data-filter-label]");
    const apply = (area) => {
      areaBtns.forEach((b) => {
        const on = b.dataset.filterArea === area;
        b.setAttribute("aria-pressed", String(on));
        b.closest("tr").classList.toggle("active", on);
      });
      map.classList.toggle("filtering", !!area);
      roleList.classList.toggle("filtering", !!area);
      let n = 0;
      roleList.querySelectorAll(".job").forEach((r) => {
        const hit = !!area && r.dataset.areas.split(" ").includes(area);
        r.classList.toggle("match", hit);
        if (hit) n++;
        r.querySelectorAll(".area-chip").forEach((c) => c.classList.toggle("hit", c.dataset.chip === area));
      });
      if (status) {
        status.hidden = !area;
        if (area) {
          const name = areaBtns.find((b) => b.dataset.filterArea === area).textContent;
          label.textContent = `grep "${name}": ${n} of ${roleList.children.length} roles`;
        }
      }
    };
    areaBtns.forEach((b) => {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => apply(b.getAttribute("aria-pressed") === "true" ? null : b.dataset.filterArea));
    });
    map.querySelector("[data-filter-clear]")?.addEventListener("click", () => apply(null));
  }

  // ---- Footer year ----
  const y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
