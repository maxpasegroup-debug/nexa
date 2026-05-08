export type BlizzwayCatalogueItem = {
  name: string;
  category: string;
  description: string;
  credits: number;
  level: "Starter" | "Guided" | "Advanced" | "Premium";
  recommended?: boolean;
};

export type BlizzwayCatalogueGroup = {
  title: string;
  tone: string;
  summary: string;
  items: BlizzwayCatalogueItem[];
};

export const blizzwayCatalogue: BlizzwayCatalogueGroup[] = [
  {
    title: "Resume & Profile",
    tone: "Profile magic",
    summary: "Shape proof, presence, and first impressions into a premium career identity.",
    items: [
      { name: "Resume Architect Companion", category: "Resume & Profile", description: "Turns scattered experience into a confident, recruiter-ready story.", credits: 180, level: "Guided", recommended: true },
      { name: "ATS Scan Tool", category: "Resume & Profile", description: "Gently checks resume fit so applications feel clearer and less random.", credits: 90, level: "Starter" },
      { name: "Digital Profile Builder", category: "Resume & Profile", description: "Creates a polished online identity for students and professionals.", credits: 160, level: "Guided" },
      { name: "LinkedIn Companion", category: "Resume & Profile", description: "Makes your LinkedIn feel warm, credible, and opportunity-ready.", credits: 140, level: "Starter" },
      { name: "Portfolio Builder", category: "Resume & Profile", description: "Helps convert projects and wins into visible proof-of-work.", credits: 220, level: "Advanced", recommended: true },
    ],
  },
  {
    title: "Language & Communication",
    tone: "Voice confidence",
    summary: "Build calm fluency, global communication, and interview-ready expression.",
    items: [
      { name: "English Companion", category: "Language & Communication", description: "Builds everyday confidence for speaking, writing, and interviews.", credits: 140, level: "Starter", recommended: true },
      { name: "IELTS Companion", category: "Language & Communication", description: "Guides band-focused practice with encouraging, structured feedback.", credits: 240, level: "Advanced" },
      { name: "German Companion", category: "Language & Communication", description: "Supports early German learning for study, work, and mobility dreams.", credits: 220, level: "Guided" },
      { name: "French Companion", category: "Language & Communication", description: "Creates a gentle French practice lane for global aspirations.", credits: 220, level: "Guided" },
      { name: "Accent Coach", category: "Language & Communication", description: "Softens speaking anxiety with clear pronunciation practice.", credits: 160, level: "Guided" },
      { name: "Business Communication Companion", category: "Language & Communication", description: "Helps messages, meetings, and presentations sound calm and premium.", credits: 210, level: "Advanced", recommended: true },
    ],
  },
  {
    title: "Exam Coaching",
    tone: "Study clarity",
    summary: "Keep preparation organized, less stressful, and easier to repeat.",
    items: [
      { name: "School Exam Companion", category: "Exam Coaching", description: "Creates a calm revision path for school learners and parents.", credits: 120, level: "Starter" },
      { name: "Competitive Exam Companion", category: "Exam Coaching", description: "Turns big preparation into structured weekly study wins.", credits: 230, level: "Advanced", recommended: true },
      { name: "IELTS/TOEFL/GRE/GMAT Companion", category: "Exam Coaching", description: "Builds a global exam plan with practice, review, and confidence.", credits: 280, level: "Premium" },
      { name: "Study Planner", category: "Exam Coaching", description: "Designs focused study routines that feel achievable, not heavy.", credits: 100, level: "Starter" },
      { name: "Doubt Solver", category: "Exam Coaching", description: "Helps learners unblock confusion with patient explanations.", credits: 80, level: "Starter" },
    ],
  },
  {
    title: "Career Growth",
    tone: "Direction engine",
    summary: "Find the right direction, prepare for opportunities, and negotiate with confidence.",
    items: [
      { name: "Career Pathway Companion", category: "Career Growth", description: "Maps your next career chapter into practical, hopeful steps.", credits: 260, level: "Premium", recommended: true },
      { name: "Skill Gap Analyzer", category: "Career Growth", description: "Shows what to learn next without making growth feel overwhelming.", credits: 170, level: "Guided" },
      { name: "Interview Companion", category: "Career Growth", description: "Practices answers while protecting confidence and clarity.", credits: 200, level: "Guided", recommended: true },
      { name: "Job Match Companion", category: "Career Growth", description: "Connects your profile to roles that feel realistic and energizing.", credits: 190, level: "Guided" },
      { name: "Salary Negotiation Companion", category: "Career Growth", description: "Prepares calm, respectful conversations around value and pay.", credits: 240, level: "Advanced" },
    ],
  },
  {
    title: "Migration & Global Mobility",
    tone: "Global pathway",
    summary: "Prepare for countries, universities, documents, and relocation with less confusion.",
    items: [
      { name: "Country Fit Companion", category: "Migration & Global Mobility", description: "Compares global options through goals, budget, and readiness.", credits: 260, level: "Advanced", recommended: true },
      { name: "Visa Companion", category: "Migration & Global Mobility", description: "Organizes visa readiness questions into a calmer checklist.", credits: 280, level: "Premium" },
      { name: "SOP/LOR Companion", category: "Migration & Global Mobility", description: "Shapes personal stories and recommendations with clarity and warmth.", credits: 230, level: "Advanced" },
      { name: "University Shortlisting Companion", category: "Migration & Global Mobility", description: "Helps shortlist universities around fit, ambition, and practicality.", credits: 250, level: "Advanced" },
      { name: "Relocation Planner", category: "Migration & Global Mobility", description: "Turns moving abroad into visible preparation steps.", credits: 220, level: "Guided" },
    ],
  },
  {
    title: "Earning & Money Discipline",
    tone: "Income confidence",
    summary: "Explore earning paths, compare offers, and build healthy money habits.",
    items: [
      { name: "Freelance Finder", category: "Earning & Money Discipline", description: "Finds small service ideas that match your skills and confidence.", credits: 170, level: "Guided", recommended: true },
      { name: "Internship Finder", category: "Earning & Money Discipline", description: "Helps students discover starter opportunities with less anxiety.", credits: 150, level: "Starter" },
      { name: "Side Hustle Companion", category: "Earning & Money Discipline", description: "Turns interests into practical, low-risk earning experiments.", credits: 190, level: "Guided" },
      { name: "Money Discipline Companion", category: "Earning & Money Discipline", description: "Builds calm spending, saving, and weekly money awareness.", credits: 120, level: "Starter" },
      { name: "Income Tracker", category: "Earning & Money Discipline", description: "Keeps dummy income goals and progress easy to understand.", credits: 100, level: "Starter" },
      { name: "Offer Comparator", category: "Earning & Money Discipline", description: "Compares roles, internships, and offers with practical clarity.", credits: 180, level: "Guided" },
    ],
  },
  {
    title: "Happiness & Personal Growth",
    tone: "Inner momentum",
    summary: "Protect focus, confidence, habits, reflection, and sustainable growth.",
    items: [
      { name: "Focus Companion", category: "Happiness & Personal Growth", description: "Keeps attention gentle and grounded during important weeks.", credits: 110, level: "Starter" },
      { name: "Confidence Companion", category: "Happiness & Personal Growth", description: "Helps users remember strengths before high-pressure moments.", credits: 130, level: "Starter", recommended: true },
      { name: "Habit Companion", category: "Happiness & Personal Growth", description: "Turns ambition into small routines that feel kind and repeatable.", credits: 120, level: "Starter" },
      { name: "Burnout Watch", category: "Happiness & Personal Growth", description: "Encourages healthier pacing before motivation turns heavy.", credits: 160, level: "Guided" },
      { name: "Weekly Reflection Companion", category: "Happiness & Personal Growth", description: "Makes reflection feel rewarding and useful for future growth.", credits: 100, level: "Starter" },
    ],
  },
  {
    title: "Blizzway Premium",
    tone: "Dreamscape intelligence",
    summary: "High-touch dummy pathways for deeper transformation, planning, and future vision.",
    items: [
      { name: "Guardian Angel Pathway", category: "Blizzway Premium", description: "A premium guided experience with NEXA watching the full journey.", credits: 500, level: "Premium", recommended: true },
      { name: "Magical Career Roadmap", category: "Blizzway Premium", description: "Creates a beautiful multi-stage roadmap from dream to launch.", credits: 420, level: "Premium" },
      { name: "Future Vision Simulator", category: "Blizzway Premium", description: "Explores 6-month, 1-year, 3-year, and 5-year futures.", credits: 360, level: "Advanced", recommended: true },
      { name: "90-Day Transformation Path", category: "Blizzway Premium", description: "Turns the next quarter into an inspiring, measurable growth arc.", credits: 450, level: "Premium" },
      { name: "1-Year Dream Pathway", category: "Blizzway Premium", description: "Builds a long-range journey around happiness, proof, and opportunity.", credits: 620, level: "Premium" },
    ],
  },
];

export const allBlizzwayCatalogueItems = blizzwayCatalogue.flatMap((group) => group.items);
