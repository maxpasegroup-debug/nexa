"use client";

import { CheckCircle2, Download, Sparkles, Star } from "lucide-react";

type AgentAppCardProps = {
  id?: string;
  name?: string;
  category?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  price?: string;
  icon?: string;
  installed?: boolean;
  featured?: boolean;
  onInstall?: () => void;
};

export function AgentAppCard({
  name = "Agent Name",
  category = "Learning",
  description = "Description of what this agent does",
  rating = 4.8,
  reviews = 324,
  price = "Free",
  installed = false,
  featured = false,
  onInstall = () => {},
}: AgentAppCardProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_22px_55px_rgba(79,70,229,0.14)]">
      <div className="relative h-24 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400">
        {featured && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-lg">
            <Sparkles size={14} />
            Featured
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1 line-clamp-2 text-base font-bold text-slate-950">{name}</h3>
        <p className="mb-3 text-xs text-slate-500">{category}</p>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">{description}</p>

        <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={14}
                className={index < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-700">{rating}</span>
          <span className="text-xs text-slate-500">({reviews})</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-slate-950">{price}</span>
          {!installed ? (
            <button
              onClick={onInstall}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Download size={14} />
              Install
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
              <CheckCircle2 size={14} />
              Installed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
