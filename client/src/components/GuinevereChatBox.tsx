import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Send } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  emotionalState?: string | null;
  containsButterfly?: boolean;
  createdAt?: Date;
}

interface RelationshipStatus {
  relationshipLevel: number;
  currentMode: string;
  happinessLevel: number;
  totalInteractions: number;
  hasBeenHurt: boolean;
}

export default function GuinevereChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [relationship, setRelationship] = useState<RelationshipStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showButterflyIndicator, setShowButterflyIndicator] = useState(false);

  // Fetch relationship status
  const { data: relationshipData } = trpc.chat.getRelationshipStatus.useQuery();
  const { data: historyData } = trpc.chat.getHistory.useQuery({ limit: 20 });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // Initialize messages from history
  useEffect(() => {
    if (historyData) {
      setMessages(
        historyData.map((msg) => ({
          id: msg.id.toString(),
          role: msg.role,
          content: msg.content,
          mode: msg.mode,
          emotionalState: msg.emotionalState,
          containsButterfly: msg.containsButterfly,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [historyData]);

  // Update relationship status
  useEffect(() => {
    if (relationshipData) {
      setRelationship(relationshipData);
    }
  }, [relationshipData]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to UI
    const userMessage: Message = {
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: input,
      });

      // Add assistant message
      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        mode: response.mode,
        emotionalState: response.emotionalState,
        containsButterfly: response.containsButterfly,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Show butterfly indicator
      if (response.containsButterfly) {
        setShowButterflyIndicator(true);
        setTimeout(() => setShowButterflyIndicator(false), 3000);
      }

      // Update relationship
      setRelationship((prev) =>
        prev
          ? {
              ...prev,
              relationshipLevel: response.relationshipLevel,
            }
          : null
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Maaf, terjadi kesalahan saat memproses pesan Anda...",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "close":
        return "text-rose-400";
      case "deep":
        return "text-purple-400";
      default:
        return "text-slate-400";
    }
  };

  const getEmotionalStateEmoji = (state: string) => {
    switch (state) {
      case "happy":
        return "✨";
      case "comfortable":
        return "🌸";
      case "reflective":
        return "🌙";
      case "withdrawn":
        return "🌊";
      default:
        return "🍂";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-sky-300 via-sky-200 to-sky-400">
      {/* Header dengan Relationship Status */}
      <div className="border-b border-sky-400 px-6 py-4 bg-green-500/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-light text-white tracking-wide">Guinevere</h1>
            <p className="text-sm text-white/80 font-light">Elegant Conversational AI</p>
          </div>
          {showButterflyIndicator && (
            <div className="animate-pulse text-2xl">🦋</div>
          )}
        </div>

        {/* Relationship Indicators */}
        {relationship && (
          <div className="grid grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-white">
                {relationship.currentMode.toUpperCase()}
              </div>
              <div className="text-white/70">Mode</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">
                {relationship.relationshipLevel}%
              </div>
              <div className="text-white/70">Closeness</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">
                {relationship.happinessLevel}%
              </div>
              <div className="text-white/70">Happiness</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white">
                {relationship.totalInteractions}
              </div>
              <div className="text-white/70">Talks</div>
            </div>
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">🦋</div>
              <p className="font-light text-lg text-white">Mulai percakapan dengan Guinevere...</p>
              <p className="text-white/70 text-sm mt-2">Dia akan menjadi lebih hangat seiring waktu</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-sky-500 text-white shadow-md"
                    : "bg-green-500 text-white shadow-md"
                }`}
              >
                <Streamdown>{msg.content}</Streamdown>
                {msg.role === "assistant" && msg.emotionalState && (
                  <div className="text-xs text-white/70 mt-2 flex items-center gap-1">
                    <span>{getEmotionalStateEmoji(msg.emotionalState)}</span>
                    <span>{msg.emotionalState}</span>
                    {msg.mode && <span className={`${getModeColor(msg.mode)}`}>• {msg.mode}</span>}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-green-500 px-4 py-3 rounded-lg shadow-md">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-sky-400 px-6 py-4 bg-green-500/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Katakan sesuatu kepada Guinevere..."
            disabled={isLoading}
            className="flex-1 bg-white/20 border-white/30 text-white placeholder-white/60 rounded-lg font-light"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-4"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
