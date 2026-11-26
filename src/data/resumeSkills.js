// Skill dictionaries for the rule-based (demo) resume analysis.
// Each skill: [display name, ...aliases]. Aliases are matched case-insensitively as whole words.
const S = (...names) => names;

export const ROLE_SKILLS = {
  "Software Developer": [
    S("Data Structures", "data structures", "dsa"), S("Algorithms", "algorithms", "algorithm"), S("Java", "java"), S("Python", "python"),
    S("C++", "c++", "cpp"), S("OOP", "oop", "object oriented", "object-oriented"), S("Git", "git", "github", "gitlab"), S("SQL", "sql", "mysql", "postgresql"),
    S("REST APIs", "rest", "api", "apis"), S("Operating Systems", "operating system", "operating systems"), S("Testing", "unit test", "testing", "junit", "pytest"), S("Linux", "linux"),
  ],
  "Web Developer": [
    S("HTML", "html", "html5"), S("CSS", "css", "css3"), S("JavaScript", "javascript", "js", "es6"), S("React", "react", "react.js", "reactjs"),
    S("Node.js", "node", "node.js", "nodejs"), S("Express", "express", "express.js"), S("TypeScript", "typescript"), S("Responsive Design", "responsive"),
    S("Git", "git", "github"), S("REST APIs", "rest", "api", "apis"), S("Tailwind / Bootstrap", "tailwind", "bootstrap"), S("MongoDB / SQL", "mongodb", "sql", "mysql"),
  ],
  "Data Analyst": [
    S("SQL", "sql", "mysql", "postgresql"), S("Excel", "excel", "spreadsheets", "vlookup", "pivot"), S("Python", "python"), S("pandas", "pandas"),
    S("Power BI", "power bi", "powerbi"), S("Tableau", "tableau"), S("Statistics", "statistics", "statistical"), S("Data Visualization", "visualization", "visualisation", "dashboard", "dashboards"),
    S("Data Cleaning", "data cleaning", "cleaning"), S("NumPy", "numpy"), S("A/B Testing", "a/b test", "ab testing", "hypothesis"), S("Communication", "communication", "presentation"),
  ],
  "HR / Management": [
    S("Recruitment", "recruitment", "recruiting", "hiring", "talent acquisition"), S("Onboarding", "onboarding"), S("Communication", "communication"), S("Employee Engagement", "engagement"),
    S("Performance Management", "performance management", "appraisal", "appraisals"), S("Labour Law", "labour law", "labor law", "compliance"), S("Payroll", "payroll"), S("HRMS", "hrms", "hris"),
    S("Conflict Resolution", "conflict resolution", "grievance"), S("MS Excel", "excel"), S("Leadership", "leadership", "led", "managed"), S("Training & Development", "training", "l&d"),
  ],
  Marketing: [
    S("SEO", "seo"), S("Social Media", "social media", "instagram", "linkedin marketing"), S("Content Writing", "content", "copywriting"), S("Google Analytics", "google analytics", "analytics"),
    S("Email Marketing", "email marketing", "mailchimp"), S("Campaigns", "campaign", "campaigns"), S("Branding", "brand", "branding"), S("Market Research", "market research", "research"),
    S("Canva / Design", "canva", "photoshop", "figma"), S("Paid Ads", "google ads", "meta ads", "ppc", "sem"), S("Communication", "communication"), S("Excel", "excel"),
  ],
  "Customer Support": [
    S("Communication", "communication"), S("CRM", "crm", "salesforce", "zendesk", "freshdesk"), S("Problem Solving", "problem solving", "problem-solving"), S("Empathy", "empathy", "customer satisfaction"),
    S("Ticketing", "ticket", "tickets", "ticketing"), S("English Fluency", "english", "fluent"), S("Multitasking", "multitasking", "multi-tasking"), S("MS Office", "ms office", "excel", "word"),
    S("Conflict Handling", "escalation", "conflict"), S("Product Knowledge", "product"), S("Typing Speed", "typing"), S("Teamwork", "team", "teamwork"),
  ],
  "Fresher (General)": [
    S("Communication", "communication"), S("Teamwork", "team", "teamwork"), S("Problem Solving", "problem solving", "problem-solving"), S("MS Office", "ms office", "excel", "powerpoint", "word"),
    S("Leadership", "leadership", "led", "lead"), S("Time Management", "time management"), S("Projects", "project", "projects"), S("Internship", "intern", "internship"),
    S("Certifications", "certification", "certified", "certificate"), S("Programming", "python", "java", "c++", "javascript"), S("Presentation", "presentation", "public speaking"), S("Adaptability", "adaptability", "adaptable", "quick learner"),
  ],
};

export const RESUME_ROLES = Object.keys(ROLE_SKILLS);

export const ACTION_VERBS = [
  "achieved", "built", "created", "designed", "developed", "delivered", "implemented", "improved", "increased", "reduced", "led", "managed",
  "launched", "organised", "organized", "optimised", "optimized", "automated", "analysed", "analyzed", "collaborated", "coordinated", "won", "mentored", "streamlined", "deployed",
];
