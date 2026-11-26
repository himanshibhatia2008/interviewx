// Edit this to put your name in the footer credit.
export const STUDENT_NAME = "Your Name";

export const TAGLINE = "Prepare Smarter. Interview Better. Get Hired.";

export const ROLES = [
  { id: "Software Developer", icon: "code", blurb: "DSA, OOP, systems & projects" },
  { id: "Web Developer", icon: "globe", blurb: "HTML, CSS, JavaScript & React" },
  { id: "Data Analyst", icon: "chart", blurb: "SQL, stats, dashboards" },
  { id: "HR / Management", icon: "people", blurb: "People, process, leadership" },
  { id: "Marketing", icon: "megaphone", blurb: "Campaigns, brand, growth" },
  { id: "Customer Support", icon: "headset", blurb: "Empathy, resolution, SLAs" },
  { id: "Fresher (General)", icon: "cap", blurb: "Aptitude, attitude, basics" },
];

export const DIFFICULTIES = [
  { id: "Beginner", hint: "Warm-up questions" },
  { id: "Intermediate", hint: "Realistic campus-placement level" },
  { id: "Advanced", hint: "Tough follow-ups and depth" },
];

export const TYPES = [
  { id: "HR Round", hint: "About you, goals, culture fit" },
  { id: "Technical Round", hint: "Role-specific knowledge" },
  { id: "Behavioural Round", hint: "Past situations (STAR)" },
  { id: "Mixed", hint: "A bit of everything" },
];

export const COUNTS = [2, 5, 8];

export const SECONDS_PER_QUESTION = 120;

export function rankFor(score10) {
  if (score10 >= 8.5) return { label: "Excellent", tone: "success" };
  if (score10 >= 7) return { label: "Interview Ready", tone: "violet" };
  if (score10 >= 5) return { label: "Good", tone: "amber" };
  return { label: "Needs Practice", tone: "coral" };
}
