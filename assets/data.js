/*
 * Every fact on the site in one place.
 * The case-study panel and the "Ask Tirth" assistant both read from here,
 * so the assistant can only say things that are written down below.
 */
window.SITE = {
  github: "Tirth262830",
  email: "parikhtirth77@gmail.com",
  linkedin: "https://www.linkedin.com/in/tirth-parikh-199113339/",

  projects: {
    webmcp: {
      title: "WebMcp.AI",
      year: "2026",
      kind: "AI agents · Web",
      tagline: "Paste any website. Find the tools that would make it agent-ready.",
      stack: ["TypeScript", "Next.js", "OpenAI Responses API", "Zod", "Vitest", "Tailwind"],
      links: [
        ["Live site", "https://webmcpai.vercel.app"],
        ["GitHub", "https://github.com/Tirth262830/mcp-opportunity-scanner"],
      ],
      problem:
        "Most websites make AI agents guess how to use a visual interface. WebMCP lets a page expose clear tools that agents can call directly, but site owners don't know which tools they should build.",
      built:
        "A scanner for the OpenAI WebMCP Challenge. You paste a public URL. It researches the site, maps real user workflows to structured tools, ranks each opportunity, and writes an implementation prompt you can hand to a developer or a coding agent.",
      how: [
        "Fetches public pages behind safety checks: redirects, size limits, protocol, DNS, and blocking of private networks.",
        "Treats crawled text as untrusted data, so instructions hidden in a page can't steer the model.",
        "Uses the OpenAI Responses API with web search, then validates every model answer against a strict Zod schema.",
        "Shows evidence links, a readiness score, safety labels and the top three picks, with before/after flows.",
        "The app exposes its own WebMCP tools (analyze_website, get_opportunity_report, select_tools_for_plan), so an agent can use it too.",
      ],
      result:
        "Live on Vercel. Tested with unit tests for URLs, scoring, schemas, prompts and malformed model output, plus an end-to-end test.",
    },
    ppe: {
      title: "PPE Detection",
      year: "2026",
      kind: "Computer vision",
      tagline: "Spots missing helmets and vests on construction sites.",
      stack: ["Python", "YOLOv8", "OpenCV", "Streamlit"],
      links: [["GitHub", "https://github.com/Tirth262830/ppe_detection"]],
      problem:
        "Checking by hand whether every worker on a site is wearing a helmet and vest is slow and easy to miss.",
      built:
        "A detection system trained with Ultralytics YOLOv8 that finds helmets and vests, and flags people without them, in images, video or a live webcam.",
      how: [
        "Detects four classes: helmet, vest, without_helmet and without_vest.",
        "Flags a violation when a missing helmet or vest is found, and saves the annotated frame as evidence.",
        "Runs from the command line for images, video files or webcam, with a Streamlit dashboard on top.",
        "Confidence, overlap (IoU) threshold, device and storage are set in one YAML config file.",
      ],
      result: "A working pipeline from training to live inference, with saved evidence for every violation.",
    },
    forest: {
      title: "Forest Fire Prediction",
      year: "2024",
      kind: "Machine learning",
      tagline: "Predicting the Fire Weather Index from weather readings.",
      stack: ["Python", "scikit-learn", "Pandas", "Flask"],
      links: [["GitHub", "https://github.com/Tirth262830/forestfire"]],
      problem: "Fire danger depends on temperature, humidity, wind and rain in ways that are hard to judge by eye.",
      built: "A model that predicts the Fire Weather Index (FWI) from daily weather readings, trained on the Algerian forest fires dataset, with a web form to try it.",
      how: [
        "Cleaned the dataset and explored it with Pandas, Matplotlib and Seaborn.",
        "Compared Linear, Ridge, Lasso and ElasticNet regression, tuned with cross-validation and scored with R².",
        "Saved the chosen Ridge model and its scaler, and served predictions from a Flask web app.",
        "Added deployment config for AWS Elastic Beanstalk.",
      ],
      result: "Enter today's weather, get a fire danger estimate. The burning name at the top of this site is a nod to it.",
    },
    ghar: {
      title: "Ghar.com",
      year: "2023",
      kind: "Full-stack web",
      tagline: "A vacation rental listing platform.",
      stack: ["Node.js", "Express", "MongoDB Atlas", "EJS", "Passport.js"],
      links: [
        ["Live site", "https://ghar-dot-com.onrender.com"],
        ["GitHub", "https://github.com/Tirth262830/Ghar-dot-com"],
      ],
      problem: "A full-stack project to show the whole path from database to deployed app.",
      built: "A site where people browse and filter vacation rentals, see them on a map, and sign in to manage listings.",
      how: [
        "Sign-up and login with Passport.js and server sessions.",
        "Property listings with search filters and an embedded map.",
        "Image uploads with Multer, data stored in MongoDB Atlas.",
        "An admin dashboard to manage users and listings, plus a help chatbot.",
      ],
      result: "Deployed and live on Render.",
    },
    expense: {
      title: "Expense Manager",
      year: "2024",
      kind: "Backend · APIs",
      tagline: "Track spending and see where the money goes.",
      stack: ["Node.js", "Express", "MongoDB", "REST"],
      links: [
        ["Live site", "https://your-expense-manager.vercel.app/"],
        ["GitHub", "https://github.com/Tirth262830/Expense-management"],
      ],
      problem: "Seeing your spending by month and category usually means a messy spreadsheet.",
      built: "REST APIs that record expenses and summarize spending by month and by category.",
      how: [
        "Express routes for adding, editing and listing expenses.",
        "MongoDB aggregation for monthly and per-category totals.",
      ],
      result: "Deployed with a live demo.",
    },
    powerbi: {
      title: "Sales Insights Dashboard",
      year: "2025",
      kind: "Data · BI",
      tagline: "Regional sales and year-over-year growth at a glance.",
      stack: ["Power BI", "SQL", "DAX", "Power Query"],
      links: [],
      problem: "Sales teams needed to compare regions and spot growth without digging through raw tables.",
      built: "A Power BI dashboard built on SQL data with DAX measures.",
      how: [
        "SQL to pull and shape the sales data.",
        "DAX measures for totals and year-over-year growth.",
        "Filters to slice results by region and period.",
      ],
      result: "One page that answers the common sales questions.",
    },
  },

  /*
   * Knowledge for the assistant. Each entry has words it should match,
   * a short answer, and where on the page that answer comes from.
   */
  facts: [
    { id: "who", keys: "who are you tirth about yourself introduce summary background tell me", a: "Tirth Parikh is an AI Engineer at Evently Technology in Vadodara, Gujarat. He builds agent-assisted workflows for market research and prospect discovery, and has worked in data analysis and web development before that.", src: ["About", "#about"] },
    { id: "now", keys: "current job now work currently evently keel company role position employer doing", a: "He's an AI Engineer at Evently Technology (since Sep 2026), working on Keel. He builds research workflows that verify company identities and gather sources, checks client prospect lists against the research, and scores each prospect's fit, need and buying timeline. He also works on AI provider integrations that track paid requests.", src: ["Work → Evently", "#work"] },
    { id: "ion", keys: "ion exchange data analyst intern internship analytics sql excel power bi 2025", a: "From Mar to Apr 2025 he was a Data Analyst Intern at Ion Exchange (India) Ltd., cleaning and analyzing business data with SQL and Excel and building Power BI reports.", src: ["Work → Ion Exchange", "#work"] },
    { id: "yo4gis", keys: "yo4gis web developer intern internship hyderabad javascript frontend performance load", a: "From Jun to Dec 2024 he was a Web Developer Intern at YO4GIS Solution in Hyderabad. He built responsive JavaScript apps and cut page load time by about 15–20%.", src: ["Work → YO4GIS", "#work"] },
    { id: "exp", keys: "experience jobs worked internships history career years", a: "Three roles: AI Engineer at Evently Technology (Sep 2026 – now), Data Analyst Intern at Ion Exchange (Mar – Apr 2025), and Web Developer Intern at YO4GIS (Jun – Dec 2024).", src: ["Work", "#work"] },
    { id: "webmcp", keys: "webmcp mcp webmcp.ai openai challenge agent ready scanner tools opportunity best project proud", a: "WebMcp.AI is his entry for the OpenAI WebMCP Challenge. You paste a website and it finds the tools that would let AI agents use that site directly, ranks them, and writes an implementation prompt. It treats crawled pages as untrusted data and validates every model answer with Zod. It's live at webmcpai.vercel.app.", src: ["Projects → WebMcp.AI", "#case-webmcp"] },
    { id: "ppe", keys: "ppe helmet vest yolo yolov8 computer vision detection opencv safety construction streamlit", a: "PPE Detection uses YOLOv8 and OpenCV to find helmets and vests, and to flag workers without them, in images, video or a webcam. It saves an annotated frame for each violation and has a Streamlit dashboard.", src: ["Projects → PPE Detection", "#case-ppe"] },
    { id: "forest", keys: "forest fire prediction machine learning ml model regression fwi weather flask", a: "Forest Fire Prediction estimates the Fire Weather Index from weather readings (Algerian forest fires dataset). He compared Linear, Ridge, Lasso and ElasticNet regression with cross-validation and served the Ridge model from a Flask web app.", src: ["Projects → Forest Fire", "#case-forest"] },
    { id: "ghar", keys: "ghar vacation rental homes listing airbnb full stack node mongodb passport", a: "Ghar.com is a vacation rental site with login (Passport.js), search filters, a map, image uploads, an admin dashboard and a chatbot. Built with Node, Express and MongoDB Atlas, live on Render.", src: ["Projects → Ghar.com", "#case-ghar"] },
    { id: "expense", keys: "expense manager money spending budget rest api express", a: "The Expense Manager is a set of REST APIs in Node, Express and MongoDB that record expenses and summarize spending by month and category. There's a live demo.", src: ["Projects → Expense Manager", "#case-expense"] },
    { id: "powerbi", keys: "power bi dashboard sales insights dax bi visualization", a: "The Sales Insights Dashboard is a Power BI report on SQL data, with DAX measures to compare regional sales and track year-over-year growth.", src: ["Projects → Sales Dashboard", "#case-powerbi"] },
    { id: "projects", keys: "projects built portfolio show work examples side", a: "Highlights: WebMcp.AI (agent-readiness scanner, OpenAI WebMCP Challenge), PPE Detection (YOLOv8), Forest Fire Prediction (regression on weather data), Ghar.com (full-stack rentals), an Expense Manager API and a Power BI sales dashboard.", src: ["Projects", "#projects"] },
    { id: "ai", keys: "ai ml machine learning llm agents agentic artificial intelligence models deep learning", a: "AI work: research agents at Evently (Keel), WebMcp.AI with the OpenAI Responses API, a YOLOv8 vision model for PPE, and regression models for forest fire danger. Tools: Python, Pandas, NumPy, feature engineering and EDA.", src: ["Toolkit", "#skills"] },
    { id: "skills", keys: "skills stack tech technologies languages tools know use good at programming", a: "Languages: Python, SQL, JavaScript, TypeScript, C++. AI and data: agentic workflows, regression and classification, YOLOv8, Pandas, NumPy, EDA. Web: Node.js, Express, React, Next.js, REST APIs. Data and BI: MySQL, MongoDB, Power BI, DAX, Power Query, Excel.", src: ["Toolkit", "#skills"] },
    { id: "python", keys: "python pandas numpy", a: "Python is his main language: research workflows, ML models with scikit-learn (Forest Fire), computer vision (PPE Detection with YOLOv8), and data analysis with Pandas and NumPy.", src: ["Toolkit", "#skills"] },
    { id: "web", keys: "web javascript typescript react node next frontend backend full stack", a: "For the web he uses JavaScript and TypeScript with Node.js, Express, React and Next.js. Examples: WebMcp.AI (Next.js), Ghar.com and the Expense Manager (Node + MongoDB).", src: ["Toolkit", "#skills"] },
    { id: "edu", keys: "education college university degree study studied cgpa gpa engineering svit graduate", a: "B.E. in Computer Engineering from Sardar Vallabhbhai Patel Institute of Technology (SVIT), Vasad, 2022–2026, with a CGPA of 8.5/10.", src: ["Toolkit → Education", "#skills"] },
    { id: "certs", keys: "certificates certifications certification courses deloitte jp morgan forage apna college", a: "Full Stack Development Certification (Apna College), plus job simulations in Data Analytics (Deloitte, Forage) and Software Engineering (J.P. Morgan, Forage).", src: ["Toolkit → Certificates", "#skills"] },
    { id: "contact", keys: "contact email reach hire hiring message talk connect linkedin phone", a: "Email parikhtirth77@gmail.com, or find him on LinkedIn and GitHub. Links are in the Contact section.", src: ["Contact", "#contact"] },
    { id: "where", keys: "where location based live city india vadodara gujarat remote", a: "He's based in Vadodara, Gujarat, India.", src: ["Contact", "#contact"] },
    { id: "resume", keys: "resume cv download pdf", a: "There's a printable resume page. Open it and use Download PDF.", src: ["Resume", "resume.html"] },
    { id: "site", keys: "this site website built how made portfolio fire burning name animation", a: "This site is plain HTML, CSS and JavaScript with no framework. The burning name is a small cellular automaton: trees grow in the letters, your cursor is a spark, and the forest grows back. I'm a simple search over facts written on this page, not a large language model, so I can't make things up.", src: ["Top", "#top"] },
  ],
};
