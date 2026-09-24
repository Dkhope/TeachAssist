import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BookOpenCheck, Lightbulb, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState, ThinkingState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ResultActions } from "@/components/result-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateResearch, type ResearchResult } from "@/lib/mock-ai";
import { logActivity } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — TeachAssist" },
      {
        name: "description",
        content:
          "Paste a topic, article or link and get a concise summary, key takeaways and classroom ideas.",
      },
      { property: "og:title", content: "Research Assistant — TeachAssist" },
      {
        property: "og:description",
        content:
          "Paste a topic, article or link and get a concise summary, key takeaways and classroom ideas.",
      },
    ],
  }),
  component: Research,
});

function Research() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const run = async () => {
    if (input.trim().length < 3) {
      toast.error("Enter a topic, some text, or a link");
      return;
    }
    setLoading(true);
    setResult(null);
    const res = await generateResearch(input);
    setResult(res);
    setLoading(false);
    logActivity("Research Assistant", res.title);
  };

  const text = result
    ? `${result.title}\n\n${result.summary}\n\nKey takeaways:\n${result.takeaways
        .map((t) => `• ${t}`)
        .join("\n")}\n\nClassroom ideas:\n${result.classroomIdeas
        .map((t) => `• ${t}`)
        .join("\n")}\n\nWatch-outs:\n${result.watchOuts.map((t) => `• ${t}`).join("\n")}`
    : "";

  return (
    <div className="space-y-8">
      <PageHeader
        icon={BookOpenCheck}
        title="Research Assistant"
        description="Turn a topic, article or web link into something you can actually use on Monday morning."
      />

      <Card className="no-print shadow-card">
        <CardHeader>
          <CardTitle className="text-base">What are you researching?</CardTitle>
          <CardDescription>
            A topic ("retrieval practice in primary maths"), pasted article text, or a URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            rows={6}
            placeholder="e.g. Cognitive load theory for mixed-ability science classes"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={run} disabled={loading} className="w-full sm:w-auto">
            <Sparkles className="size-4" /> {loading ? "Researching…" : "Generate insights"}
          </Button>
        </CardContent>
      </Card>

      {loading && <ThinkingState label="Reading, summarising and pulling out teaching insights…" />}

      {!loading && !result && (
        <EmptyState
          icon={Search}
          title="No research yet"
          hint="Add a topic above and you'll get a summary, key takeaways, classroom ideas and things to be cautious about."
        />
      )}

      {result && (
        <section className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <h2 className="min-w-0 truncate text-lg font-semibold">{result.title}</h2>
            <ResultActions tool="Research Assistant" title={result.title} content={text} />
          </div>

          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed">{result.summary}</CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="size-4" /> Key takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.takeaways.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Try this in class</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {result.classroomIdeas.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary-foreground/60" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-secondary bg-accent/40 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4" /> Worth checking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {result.watchOuts.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
