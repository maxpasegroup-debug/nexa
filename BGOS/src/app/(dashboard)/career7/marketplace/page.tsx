"use client";

import { AgentAppCard } from "@/components/career7";

const agents = [
  {
    id: "agent-1",
    name: "Learn & Master JavaScript",
    category: "Learning",
    description: "Comprehensive JavaScript course with hands-on projects and real-world applications.",
    rating: 4.8,
    reviews: 324,
    price: "Free",
    featured: true,
  },
  {
    id: "agent-2",
    name: "React Pro Masterclass",
    category: "Frontend",
    description: "Master React with advanced patterns, hooks, and performance optimization.",
    rating: 4.9,
    reviews: 567,
    price: "Free",
    featured: true,
  },
  {
    id: "agent-3",
    name: "Web Design Essentials",
    category: "Design",
    description: "Learn UI principles, design systems, and modern product interface patterns.",
    rating: 4.6,
    reviews: 289,
    price: "Rs. 299/month",
  },
  {
    id: "agent-4",
    name: "Professional Networking Guide",
    category: "Networking",
    description: "Build a repeatable relationship system for mentors, peers, and recruiters.",
    rating: 4.7,
    reviews: 412,
    price: "Free",
  },
  {
    id: "agent-5",
    name: "Career Analytics Dashboard",
    category: "Analytics",
    description: "Track career growth, skill depth, and earning momentum in one premium view.",
    rating: 4.5,
    reviews: 178,
    price: "Rs. 599/month",
  },
  {
    id: "agent-6",
    name: "Interview Preparation Pro",
    category: "Career",
    description: "Prepare for technical and behavioral interviews with structured practice loops.",
    rating: 4.8,
    reviews: 645,
    price: "Free",
  },
];

export default function MarketplacePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">Agent Store</h1>
        <p className="mt-2 text-slate-600">Discover and install career growth agents.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search agents..."
            className="min-w-[220px] flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All Categories</option>
            <option>Learning</option>
            <option>Frontend</option>
            <option>Design</option>
            <option>Networking</option>
            <option>Analytics</option>
            <option>Career</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AgentAppCard
            key={agent.id}
            id={agent.id}
            name={agent.name}
            category={agent.category}
            description={agent.description}
            rating={agent.rating}
            reviews={agent.reviews}
            price={agent.price}
            featured={agent.featured}
            onInstall={() => {}}
          />
        ))}
      </div>
    </div>
  );
}
