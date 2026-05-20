import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, Copy, Lock, Megaphone, Sparkles } from "lucide-react";

import auth from "@/lib/auth";
import {
  career7Languages,
  getCareer7Lesson,
  normalizeCareer7Language,
} from "@/lib/nicejobs/career7";
import { completeNiceJobsResource, getNiceJobsTrainingLesson } from "@/lib/nicejobs/training";

export default async function Career7TrainingLessonPage({
  params,
  searchParams,
}: {
  params: { lessonKey: string };
  searchParams?: { lang?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?businessModel=nicejobs&callbackUrl=/nicejobs/training");
  }

  const language = normalizeCareer7Language(searchParams?.lang);
  const lesson = getCareer7Lesson(params.lessonKey);
  const training = await getNiceJobsTrainingLesson(session.user.id, params.lessonKey);

  if (!lesson || !training) notFound();

  const referralCode = training.application.referralCode;
  const shareText = encodeURIComponent(
    `Career7 free career test try cheyyu / try pannunga / try madi / try kijiye. My code: ${referralCode}`,
  );

  if (training.locked) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-[#151515]/10 bg-white p-6 text-[#151515]">
        <Lock size={28} className="text-[#1c7c54]" />
        <h2 className="mt-4 text-2xl font-black">This level is locked</h2>
        <p className="mt-2 text-sm leading-6 text-[#555]">
          Complete the previous Career7 lesson first. NICEJOBS unlocks training step by step so users stay focused.
        </p>
        <Link href={`/nicejobs/training?lang=${language}`} className="mt-5 inline-flex rounded-md bg-[#151515] px-4 py-3 text-sm font-black text-white">
          Back to training
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Link href={`/nicejobs/training?lang=${language}`} className="inline-flex w-fit items-center gap-2 text-sm font-black text-[#1c7c54]">
        <ArrowLeft size={17} /> Back to levels
      </Link>

      <section className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-black uppercase text-[#1c7c54]">Career7 · Level {lesson.level}</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal">{lesson.titles[language]}</h1>
            <p className="mt-4 text-base leading-8 text-[#444]">{lesson.intro[language]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {career7Languages.map((item) => (
              <Link
                key={item.code}
                href={`/nicejobs/training/career7/${lesson.key}?lang=${item.code}`}
                className={`rounded-md px-3 py-2 text-sm font-black ${
                  language === item.code ? "bg-[#1c7c54] text-white" : "bg-[#f7f7f2] text-[#333]"
                }`}
              >
                {item.nativeLabel}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1fr_0.75fr]">
        <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
          <h2 className="text-xl font-black">Listen and understand</h2>
          <div className="mt-4 rounded-lg bg-[#f7f7f2] p-5">
            <p className="text-sm font-black text-[#1c7c54]">Audio script</p>
            <p className="mt-2 text-sm leading-7 text-[#444]">{lesson.intro[language]}</p>
          </div>

          <h2 className="mt-6 text-xl font-black">Do this now</h2>
          <ol className="mt-4 grid gap-3">
            {lesson.steps[language].map((step, index) => (
              <li key={step} className="flex gap-3 rounded-lg bg-[#f7f7f2] p-4 text-sm font-semibold leading-6 text-[#333]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1c7c54] text-xs font-black text-white">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <aside className="grid gap-4">
          <div className="rounded-lg border border-[#151515]/10 bg-[#151515] p-6 text-white">
            <Megaphone size={24} className="text-[#f0c85a]" />
            <h2 className="mt-4 text-xl font-black">Your task</h2>
            <p className="mt-2 text-sm leading-7 text-white/75">{lesson.task[language]}</p>
          </div>

          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <p className="text-sm font-black text-[#555]">Referral code</p>
            <div className="mt-2 rounded-md bg-[#f7f7f2] p-3 font-black">{referralCode}</div>
            <a
              href={`https://wa.me/?text=${shareText}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1c7c54] px-4 py-3 text-sm font-black text-white"
            >
              <Copy size={17} /> Share on WhatsApp
            </a>
          </div>

          <div className="rounded-lg border border-[#151515]/10 bg-white p-6">
            <Sparkles size={22} className="text-[#1c7c54]" />
            <p className="mt-3 text-sm font-black">Nexa says</p>
            <p className="mt-2 text-sm leading-7 text-[#555]">{lesson.quote[language]}</p>
          </div>
        </aside>
      </section>

      <form action={completeNiceJobsResource} className="rounded-lg border border-[#151515]/10 bg-white p-6">
        <input type="hidden" name="applicationId" value={training.application.id} />
        <input type="hidden" name="resourceId" value={training.resource.id} />
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#151515] px-5 py-4 text-sm font-black text-white sm:w-fit"
        >
          <CheckCircle2 size={18} /> I completed today&apos;s work
        </button>
      </form>
    </div>
  );
}
