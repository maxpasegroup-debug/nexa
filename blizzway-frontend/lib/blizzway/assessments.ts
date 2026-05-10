export type Assessment = {
  slug: string;
  title: string;
  category: string;
  description: string;
  purpose: string;
  measures: string[];
  timeRequired: string;
  creditCost: number;
  bdpImpact: string;
  repeatable: boolean;
  nexaRecommendation: string;
  sampleScore: number;
  strengths: string[];
  improvementAreas: string[];
  nextAssessments: string[];
  companions: string[];
};

export const assessmentCategories = [
  "Career Tests",
  "Psychometric",
  "IQ & Aptitude",
  "EQ & Emotional Intelligence",
  "CQ & Cultural Intelligence",
  "Communication",
  "Learning Style",
  "Academic Readiness",
  "Job Readiness",
  "Global Readiness",
  "Migration Readiness",
  "Happiness & Wellbeing",
  "Leadership",
  "Entrepreneurship",
];

export const assessments: Assessment[] = [
  {
    slug: "career-compass-starter",
    title: "Career Compass Starter",
    category: "Career Tests",
    description: "A gentle first map of interests, motivation, and best-fit pathway direction.",
    purpose: "Help NEXA understand your early career direction and confidence signals.",
    measures: ["Interest clusters", "Role-fit direction", "Motivation style", "Confidence blockers"],
    timeRequired: "12 min",
    creditCost: 0,
    bdpImpact: "Improves pathway accuracy",
    repeatable: true,
    nexaRecommendation: "Start here if your BDP is new or your direction feels scattered.",
    sampleScore: 82,
    strengths: ["Clear people-facing interest", "Strong creative problem solving", "High curiosity"],
    improvementAreas: ["Compare two role families", "Add proof stories to Soul Vault"],
    nextAssessments: ["Learning Style Lens", "Communication Spark"],
    companions: ["Pathway Planner", "Confidence Coach"],
  },
  {
    slug: "learning-style-lens",
    title: "Learning Style Lens",
    category: "Learning Style",
    description: "Find the study rhythm, content format, and practice style that helps you grow fastest.",
    purpose: "Tune Learning Garden recommendations to your preferred learning pattern.",
    measures: ["Visual learning", "Practice preference", "Reflection habits", "Focus rhythm"],
    timeRequired: "10 min",
    creditCost: 80,
    bdpImpact: "Improves learning fit",
    repeatable: true,
    nexaRecommendation: "Take this before choosing a new course or exam prep plan.",
    sampleScore: 76,
    strengths: ["Learns well through examples", "Benefits from short practice loops"],
    improvementAreas: ["Build revision rituals", "Reduce passive watching"],
    nextAssessments: ["Academic Readiness Check", "IQ Sprint"],
    companions: ["Study Gardener", "Habit Builder"],
  },
  {
    slug: "communication-spark",
    title: "Communication Spark",
    category: "Communication",
    description: "A practical readiness check for interviews, introductions, and confident expression.",
    purpose: "Reveal communication habits that affect interviews, networking, and public confidence.",
    measures: ["Clarity", "Listening", "Structure", "Presence"],
    timeRequired: "15 min",
    creditCost: 120,
    bdpImpact: "Improves confidence signal",
    repeatable: true,
    nexaRecommendation: "Recommended because stronger communication will lift your pathway readiness.",
    sampleScore: 71,
    strengths: ["Warm conversational tone", "Good story instincts"],
    improvementAreas: ["Answer structure", "Concise examples", "Follow-up questions"],
    nextAssessments: ["EQ Pulse", "Job Readiness Snapshot"],
    companions: ["Interview Coach", "Voice Practice"],
  },
  {
    slug: "eq-pulse",
    title: "EQ Pulse",
    category: "EQ & Emotional Intelligence",
    description: "A premium emotional awareness snapshot for collaboration, resilience, and leadership growth.",
    purpose: "Help BDP represent how you work with pressure, feedback, and people.",
    measures: ["Self-awareness", "Empathy", "Conflict response", "Resilience"],
    timeRequired: "18 min",
    creditCost: 150,
    bdpImpact: "Improves EQ metric",
    repeatable: false,
    nexaRecommendation: "Useful before leadership, admissions, or job readiness planning.",
    sampleScore: 88,
    strengths: ["High empathy", "Reflective decision making", "Steady under feedback"],
    improvementAreas: ["Boundary setting", "Assertive communication"],
    nextAssessments: ["Leadership Signal", "Happiness Baseline"],
    companions: ["Growth Journal", "Leadership Mentor"],
  },
  {
    slug: "global-readiness-scan",
    title: "Global Readiness Scan",
    category: "Global Readiness",
    description: "Check your readiness for international study, work, and cross-cultural environments.",
    purpose: "Give NEXA better signals for migration, global careers, and international admissions.",
    measures: ["Adaptability", "Documentation awareness", "Language confidence", "Cultural comfort"],
    timeRequired: "20 min",
    creditCost: 180,
    bdpImpact: "Improves global fit",
    repeatable: true,
    nexaRecommendation: "Recommended if your pathway includes study abroad, remote work, or migration.",
    sampleScore: 69,
    strengths: ["Open to new cultures", "Strong planning intent"],
    improvementAreas: ["Documentation readiness", "Country comparison", "Language practice"],
    nextAssessments: ["CQ Bridge", "Migration Readiness Mini"],
    companions: ["Global Guide", "Admissions Companion"],
  },
  {
    slug: "academic-readiness-check",
    title: "Academic Readiness Check",
    category: "Academic Readiness",
    description: "Check study preparedness, entrance planning, and college application confidence.",
    purpose: "Help NEXA recommend national and international admissions pathways with better academic-fit signals.",
    measures: ["Subject confidence", "Entrance readiness", "Study consistency", "Application preparedness"],
    timeRequired: "16 min",
    creditCost: 0,
    bdpImpact: "Improves admissions readiness",
    repeatable: true,
    nexaRecommendation: "Recommended before shortlisting colleges, courses, scholarships, or entrance exam plans.",
    sampleScore: 74,
    strengths: ["Clear academic interest", "Good planning mindset"],
    improvementAreas: ["Document readiness", "Entrance timeline", "Scholarship proof"],
    nextAssessments: ["Global Readiness Scan", "Career Compass Starter"],
    companions: ["Admissions Companion", "Entrance Planner"],
  },
  {
    slug: "happiness-baseline",
    title: "Happiness Baseline",
    category: "Happiness & Wellbeing",
    description: "A kindness-first wellbeing snapshot for energy, confidence, and sustainable ambition.",
    purpose: "Keep pathway recommendations healthy, humane, and confidence-aware.",
    measures: ["Energy", "Belonging", "Stress load", "Optimism"],
    timeRequired: "8 min",
    creditCost: 0,
    bdpImpact: "Improves happiness guidance",
    repeatable: true,
    nexaRecommendation: "Take this whenever your motivation feels low or your next step feels heavy.",
    sampleScore: 74,
    strengths: ["Optimistic long-term view", "Responsive to encouragement"],
    improvementAreas: ["Recovery routines", "Smaller next actions"],
    nextAssessments: ["EQ Pulse", "Learning Style Lens"],
    companions: ["Calm Planner", "NEXA Check-in"],
  },
];

export function getAssessment(slug: string) {
  return assessments.find((assessment) => assessment.slug === slug);
}
