import { Mic, MicOff, Volume2, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n, useVoiceLang } from "@/lib/i18n";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onSpeak?: (text: string) => void;
  placeholder?: string;
  className?: string;
  size?: "default" | "large";
}

export function VoiceInput({ onTranscript, className, size = "default" }: VoiceInputProps) {
  const { t, lang } = useI18n();
  const voiceLang = useVoiceLang();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const start = () => {
    const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = voiceLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const text = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(" ");
      setTranscript(text);
      if (e.results[0].isFinal) {
        onTranscript(text);
        setListening(false);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
    setTranscript("");
    // Haptic feedback if available
    try {
      navigator.vibrate?.(40);
    } catch {}
  };

  const stop = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setListening(false);
  };

  if (!supported) {
    return (
      <p className={`text-xs text-muted-foreground ${className ?? ""}`} role="note">
        Voice not supported on this device. Type your question instead.
      </p>
    );
  }

  const large = size === "large";
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-label={listening ? t("common.action.listening") : t("common.action.tapToSpeak")}
        aria-pressed={listening}
        className={`inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-95 ${
          listening
            ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
        } ${large ? "h-14 w-14 text-base" : "h-11 w-11"}`}
        style={{ minHeight: large ? 56 : 44, minWidth: large ? 56 : 44 }}
      >
        {listening ? <Square className="h-5 w-5" aria-hidden="true" /> : <Mic className="h-5 w-5" aria-hidden="true" />}
      </button>
      <span className={`text-sm ${listening ? "text-destructive font-medium" : "text-muted-foreground"}`} aria-live="polite">
        {listening ? t("common.action.listening") : transcript ? `"${transcript}"` : t("common.action.tapToSpeak")}
      </span>
    </div>
  );
}

export function ReadAloud({ text, langHint }: { text: string; langHint?: string }) {
  const { lang } = useI18n();
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const langMap: Record<string, string> = { en: "en-NG", ha: "ha-NG", yo: "yo-NG", ig: "ig-NG", igl: "en-NG", pcm: "en-NG", ar: "ar-SA" };
  const voiceLang = langMap[langHint ?? lang] ?? "en-NG";

  const toggle = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!text.trim()) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceLang;
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    speechSynthesis.speak(u);
    setSpeaking(true);
    try {
      navigator.vibrate?.(20);
    } catch {}
  };

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      try {
        if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={speaking}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
      {speaking ? "Stop" : "Read aloud"}
    </button>
  );
}
