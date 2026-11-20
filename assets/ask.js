/*
 * The "Ask Tirth" matcher. No AI model: it scores each fact in SITE.facts
 * against the question and returns the best one, or says it doesn't know.
 * Rare words count more than common ones (inverse document frequency),
 * so "yolo" beats "work".
 * Runs in the browser and in Node (tests/ask.test.mjs).
 */
(function (root) {
  const STOP = new Set((
    "a an the is are was were be been am of to in on at for and or with what whats which whom whose how " +
    "do does did doing done he him his she her they them their it its this that these those there here " +
    "tirth tirths parikh me my i im you your yours tell about can could would should will please any some " +
    "much many has have had get got know good well show give list kind sort type thing things like just also really " +
    "mr sir bro hey hi hello yo up out by from as so if then than into over"
  ).split(" "));

  // every word on the left becomes the word on the right before matching
  const SYN = {
    current: "now", currently: "now", present: "now", today: "now", nowadays: "now",
    job: "work", jobs: "work", working: "work", works: "work", worked: "work", role: "work", roles: "work",
    position: "work", employer: "work", company: "work", employed: "work", career: "work", occupation: "work",
    profession: "work", office: "work",
    project: "project", projects: "project", built: "project", build: "project", building: "project",
    made: "project", make: "project", created: "project", side: "project",
    stack: "skill", skills: "skill", tech: "skill", technologies: "skill", technology: "skill", tools: "skill",
    tool: "skill", languages: "skill", language: "skill", programming: "skill", frameworks: "skill",
    framework: "skill", expertise: "skill", strengths: "skill", strength: "skill",
    college: "education", degree: "education", university: "education", study: "education", studied: "education",
    studying: "education", school: "education", graduate: "education", graduated: "education",
    graduation: "education", qualification: "education", qualifications: "education", btech: "education",
    be: "education", gpa: "cgpa", grades: "cgpa", marks: "cgpa",
    email: "contact", mail: "contact", hire: "contact", hiring: "contact", reach: "contact", phone: "contact",
    call: "contact", message: "contact", connect: "contact", touch: "contact",
    cv: "resume",
    best: "best", favourite: "best", favorite: "best", proud: "best", strongest: "best", top: "best",
    biggest: "best", impressive: "best", flagship: "best", coolest: "best", greatest: "best", standout: "best",
    vision: "yolo", detection: "yolo", detect: "yolo", cv2: "opencv",
    ml: "machine", agent: "agent", agents: "agent", agentic: "agent", llm: "ai", llms: "ai", genai: "ai",
    intern: "internship", internships: "internship", interned: "internship",
    experience: "experience", experienced: "experience", fresher: "experience", junior: "experience", senior: "experience", years: "experience", background: "experience", history: "experience",
    located: "where", location: "where", live: "where", lives: "where", based: "where", city: "where",
    country: "where", from: "where",
    certificate: "cert", certificates: "cert", certification: "cert", certifications: "cert",
    certified: "cert", course: "cert", courses: "cert",
    analyst: "analyst", analytics: "analyst", analysis: "analyst", data: "data",
    website: "site", webpage: "site",
  };
  // "be" and "from" are also stop words; keep them only as synonyms when useful
  STOP.delete("from");

  const stem = (w) => (w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
  const norm = (w) => SYN[w] || SYN[stem(w)] || stem(w);

  function tokens(text) {
    return String(text).toLowerCase()
      .replace(/['’]s\b/g, "")
      .replace(/(\d)\.(\d)/g, "$1_$2")
      .replace(/[^a-z0-9+#_ ]/g, " ")
      .split(/\s+/)
      .filter((w) => w && !STOP.has(w))
      .map(norm);
  }

  function build(facts) {
    const docs = facts.map((f) => ({ f, words: new Set(tokens(f.keys)) }));
    const df = {};
    docs.forEach((d) => d.words.forEach((w) => { df[w] = (df[w] || 0) + 1; }));
    const N = docs.length;
    const idf = (w) => Math.log(1 + N / df[w]);
    return { docs, idf };
  }

  const GREETING = /^\s*(hi|hey|hello|hii+|yo|namaste|good (morning|afternoon|evening))\b[\s!.?]*$/i;
  const THANKS = /^\s*(thanks|thank you|thx|ty|cool|great|nice|ok|okay)\b/i;

  function create(facts, opts = {}) {
    const { docs, idf } = build(facts);
    const MIN = opts.min ?? 1.2;
    const unknown = opts.unknown;

    function rank(q) {
      let qt = [...new Set(tokens(q))];
      // "where does he work / study" is about work or study, not location
      if (qt.length > 1 && qt.includes("where")) qt = qt.filter((w) => w !== "where");
      return docs
        .map((d, i) => {
          let s = 0;
          for (const w of qt) if (d.words.has(w)) s += idf(w);
          return { f: d.f, s, i };
        })
        // on a tie, the fact listed first in data.js wins (most important first)
        .sort((a, b) => b.s - a.s || a.i - b.i);
    }

    function answer(q) {
      if (GREETING.test(q)) return { a: "Hi! Ask me anything about Tirth: his work, projects, skills, education or how to reach him.", kind: "greeting" };
      if (THANKS.test(q) && tokens(q).length <= 2) return { a: "Happy to help. Anything else you'd like to know?", kind: "thanks" };
      const r = rank(q);
      if (!r.length || r[0].s < MIN) return { ...unknown, kind: "unknown" };
      return { ...r[0].f, kind: "fact", score: r[0].s };
    }

    return { answer, rank, tokens };
  }

  root.AskEngine = { create, tokens };
})(typeof window !== "undefined" ? window : globalThis);
