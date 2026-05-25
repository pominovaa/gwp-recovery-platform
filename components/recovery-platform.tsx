// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShieldCheck,
  BookOpenText,
  Users,
  Lock,
  Sparkles,
  LifeBuoy,
  ClipboardList,
  MessageCircleHeart,
  Check,
  ArrowRight,
  Menu,
  X,
  EyeOff,
  FileText,
  Home,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    note: "Immediate support resources",
    cta: "Get help now",
    features: [
      "Urgent help and crisis resources",
      "Warning signs and treatment navigation",
      "Eating disorder facts and statistics",
      "Caregiver scripts and printable checklists",
    ],
  },
  {
    name: "Light",
    price: "$1/month",
    note: "Billed annually",
    cta: "Start light plan",
    featured: true,
    features: [
      "Supports platform development",
      "Anonymous private journal",
      "Coping cards and reflection prompts",
      "Appointment notes and provider questions",
      "Printable recovery binder pages",
    ],
  },
  {
    name: "Plus",
    price: "$5/month preview",
    note: "Personal recovery-support tools",
    cta: "Start plus preview",
    features: [
      "Supports platform development",
      "Meal support reflection, not calorie tracking",
      "Distress and coping pattern view",
      "Custom reminders and treatment timeline",
      "Exportable summaries for trusted support",
    ],
  },
  {
    name: "Family",
    price: "$19/month preview",
    note: "Multiple profiles and devices",
    cta: "Start family plan preview",
    features: [
      "Supports platform development",
      "Family Circle with caregiver coordination",
      "Shared appointments and school notes",
      "Insurance and provider question tracker",
      "User-controlled sharing and privacy settings",
    ],
  },
];

const stories = [
  {
    title: "The first meal I did not do alone",
    category: "Heal",
    excerpt:
      "A short anonymous story about using support before, during, and after a hard meal — without numbers, comparison, or medical advice.",
  },
  {
    title: "Going back to school felt impossible",
    category: "Live",
    excerpt:
      "A moderated reflection on returning to routines, asking for accommodations, and rebuilding confidence one day at a time.",
  },
  {
    title: "What I wish my family knew",
    category: "Give",
    excerpt:
      "A hope note for caregivers: what helped, what hurt, and how support can feel safer when panic is loud.",
  },
];

const moderationRules = [
  "No names, locations, providers, schools, or identifying details",
  "No weights, calories, BMI, body measurements, or comparison metrics",
  "No self-harm methods, restriction tips, purging details, or treatment avoidance",
  "No medical, nutrition, psychiatric, or emergency advice",
];

function Nav() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const links = ["Heal", "Live", "Give", "Stories", "Pricing"];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold tracking-tight text-stone-950">Get Whole Project</div>
              <div className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Heal · Live · Give</div>
            </div>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((link) =>
              link === "Stories" ? (
                <button
                  key={link}
                  type="button"
                  onClick={() => setStoriesOpen(true)}
                  className="text-sm font-medium text-stone-600 transition hover:text-stone-950"
                >
                  {link}
                </button>
              ) : (
                <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-stone-600 transition hover:text-stone-950">
                  {link}
                </a>
              )
            )}
            <div className="group relative inline-flex">
              <a
                href="#pricing"
                aria-label="Upgrade to customize"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                <CustomizeIcon />
              </a>
              <div className="pointer-events-none absolute right-0 top-full mt-2 w-44 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                Upgrade to customize.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Open account management"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-950 shadow-sm transition hover:bg-stone-50"
            >
              OA
            </button>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              aria-label="Open account management"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-950 shadow-sm"
            >
              OA
            </button>
            <button className="rounded-xl p-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-stone-200 bg-white px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {links.map((link) =>
                link === "Stories" ? (
                  <button
                    key={link}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setStoriesOpen(true);
                    }}
                    className="text-left text-sm font-medium text-stone-700"
                  >
                    {link}
                  </button>
                ) : (
                  <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-medium text-stone-700" onClick={() => setOpen(false)}>
                    {link}
                  </a>
                )
              )}
              <div className="group relative inline-flex">
                <a
                  href="#pricing"
                  aria-label="Upgrade to customize"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                >
                  <CustomizeIcon />
                </a>
                <div className="pointer-events-none absolute left-0 top-full mt-2 w-44 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                  Upgrade to customize.
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {accountOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white">
          <div className="mx-auto max-w-7xl px-5 py-6 md:py-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-950 text-sm font-semibold text-white">
                  OA
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.25em] text-stone-500">Private Profile</div>
                  <h1 className="text-2xl font-semibold tracking-tight text-stone-950">Account Management</h1>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAccountOpen(false)}
                className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                Back to site
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                ["Privacy", "Manage anonymity, story visibility, deletion, sharing, and moderation preferences."],
                ["Subscription", "View plan, renewal date, billing status, donations, and the 14-day guarantee."],
                ["Journal", "Open private reflections, recovery notes, appointment notes, and story drafts."],
                ["Saved Cards", "Return to saved coping cards, prompts, resources, and moderated stories."],
              ].map(([title, text]) => (
                <Card key={title} className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
                  <CardContent className="p-7">
                    <h2 className="text-xl font-semibold text-stone-950">{title}</h2>
                    <p className="mt-3 leading-7 text-stone-600">{text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {storiesOpen && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white">
          <div className="mx-auto max-w-7xl px-5 py-6 md:py-10">
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStoriesOpen(false)}
                className="rounded-full border border-stone-300 bg-white px-5 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
              >
                Back to site
              </button>
            </div>

            <section className="rounded-[2.5rem] bg-stone-100 p-7 md:p-12">
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-stone-900 shadow-sm">
                    <BookOpenText className="h-6 w-6" />
                  </div>
                  <h1 className="text-4xl font-semibold tracking-tight">Whole Stories</h1>
                  <p className="mt-5 text-lg leading-8 text-stone-650">
                    A moderated story library where people can share what helped, what hurt, what gave them courage, and what they want others to know — without publishing private health details.
                  </p>
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <label className="mb-3 block text-sm font-semibold text-stone-800">Story prompt</label>
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-stone-700">
                    “Share one moment when support helped you feel less alone.”
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
                {[
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
                ].map((video) => (
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
                        <h3 className="text-base font-semibold text-stone-950">{video.title}</h3>
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
                {[
                  {
                    title: "The first meal I did not do alone",
                    excerpt: "A short anonymous story about using support before, during, and after a hard meal — without numbers, comparison, or medical advice.",
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
                ].map((story) => (
                  <div key={story.title} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                    <h3 className="text-lg font-semibold text-stone-950">{story.title}</h3>
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
        </div>
      )}
    </>
  );
}

function Pill({ children }) {
  return <span className="text-sm font-semibold text-stone-700">{children}</span>;
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <div className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-stone-500">{eyebrow}</div>
      <h2 className="text-3xl font-semibold tracking-tight text-stone-950 md:text-5xl">{title}</h2>
      {children && <p className="mt-5 text-lg leading-8 text-stone-600">{children}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, children }) {
  return (
    <Card className="rounded-[2rem] border-stone-200 bg-white/80 shadow-sm">
      <CardContent className="p-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-3 text-xl font-semibold text-stone-950">{title}</h3>
        <p className="leading-7 text-stone-600">{children}</p>
      </CardContent>
    </Card>
  );
}

function CustomizeIcon({ className = "" }) {
  return (
    <span aria-hidden="true" className={`inline-block leading-none ${className}`}>
      {"\u2728"}
    </span>
  );
}

export default function GetWholeProjectPrototype() {
  const [selectedPrompt, setSelectedPrompt] = useState("What helped me through one hard moment today?");

  const prompts = useMemo(
    () => [
      "What helped me through one hard moment today?",
      "What did I need before, during, or after support?",
      "What is one thing I want my future self to remember?",
      "What made today harder, without judging myself?",
    ],
    []
  );

  return (
    <div id="top" className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8f3ed,transparent_34%),linear-gradient(180deg,#fffaf4_0%,#ffffff_42%,#f7f7f5_100%)] text-stone-950">
      <Nav />

      <main>
        <section className="relative overflow-hidden px-5 py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="mb-6 flex flex-wrap gap-3">
                <Pill>Anonymous by design</Pill>
                <Pill>No weight or calorie tracking</Pill>
                <Pill>Moderated stories</Pill>
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-stone-950 md:text-7xl">
                Get Whole Project
                <span className="mt-3 block text-3xl tracking-tight text-stone-600 md:text-5xl">Heal. Live. Give.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-9 text-stone-650">
                A judgment-free space for eating-disorder recovery — where people and families can find and share community-rated resources, moderated personal stories, reflection tools, and hope.
              </p>
              <p className="mt-5 max-w-2xl text-lg font-medium text-stone-800">You are not your disorder. Your whole life is still yours.</p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button className="h-12 rounded-full bg-stone-950 px-7 text-base text-white hover:bg-stone-800">
                  Get urgent help <LifeBuoy className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="h-12 rounded-full border-stone-300 bg-white px-7 text-base hover:bg-stone-50">
                  Explore private tools <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div className="relative rounded-[2.5rem] border border-stone-200 bg-white p-4 shadow-2xl shadow-stone-200/70">
                <div className="rounded-[2rem] bg-stone-950 p-5 text-white">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium uppercase tracking-[0.25em] text-stone-300">TODAY</div>
                      <div className="mt-3 text-2xl font-semibold">A few gentle steps for today.</div>
                      <p className="mt-3 text-sm leading-6 text-stone-300">
                        Affirmation: I can take this one moment at a time.
                      </p>
                    </div>
                    <div className="group relative inline-flex">
                      <a
                        href="#pricing"
                        aria-label="Customize today's affirmation and checklist"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white transition hover:bg-white/15"
                      >
                        <CustomizeIcon />
                      </a>
                      <div className="pointer-events-none absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white px-3 py-2 text-xs leading-5 text-stone-800 opacity-0 shadow-lg transition group-hover:opacity-100">
                        Upgrade to customize today’s affirmation and checklist.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      "Pause and take one slow breath",
                      "Use one support tool if needed",
                      "Notice one small win today",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30">
                          <Check className="h-3.5 w-3.5 text-white" />
                        </div>
                        <span className="text-sm text-stone-100">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-[2rem] bg-stone-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-stone-900">Reset Card</div>
                      <div className="mt-1 text-sm leading-6 text-stone-600">
                        Breathe, name the fear, choose the next tiny step.
                      </div>
                    </div>
                    <div className="group relative inline-flex">
                      <a
                        href="#pricing"
                        aria-label="Customize reset cards"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                      >
                        <CustomizeIcon />
                      </a>
                      <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-44 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                        Upgrade to customize reset cards.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 rounded-[2rem] bg-stone-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MessageCircleHeart className="h-5 w-5 text-stone-700" />
                      <div className="font-semibold">Journal Prompt</div>
                    </div>
                    <div className="group relative inline-flex">
                      <a
                        href="#pricing"
                        aria-label="Customize journal prompts"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-white text-xs font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
                      >
                        <CustomizeIcon />
                      </a>
                      <div className="pointer-events-none absolute right-0 top-full z-10 mt-2 w-44 rounded-2xl bg-stone-950 px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                        Upgrade to customize journal prompts.
                      </div>
                    </div>
                  </div>
                  <select
                    value={selectedPrompt}
                    onChange={(e) => setSelectedPrompt(e.target.value)}
                    className="mb-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none"
                  >
                    {prompts.map((prompt) => (
                      <option key={prompt}>{prompt}</option>
                    ))}
                  </select>
                  <div className="min-h-28 rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm leading-6 text-stone-500">
                    Write privately here. Your reflection is not public, not compared, and not used to diagnose or treat.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-14">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-rose-200 bg-rose-50 p-7 md:p-10">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
                  <LifeBuoy className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-semibold tracking-tight text-stone-950">Urgent help comes first.</h2>
                <p className="mt-4 leading-7 text-stone-700">
                  The free resource hub is designed for immediate direction: emergency warning signs, crisis resources, provider-call prep, and family support basics.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "If there is immediate danger, call emergency services.",
                  "If self-harm thoughts are present, use crisis resources now.",
                  "If eating, drinking, fainting, or vitals are unsafe, seek medical help.",
                  "This platform is not monitored for emergencies.",
                ].map((item) => (
                  <div key={item} className="rounded-3xl bg-white p-5 text-sm font-medium leading-6 text-stone-800 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="heal" className="px-5 py-20">
          <SectionTitle eyebrow="Heal" title="Support for the hard days.">
            Practical tools for moments when recovery feels loud: coping cards, meal-support reflections, treatment notes, and private journaling without triggering metrics.
          </SectionTitle>
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            <FeatureCard icon={Heart} title="Meal Support Reflection">
              Reflect on distress, emotions, support used, and what helped — without calories, weight, portions, or comparison.
            </FeatureCard>
            <FeatureCard icon={ClipboardList} title="Recovery Binder">
              Keep provider questions, appointments, school notes, insurance calls, and treatment timeline in one private place.
            </FeatureCard>
            <FeatureCard icon={ShieldCheck} title="Safety Guardrails">
              Product rules are designed to remove numbers, triggering details, PHI, self-harm methods, and peer medical advice.
            </FeatureCard>
          </div>
        </section>

        <section id="live" className="bg-stone-950 px-5 py-20 text-white">
          <SectionTitle eyebrow="Live" title="Recovery is not only about symptoms.">
            It is also about school, family, identity, confidence, routines, and feeling like life can become yours again.
          </SectionTitle>
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-4">
            {[
              [Home, "School & routine", "Return-to-school notes, accommodations, and daily structure."],
              [Users, "Family Circle", "Caregiver coordination across web, mobile, and shared devices."],
              [FileText, "Provider prep", "Questions, appointment notes, exports, and next-step planning."],
              [EyeOff, "Private by default", "Anonymous profiles with user-controlled sharing and deletion."],
            ].map(([Icon, title, text]) => (
              <div key={title} className="rounded-[2rem] bg-white/8 p-6">
                <Icon className="mb-5 h-7 w-7 text-stone-200" />
                <h3 className="mb-3 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-6 text-stone-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="give" className="px-5 py-20">
          <SectionTitle eyebrow="Give" title="Stories that give hope forward.">
            Users can submit anonymous recovery stories, but stories are moderated before publishing to protect privacy and reduce harm.
          </SectionTitle>
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-5 md:grid-cols-3">
              {stories.map((story) => (
                <Card key={story.title} className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-stone-600">
                      {story.category}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-stone-950">{story.title}</h3>
                    <p className="text-sm leading-7 text-stone-600">{story.excerpt}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="rounded-[2rem] border-stone-200 bg-stone-50 shadow-sm">
              <CardContent className="p-7">
                <div className="mb-5 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-stone-800" />
                  <h3 className="text-xl font-semibold">Story Safety Standard</h3>
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
        <div id="stories" />

        <section id="pricing" className="px-5 py-20">
          <SectionTitle eyebrow="Pricing" title="Start free. Stay private. Add tools when ready.">
            A low-cost ladder designed for access: urgent resources are free, private tools are affordable, and family coordination is available when support involves more than one person.
          </SectionTitle>
          <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`rounded-[2rem] border shadow-sm ${tier.featured ? "border-stone-950 bg-stone-950 text-white" : "border-stone-200 bg-white"}`}>
                <CardContent className="flex h-full flex-col p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold">{tier.name}</h3>
                    {tier.featured && <Sparkles className="h-6 w-6" />}
                  </div>
                  <div className="text-4xl font-semibold tracking-tight">{tier.price}</div>
                  <p className={`mt-2 text-sm ${tier.featured ? "text-stone-300" : "text-stone-500"}`}>{tier.note}</p>
                  <div className="my-7 space-y-3">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex gap-3 text-sm leading-6">
                        <Check className={`mt-0.5 h-5 w-5 flex-none ${tier.featured ? "text-white" : "text-stone-900"}`} />
                        <span className={tier.featured ? "text-stone-100" : "text-stone-650"}>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className={`mt-auto h-11 rounded-full ${tier.featured ? "bg-white text-stone-950 hover:bg-stone-100" : "bg-stone-950 text-white hover:bg-stone-800"}`}>
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
              <CardContent className="p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold">Privacy promise</h3>
                <p className="mt-4 leading-7 text-stone-600">
                  GWP is designed to avoid names, public profiles, body metrics, medical records, and unnecessary personal identifiers. Users control what they save, export, share, and delete.
                </p>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-stone-200 bg-white shadow-sm">
              <CardContent className="p-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100 text-stone-900">
                  <CircleDollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-semibold">Clear boundary</h3>
                <p className="mt-4 leading-7 text-stone-600">
                  GWP provides organization, reflection, storytelling, and support tools. It does not diagnose, treat, monitor emergencies, or replace medical, nutritional, psychiatric, or crisis care.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white px-5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-semibold">Get Whole Project</div>
            <div className="text-sm text-stone-500">Heal. Live. Give.</div>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-stone-500">
            <a href="#" className="hover:text-stone-950">Safety Standard</a>
            <a href="#" className="hover:text-stone-950">Privacy</a>
            <a href="#" className="hover:text-stone-950">Terms</a>
            <a href="#" className="hover:text-stone-950">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
