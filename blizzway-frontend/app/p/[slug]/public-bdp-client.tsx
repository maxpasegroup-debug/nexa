"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { bdpApi, getApiErrorMessage, type BlizzwayPublishedBdpProfile } from "@/lib/api";

function asTextArray(value: unknown[]) {
  return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).filter(Boolean);
}

function SectionList({ title, items }: { title: string; items: unknown[] }) {
  const normalized = asTextArray(items);
  if (!normalized.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
      <div className="mt-4 grid gap-3">
        {normalized.map((item) => (
          <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">{item}</div>
        ))}
      </div>
    </section>
  );
}

function ObjectHighlights({ title, items }: { title: string; items: unknown[] }) {
  if (!items.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">{title}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => {
          const record = item && typeof item === "object" && !Array.isArray(item) ? item as Record<string, unknown> : {};
          const heading = String(record.title || record.type || record.companion || `Highlight ${index + 1}`);
          const summary = String(record.summary || record.description || item);
          return (
            <div key={`${heading}-${index}`} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-black text-slate-950">{heading}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{summary}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PublicBdpClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [profile, setProfile] = useState<BlizzwayPublishedBdpProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    bdpApi.getPublicProfile(slug)
      .then((response) => {
        if (active) setProfile(response.profile);
        void bdpApi.trackPublicView(slug).catch(() => null);
      })
      .catch((caught) => {
        if (active) setError(getApiErrorMessage(caught));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const skills = useMemo(() => profile ? asTextArray(profile.skills) : [], [profile]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
          <div className="h-8 w-64 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-5 h-32 animate-pulse rounded-3xl bg-slate-100" />
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
        <section className="max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Public BDP</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950">Profile not available</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{error || "This BDP is private or does not exist."}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="bg-slate-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-cyan-200">Blizzway Digital Profile</p>
            <p className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white/72">Powered by Blizzway</p>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.34fr]">
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-6xl">{profile.name}</h1>
              <p className="mt-4 text-2xl font-black text-cyan-200">{profile.headline}</p>
              <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-white/72">{profile.summary}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.location ? <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{profile.location}</span> : null}
                {profile.availability ? <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">{profile.availability}</span> : null}
                {profile.lastPublishedAt ? <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold">Published {new Date(profile.lastPublishedAt).toLocaleDateString()}</span> : null}
              </div>
            </div>
            <div className="rounded-3xl bg-white p-6 text-slate-950">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Recruiter contact</p>
              {profile.contact?.email ? (
                <>
                  <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">Open to recruiter contact through the user-approved email below.</p>
                  <a href={`mailto:${profile.contact.email}`} className="mt-5 block rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-black text-white">Contact candidate</a>
                </>
              ) : (
                <p className="mt-4 text-sm font-semibold leading-6 text-slate-600">Contact is hidden by the user. This public BDP is view-only.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[0.7fr_0.3fr]">
        <div className="grid gap-5">
          <SectionList title="Skills" items={skills} />
          <SectionList title="Career goals" items={profile.careerGoals} />
          <SectionList title="Education" items={profile.education} />
          <SectionList title="Experience" items={profile.experience} />
          <SectionList title="Projects and portfolio" items={profile.projects} />
          <ObjectHighlights title="Document highlights" items={profile.documentHighlights} />
          <ObjectHighlights title="Companion highlights" items={profile.companionHighlights} />
        </div>
        <aside className="grid content-start gap-5">
          <SectionList title="Languages" items={profile.languages} />
          <SectionList title="Assessment highlights" items={profile.assessmentHighlights} />
          <SectionList title="Pathway highlights" items={profile.pathwayHighlights} />
          <ObjectHighlights title="Achievements" items={profile.achievements} />
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Privacy</p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              This profile shows selected public career identity data only. Private Soul Vault notes, uploaded documents, payment data, and raw assessment answers are not public.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
