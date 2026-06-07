// @ts-nocheck
import { ArrowRight, BookOpenText, Check, ClipboardList, EyeOff, FileText, Heart, Home, LifeBuoy, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const moderationRules = [
  "No names, locations, providers, schools, or identifying details",
  "No weights, calories, BMI, body measurements, or comparison metrics",
  "No self-harm methods, restriction tips, purging details, or treatment avoidance",
  "No medical, nutrition, psychiatric, or emergency advice",
];

const stories = [
  {
    title: "The first meal I did not do alone",
    excerpt: "A short anonymous story about using support before, during, and after a hard meal without numbers, comparison, or medical advice.",
    time: "3 hours ago",
    likes: 12,
    comments: 3,
  },
  {
    title: "Going back to school felt impossible",
    excerpt: "A moderated reflection on returning to routines, asking for accommodations, and rebuilding confidence one day at a time.",
    time: "1 day ago",
    likes: 21,
    comments: 5,
  },
  {
    title: "What I wish my family knew",
    excerpt: "A hope note for caregivers: what helped, what hurt, and how support can feel safer when panic is loud.",
    time: "4 days ago",
    likes: 35,
    comments: 8,
  },
];

const storyVideos = [
  {
    title: "Recovery-support short #1",
    embed: "https://www.youtube-nocookie.com/embed/fHf6tFb7PlU",
    url: "https://www.youtube.com/shorts/fHf6tFb7PlU",
    time: "2 days ago",
    likes: 18,
    comments: 4,
  },
  {
    title: "Recovery-support short #2",
    embed: "https://www.youtube-nocookie.com/embed/qkHjLGRh-EQ",
    url: "https://www.youtube.com/shorts/qkHjLGRh-EQ",
    time: "5 days ago",
    likes: 27,
    comments: 6,
  },
];

function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">{eyebrow}</div>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-stone-650">{children}</p>
      </div>
    </section>
  );
}

export function FindHelpPage() {
  return (
    <>
      <PageHeader eyebrow="Find Help" title="Urgent help comes first.">
        The free resource hub is designed for immediate direction: emergency warning signs, crisis resources, provider-call prep, and family support basics.
      </PageHeader>
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">
          {[
            "If there is immediate danger, call emergency services.",
            "If self-harm thoughts are present, use crisis resources now.",
            "If eating, drinking, fainting, or vitals are unsafe, seek medical help.",
            "This platform is not monitored for emergencies.",
          ].map((item) => (
            <Card key={item} className="rounded-[2rem] border-rose-200 bg-rose-50 shadow-sm">
              <CardContent className="flex gap-4 p-6">
                <LifeBuoy className="mt-1 h-6 w-6 flex-none text-rose-700" />
                <p className="font-medium leading-7 text-stone-800">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

export function HealPage() {
  return (
    <>
      <section className="px-5 py-20">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Heal</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">Support for the hard days.</h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            Practical tools for moments when recovery feels loud: coping cards, meal-support reflections, treatment notes, and private journaling without triggering metrics.
          </p>
        </div>
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            [Heart, "Meal Support Reflection", "Reflect on distress, emotions, support used, and what helped without calories, weight, portions, or comparison."],
            [ClipboardList, "Recovery Binder", "Keep provider questions, appointments, school notes, insurance calls, and treatment timeline in one private place."],
            [ShieldCheck, "Safety Guardrails", "Product rules are designed to remove numbers, triggering details, PHI, self-harm methods, and peer medical advice."],
          ].map(([Icon, title, text]) => (
            <Card key={String(title)} className="rounded-[2rem] border-stone-200 bg-white/80 shadow-sm">
              <CardContent className="p-7">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mb-3 text-xl font-semibold text-stone-950">{title}</h2>
                <p className="leading-7 text-stone-600">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

export function LivePage() {
  return (
    <>
      <PageHeader eyebrow="Live" title="Recovery is not only about symptoms.">
        It is also about school, family, identity, confidence, routines, and feeling like life can become yours again.
      </PageHeader>
      <section className="bg-stone-950 px-5 py-20 text-white">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
          {[
            [Home, "School & routine", "Return-to-school notes, accommodations, and daily structure."],
            [Users, "Family Circle", "Caregiver coordination across web, mobile, and shared devices."],
            [FileText, "Provider prep", "Questions, appointment notes, exports, and next-step planning."],
            [EyeOff, "Private by default", "Anonymous profiles with user-controlled sharing and deletion."],
          ].map(([Icon, title, text]) => (
            <div key={String(title)} className="rounded-[2rem] bg-white/8 p-6">
              <Icon className="mb-5 h-7 w-7 text-stone-200" />
              <h2 className="mb-3 text-lg font-semibold">{title}</h2>
              <p className="text-sm leading-6 text-stone-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function GivePage() {
  return (
    <>
      <PageHeader eyebrow="Give" title="Stories that give hope forward.">
        Users can submit anonymous recovery stories, but stories are moderated before publishing to protect privacy and reduce harm.
      </PageHeader>
      <section className="px-5 pb-24">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-5 md:grid-cols-3">
            {stories.map((story) => (
              <Card key={story.title} className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <h2 className="mb-3 text-xl font-semibold text-stone-950">{story.title}</h2>
                  <p className="text-sm leading-7 text-stone-600">{story.excerpt}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="rounded-[2rem] border-stone-200 bg-stone-50 shadow-sm">
            <CardContent className="p-7">
              <div className="mb-5 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-stone-800" />
                <h2 className="text-xl font-semibold">Story Safety Standard</h2>
              </div>
              <div className="space-y-3">
                {moderationRules.map((rule) => (
                  <div key={rule} className="flex gap-3 rounded-2xl bg-white p-4 text-sm leading-6 text-stone-700">
                    <Check className="mt-0.5 h-5 w-5 flex-none text-stone-900" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

export function StoriesPage() {
  return (
    <>
      <section className="px-5 py-10 md:py-16">
        <div className="mx-auto max-w-7xl">
          <section className="rounded-[2.5rem] bg-stone-100 p-7 md:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-900 shadow-sm">
                  <BookOpenText className="h-6 w-6" />
                </div>
                <h1 className="text-4xl font-semibold tracking-tight">Whole Stories</h1>
                <p className="mt-5 text-lg leading-8 text-stone-650">
                  A moderated story library where people can share what helped, what hurt, what gave them courage, and what they want others to know without publishing private health details.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                <label className="mb-3 block text-sm font-semibold text-stone-800">Story prompt</label>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-stone-700">
                  Share one moment when support helped you feel less alone.
                </div>

                <label className="mb-3 mt-5 block text-sm font-semibold text-stone-800">Before publishing</label>
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm leading-7 text-stone-500">
                  Stories and videos enter moderation. Identifying details, medical specifics, triggering numbers, and unsafe content are removed or declined before publication.
                </div>

                <Button className="mt-5 h-12 rounded-full bg-stone-950 px-6 text-white hover:bg-stone-800">
                  Submit a story <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              {storyVideos.map((video) => (
                <div key={video.title} className="flex gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                  <div className="w-[30%] min-w-[96px] overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                    <iframe
                      src={video.embed}
                      title={video.title}
                      className="aspect-[9/16] w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-stone-950">{video.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span>{video.time}</span>
                        <span>{video.likes} likes</span>
                        <span>{video.comments} comments</span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                        Like
                      </button>
                      <button type="button" className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                        Comment
                      </button>
                      <a href={video.url} target="_blank" rel="noreferrer" className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                        Open
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-3">
              {stories.map((story) => (
                <div key={story.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <h2 className="text-lg font-semibold text-stone-950">{story.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{story.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                    <span>{story.time}</span>
                    <span>{story.likes} likes</span>
                    <span>{story.comments} comments</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                      Like
                    </button>
                    <button type="button" className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50">
                      Comment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
