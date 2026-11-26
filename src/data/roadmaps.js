// Career roadmaps: skills to learn + step-by-step stages. Task ids must stay stable (progress is saved by id).
const t = (id, title, detail) => ({ id, title, detail });

export const ROADMAPS = [
  {
    id: "software-developer",
    title: "Software Developer",
    icon: "code",
    blurb: "Build reliable applications and crack product-company interviews.",
    salary: "Entry roles · strong demand",
    skills: ["A core language (Java / C++ / Python)", "Data structures & algorithms", "OOP & design principles", "Git & GitHub", "SQL & databases", "Operating systems basics", "REST APIs", "Testing & debugging"],
    stages: [
      { title: "Programming foundations", weeks: "Weeks 1–4", tasks: [
        t("sd-1", "Master one language", "Variables, control flow, functions, collections and file I/O in Java, C++ or Python."),
        t("sd-2", "Object-oriented programming", "Classes, inheritance, polymorphism, encapsulation, abstraction with small projects."),
        t("sd-3", "Git & GitHub", "Commit, branch, merge, pull requests. Push every project you build."),
      ] },
      { title: "Data structures & algorithms", weeks: "Weeks 5–12", tasks: [
        t("sd-4", "Arrays, strings & hashing", "Two pointers, sliding window, prefix sums, hash maps — 40 problems."),
        t("sd-5", "Linked lists, stacks, queues", "Implement each from scratch, then solve 25 classic problems."),
        t("sd-6", "Trees & graphs", "Traversals, BST, BFS/DFS, shortest paths, topological sort."),
        t("sd-7", "Recursion, DP & greedy", "Memoisation, tabulation, knapsack, LIS and interval problems."),
      ] },
      { title: "CS fundamentals", weeks: "Weeks 13–16", tasks: [
        t("sd-8", "Operating systems", "Processes vs threads, scheduling, deadlocks, memory management, paging."),
        t("sd-9", "DBMS & SQL", "Normalisation, joins, indexing, transactions and ACID properties."),
        t("sd-10", "Computer networks", "OSI/TCP-IP layers, HTTP/HTTPS, DNS, TCP vs UDP."),
      ] },
      { title: "Projects & interview prep", weeks: "Weeks 17–24", tasks: [
        t("sd-11", "Build two portfolio projects", "One full application with a database and a REST API, deployed online."),
        t("sd-12", "Low-level design basics", "SOLID principles, design a parking lot / library system."),
        t("sd-13", "Mock interviews", "Complete 5 InterviewX technical mock interviews and review the feedback."),
      ] },
    ],
  },
  {
    id: "web-developer",
    title: "Web Developer",
    icon: "globe",
    blurb: "Design and ship fast, accessible websites and web apps.",
    salary: "Freelance & full-time options",
    skills: ["HTML5 & semantic markup", "CSS, Flexbox & Grid", "JavaScript (ES6+)", "React or another framework", "Responsive & accessible design", "Node.js & Express", "REST APIs & JSON", "Deployment (Vercel / Netlify)"],
    stages: [
      { title: "Web foundations", weeks: "Weeks 1–4", tasks: [
        t("wd-1", "Semantic HTML", "Forms, tables, landmarks and accessibility attributes."),
        t("wd-2", "Modern CSS layouts", "Box model, Flexbox, Grid, media queries, CSS variables."),
        t("wd-3", "Build 3 responsive pages", "Clone-style layouts from scratch that work on mobile and desktop."),
      ] },
      { title: "JavaScript", weeks: "Weeks 5–9", tasks: [
        t("wd-4", "Core JavaScript", "Scope, closures, arrays, objects, ES6 modules, destructuring."),
        t("wd-5", "DOM & events", "Build a to-do app and a quiz app with vanilla JS."),
        t("wd-6", "Async JavaScript", "Promises, async/await, fetch and handling API errors."),
      ] },
      { title: "Frameworks & back end", weeks: "Weeks 10–16", tasks: [
        t("wd-7", "React fundamentals", "Components, props, state, hooks, lists and forms."),
        t("wd-8", "Node.js & Express", "Build a REST API with routes, validation and a database."),
        t("wd-9", "Authentication basics", "Sessions vs JWT, hashing passwords, protecting routes."),
      ] },
      { title: "Ship & showcase", weeks: "Weeks 17–20", tasks: [
        t("wd-10", "Full-stack project", "A complete app with front end, API and database, deployed live."),
        t("wd-11", "Performance & SEO", "Lighthouse audit, image optimisation, meta tags."),
        t("wd-12", "Portfolio website", "Showcase your projects with live links and GitHub code."),
      ] },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    icon: "chart",
    blurb: "Turn raw data into insights that drive business decisions.",
    salary: "High demand across industries",
    skills: ["Excel / Google Sheets", "SQL", "Statistics fundamentals", "Python (pandas)", "Data cleaning", "Power BI or Tableau", "Data storytelling", "Business KPIs"],
    stages: [
      { title: "Spreadsheets & statistics", weeks: "Weeks 1–3", tasks: [
        t("da-1", "Advanced Excel", "Lookups, pivot tables, conditional formatting, charts."),
        t("da-2", "Descriptive statistics", "Mean, median, variance, distributions, percentiles."),
        t("da-3", "Probability basics", "Sampling, hypothesis testing, confidence intervals."),
      ] },
      { title: "SQL", weeks: "Weeks 4–7", tasks: [
        t("da-4", "Querying data", "SELECT, WHERE, ORDER BY, GROUP BY, HAVING."),
        t("da-5", "Joins & subqueries", "INNER/LEFT joins, CTEs, window functions."),
        t("da-6", "Practise 50 SQL problems", "Solve problems on real-world style datasets."),
      ] },
      { title: "Python for analysis", weeks: "Weeks 8–12", tasks: [
        t("da-7", "pandas & NumPy", "Load, clean, merge, group and reshape datasets."),
        t("da-8", "Visualisation", "matplotlib / seaborn charts that answer a question."),
        t("da-9", "Exploratory data analysis", "Complete an EDA notebook on a public dataset."),
      ] },
      { title: "Dashboards & portfolio", weeks: "Weeks 13–16", tasks: [
        t("da-10", "Power BI or Tableau", "Build an interactive dashboard with filters and KPIs."),
        t("da-11", "Case study project", "Answer a business question end-to-end and present it."),
        t("da-12", "Interview practice", "Do 3 InterviewX Data Analyst mock interviews."),
      ] },
    ],
  },
  {
    id: "hr",
    title: "HR Professional",
    icon: "people",
    blurb: "Hire, grow and support great teams.",
    salary: "Every organisation needs HR",
    skills: ["Recruitment & selection", "Communication", "Labour law basics", "Employee engagement", "Performance management", "HR analytics", "Conflict resolution", "HRMS tools"],
    stages: [
      { title: "HR foundations", weeks: "Weeks 1–3", tasks: [
        t("hr-1", "Core HR functions", "Recruitment, onboarding, payroll, compliance, L&D, employee relations."),
        t("hr-2", "Labour law essentials", "Key employment laws, contracts and workplace policies."),
        t("hr-3", "Business communication", "Professional emails, presentations and meeting skills."),
      ] },
      { title: "Talent acquisition", weeks: "Weeks 4–7", tasks: [
        t("hr-4", "Writing job descriptions", "Clear role summaries, responsibilities and requirements."),
        t("hr-5", "Interviewing techniques", "Structured interviews, competency and STAR questions."),
        t("hr-6", "Onboarding plan", "Design a 30-60-90 day onboarding plan."),
      ] },
      { title: "People management", weeks: "Weeks 8–11", tasks: [
        t("hr-7", "Performance appraisals", "Goal setting, KPIs, 360° feedback, fair reviews."),
        t("hr-8", "Engagement & retention", "Surveys, recognition programmes, exit interviews."),
        t("hr-9", "Conflict resolution", "Mediation steps and handling grievances."),
      ] },
      { title: "Tools & analytics", weeks: "Weeks 12–14", tasks: [
        t("hr-10", "HRMS software", "Explore an HRMS such as Zoho People or BambooHR."),
        t("hr-11", "HR analytics in Excel", "Attrition rate, time-to-hire and cost-per-hire dashboards."),
        t("hr-12", "Mock HR interviews", "Complete 3 InterviewX HR-round interviews."),
      ] },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist / ML",
    icon: "sparkle",
    blurb: "Build models that predict, classify and recommend.",
    salary: "Specialised, fast-growing field",
    skills: ["Python", "Linear algebra & statistics", "pandas & scikit-learn", "Machine learning algorithms", "Model evaluation", "Deep learning basics", "SQL", "Communicating results"],
    stages: [
      { title: "Maths & Python", weeks: "Weeks 1–5", tasks: [
        t("ds-1", "Python for data", "NumPy, pandas, plotting and Jupyter notebooks."),
        t("ds-2", "Linear algebra", "Vectors, matrices, dot products, eigenvalues (intuition first)."),
        t("ds-3", "Statistics & probability", "Distributions, Bayes' theorem, hypothesis testing."),
      ] },
      { title: "Machine learning", weeks: "Weeks 6–12", tasks: [
        t("ds-4", "Supervised learning", "Linear/logistic regression, decision trees, random forests."),
        t("ds-5", "Model evaluation", "Train/test split, cross-validation, precision, recall, ROC-AUC."),
        t("ds-6", "Unsupervised learning", "k-means, PCA and clustering evaluation."),
      ] },
      { title: "Deep learning", weeks: "Weeks 13–18", tasks: [
        t("ds-7", "Neural network basics", "Perceptrons, backpropagation, activation functions."),
        t("ds-8", "A framework", "Build and train a model with PyTorch or TensorFlow."),
        t("ds-9", "NLP or computer vision project", "Text classification or image classification."),
      ] },
      { title: "Portfolio", weeks: "Weeks 19–24", tasks: [
        t("ds-10", "End-to-end ML project", "From data collection to a deployed demo (e.g. Streamlit)."),
        t("ds-11", "Kaggle competition", "Enter one competition and write up your approach."),
        t("ds-12", "Explain your models", "Practise explaining a project in a mock interview."),
      ] },
    ],
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    icon: "cloud",
    blurb: "Automate, deploy and run software at scale.",
    salary: "Strong demand for cloud skills",
    skills: ["Linux & shell", "Networking basics", "Git", "Docker", "CI/CD pipelines", "A cloud platform (AWS / Azure / GCP)", "Infrastructure as code", "Monitoring"],
    stages: [
      { title: "Linux & networking", weeks: "Weeks 1–4", tasks: [
        t("cd-1", "Linux command line", "Files, permissions, processes, package managers, SSH."),
        t("cd-2", "Shell scripting", "Write Bash scripts to automate everyday tasks."),
        t("cd-3", "Networking fundamentals", "IP, subnets, DNS, HTTP, load balancers, firewalls."),
      ] },
      { title: "Containers & CI/CD", weeks: "Weeks 5–9", tasks: [
        t("cd-4", "Docker", "Images, containers, volumes, Dockerfiles, docker compose."),
        t("cd-5", "CI/CD pipelines", "Build, test and deploy automatically with GitHub Actions."),
        t("cd-6", "Kubernetes basics", "Pods, deployments, services and scaling."),
      ] },
      { title: "Cloud platform", weeks: "Weeks 10–15", tasks: [
        t("cd-7", "Core cloud services", "Compute, storage, databases and IAM on one provider."),
        t("cd-8", "Infrastructure as code", "Provision resources with Terraform."),
        t("cd-9", "Entry-level certification", "Prepare for a foundational cloud certification."),
      ] },
      { title: "Operate & showcase", weeks: "Weeks 16–20", tasks: [
        t("cd-10", "Monitoring & logging", "Metrics, alerts and dashboards (e.g. Prometheus + Grafana)."),
        t("cd-11", "Deploy a real project", "Containerise an app and deploy it with a CI/CD pipeline."),
        t("cd-12", "Document your setup", "Write a README with an architecture diagram."),
      ] },
    ],
  },
];
