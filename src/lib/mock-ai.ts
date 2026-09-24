export type Priority = "high" | "medium" | "low";

export type Task = {
  id: string;
  title: string;
  deadline: string;
  priority: Priority;
  minutes: number;
};

export type ScheduleBlock = {
  time: string;
  title: string;
  detail: string;
  priority: Priority;
};

export type ScheduleDay = {
  day: string;
  focus: string;
  blocks: ScheduleBlock[];
};

export type SchedulePlan = {
  summary: string;
  days: ScheduleDay[];
  tips: string[];
};

export type ResearchResult = {
  title: string;
  summary: string;
  takeaways: string[];
  classroomIdeas: string[];
  watchOuts: string[];
};

const priorityWeight: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function startTimes(start = 8 * 60, step = 45) {
  let t = start;
  return () => {
    const h = Math.floor(t / 60);
    const m = t % 60;
    t += step;
    if (t === 12 * 60 + 15) t += 30;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export async function generateSchedule(
  tasks: Task[],
  mode: "daily" | "weekly",
): Promise<SchedulePlan> {
  await delay(1400);

  const sorted = [...tasks].sort((a, b) => {
    const p = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (p !== 0) return p;
    return (a.deadline || "9999").localeCompare(b.deadline || "9999");
  });

  const highCount = sorted.filter((t) => t.priority === "high").length;
  const totalMinutes = sorted.reduce((s, t) => s + t.minutes, 0);

  if (mode === "daily") {
    const next = startTimes();
    const blocks: ScheduleBlock[] = sorted.map((t) => ({
      time: next(),
      title: t.title,
      detail: `${t.minutes} min focus block${t.deadline ? ` · due ${t.deadline}` : ""}`,
      priority: t.priority,
    }));
    blocks.splice(Math.min(2, blocks.length), 0, {
      time: "10:45",
      title: "Recovery break & inbox sweep",
      detail: "Protects energy before the next deep-work block.",
      priority: "low",
    });
    return {
      summary: `Your day is organised around ${highCount} high-priority item${
        highCount === 1 ? "" : "s"
      }, with roughly ${Math.round(totalMinutes / 60)}h of focused work scheduled. Demanding tasks sit in the morning, when attention is strongest, and admin work is grouped later to reduce context switching.`,
      days: [{ day: "Today", focus: sorted[0]?.title ?? "Planning", blocks }],
      tips: [
        "Keep the first 90 minutes free of email — it is your highest-value marking and planning window.",
        "Batch parent communication into one afternoon slot instead of replying throughout the day.",
        "If a block overruns, move the lowest-priority item to tomorrow rather than shortening breaks.",
      ],
    };
  }

  const days: ScheduleDay[] = daysOfWeek.map((day, i) => {
    const next = startTimes(9 * 60, 60);
    const mine = sorted.filter((_, idx) => idx % daysOfWeek.length === i);
    return {
      day,
      focus: mine[0]?.title ?? "Flexible catch-up and preparation",
      blocks: mine.length
        ? mine.map((t) => ({
            time: next(),
            title: t.title,
            detail: `${t.minutes} min${t.deadline ? ` · due ${t.deadline}` : ""}`,
            priority: t.priority,
          }))
        : [
            {
              time: "09:00",
              title: "Buffer & catch-up",
              detail: "Reserved for overruns, marking and unplanned meetings.",
              priority: "low",
            },
          ],
    };
  });

  return {
    summary: `Your week spreads ${sorted.length} task${
      sorted.length === 1 ? "" : "s"
    } across five days, front-loading deadline-critical work to Monday and Tuesday and leaving Friday lighter for reflection and planning ahead.`,
    days,
    tips: [
      "Protect one full afternoon for marking — spreading it thinly across days costs more time overall.",
      "Review the plan each morning; a weekly schedule works best as a guide, not a contract.",
      "Leave Friday afternoon for next week's preparation so Monday starts calmly.",
    ],
  };
}

export async function generateResearch(input: string): Promise<ResearchResult> {
  await delay(1600);
  const isUrl = /^https?:\/\//i.test(input.trim());
  const topic = isUrl
    ? input.trim().replace(/^https?:\/\//, "").split("/")[0]
    : input.trim().split(/\s+/).slice(0, 8).join(" ");

  return {
    title: isUrl ? `Source review: ${topic}` : `Research brief: ${topic}`,
    summary: `This material centres on ${topic.toLowerCase()} and its practical implications for classroom teaching. The core argument is that learning improves most when new material is introduced in small steps, practised actively, and revisited over spaced intervals rather than covered once in depth. Evidence cited points to consistent gains for low-stakes retrieval practice and clear, worked examples, particularly for students who are still building foundational knowledge. The material also stresses that strategies must be adapted to context: what works in a well-resourced setting may need modification for larger or more mixed-ability classes.`,
    takeaways: [
      "Short, frequent retrieval practice produces stronger retention than re-reading or single long revision sessions.",
      "Worked examples reduce cognitive load for novices; fade the scaffolding as competence grows.",
      "Feedback is most effective when it is specific, actionable and given while the task is still live.",
      "Spacing and interleaving feel harder for students, but consistently improve long-term recall.",
    ],
    classroomIdeas: [
      "Open each lesson with a five-question quiz drawn from last week and last term.",
      "Model one full worked example before releasing students into paired practice.",
      "Replace one written feedback cycle per unit with live verbal feedback during the task.",
      "Build a rolling revision calendar so every topic resurfaces at least three times per term.",
    ],
    watchOuts: [
      "Findings come largely from controlled studies — expect smaller effects in busy classrooms.",
      "Check whether the evidence covers your age group and subject before adopting it wholesale.",
    ],
  };
}

const chatResponses: { match: RegExp; reply: string }[] = [
  {
    match: /lesson plan|plan a lesson/i,
    reply: `Here's a structure you can adapt for a 50-minute lesson:\n\n**1. Retrieval starter (5 min)** — four quick questions mixing last lesson and last term.\n\n**2. Explicit teaching (12 min)** — introduce the new idea in two or three small steps, checking understanding after each with a quick whole-class response.\n\n**3. Worked example (8 min)** — model the thinking aloud, then do a second example together.\n\n**4. Guided practice (15 min)** — students work in pairs while you circulate; target three students you want to hear from.\n\n**5. Independent check (7 min)** — a short task done alone so you can see who has it.\n\n**6. Exit ticket (3 min)** — one question that tells you what to reteach.\n\nTell me the subject, year group and topic and I'll fill this in properly.`,
  },
  {
    match: /behaviour|behavior|disrupt|classroom management/i,
    reply: `A few things that reliably help, in order of impact:\n\n- **Routines beat consequences.** Teach the entry, transition and packing-up routines explicitly, and rehearse them until they're automatic.\n- **Narrate the positive.** Naming two or three students doing the right thing shifts the room faster than addressing the one who isn't.\n- **Least invasive first.** Proximity, a pause, a name — escalate only when needed, and keep your voice level.\n- **Reset privately.** A 30-second conversation at the door after the lesson preserves the relationship far better than a public exchange.\n\nIf one particular student is the concern, tell me a bit more and I'll suggest something specific.`,
  },
  {
    match: /marking|grading|feedback|workload/i,
    reply: `Marking is usually the biggest single drain, and most of it can be cut without losing quality:\n\n- **Whole-class feedback sheets** — read the set, note the common errors, and teach to those in one slot rather than writing the same comment 28 times.\n- **Live marking** — circulate with a pen during independent work; feedback lands while the thinking is fresh.\n- **Sampling** — for low-stakes work, mark a representative third in depth and skim the rest.\n- **Self- and peer-marking** with a clear rubric for anything with objective answers.\n\nA realistic target is one deep-marked piece per unit, with everything else checked more lightly.`,
  },
  {
    match: /differentiat|mixed ability|send|support/i,
    reply: `Differentiation works best as **the same ambitious task with different support**, not different tasks:\n\n- Keep the learning goal identical for everyone.\n- Vary the scaffolding: sentence starters, partially completed examples, knowledge organisers, glossaries.\n- Plan the questions you'll direct to specific students in advance.\n- Give extension by depth — "now justify it", "now find a counter-example" — rather than more of the same.\n\nThis keeps expectations high while giving students who need it a genuine route in.`,
  },
  {
    match: /parent|report|email/i,
    reply: `For parent communication, a simple three-part structure works well:\n\n1. **Something genuine and specific** the student does well.\n2. **The concern, in observable terms** — "has not completed homework in three of the last four weeks", not "is lazy".\n3. **One clear, shared next step** and when you'll check in again.\n\nKeep it under 150 words, avoid jargon, and send it before the problem is urgent. Want me to draft one? Tell me the situation.`,
  },
];

export async function generateChatReply(prompt: string): Promise<string> {
  await delay(1200);
  const hit = chatResponses.find((r) => r.match.test(prompt));
  if (hit) return hit.reply;
  return `Good question — here's how I'd approach "${prompt.trim()}":\n\n**Start with the outcome.** Get specific about what you want students to be able to do by the end, and how you'll know.\n\n**Work backwards.** Identify the two or three steps that stand between where they are now and that outcome, and sequence them smallest-first.\n\n**Build in a check.** Plan one quick way to see who has it before you move on — a mini-whiteboard question, an exit ticket, a hinge question.\n\n**Keep it sustainable.** Whatever you design, ask whether you could run it every week. If not, simplify it now rather than abandoning it in three weeks.\n\nIf you share the year group, subject and any constraints, I can make this a lot more concrete.`;
}

export const suggestedPrompts = [
  "Plan a 50-minute lesson on fractions for Year 5",
  "How do I reduce my marking workload this term?",
  "Give me strategies for a disruptive Year 9 class",
  "Draft an email to a parent about missing homework",
  "Ideas for differentiating a mixed-ability science lesson",
  "Write five retrieval questions on photosynthesis",
];
