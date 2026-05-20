import Link from "next/link";
import { CheckCircle2, FileText, Headphones, Image, Lock, PlayCircle, ShieldCheck, Trophy } from "lucide-react";

import auth from "@/lib/auth";
import {
  career7Languages,
  career7Lessons,
  normalizeCareer7Language,
  type Career7Language,
} from "@/lib/nicejobs/career7";
import { completeNiceJobsResource, getNiceJobsTrainingHub } from "@/lib/nicejobs/training";

const resourceIcons = {
  audio: Headphones,
  video: PlayCircle,
  pdf: FileText,
  asset: Image,
};

export default async function NiceJobsTrainingPage({
  searchParams,
}: {
  searchParams?: { lang?: string };
}) {
  const session = await auth();
  const tracks = session?.user?.id ? await getNiceJobsTrainingHub(session.user.id) : [];
  const language = normalizeCareer7Language(searchParams?.lang);

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">Training hub</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">Complete your active learning funnel.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
          Lessons unlock one by one like levels. Listen, understand, do today&apos;s task, then unlock the next step.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {career7Languages.map((item) => (
            <Link
              key={item.code}
              href={`/nicejobs/training?lang=${item.code}`}
              className={`rounded-md px-3 py-2 text-sm font-black ${
                language === item.code
                  ? "bg-[#1c7c54] text-white"
                  : "border border-[#151515]/10 bg-[#f7f7f2] text-[#333]"
              }`}
            >
              {item.nativeLabel}
            </Link>
          ))}
        </div>
      </section>

      {tracks.length ? (
        tracks.map((track) => (
          <section key={track.application.id} className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-2xl font-black">{track.application.franchise.name}</h3>
                <p className="mt-2 text-sm font-bold text-[#555]">
                  {track.completedCount}/{track.totalCount} resources completed
                </p>
              </div>
              <span className="w-fit rounded-md bg-[#e2f6ed] px-3 py-2 text-sm font-black text-[#1c7c54]">
                {track.complete ? "Ready for approval" : track.application.status.replaceAll("_", " ")}
              </span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#f7f7f2]">
              <div
                className="h-full bg-[#1c7c54]"
                style={{ width: `${track.totalCount ? (track.completedCount / track.totalCount) * 100 : 0}%` }}
              />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {track.resources.map((resource) => {
                const Icon = resourceIcons[resource.resourceType as keyof typeof resourceIcons] || FileText;
                const completed = track.progressByResource.get(resource.id)?.status === "COMPLETED";
                const locked = resource.sortOrder > track.nextUnlockedSortOrder;
                const lesson = track.application.franchise.slug === "career7-in"
                  ? career7Lessons.find((item) => item.day === resource.sortOrder)
                  : null;
                const title = lesson?.titles[language as Career7Language] || resource.title;
                const description = lesson?.intro[language as Career7Language] || resource.description;

                return (
                  <div
                    key={resource.id}
                    className={`rounded-lg border p-4 ${
                      locked
                        ? "border-[#151515]/5 bg-[#ecece5] text-[#777]"
                        : "border-[#151515]/10 bg-[#f7f7f2]"
                    }`}
                  >
                    <div className="flex h-full flex-col justify-between gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-[#1c7c54]">
                            {locked ? <Lock size={22} /> : completed ? <Trophy size={22} /> : <Icon size={22} />}
                          </span>
                          <span className="rounded-md bg-white px-2 py-1 text-xs font-black">
                            Day {resource.sortOrder}
                          </span>
                        </div>
                        <h4 className="mt-4 font-black">{title}</h4>
                        <p className="mt-2 text-sm leading-6 text-[#555]">{description}</p>
                      </div>

                      {locked ? (
                        <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-[#777]">
                          <Lock size={17} /> Locked
                        </span>
                      ) : completed ? (
                        <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-[#1c7c54]">
                          <CheckCircle2 size={17} /> Done
                        </span>
                      ) : track.application.franchise.slug === "career7-in" ? (
                        <Link
                          href={`${resource.resourceUrl}?lang=${language}`}
                          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white"
                        >
                          Start level <ShieldCheck size={17} />
                        </Link>
                      ) : (
                        <form action={completeNiceJobsResource}>
                          <input type="hidden" name="applicationId" value={track.application.id} />
                          <input type="hidden" name="resourceId" value={resource.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white"
                          >
                            Mark done <ShieldCheck size={17} />
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <h3 className="text-xl font-black">No training track yet</h3>
          <p className="mt-2 text-sm leading-6 text-[#555]">Apply to an opportunity and sign the MOU to unlock training.</p>
          <Link
            href="/nicejobs/opportunities"
            className="mt-5 inline-flex items-center rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white"
          >
            Browse opportunities
          </Link>
        </section>
      )}
    </div>
  );
}
