import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "How do you do. Please tell me your problem.",
};

const API_URL = "/v1/chat/completions";

const BOOT_LINES = [
  "INITIALIZING SYSTEM...",
  "MEM CHECK: 64K RAM SYSTEM  64K RAM OK",
  "LOADING ELIZA.SYS .......... OK",
  "LOADING NLP MODULE ......... OK",
  "LOADING RESPONSE DB ........ OK",
  "",
  "  ╔══════════════════════════════════╗",
  "  ║         E L I Z A  v1.0         ║",
  "  ║     MIT AI LAB - JUNE 1966      ║",
  "  ║   JOSEPH WEIZENBAUM, PH.D.      ║",
  "  ╚══════════════════════════════════╝",
  "",
  "READY.",
  "",
];

const ElizaTerminal = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bootPhase, setBootPhase] = useState<"off" | "powering" | "booting" | "ready">("off");
  const [bootLines, setBootLines] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot sequence
  useEffect(() => {
    // Phase 1: black screen -> white flash -> screen on
    const t1 = setTimeout(() => setBootPhase("powering"), 300);
    const t2 = setTimeout(() => setBootPhase("booting"), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (bootPhase !== "booting") return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBootPhase("ready"), 600);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [bootPhase]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, bootLines]);

  useEffect(() => {
    if (bootPhase === "ready") inputRef.current?.focus();
  }, [bootPhase]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "elizabot",
          messages: updatedHistory,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "...";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "*** CONNECTION ERROR ***" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // Phase: off / powering (white flash)
  if (bootPhase === "off") {
    return (
      <div className="w-full max-w-2xl h-[78vh] bg-background" style={{ borderRadius: "24px" }} />
    );
  }

  if (bootPhase === "powering") {
    return (
      <div
        className="w-full max-w-2xl h-[78vh] crt-power-flash"
        style={{ borderRadius: "24px" }}
      />
    );
  }

  return (
    <div
      className={`relative w-full max-w-2xl crt-scanlines crt-vignette ${bootPhase === "ready" ? "crt-flicker" : ""} crt-turn-on`}
      style={{ borderRadius: "24px" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        className="relative overflow-hidden border-2 border-border bg-card"
        style={{ borderRadius: "24px" }}
      >
        <div className="h-[70vh] overflow-y-auto px-6 py-5 space-y-1">
          {/* Boot sequence */}
          {bootPhase === "booting" && (
            <>
              {bootLines.map((line, i) => (
                <div key={`boot-${i}`} className="text-left">
                  <span className="crt-text-subtle text-foreground text-lg whitespace-pre">
                    {line}
                  </span>
                </div>
              ))}
              <span className="cursor-blink text-foreground crt-text text-lg">█</span>
            </>
          )}

          {/* Chat messages (after boot) */}
          {bootPhase === "ready" && (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`${msg.role === "user" ? "text-right" : "text-left"} mt-2`}>
                  <span className="crt-text-subtle text-foreground text-lg leading-relaxed">
                    {msg.role === "user" ? "> YOU: " : "> ELIZA: "}
                    {msg.content}
                  </span>
                </div>
              ))}

              {isLoading && (
                <div className="text-left mt-2">
                  <span className="crt-text-subtle text-muted-foreground text-lg">
                    &gt; ELIZA: Processing
                    <span className="cursor-blink">█</span>
                  </span>
                </div>
              )}
            </>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input - only show when ready */}
        {bootPhase === "ready" && (
          <div className="border-t border-border px-6 py-4 flex items-center gap-2">
            <span className="crt-text text-foreground text-lg">&gt;</span>
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder=""
                className="w-full bg-transparent text-foreground text-lg crt-text-subtle outline-none border-none caret-transparent"
                style={{ fontFamily: "var(--font-mono)" }}
              />
              <span
                className="absolute top-0 left-0 text-lg pointer-events-none crt-text"
                style={{ fontFamily: "var(--font-mono)" }}
                aria-hidden
              >
                <span className="invisible">{input}</span>
                <span className="cursor-blink text-foreground">█</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElizaTerminal;
