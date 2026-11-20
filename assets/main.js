(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  $("[data-year]").textContent = new Date().getFullYear();
  if (!finePointer) $("[data-hint]").textContent = "Tap or drag across the name.";

  /* ---------- pause decorative animations that are off screen ---------- */
  const offIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle("is-off", !en.isIntersecting));
  }, { rootMargin: "100px 0px" });
  $$(".hero, .section").forEach((el) => { el.classList.add("is-off"); offIO.observe(el); });

  /* ---------- in-page links land exactly ----------
     Off-screen sections skip layout (content-visibility), so the browser
     guesses their height. After a jump, check where the target really is
     and finish the scroll once the real sizes are known. */
  function landOn(el, smooth) {
    el.scrollIntoView({ behavior: smooth && !reduced ? "smooth" : "auto", block: "start" });
    let tries = 0;
    const fix = () => {
      const off = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
      if (Math.abs(off) > 4 && tries++ < 4) { el.scrollIntoView({ behavior: "auto", block: "start" }); setTimeout(fix, 120); }
    };
    if ("onscrollend" in window && smooth && !reduced) addEventListener("scrollend", () => setTimeout(fix, 30), { once: true });
    else setTimeout(fix, smooth && !reduced ? 900 : 60);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const el = document.getElementById(a.getAttribute("href").slice(1));
    if (!el || el.closest(".tile")) return; // case-study tiles open their own panel
    e.preventDefault();
    history.pushState(null, "", a.getAttribute("href"));
    landOn(el, true);
  });
  window.landOn = landOn;
  // arriving with a hash in the address bar, e.g. /#work
  if (location.hash.length > 1 && !location.hash.startsWith("#case-")) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) addEventListener("load", () => landOn(el, false), { once: true });
  }

  /* ---------- cursor light ---------- */
  if (finePointer && !reduced) {
    const root = document.documentElement;
    window.addEventListener("pointermove", (e) => {
      root.style.setProperty("--mx", e.clientX + "px");
      root.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });
  }

  /* ---------- toast ---------- */
  const toastEl = $(".toast");
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2000);
  }

  /* ---------- reveal on scroll + number counters ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      $$("[data-count]", en.target).forEach(countUp);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suf = el.dataset.suffix || "";
    if (reduced) { el.textContent = end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1400;
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- role text scramble ---------- */
  const roleEl = $("[data-scramble]");
  const roles = ["AI Engineer", "Agent builder", "Data analyst", "Web developer"];
  const glyphs = "!<>-_\\/[]{}=+*^?#01";
  function scrambleTo(el, text) {
    return new Promise((done) => {
      const from = el.textContent, len = Math.max(from.length, text.length);
      const q = [];
      for (let i = 0; i < len; i++) {
        const start = Math.floor(Math.random() * 14), end = start + 8 + Math.floor(Math.random() * 14);
        q.push({ from: from[i] || "", to: text[i] || "", start, end });
      }
      let f = 0;
      (function frame() {
        let out = "", fin = 0;
        for (const c of q) {
          if (f >= c.end) { fin++; out += c.to; }
          else if (f >= c.start) out += glyphs[(Math.random() * glyphs.length) | 0];
          else out += c.from;
        }
        el.textContent = out;
        if (fin === q.length) return done();
        f++; requestAnimationFrame(frame);
      })();
    });
  }
  if (!reduced) {
    (async function cycle() {
      let i = 0;
      for (;;) {
        await wait(2800);
        i = (i + 1) % roles.length;
        await scrambleTo(roleEl, roles[i]);
      }
    })();
  }

  /* ---------- timeline line fills as you scroll ---------- */
  const timeline = $(".timeline");
  // Measuring the timeline forces a page layout, so only do it while the
  // timeline is on screen, at most once per frame.
  let tlVisible = false, tlQueued = false;
  function onScroll() {
    tlQueued = false;
    const r = timeline.getBoundingClientRect();
    const p = (window.innerHeight * 0.6 - r.top) / r.height;
    timeline.style.setProperty("--progress", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  const queueTimeline = () => { if (tlVisible && !tlQueued) { tlQueued = true; requestAnimationFrame(onScroll); } };
  new IntersectionObserver(([e]) => { tlVisible = e.isIntersecting; queueTimeline(); }).observe(timeline);
  window.addEventListener("scroll", queueTimeline, { passive: true });

  /* ---------- project cards: tilt + spotlight ---------- */
  if (finePointer && !reduced) {
    $$("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--px", x * 100 + "%");
        card.style.setProperty("--py", y * 100 + "%");
        card.style.setProperty("--ry", (x - 0.5) * 6 + "deg");
        card.style.setProperty("--rx", (0.5 - y) * 6 + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });

    /* magnetic button */
    $$("[data-magnetic]").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- copy email ---------- */
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast("Email copied"); }
    catch { toast(text); }
  }
  $$("[data-copy]").forEach((b) => b.addEventListener("click", () => copy(b.dataset.copy)));

  /* ---------- agent demo ---------- */
  const log = $("[data-agent-log]");
  const card = $("[data-agent-card]");
  const field = (n) => $(`[data-field="${n}"]`, card);
  let runId = 0;

  // Sample data for a made-up company. It only shows the shape of the work.
  const script = [
    { t: '<span class="k">task</span> research "Saffron Lane Bakery", Pune' },
    { t: '<span class="dim">→ searching company registers and the web…</span>', d: 700 },
    { t: '  found 4 candidates with a similar name', d: 500 },
    { t: '<span class="dim">→ matching address, phone and domain…</span>', d: 700 },
    { t: '  <span class="ok">✓ identity confirmed</span> saffronlane.example · 3 of 3 signals agree', d: 500,
      fx: () => { field("domain").textContent = "saffronlane.example · Pune"; const b = field("verified"); b.textContent = "verified"; b.classList.add("is-ok"); } },
    { t: '<span class="dim">→ collecting sources…</span>', d: 600 },
    { t: '  + company website', d: 350, fx: () => chip("website") },
    { t: '  + google business profile', d: 350, fx: () => chip("maps profile") },
    { t: '  + job post: "hiring 2 delivery staff"', d: 350, fx: () => chip("job post") },
    { t: '  + local news, 2026', d: 350, fx: () => chip("news") },
    { t: '<span class="dim">→ scoring fit against the client\'s ideal customer…</span>', d: 700 },
    { t: '  <span class="k">fit</span> 82/100  sells online, 2 shops, growing', d: 500,
      fx: () => { field("fit").style.width = "82%"; field("fit-num").textContent = "82 / 100"; } },
    { t: '  <span class="k">need</span> hiring for delivery → orders are up', d: 500,
      fx: () => { field("need").textContent = "Hiring delivery staff, so orders are growing. Source: job post."; } },
    { t: '  <span class="k">timeline</span> likely 1–3 months', d: 500,
      fx: () => { field("timeline").textContent = "Likely in 1–3 months, while the third shop opens."; } },
    { t: '<span class="warn">! 1 claim had no source and was dropped</span>', d: 600 },
    { t: '<span class="ok">done</span> profile ready · every claim has a source', d: 500 },
  ];

  function chip(text) {
    const c = document.createElement("span");
    c.className = "chip"; c.textContent = text;
    field("sources").appendChild(c);
  }

  function resetCard() {
    log.innerHTML = "";
    field("domain").textContent = "resolving…";
    const b = field("verified"); b.textContent = "pending"; b.classList.remove("is-ok");
    field("sources").innerHTML = "";
    field("fit").style.width = "0";
    field("fit-num").textContent = "—";
    field("need").textContent = "—";
    field("timeline").textContent = "—";
  }

  async function typeLine(html, id) {
    const line = document.createElement("div");
    line.className = "term__line";
    log.appendChild(line);
    const caret = document.createElement("span"); caret.className = "caret";
    // type the plain text, then swap in the coloured version
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const plain = tmp.textContent;
    if (reduced) { line.innerHTML = html; return; }
    for (let i = 1; i <= plain.length; i += 2) {
      if (id !== runId) return;
      line.textContent = plain.slice(0, i);
      line.appendChild(caret);
      await wait(12);
    }
    line.innerHTML = html;
    log.appendChild(caret);
  }

  async function runAgent() {
    const id = ++runId;
    resetCard();
    for (const s of script) {
      await wait(reduced ? 0 : s.d || 300);
      if (id !== runId) return;
      $$(".caret", log).forEach((c) => c.remove());
      await typeLine(s.t, id);
      if (id !== runId) return;
      if (s.fx) s.fx();
      log.scrollTop = log.scrollHeight;
    }
  }

  let agentStarted = false;
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !agentStarted) { agentStarted = true; runAgent(); }
  }, { threshold: 0.35 }).observe($(".agent__stage"));
  $("[data-agent-replay]").addEventListener("click", runAgent);

  /* ---------- command palette ---------- */
  const palette = $("[data-palette]");
  const input = $(".palette__input", palette);
  const list = $(".palette__list", palette);
  const go = (sel) => () => landOn(document.querySelector(sel), true);
  const commands = [
    { name: "Ask Tirth a question", hint: "ask", run: () => window.Site.openAsk() },
    { name: "Open resume", hint: "resume", run: () => { location.href = "resume.html"; } },
    { name: "Case study: WebMcp.AI", hint: "webmcp", run: () => window.Site.openCase("webmcp") },
    { name: "Case study: PPE Detection", hint: "ppe yolo", run: () => window.Site.openCase("ppe") },
    { name: "Live GitHub activity", hint: "github", run: go("#github") },
    { name: "Go to About", hint: "about", run: go("#about") },
    { name: "Go to Work", hint: "work", run: go("#work") },
    { name: "Watch the agent", hint: "agent", run: () => { go("#agent")(); setTimeout(runAgent, 500); } },
    { name: "Go to Projects", hint: "projects", run: go("#projects") },
    { name: "Contact", hint: "contact", run: go("#contact") },
    { name: "Copy email", hint: "email", run: () => copy("parikhtirth77@gmail.com") },
    { name: "Open GitHub", hint: "github", run: () => window.open("https://github.com/Tirth262830", "_blank", "noopener") },
    { name: "Open LinkedIn", hint: "linkedin", run: () => window.open("https://www.linkedin.com/in/tirth-parikh-199113339/", "_blank", "noopener") },
    { name: "Set the name on fire", hint: "fire", run: () => { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); setTimeout(() => window.Forest && window.Forest.burn(), 400); } },
    { name: "Back to top", hint: "top", run: () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }) },
  ];
  let shown = commands, sel = 0, lastFocus = null;

  function render() {
    const q = input.value.trim().toLowerCase();
    shown = commands.filter((c) => !q || (c.name + " " + c.hint).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    if (!shown.length) {
      const li = document.createElement("li"); li.innerHTML = '<span class="muted">No command found</span><span></span>';
      list.appendChild(li); return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", i === sel ? "true" : "false");
      li.innerHTML = `<span></span><span></span>`;
      li.children[0].textContent = c.name; li.children[1].textContent = c.hint;
      li.addEventListener("pointermove", () => { if (sel !== i) { sel = i; render(); } });
      li.addEventListener("click", () => runCmd(c));
      list.appendChild(li);
    });
  }
  function openPalette() {
    lastFocus = document.activeElement;
    palette.hidden = false; input.value = ""; sel = 0; render();
    input.focus();
  }
  function closePalette() {
    palette.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function runCmd(c) { closePalette(); c.run(); }

  document.addEventListener("keydown", (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName) && document.activeElement !== input;
    if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && palette.hidden && !typing)) {
      e.preventDefault(); palette.hidden ? openPalette() : closePalette(); return;
    }
    if (palette.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === "Enter" && shown[sel]) { e.preventDefault(); runCmd(shown[sel]); }
  });
  input.addEventListener("input", () => { sel = 0; render(); });
  $$("[data-open-palette]").forEach((b) => b.addEventListener("click", openPalette));
  $$("[data-close-palette]").forEach((b) => b.addEventListener("click", closePalette));
})();
