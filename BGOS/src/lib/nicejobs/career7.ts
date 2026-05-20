export type Career7Language = "en" | "ml" | "ta" | "kn" | "hi";

export const career7Languages: Array<{ code: Career7Language; label: string; nativeLabel: string }> = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

export const career7Products = [
  {
    title: "Free Career Test",
    audience: "Students",
    price: "Free entry",
    commission: "Level unlock",
    description: "The easiest first step. Help students take a free Career7 test and build trust before paid products.",
  },
  {
    title: "CareerX Intelligence Test",
    audience: "Students and parents",
    price: "Paid test/top-up",
    commission: "50% post-GST",
    description: "Core assessment product for career clarity, strengths, and student direction.",
  },
  {
    title: "C7DP Digital Biodata",
    audience: "Students and job seekers",
    price: "Profile package",
    commission: "40%",
    description: "AI career profile with biodata, assessment summary, strengths, and shareable career identity.",
  },
  {
    title: "AI Career Tools Pack",
    audience: "College and job seekers",
    price: "Tool bundle",
    commission: "Up to 50%",
    description: "Resume, biodata, LinkedIn, interview prep, and career document tools in one practical pack.",
  },
];

export const career7CommissionNotes = [
  "Career7 paid assessments/top-ups: 50% of post-GST net amount.",
  "C7DP Digital Biodata: 40% commission.",
  "AI career tools: up to 50% depending on product.",
  "LinkedIn, resume, biodata service work: 35% commission.",
];

export type Career7Lesson = {
  key: string;
  level: number;
  day: number;
  badge: string;
  reward: string;
  titles: Record<Career7Language, string>;
  intro: Record<Career7Language, string>;
  steps: Record<Career7Language, string[]>;
  task: Record<Career7Language, string>;
  quote: Record<Career7Language, string>;
};

export const career7Lessons: Career7Lesson[] = [
  {
    key: "intro-1-career7",
    level: 0,
    day: 1,
    badge: "Career7 Starter",
    reward: "Understand the product",
    titles: {
      en: "Introduction 1: What is Career7?",
      ml: "പരിചയം 1: Career7 എന്താണ്?",
      ta: "அறிமுகம் 1: Career7 என்றால் என்ன?",
      kn: "ಪರಿಚಯ 1: Career7 ಅಂದರೆ ಏನು?",
      hi: "परिचय 1: Career7 क्या है?",
    },
    intro: {
      en: "Career7 is an AI career intelligence platform. It helps students and job seekers understand their strengths, choose better paths, and build better career documents.",
      ml: "Career7 വിദ്യാർത്ഥികൾക്കും ജോലി അന്വേഷിക്കുന്നവർക്കും സ്വന്തം കഴിവ്, ശരിയായ കരിയർ വഴി, നല്ല ബയോഡാറ്റ എന്നിവ മനസ്സിലാക്കാൻ സഹായിക്കുന്ന AI career intelligence platform ആണ്.",
      ta: "Career7 என்பது மாணவர்கள் மற்றும் வேலை தேடுபவர்கள் தங்கள் திறன், சரியான career பாதை, நல்ல biodata ஆகியவற்றை புரிந்து கொள்ள உதவும் AI career intelligence platform.",
      kn: "Career7 ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಉದ್ಯೋಗ ಹುಡುಕುವವರು ತಮ್ಮ ಶಕ್ತಿ, ಸರಿಯಾದ career ದಾರಿ, ಉತ್ತಮ biodata ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುವ AI career intelligence platform.",
      hi: "Career7 एक AI career intelligence platform है. यह students और job seekers को अपनी strength, सही career direction और बेहतर biodata समझने में मदद करता है.",
    },
    steps: {
      en: ["Remember one line: Career7 helps people choose and build better careers.", "Do not start by selling. Start by offering a free test.", "Your work is to guide, share your code, and follow up."],
      ml: ["ഒരു വരി ഓർക്കുക: Career7 ആളുകൾക്ക് നല്ല career വഴി കണ്ടെത്താൻ സഹായിക്കുന്നു.", "ആദ്യമായി വിൽക്കാൻ നോക്കണ്ട. free test പറയുക.", "നിങ്ങളുടെ ജോലി guide ചെയ്യുക, code share ചെയ്യുക, follow up ചെയ്യുക."],
      ta: ["ஒரு வரி மனதில் வைங்க: Career7 நல்ல career முடிவு எடுக்க உதவும்.", "முதலில் விற்க முயற்சி வேண்டாம். free test சொல்லுங்கள்.", "உங்கள் வேலை guide பண்ணுவது, code share பண்ணுவது, follow up பண்ணுவது."],
      kn: ["ಒಂದು ಸಾಲು ನೆನಪಿಡಿ: Career7 ಉತ್ತಮ career ಆಯ್ಕೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.", "ಮೊದಲು ಮಾರಾಟ ಮಾಡಬೇಡಿ. free test ಹೇಳಿ.", "ನಿಮ್ಮ ಕೆಲಸ guide ಮಾಡುವುದು, code share ಮಾಡುವುದು, follow up ಮಾಡುವುದು."],
      hi: ["एक लाइन याद रखें: Career7 लोगों को बेहतर career चुनने में मदद करता है.", "पहले बेचने की कोशिश मत कीजिए. free test से शुरू कीजिए.", "आपका काम guide करना, code share करना और follow up करना है."],
    },
    task: {
      en: "Tell one friend or family member: Career7 gives students a free career clarity test.",
      ml: "ഒരു സുഹൃത്തിനോ ബന്ധുവിനോ പറയുക: Career7 students-ന് free career clarity test നൽകുന്നു.",
      ta: "ஒரு நண்பரிடம் அல்லது உறவினரிடம் சொல்லுங்கள்: Career7 students-க்கு free career clarity test தருகிறது.",
      kn: "ಒಬ್ಬ ಸ್ನೇಹಿತ ಅಥವಾ ಬಂಧುವಿಗೆ ಹೇಳಿ: Career7 students ಗೆ free career clarity test ಕೊಡುತ್ತದೆ.",
      hi: "एक दोस्त या रिश्तेदार को बताइए: Career7 students को free career clarity test देता है.",
    },
    quote: {
      en: "Start small. One clear explanation can create your first earning path.",
      ml: "ചെറുതായി തുടങ്ങുക. ഒരു നല്ല വിശദീകരണം ആദ്യ earning വഴിയാകാം.",
      ta: "சிறியதாக தொடங்குங்கள். ஒரு தெளிவான விளக்கம் முதல் earning வாய்ப்பாகும்.",
      kn: "ಸಣ್ಣದಾಗಿ ಪ್ರಾರಂಭಿಸಿ. ಒಂದು ಸ್ಪಷ್ಟ ಮಾತು ಮೊದಲ earning ದಾರಿ ಆಗಬಹುದು.",
      hi: "छोटा शुरू कीजिए. एक साफ बात आपकी पहली earning का रास्ता बना सकती है.",
    },
  },
  {
    key: "intro-2-audience",
    level: 0,
    day: 2,
    badge: "Audience Finder",
    reward: "Know who to contact",
    titles: {
      en: "Introduction 2: Who needs Career7?",
      ml: "പരിചയം 2: Career7 ആര്ക്ക് വേണ്ടത്?",
      ta: "அறிமுகம் 2: Career7 யாருக்கு தேவை?",
      kn: "ಪರಿಚಯ 2: Career7 ಯಾರಿಗೆ ಬೇಕು?",
      hi: "परिचय 2: Career7 किसे चाहिए?",
    },
    intro: {
      en: "Career7 is useful for school students, college students, parents, job seekers, and people who want better career documents.",
      ml: "Career7 school students, college students, parents, job seekers, നല്ല resume/biodata വേണമെന്നുള്ളവർക്ക് ഉപയോഗപ്പെടും.",
      ta: "Career7 school students, college students, parents, job seekers, நல்ல resume/biodata வேண்டும் என்பவர்களுக்கு உதவும்.",
      kn: "Career7 school students, college students, parents, job seekers ಮತ್ತು ಉತ್ತಮ resume/biodata ಬೇಕಿರುವವರಿಗೆ ಉಪಯುಕ್ತ.",
      hi: "Career7 school students, college students, parents, job seekers और बेहतर resume/biodata चाहने वालों के लिए उपयोगी है.",
    },
    steps: {
      en: ["Make a list of 10 people: students, parents, or job seekers.", "Do not judge who will buy. First ask who wants a free test.", "Save the names in your phone notes."],
      ml: ["10 പേരുടെ list ഉണ്ടാക്കുക: students, parents, job seekers.", "ആരാണ് വാങ്ങുക എന്ന് ആദ്യം തീരുമാനിക്കണ്ട. free test വേണോ എന്ന് ചോദിക്കുക.", "പേരുകൾ phone notes-ൽ save ചെയ്യുക."],
      ta: ["10 பேரின் list எடுக்கவும்: students, parents, job seekers.", "யார் வாங்குவார்கள் என்று முன்பே முடிவு செய்ய வேண்டாம். free test வேண்டுமா என்று கேளுங்கள்.", "பெயர்களை phone notes-ல் save செய்யுங்கள்."],
      kn: ["10 ಜನರ list ಮಾಡಿ: students, parents, job seekers.", "ಯಾರು ಖರೀದಿಸುತ್ತಾರೆ ಎಂದು ಮೊದಲು ತೀರ್ಮಾನಿಸಬೇಡಿ. free test ಬೇಕಾ ಎಂದು ಕೇಳಿ.", "ಹೆಸರುಗಳನ್ನು phone notes ನಲ್ಲಿ save ಮಾಡಿ."],
      hi: ["10 लोगों की list बनाइए: students, parents, job seekers.", "कौन खरीदेगा यह पहले मत सोचिए. पहले free test पूछिए.", "नाम phone notes में save कर लीजिए."],
    },
    task: {
      en: "Create your first 10-person contact list.",
      ml: "ആദ്യ 10 പേരുടെ contact list തയ്യാറാക്കുക.",
      ta: "முதல் 10 பேரின் contact list தயார் செய்யுங்கள்.",
      kn: "ಮೊದಲ 10 ಜನರ contact list ಮಾಡಿ.",
      hi: "पहली 10 लोगों की contact list बनाइए.",
    },
    quote: {
      en: "Income starts with a list. Your list is your first asset.",
      ml: "Income ഒരു list-ൽ നിന്നാണ് തുടങ്ങുന്നത്. നിങ്ങളുടെ list ആണ് ആദ്യ asset.",
      ta: "Income ஒரு list-லிருந்து துவங்கும். உங்கள் list தான் முதல் asset.",
      kn: "Income ಒಂದು list ಇಂದ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ. ನಿಮ್ಮ list ನಿಮ್ಮ ಮೊದಲ asset.",
      hi: "Income list से शुरू होती है. आपकी list आपकी पहली asset है.",
    },
  },
  {
    key: "level-1-free-test",
    level: 1,
    day: 3,
    badge: "Free Test Mission",
    reward: "Unlock paid test training after 10 free tests",
    titles: {
      en: "Level 1: Get 10 students to take the free test",
      ml: "Level 1: 10 students free test ചെയ്യിക്കുക",
      ta: "Level 1: 10 students free test எழுத வைக்கவும்",
      kn: "Level 1: 10 students free test ಮಾಡಿಸಿರಿ",
      hi: "Level 1: 10 students से free test करवाइए",
    },
    intro: {
      en: "Your first real mission is simple: use your referral code and help 10 students start the free Career7 test.",
      ml: "നിങ്ങളുടെ ആദ്യ mission simple ആണ്: referral code ഉപയോഗിച്ച് 10 students free Career7 test തുടങ്ങാൻ സഹായിക്കുക.",
      ta: "உங்கள் முதல் mission simple: referral code வைத்து 10 students free Career7 test தொடங்க உதவுங்கள்.",
      kn: "ನಿಮ್ಮ ಮೊದಲ mission simple: referral code ಬಳಸಿ 10 students free Career7 test ಶುರು ಮಾಡಿಸಲು ಸಹಾಯ ಮಾಡಿ.",
      hi: "आपका पहला mission simple है: referral code से 10 students को free Career7 test start करवाना है.",
    },
    steps: {
      en: ["Copy your Career7 referral code.", "Send the ready message to 10 students or parents.", "Say: It is free. Just try and see the result.", "Come back and mark this task done."],
      ml: ["Career7 referral code copy ചെയ്യുക.", "ready message 10 students/parents-ന് അയയ്ക്കുക.", "ഇത് free ആണ്, ഒന്ന് try ചെയ്തു result നോക്കൂ എന്ന് പറയുക.", "തിരിച്ച് വന്ന് task done mark ചെയ്യുക."],
      ta: ["Career7 referral code copy செய்யுங்கள்.", "ready message 10 students/parents-க்கு அனுப்புங்கள்.", "இது free, ஒரு முறை try பண்ணி result பாருங்கள் என்று சொல்லுங்கள்.", "திரும்பி வந்து task done mark செய்யுங்கள்."],
      kn: ["Career7 referral code copy ಮಾಡಿ.", "ready message ಅನ್ನು 10 students/parents ಗೆ ಕಳುಹಿಸಿ.", "ಇದು free, ಒಮ್ಮೆ try ಮಾಡಿ result ನೋಡಿ ಎಂದು ಹೇಳಿ.", "ಮತ್ತೆ ಬಂದು task done mark ಮಾಡಿ."],
      hi: ["Career7 referral code copy कीजिए.", "ready message 10 students/parents को भेजिए.", "बोलिए: यह free है, एक बार try करके result देखिए.", "वापस आकर task done mark कीजिए."],
    },
    task: {
      en: "Share your code with 10 students or parents today.",
      ml: "ഇന്ന് 10 students/parents-ന് code share ചെയ്യുക.",
      ta: "இன்று 10 students/parents-க்கு code share செய்யுங்கள்.",
      kn: "ಇಂದು 10 students/parents ಗೆ code share ಮಾಡಿ.",
      hi: "आज 10 students/parents को code share कीजिए.",
    },
    quote: {
      en: "Do not chase sales today. Build trust with the free test.",
      ml: "ഇന്ന് sale പിന്നാലെ പോകണ്ട. free test കൊണ്ട് trust ഉണ്ടാക്കുക.",
      ta: "இன்று sales பின்தொடர வேண்டாம். free test மூலம் trust உருவாக்குங்கள்.",
      kn: "ಇಂದು sales ಹಿಂದೆ ಓಡಬೇಡಿ. free test ಮೂಲಕ trust ಕಟ್ಟಿರಿ.",
      hi: "आज sales के पीछे मत भागिए. free test से trust बनाइए.",
    },
  },
  {
    key: "level-2-careerx",
    level: 2,
    day: 4,
    badge: "CareerX Promoter",
    reward: "Paid assessment earning starts here",
    titles: {
      en: "Level 2: Promote CareerX Intelligence Test",
      ml: "Level 2: CareerX Intelligence Test promote ചെയ്യുക",
      ta: "Level 2: CareerX Intelligence Test promote செய்யுங்கள்",
      kn: "Level 2: CareerX Intelligence Test promote ಮಾಡಿ",
      hi: "Level 2: CareerX Intelligence Test promote कीजिए",
    },
    intro: {
      en: "After free test interest, explain the paid CareerX Intelligence Test. This is where real sales can begin.",
      ml: "free test interest വന്നാൽ CareerX Intelligence Test explain ചെയ്യുക. ഇവിടെ നിന്നാണ് real sales തുടങ്ങുന്നത്.",
      ta: "free test interest வந்த பிறகு CareerX Intelligence Test explain செய்யுங்கள். இங்கிருந்து real sales தொடங்கும்.",
      kn: "free test interest ಬಂದ ನಂತರ CareerX Intelligence Test explain ಮಾಡಿ. ಇಲ್ಲಿಂದ real sales ಶುರುವಾಗುತ್ತದೆ.",
      hi: "free test interest आने के बाद CareerX Intelligence Test समझाइए. यहीं से real sales शुरू होती है.",
    },
    steps: {
      en: ["Follow up with students who took or asked about the free test.", "Tell parents this gives deeper clarity.", "Use simple words: strengths, interest, career direction.", "Share only with interested people first."],
      ml: ["free test എടുത്തവരെയോ ചോദിച്ചവരെയോ follow up ചെയ്യുക.", "ഇത് കൂടുതൽ clarity നൽകും എന്ന് parents-ന് പറയുക.", "strengths, interest, career direction എന്ന് simple ആയി പറയുക.", "ആദ്യം interested ആളുകൾക്ക് മാത്രം share ചെയ്യുക."],
      ta: ["free test எடுத்தவர்கள் அல்லது கேட்டவர்களை follow up செய்யுங்கள்.", "இது deeper clarity தரும் என்று parents-க்கு சொல்லுங்கள்.", "strengths, interest, career direction என்று simple-ஆ சொல்லுங்கள்.", "முதலில் interested people-க்கு மட்டும் share செய்யுங்கள்."],
      kn: ["free test ತೆಗೆದುಕೊಂಡವರು ಅಥವಾ ಕೇಳಿದವರ follow up ಮಾಡಿ.", "ಇದು deeper clarity ಕೊಡುತ್ತದೆ ಎಂದು parents ಗೆ ಹೇಳಿ.", "strengths, interest, career direction ಎಂದು simple ಆಗಿ ಹೇಳಿ.", "ಮೊದಲು interested ಜನರಿಗೆ ಮಾತ್ರ share ಮಾಡಿ."],
      hi: ["free test लेने या पूछने वालों का follow up कीजिए.", "Parents को बताइए कि इससे deeper clarity मिलती है.", "Simple words use कीजिए: strengths, interest, career direction.", "पहले interested लोगों को ही share कीजिए."],
    },
    task: {
      en: "Follow up with 5 people from your free-test list.",
      ml: "free-test list-ൽ നിന്ന് 5 പേരെ follow up ചെയ്യുക.",
      ta: "free-test list-லிருந்து 5 பேரை follow up செய்யுங்கள்.",
      kn: "free-test list ನಿಂದ 5 ಜನರ follow up ಮಾಡಿ.",
      hi: "free-test list से 5 लोगों का follow up कीजिए.",
    },
    quote: {
      en: "Follow-up is where earning begins. Ask gently, explain clearly.",
      ml: "Follow-up-ലാണ് earning തുടങ്ങുന്നത്. മൃദുവായി ചോദിക്കുക, വ്യക്തമായി explain ചെയ്യുക.",
      ta: "Follow-up-ல்தான் earning தொடங்கும். மெதுவாக கேளுங்கள், தெளிவாக explain செய்யுங்கள்.",
      kn: "Follow-up ಇಂದ earning ಶುರುವಾಗುತ್ತದೆ. ಮೃದುವಾಗಿ ಕೇಳಿ, ಸ್ಪಷ್ಟವಾಗಿ explain ಮಾಡಿ.",
      hi: "Follow-up से earning शुरू होती है. धीरे पूछिए, साफ समझाइए.",
    },
  },
  {
    key: "level-3-c7dp",
    level: 3,
    day: 5,
    badge: "Digital Profile Guide",
    reward: "C7DP Digital Biodata product unlocked",
    titles: {
      en: "Level 3: Sell C7DP Digital Biodata",
      ml: "Level 3: C7DP Digital Biodata explain ചെയ്യുക",
      ta: "Level 3: C7DP Digital Biodata explain செய்யுங்கள்",
      kn: "Level 3: C7DP Digital Biodata explain ಮಾಡಿ",
      hi: "Level 3: C7DP Digital Biodata समझाइए",
    },
    intro: {
      en: "C7DP is a digital career biodata. It is useful for students, job seekers, and parents who want one clean career profile.",
      ml: "C7DP ഒരു digital career biodata ആണ്. students, job seekers, parents-ന് ഒരൊറ്റ clean career profile ആയി ഉപയോഗപ്പെടും.",
      ta: "C7DP ஒரு digital career biodata. students, job seekers, parents-க்கு clean career profile ஆக உதவும்.",
      kn: "C7DP ಒಂದು digital career biodata. students, job seekers, parents ಗೆ clean career profile ಆಗಿ ಉಪಯುಕ್ತ.",
      hi: "C7DP एक digital career biodata है. Students, job seekers और parents के लिए clean career profile बनता है.",
    },
    steps: {
      en: ["Explain it as a career profile, not just biodata.", "Say it can include strengths, tests, education, skills, and AI summary.", "Best audience: college students and job seekers.", "Offer it after they show interest in Career7."],
      ml: ["ഇത് biodata മാത്രം അല്ല, career profile ആണെന്ന് പറയുക.", "strengths, tests, education, skills, AI summary ഉൾപ്പെടും എന്ന് പറയുക.", "college students/job seekers ആണ് best.", "Career7-ൽ interest കാണിച്ചാൽ offer ചെയ്യുക."],
      ta: ["இது biodata மட்டும் இல்லை, career profile என்று சொல்லுங்கள்.", "strengths, tests, education, skills, AI summary இருக்கும் என்று சொல்லுங்கள்.", "college students/job seekers best audience.", "Career7 interest காட்டிய பிறகு offer செய்யுங்கள்."],
      kn: ["ಇದು biodata ಮಾತ್ರ ಅಲ್ಲ, career profile ಎಂದು ಹೇಳಿ.", "strengths, tests, education, skills, AI summary ಇರಬಹುದು ಎಂದು ಹೇಳಿ.", "college students/job seekers best audience.", "Career7 interest ತೋರಿದ ಮೇಲೆ offer ಮಾಡಿ."],
      hi: ["इसे सिर्फ biodata नहीं, career profile कहिए.", "इसमें strengths, tests, education, skills और AI summary हो सकती है.", "Best audience: college students और job seekers.", "Career7 interest के बाद offer कीजिए."],
    },
    task: {
      en: "Find 3 college students or job seekers who need a better biodata/profile.",
      ml: "നല്ല biodata/profile വേണ്ട 3 college students/job seekers കണ്ടെത്തുക.",
      ta: "நல்ல biodata/profile தேவைப்படும் 3 college students/job seekers கண்டுபிடியுங்கள்.",
      kn: "ಉತ್ತಮ biodata/profile ಬೇಕಿರುವ 3 college students/job seekers ಹುಡುಕಿ.",
      hi: "बेहतर biodata/profile चाहने वाले 3 college students/job seekers ढूंढिए.",
    },
    quote: {
      en: "A clear profile gives confidence. You are helping people present themselves better.",
      ml: "ഒരു clear profile confidence നൽകും. ആളുകൾക്ക് സ്വയം നല്ല രീതിയിൽ present ചെയ്യാൻ നിങ്ങൾ സഹായിക്കുന്നു.",
      ta: "ஒரு clear profile confidence தரும். மக்கள் தங்களை நல்லபடி present செய்ய நீங்கள் உதவுகிறீர்கள்.",
      kn: "ಒಂದು clear profile confidence ಕೊಡುತ್ತದೆ. ಜನರು ತಮ್ಮನ್ನು ಉತ್ತಮವಾಗಿ present ಮಾಡಲು ನೀವು ಸಹಾಯ ಮಾಡುತ್ತಿದ್ದೀರಿ.",
      hi: "Clear profile confidence देता है. आप लोगों को खुद को बेहतर present करने में मदद कर रहे हैं.",
    },
  },
  {
    key: "level-4-ai-tools",
    level: 4,
    day: 6,
    badge: "AI Tools Seller",
    reward: "AI tools pack unlocked",
    titles: {
      en: "Level 4: AI Resume, Biodata and LinkedIn Tools",
      ml: "Level 4: AI Resume, Biodata, LinkedIn tools",
      ta: "Level 4: AI Resume, Biodata, LinkedIn tools",
      kn: "Level 4: AI Resume, Biodata, LinkedIn tools",
      hi: "Level 4: AI Resume, Biodata और LinkedIn tools",
    },
    intro: {
      en: "Career7 also helps people improve career documents: resume, biodata, LinkedIn, interview preparation, and career summaries.",
      ml: "Career7 career documents improve ചെയ്യാനും സഹായിക്കുന്നു: resume, biodata, LinkedIn, interview preparation, career summaries.",
      ta: "Career7 career documents improve செய்ய உதவும்: resume, biodata, LinkedIn, interview preparation, career summaries.",
      kn: "Career7 career documents improve ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ: resume, biodata, LinkedIn, interview preparation, career summaries.",
      hi: "Career7 career documents improve करने में मदद करता है: resume, biodata, LinkedIn, interview preparation, career summaries.",
    },
    steps: {
      en: ["Ask job seekers if their resume is updated.", "Ask college students if they have a good LinkedIn profile.", "Offer AI tools as quick improvement, not a big course.", "Use before/after examples when available."],
      ml: ["job seekers-നോട് resume updated ആണോ ചോദിക്കുക.", "college students-നോട് LinkedIn profile ഉണ്ടോ ചോദിക്കുക.", "AI tools quick improvement ആണെന്ന് പറയുക, വലിയ course അല്ല.", "available ആണെങ്കിൽ before/after examples കാണിക്കുക."],
      ta: ["job seekers-கிட்ட resume updated ஆச்சா கேளுங்கள்.", "college students-கிட்ட LinkedIn profile நல்லதா இருக்கா கேளுங்கள்.", "AI tools quick improvement என்று சொல்லுங்கள், big course அல்ல.", "available இருந்தால் before/after examples காட்டுங்கள்."],
      kn: ["job seekers ಗೆ resume updated ಇದೆಯಾ ಕೇಳಿ.", "college students ಗೆ LinkedIn profile ಚೆನ್ನಾಗಿದೆಯಾ ಕೇಳಿ.", "AI tools quick improvement ಎಂದು ಹೇಳಿ, big course ಅಲ್ಲ.", "available ಇದ್ದರೆ before/after examples ತೋರಿಸಿ."],
      hi: ["job seekers से पूछिए resume updated है क्या.", "college students से पूछिए LinkedIn profile अच्छा है क्या.", "AI tools को quick improvement बताइए, बड़ा course नहीं.", "Available हो तो before/after examples दिखाइए."],
    },
    task: {
      en: "Send the AI tools message to 5 job seekers or college students.",
      ml: "AI tools message 5 job seekers/college students-ന് അയയ്ക്കുക.",
      ta: "AI tools message 5 job seekers/college students-க்கு அனுப்புங்கள்.",
      kn: "AI tools message ಅನ್ನು 5 job seekers/college students ಗೆ ಕಳುಹಿಸಿ.",
      hi: "AI tools message 5 job seekers/college students को भेजिए.",
    },
    quote: {
      en: "People do not need complicated advice first. They need one useful improvement.",
      ml: "ആളുകൾക്ക് ആദ്യം complicated advice വേണ്ട. ഒരു useful improvement മതി.",
      ta: "மக்களுக்கு முதலில் complicated advice வேண்டாம். ஒரு useful improvement போதும்.",
      kn: "ಜನರಿಗೆ ಮೊದಲು complicated advice ಬೇಡ. ಒಂದು useful improvement ಸಾಕು.",
      hi: "लोगों को पहले complicated advice नहीं चाहिए. एक useful improvement काफी है.",
    },
  },
];

export function normalizeCareer7Language(value?: string | null): Career7Language {
  if (value === "ml" || value === "ta" || value === "kn" || value === "hi") return value;
  return "en";
}

export function getCareer7Lesson(key: string) {
  return career7Lessons.find((lesson) => lesson.key === key) || null;
}

export function getCareer7ReferralCode(seed: string) {
  return `NJ-C7-${seed.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
}
