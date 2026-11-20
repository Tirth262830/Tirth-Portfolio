/* Case studies, the "Ask Tirth" assistant, live GitHub, scroll progress. */
(function () {
  const S = window.SITE;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- scroll progress bar + local clock ---------- */
  const root = document.documentElement;
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    root.style.setProperty("--scroll", max > 0 ? (scrollY / max).toFixed(4) : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const clock = $("[data-clock]");
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  };
  tick(); setInterval(tick, 30000);

  /* ---------- case study panel ---------- */
  const dlg = $("[data-case-dialog]");
  const order = Object.keys(S.projects);
  let current = null;
  const c = (k) => $(`[data-c="${k}"]`, dlg);

  function openCase(id, push = true) {
    const p = S.projects[id];
    if (!p) return;
    current = id;
    c("meta").textContent = `${p.year} · ${p.kind}`;
    c("title").textContent = p.title;
    c("tagline").textContent = p.tagline;
    c("problem").textContent = p.problem;
    c("built").textContent = p.built;
    c("result").textContent = p.result;
    c("how").innerHTML = p.how.map((h) => `<li><span>${esc(h)}</span></li>`).join("");
    c("stack").innerHTML = p.stack.map((s) => `<li>${esc(s)}</li>`).join("");
    c("links").innerHTML = p.links
      .map(([label, url], i) => `<a class="btn btn--sm ${i === 0 ? "btn--primary" : ""}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} ↗</a>`)
      .join("");
    if (!dlg.open) { dlg.showModal(); document.body.classList.add("no-scroll"); }
    dlg.scrollTop = 0;
    if (push) history.replaceState(null, "", `#case-${id}`);
  }
  function closeCase() {
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener("close", () => {
    document.body.classList.remove("no-scroll");
    if (location.hash.startsWith("#case-")) history.replaceState(null, "", location.pathname);
    const tile = current && document.getElementById(`case-${current}`);
    if (tile) $(".tile__hit", tile).focus({ preventScroll: true });
  });
  // click on the dark backdrop closes it
  dlg.addEventListener("click", (e) => { if (e.target === dlg) closeCase(); });
  $("[data-close-case]").addEventListener("click", closeCase);
  $$("[data-case-step]").forEach((b) => b.addEventListener("click", () => {
    const i = order.indexOf(current) + Number(b.dataset.caseStep);
    openCase(order[(i + order.length) % order.length]);
  }));
  $$("[data-case]").forEach((b) => b.addEventListener("click", () => openCase(b.dataset.case)));
  // deep links such as /#case-webmcp open the study directly
  const fromHash = () => {
    const m = location.hash.match(/^#case-(\w+)$/);
    if (m && S.projects[m[1]]) {
      document.getElementById(`case-${m[1]}`).scrollIntoView({ block: "center" });
      openCase(m[1], false);
    }
  };
  addEventListener("hashchange", fromHash);
  fromHash();

  /* ---------- Ask Tirth ---------- */
  const panel = $("[data-ask]");
  const fab = $(".ask-fab");
  const log = $("[data-ask-log]");
  const form = $("[data-ask-form]");
  const input = $(".ask__input", panel);
  const chips = $("[data-ask-chips]");
  const SUGGEST = ["What does he do now?", "Best AI project?", "What's his stack?", "Education?", "How do I contact him?"];
  const engine = window.AskEngine.create(S.facts, { unknown: S.unknown });
  const answer = (q) => engine.answer(q);

  function addMsg(who, html) {
    const m = document.createElement("div");
    m.className = `msg msg--${who}`;
    m.innerHTML = html;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }

  async function ask(q) {
    q = q.trim();
    if (!q) return;
    addMsg("me", esc(q));
    input.value = "";
    const t = addMsg("bot", '<span class="typing"><i></i><i></i><i></i></span>');
    await wait(reduced ? 0 : 450 + Math.random() * 300);
    const r = answer(q);
    t.textContent = "";
    // stream the words in for a chat feel
    const words = r.a.split(" ");
    const span = document.createElement("span");
    t.appendChild(span);
    for (let i = 0; i < words.length; i++) {
      span.textContent = words.slice(0, i + 1).join(" ");
      log.scrollTop = log.scrollHeight;
      if (!reduced) await wait(18);
    }
    if (r.src) {
      const a = document.createElement("a");
      a.className = "msg__src";
      a.href = r.src[1];
      a.textContent = `↳ Source: ${r.src[0]}`;
      a.addEventListener("click", (e) => {
        const href = r.src[1];
        if (!href.startsWith("#")) return; // resume.html opens normally
        e.preventDefault();
        if (innerWidth < 640) closeAsk();
        const m = href.match(/^#case-(\w+)$/);
        if (m) { openCase(m[1]); return; }
        const el = document.querySelector(href);
        window.landOn(el, true);
        el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
      });
      t.appendChild(document.createElement("br"));
      t.appendChild(a);
    }
    log.scrollTop = log.scrollHeight;
  }

  let greeted = false;
  function openAsk() {
    panel.hidden = false;
    fab.classList.add("is-hidden");
    if (!greeted) {
      greeted = true;
      addMsg("bot", "Hi, I'm a small assistant that knows what's on this site. I answer only from these facts and show you where each answer comes from.");
      chips.innerHTML = SUGGEST.map((s) => `<button type="button">${esc(s)}</button>`).join("");
      $$("button", chips).forEach((b) => b.addEventListener("click", () => ask(b.textContent)));
    }
    setTimeout(() => input.focus(), 50);
  }
  function closeAsk() {
    panel.hidden = true;
    fab.classList.remove("is-hidden");
  }
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  $$("[data-open-ask]").forEach((b) => b.addEventListener("click", openAsk));
  $("[data-close-ask]").addEventListener("click", closeAsk);
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); closeAsk(); fab.focus(); } });

  window.Site = { openAsk, openCase };

  /* ---------- live GitHub ---------- */
  const LANG = { Python: "#3572A5", TypeScript: "#3178c6", JavaScript: "#f1e05a", "Jupyter Notebook": "#DA5B0B", EJS: "#a91e50", HTML: "#e34c26", CSS: "#663399", "C++": "#f34b7d" };
  const ago = (d) => {
    const s = (Date.now() - new Date(d)) / 1000;
    const units = [[31536000, "year"], [2592000, "month"], [604800, "week"], [86400, "day"], [3600, "hour"], [60, "minute"]];
    for (const [n, u] of units) if (s >= n) { const v = Math.floor(s / n); return `${v} ${u}${v > 1 ? "s" : ""} ago`; }
    return "just now";
  };

  // empty starters and the duplicate copy of this site
  const HIDE = new Set(["portfolio", "mlproject"]);

  async function loadGitHub() {
    const key = "gh-cache-v2";
    let data = null;
    try {
      const c = JSON.parse(sessionStorage.getItem(key) || "null");
      if (c && Date.now() - c.t < 30 * 60 * 1000) data = c.d;
    } catch {}
    if (!data) {
      try {
        const [u, r] = await Promise.all([
          fetch(`https://api.github.com/users/${S.github}`).then((x) => (x.ok ? x.json() : Promise.reject(x.status))),
          fetch(`https://api.github.com/users/${S.github}/repos?per_page=100&sort=pushed`).then((x) => (x.ok ? x.json() : Promise.reject(x.status))),
        ]);
        data = {
          count: u.public_repos,
          repos: r.filter((x) => !x.fork && !HIDE.has(x.name)).map((x) => ({ n: x.name, d: x.description, l: x.language, s: x.stargazers_count, p: x.pushed_at, u: x.html_url, h: x.homepage })),
        };
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data })); } catch {}
      } catch {
        $("[data-gh-list]").innerHTML = `<li class="muted">GitHub didn't answer just now. <a href="https://github.com/${S.github}" target="_blank" rel="noopener">See it on GitHub ↗</a></li>`;
        return;
      }
    }
    $("[data-gh-repos]").textContent = data.count;

    const counts = {};
    data.repos.forEach((r) => { if (r.l) counts[r.l] = (counts[r.l] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    $("[data-gh-langbar]").innerHTML = langs.map(([l, n]) => `<span style="width:${(n / total) * 100}%;background:${LANG[l] || "#888"}"></span>`).join("");
    $("[data-gh-langs]").innerHTML = langs.slice(0, 5).map(([l, n]) => `<li><i style="background:${LANG[l] || "#888"}"></i>${esc(l)}<b>${Math.round((n / total) * 100)}%</b></li>`).join("");

    const desc = { "mcp-opportunity-scanner": "WebMcp.AI — find the tools that make any website agent-ready.", ppe_detection: "YOLOv8 PPE compliance detection.", forestfire: "Fire Weather Index prediction with scikit-learn and Flask." };
    $("[data-gh-list]").innerHTML = data.repos.slice(0, 6).map((r) => `
      <li><a href="${esc(r.u)}" target="_blank" rel="noopener">
        <p class="gh__name">${esc(r.n)}</p>
        <p class="gh__desc">${esc(r.d || desc[r.n] || "No description yet.")}</p>
        <p class="gh__foot">${r.l ? `<span><i style="background:${LANG[r.l] || "#888"}"></i>${esc(r.l)}</span>` : ""}<span>updated ${ago(r.p)}</span>${r.s ? `<span>★ ${r.s}</span>` : ""}</p>
      </a></li>`).join("");
  }
  // only fetch when the section is about to be seen
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { o.disconnect(); loadGitHub(); } }, { rootMargin: "400px" })
    .observe($("#github"));
})();
