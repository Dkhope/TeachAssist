import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, MessageSquareHeart, Send, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { generateChatReply, suggestedPrompts } from "@/lib/mock-ai";
import { logActivity, useFavourites } from "@/lib/storage";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — TeachAssist" },
      {
        name: "description",
        content:
          "A teaching assistant you can chat with about lesson planning, behaviour, marking and parent communication.",
      },
      { property: "og:title", content: "AI Assistant — TeachAssist" },
      {
        property: "og:description",
        content:
          "A teaching assistant you can chat with about lesson planning, behaviour, marking and parent communication.",
      },
    ],
  }),
  component: Assistant,
});

type Message = { id: string; role: "user" | "assistant"; content: string };

const STORE = "teachassist:chat";

function renderRich(text: string) {
  return text.split("\n").map((line, i) => {
    if (!line.trim()) return <span key={i} className="block h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-sm leading-relaxed">
        {parts.map((p, j) =>
          p.startsWith("**") && p.endsWith("**") ? (
            <strong key={j}>{p.slice(2, -2)}</strong>
          ) : (
            <span key={j}>{p}</span>
          ),
        )}
      </p>
    );
  });
}

function Assistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { add } = useFavourites();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) setMessages(JSON.parse(raw) as Message[]);
    } catch {
      /* ignore */
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: prompt }]);
    setInput("");
    setLoading(true);
    const reply = await generateChatReply(prompt);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: reply }]);
    setLoading(false);
    logActivity("AI Assistant", prompt.slice(0, 60));
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <PageHeader
          icon={MessageSquareHeart}
          title="AI Assistant"
          description="Think out loud with an assistant that knows teaching."
        />
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="no-print"
            onClick={() => {
              setMessages([]);
              toast.success("Conversation cleared");
            }}
          >
            <Trash2 className="size-4" /> Clear
          </Button>
        )}
      </div>

      {messages.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="space-y-4 pt-6 text-center">
            <span className="surface-primary mx-auto grid size-12 place-items-center rounded-2xl text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <h3 className="text-base font-semibold">What shall we work on?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick a starting point or type your own question below.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border bg-card px-3.5 py-2 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {messages.map((m) =>
          m.role === "user" ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-card">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="group max-w-[92%] space-y-2">
              <div className="space-y-1">{renderRich(m.content)}</div>
              <Button
                variant="ghost"
                size="sm"
                className="no-print h-7 px-2 text-xs"
                onClick={() => {
                  add({ tool: "AI Assistant", title: m.content.slice(0, 60), content: m.content });
                  toast.success("Saved to favourites");
                }}
              >
                <Star className="size-3.5" /> Save
              </Button>
            </div>
          ),
        )}
        {loading && (
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-2 animate-bounce rounded-full bg-primary"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="no-print sticky bottom-4 rounded-2xl border bg-card p-3 shadow-soft">
        <Textarea
          ref={inputRef}
          rows={2}
          value={input}
          placeholder="Ask about planning, behaviour, marking, parents…"
          className="resize-none border-0 shadow-none focus-visible:ring-0"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
        />
        <div className="flex justify-end pt-2">
          <Button size="icon" disabled={loading || !input.trim()} onClick={() => void send(input)}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
