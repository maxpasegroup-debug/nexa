"use client";

import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  ChevronRight,
  Coins,
  GraduationCap,
  LockKeyhole,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

const agents = [
  {
    name: "English Teacher",
    description: "Improve fluency, grammar and communication.",
    price: 100,
    rating: "4.8",
    reviews: "1.2k",
    color: "from-violet-400 to-indigo-400",
    icon: Bot,
  },
  {
    name: "IELTS Coach",
    description: "Get expert guidance for IELTS exam preparation.",
    price: 120,
    rating: "4.9",
    reviews: "980",
    color: "from-pink-300 to-fuchsia-300",
    icon: MessageSquare,
  },
  {
    name: "Resume Builder",
    description: "Build ATS-friendly resumes that get interviews.",
    price: 80,
    rating: "4.7",
    reviews: "1.5k",
    color: "from-sky-300 to-blue-300",
    icon: Target,
  },
  {
    name: "Interview Coach",
    description: "Practice interviews and boost your confidence.",
    price: 100,
    rating: "4.9",
    reviews: "1.1k",
    color: "from-teal-300 to-cyan-300",
    icon: MessageSquare,
  },
  {
    name: "Job Matcher",
    description: "Find jobs that match your skills and goals.",
    price: 100,
    rating: "4.8",
    reviews: "1.3k",
    color: "from-amber-300 to-orange-300",
    icon: BriefcaseBusiness,
  },
  {
    name: "Income Tracker",
    description: "Track income, expenses and savings easily.",
    price: 80,
    rating: "4.7",
    reviews: "880",
    color: "from-emerald-300 to-green-300",
    icon: TrendingUp,
  },
];

const tasks = [
  { title: "English Speaking Practice", detail: "30 mins practice", time: "10:00 AM", color: "bg-fuchsia-500" },
  { title: "Complete IELTS Reading", detail: "Take a mock test", time: "02:00 PM", color: "bg-orange-500" },
  { title: "Apply to 5 Jobs", detail: "Increase your chances", time: "05:00 PM", color: "bg-yellow-400" },
  { title: "Update LinkedIn Profile", detail: "Improve your visibility", time: "09:00 PM", color: "bg-blue-500" },
];

const learningTools = ["English Teacher", "IELTS Coach", "Resume Builder", "Interview Coach", "Skill Mapper"];
const earningTools = ["Freelance Finder", "Job Matcher", "Income Tracker", "Side Hustle"];

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.07)] ${className}`}>
      {children}
    </section>
  );
}

function NexaSaysCard() {
  return (
    <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 p-6 text-white">
      <p className="text-base font-bold">NEXA says</p>
      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 shadow-inner shadow-white/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071329] text-cyan-300">
            <Bot size={30} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">You&apos;re doing great!</p>
          <p className="mt-2 text-xs leading-relaxed text-white/85">
            Focus on improving your communication skills this week.
          </p>
        </div>
      </div>
      <button className="mt-5 w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-violet-700">
        Chat with NEXA
      </button>
    </Card>
  );
}

function CareerScoreCard() {
  return (
    <Card className="p-6">
      <p className="font-bold text-[#101633]">Career Score</p>
      <div className="mt-5 flex items-center gap-5">
        <div
          className="grid h-28 w-28 place-items-center rounded-full"
          style={{ background: "conic-gradient(#34d4c7 0 34%, #7c3aed 34% 72%, #e8eaf2 72% 100%)" }}
        >
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#101633]">720</p>
              <p className="text-[10px] text-slate-500">/1000</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-[#101633]">Excellent</p>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-500">
            <span className="h-0.5 w-8 bg-emerald-400" />
            Top 18%
          </p>
          <p className="mt-2 text-xs text-slate-500">of users</p>
        </div>
      </div>
      <button className="mt-4 rounded-lg bg-slate-50 px-8 py-2 text-sm font-semibold text-violet-600">
        View Report
      </button>
    </Card>
  );
}

function TodaysProgressCard() {
  return (
    <Card className="p-6">
      <p className="font-bold text-[#101633]">Today&apos;s Progress</p>
      <div className="mx-auto mt-7 h-24 w-44 overflow-hidden">
        <div
          className="grid h-44 w-44 place-items-center rounded-full"
          style={{ background: "conic-gradient(from 270deg, #4f46e5 0 68%, #e6e8f0 68% 100%)" }}
        >
          <div className="grid h-32 w-32 place-items-center rounded-full bg-white">
            <p className="pt-10 text-2xl font-bold text-[#101633]">68%</p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-slate-500">You&apos;re one step closer to your goal!</p>
      <div className="mt-5 text-center">
        <button className="rounded-lg bg-slate-50 px-8 py-2 text-sm font-semibold text-violet-600">View Plan</button>
      </div>
    </Card>
  );
}

function VisionBoardCard() {
  return (
    <Card className="p-6">
      <p className="font-bold text-[#101633]">Vision Board</p>
      <div className="mt-9 flex items-center gap-2">
        {["6M", "1Y", "3Y", "5Y"].map((item) => (
          <div key={item} className="flex flex-1 flex-col items-center gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${item === "1Y" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
              {item}
            </span>
            <span className={`h-1.5 w-full rounded-full ${item === "1Y" ? "bg-violet-500" : "bg-slate-200"}`} />
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm font-semibold leading-relaxed text-[#101633]">
        Become a Product Manager at a top IT company
      </p>
      <button className="mt-5 rounded-lg bg-slate-50 px-8 py-2 text-sm font-semibold text-violet-600">View Vision</button>
    </Card>
  );
}

function WalletCard() {
  return (
    <Card className="bg-[#071329] p-6 text-white">
      <div className="flex items-center justify-between">
        <p className="font-bold">My Wallet</p>
        <button className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="mt-8 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-sm font-black text-white">
          C
        </span>
        <p className="text-3xl font-bold">1,250</p>
      </div>
      <p className="mt-3 text-sm text-slate-300">Career Credits</p>
      <button className="mt-7 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-sm font-bold">
        Top Up Credits
      </button>
    </Card>
  );
}

function GrowthPath({
  title,
  subtitle,
  count,
  type,
  tools,
}: {
  title: string;
  subtitle: string;
  count: string;
  type: "learning" | "earning";
  tools: string[];
}) {
  const Icon = type === "learning" ? GraduationCap : BriefcaseBusiness;
  const accent = type === "learning" ? "from-violet-600 to-indigo-500" : "from-emerald-500 to-teal-500";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${accent} text-white`}>
          <Icon size={30} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-[#101633]">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <span className={`rounded-lg px-3 py-1 text-xs font-semibold ${type === "learning" ? "bg-violet-50 text-violet-600" : "bg-emerald-50 text-emerald-600"}`}>
              {count}
            </span>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
            {tools.map((tool, index) => (
              <div key={tool} className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 text-[#101633] shadow-sm">
                  {index === tools.length - 1 && type === "learning" ? <Target size={20} /> : <Bot size={20} />}
                </div>
                <p className="mt-2 truncate text-[11px] font-semibold text-[#101633]">{tool}</p>
                <p className="text-[10px] text-slate-400">AI</p>
              </div>
            ))}
            <div className="text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-dashed border-slate-300 text-violet-600">
                <Plus size={20} />
              </div>
              <p className="mt-2 text-[11px] font-semibold text-[#101633]">Add More</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrowthBoardSection() {
  return (
    <Card className="p-5">
      <div className="mb-5">
        <h3 className="font-bold text-[#101633]">My Growth Board</h3>
        <p className="mt-1 text-sm text-slate-500">Manage your learning and earning journey</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <GrowthPath
          title="Learning Path"
          subtitle="Add learning agents, courses and tools to upgrade your skills."
          count="5 Active"
          type="learning"
          tools={learningTools}
        />
        <GrowthPath
          title="Earning Path"
          subtitle="Add earning opportunities and tools to grow your income."
          count="4 Active"
          type="earning"
          tools={earningTools}
        />
      </div>
    </Card>
  );
}

function AgentStoreGrid() {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-[#101633]">Agent Store</h3>
          <p className="mt-1 text-sm text-slate-500">Explore AI agents to boost your career</p>
        </div>
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-violet-600">
          View All Agents
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {agents.map((agent) => {
          const Icon = agent.icon;

          return (
            <div key={agent.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className={`relative grid h-28 place-items-center bg-gradient-to-br ${agent.color}`}>
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/80 text-[#071329] shadow-lg">
                  <Icon size={32} />
                </div>
                <span className="absolute right-3 top-3 rounded-md bg-white/80 px-1.5 py-0.5 text-xs font-bold text-violet-600">
                  AI
                </span>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#101633]">{agent.name}</h4>
                <p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-500">{agent.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {agent.rating} ({agent.reviews})
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-[#101633]">
                    {agent.price}
                    <Coins size={14} className="text-amber-400" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function UpcomingTasksCard() {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-bold text-[#101633]">Upcoming Tasks</h3>
        <button className="text-xs font-semibold text-violet-600">View All</button>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.title} className="flex items-center gap-4">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${task.color} text-white`}>
              <LockKeyhole size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#101633]">{task.title}</p>
              <p className="mt-1 text-xs text-slate-500">{task.detail}</p>
            </div>
            <span className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{task.time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function NexaAssistantPanel() {
  const actions = ["Suggest learning for me", "Find job opportunities", "Improve my resume", "Plan my next 7 days"];

  return (
    <Card className="overflow-hidden bg-[#071329] p-5 text-white">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-cyan-300">
          <Bot size={18} />
        </div>
        <h3 className="text-lg font-bold">NEXA</h3>
        <span className="rounded-full bg-violet-500/70 px-3 py-1 text-xs font-semibold">AI Assistant</span>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_auto] gap-5">
        <div>
          <p className="text-sm leading-relaxed text-white/90">
            Hi Arjun! I&apos;m Nexa, your AI career companion. How can I help you today?
          </p>
          <div className="mt-4 space-y-2">
            {actions.map((action) => (
              <button key={action} className="block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/90">
                {action}
              </button>
            ))}
          </div>
        </div>
        <div className="hidden h-28 w-28 place-items-center rounded-full bg-violet-500/20 text-violet-200 shadow-[0_0_60px_rgba(124,58,237,0.6)] sm:grid">
          <Bot size={46} />
        </div>
      </div>

      <div className="mt-7 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2">
        <input
          placeholder="Type your message..."
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-slate-400"
        />
        <button className="grid h-10 w-10 place-items-center rounded-full bg-violet-600">
          <Send size={17} />
        </button>
      </div>
    </Card>
  );
}

function BlizzwayBanner() {
  return (
    <section className="overflow-hidden rounded-2xl bg-[#071329] px-6 py-5 text-white shadow-[0_18px_45px_rgba(15,23,42,0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h3 className="text-xl font-bold">Unlock your true potential with Blizzway!</h3>
          <p className="mt-1 text-sm text-slate-300">Your magical career pathway to success.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-8 py-3 text-sm font-bold">
          <Sparkles size={16} />
          Explore Blizzway
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

export default function Career7DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_350px]">
      <div className="min-w-0 space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NexaSaysCard />
          <CareerScoreCard />
          <TodaysProgressCard />
          <VisionBoardCard />
        </div>

        <GrowthBoardSection />
        <AgentStoreGrid />
        <BlizzwayBanner />
      </div>

      <aside className="space-y-6">
        <WalletCard />
        <UpcomingTasksCard />
        <NexaAssistantPanel />
      </aside>
    </div>
  );
}
