import Link from "next/link";
import { CheckCircle2, FileText, Headphones, Image, PlayCircle, ShieldCheck } from "lucide-react";

import auth from "@/lib/auth";
import { completeNiceJobsResource, getNiceJobsTrainingHub } from "@/lib/nicejobs/training";

const resourceIcons = {
  audio: Headphones,
  video: PlayCircle,
  pdf: FileText,
  asset: Image,
};

export default async function NiceJobsTrainingPage() {
  const session = await auth();
  const tracks = session?.user?.id ? await getNiceJobsTrainingHub(session.user.id) : [];

  return (
    <div className="grid gap-6">
      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <p className="text-sm font-black uppercase text-[#1c7c54]">Training hub</p>
        <h2 className="mt-2 text-3xl font-black tracking-normal">Complete your active learning funnel.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#555]">
          Each franchise track includes audio, promotional resources, videos, and payout rules. Completion moves your
          application into approval review.
        </p>
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

            <div className="mt-6 grid gap-3">
              {track.resources.map((resource) => {
                const Icon = resourceIcons[resource.resourceType as keyof typeof resourceIcons] || FileText;
                const completed = track.progressByResource.get(resource.id)?.status === "COMPLETED";

                return (
                  <div key={resource.id} className="rounded-lg border border-[#151515]/10 bg-[#f7f7f2] p-4">
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white text-[#1c7c54]">
                          <Icon size={22} />
                        </span>
                        <div>
                          <h4 className="font-black">{resource.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-[#555]">{resource.description}</p>
                          <Link href={resource.resourceUrl} className="mt-2 inline-block text-sm font-black text-[#1c7c54]">
                            Open resource
                          </Link>
                        </div>
                      </div>

                      {completed ? (
                        <span className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-[#1c7c54]">
                          <CheckCircle2 size={17} /> Done
                        </span>
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
