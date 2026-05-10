export type AdmissionPathway = {
  slug: string;
  title: string;
  location: string;
  countryRegion: string;
  level: "UG" | "PG" | "Diploma" | "Certification";
  mode: "National" | "International";
  intakeDeadline: string;
  eligibilityStatus: string;
  credits: string;
  eligibilitySummary: string;
  documents: string[];
  deadlines: string[];
  budget: string;
  scholarships: string[];
  nexaAdvice: string;
  recommendedAssessments: string[];
  recommendedCompanions: string[];
};

export const admissionsCategories = [
  "Indian Colleges",
  "Study Abroad",
  "Scholarships",
  "Entrance Exams",
  "SOP & LOR",
  "Visa Readiness",
  "Course Finder",
  "University Shortlist",
  "Application Tracker",
];

export const admissionPathways: AdmissionPathway[] = [
  {
    slug: "india-computer-science-ug",
    title: "Computer Science UG Pathway",
    location: "India",
    countryRegion: "Indian Colleges",
    level: "UG",
    mode: "National",
    intakeDeadline: "July 2026 intake, forms open soon",
    eligibilityStatus: "Likely eligible",
    credits: "120 credits placeholder",
    eligibilitySummary: "Strong fit for students with mathematics, coding interest, and entrance exam preparation intent.",
    documents: ["Class 10 marksheet", "Class 12 marksheet", "Entrance score", "Identity proof", "Category certificate if applicable"],
    deadlines: ["Entrance exam window: Apr-May 2026", "Counselling: Jun-Jul 2026", "Document verification: Jul 2026"],
    budget: "INR 2L-12L per year placeholder",
    scholarships: ["Merit scholarship", "Need-based aid", "State education support"],
    nexaAdvice: "Pair Academic Readiness with Career Compass Starter before finalizing your shortlist.",
    recommendedAssessments: ["Academic Readiness Check", "Career Compass Starter", "IQ Sprint"],
    recommendedCompanions: ["Admissions Companion", "Entrance Planner", "BDP Profile Coach"],
  },
  {
    slug: "canada-business-diploma",
    title: "Business Diploma Canada Route",
    location: "Canada",
    countryRegion: "Study Abroad",
    level: "Diploma",
    mode: "International",
    intakeDeadline: "September 2026 intake, shortlist by March",
    eligibilityStatus: "Needs language proof",
    credits: "180 credits placeholder",
    eligibilitySummary: "Good option for students seeking practical business exposure with international work-readiness planning.",
    documents: ["Academic transcripts", "Passport", "English test score", "SOP", "Financial proof"],
    deadlines: ["College shortlist: Feb 2026", "Applications: Mar-Apr 2026", "Visa file: Jun 2026"],
    budget: "CAD 18K-32K per year placeholder",
    scholarships: ["International entrance award", "College bursary", "Early applicant waiver"],
    nexaAdvice: "Complete Global Readiness Scan and Communication Spark before SOP drafting.",
    recommendedAssessments: ["Global Readiness Scan", "Communication Spark", "Learning Style Lens"],
    recommendedCompanions: ["Global Guide", "SOP Mentor", "Visa Readiness Coach"],
  },
  {
    slug: "uk-data-science-pg",
    title: "Data Science PG UK Pathway",
    location: "United Kingdom",
    countryRegion: "Study Abroad",
    level: "PG",
    mode: "International",
    intakeDeadline: "January 2027 intake, scholarship review open",
    eligibilityStatus: "Profile review needed",
    credits: "220 credits placeholder",
    eligibilitySummary: "Best for graduates with quantitative background, project proof, and clear career intent.",
    documents: ["Degree transcripts", "CV", "SOP", "Two LORs", "English test score", "Portfolio proof"],
    deadlines: ["Scholarship scan: Aug 2026", "Applications: Sep-Oct 2026", "CAS and visa: Nov-Dec 2026"],
    budget: "GBP 24K-42K total placeholder",
    scholarships: ["Global excellence award", "Women in STEM award", "University country scholarship"],
    nexaAdvice: "Strengthen BDP proof stories and take Academic Readiness before applying.",
    recommendedAssessments: ["Academic Readiness Check", "Global Readiness Scan", "EQ Pulse"],
    recommendedCompanions: ["Scholarship Finder", "Portfolio Coach", "Global Guide"],
  },
  {
    slug: "india-design-certification",
    title: "Design Foundation Certification",
    location: "India and online",
    countryRegion: "Course Finder",
    level: "Certification",
    mode: "National",
    intakeDeadline: "Rolling intake placeholder",
    eligibilityStatus: "Eligible",
    credits: "60 credits placeholder",
    eligibilitySummary: "A low-risk exploration route for learners considering design, product, or creative technology.",
    documents: ["Identity proof", "Education proof", "Portfolio samples if available"],
    deadlines: ["Rolling applications", "Portfolio review every month", "Start date within 30 days"],
    budget: "INR 35K-1.5L placeholder",
    scholarships: ["Early learner grant", "Portfolio promise discount"],
    nexaAdvice: "Use this route to test interest before committing to a full degree pathway.",
    recommendedAssessments: ["Career Compass Starter", "Learning Style Lens", "Communication Spark"],
    recommendedCompanions: ["Course Finder", "Portfolio Coach", "Confidence Coach"],
  },
];

export function getAdmissionPathway(slug: string) {
  return admissionPathways.find((pathway) => pathway.slug === slug);
}
