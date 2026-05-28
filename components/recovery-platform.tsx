// @ts-nocheck
"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShieldCheck,
  Users,
  LifeBuoy,
  ClipboardList,
  MessageCircleHeart,
  Check,
  ArrowRight,
  EyeOff,
  FileText,
  Home,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CustomizeIcon } from "@/components/ui/customize-icon";
import { SectionHeader } from "@/components/ui/headers";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNav } from "@/components/layout/site-nav";

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

function Pill({ children }) {
  return <span className="text-sm font-semibold text-stone-700">{children}</span>;
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
      <SiteNav />

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
                <a href="/find-help" className="inline-flex h-12 items-center justify-center rounded-full bg-stone-950 px-7 text-base font-medium text-white transition hover:bg-stone-800">
                  Get urgent help <LifeBuoy className="ml-2 h-5 w-5" />
                </a>
                <a href="/find-support" className="inline-flex h-12 items-center justify-center rounded-full border border-stone-300 bg-white px-7 text-base font-medium text-stone-950 transition hover:bg-stone-50">
                  Explore private tools <ArrowRight className="ml-2 h-5 w-5" />
                </a>
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
                    <TooltipIconButton
                      className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                      href="/find-support"
                      icon={<CustomizeIcon />}
                      label="Customize today's affirmation and checklist"
                      tooltip="Upgrade to customize today's affirmation and checklist."
                    />
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
                    <TooltipIconButton
                      href="/find-support"
                      icon={<CustomizeIcon />}
                      label="Customize reset cards"
                      tooltip="Upgrade to customize reset cards."
                    />
                  </div>
                </div>
                <div className="mt-4 rounded-[2rem] bg-stone-50 p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <MessageCircleHeart className="h-5 w-5 text-stone-700" />
                      <div className="font-semibold">Journal Prompt</div>
                    </div>
                    <TooltipIconButton
                      href="/find-support"
                      icon={<CustomizeIcon />}
                      label="Customize journal prompts"
                      tooltip="Upgrade to customize journal prompts."
                    />
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

        <section id="find-help" className="px-5 py-14">
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
          <SectionHeader eyebrow="Heal" title="Support for the hard days.">
            Practical tools for moments when recovery feels loud: coping cards, meal-support reflections, treatment notes, and private journaling without triggering metrics.
          </SectionHeader>
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
          <SectionHeader eyebrow="Live" title="Recovery is not only about symptoms." tone="dark">
            It is also about school, family, identity, confidence, routines, and feeling like life can become yours again.
          </SectionHeader>
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
          <SectionHeader eyebrow="Give" title="Stories that give hope forward.">
            Users can submit anonymous recovery stories, but stories are moderated before publishing to protect privacy and reduce harm.
          </SectionHeader>
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

      </main>

      <SiteFooter />
    </div>
  );
}
