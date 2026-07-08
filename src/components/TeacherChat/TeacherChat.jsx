import React, { useEffect, useRef, useState, useCallback } from "react";
import { MessageSquareText, Send, X } from "lucide-react";
import { io } from "socket.io-client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { apiService } from "../../lib/apiService";

const API_URL = import.meta.env.VITE_API_URL;

const initialsOf = (name) =>
  (name || "")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const STATUS_META = {
  connecting: { label: "Connecting…", dot: "bg-amber-400 animate-pulse", text: "text-amber-600 dark:text-amber-400" },
  live: { label: "Live", dot: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
  error: { label: "Offline", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  disabled: { label: "Not configured", dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

export default function TeacherChat({ isOpen, onClose, projectId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(API_URL ? "connecting" : "disabled");
  const [connError, setConnError] = useState("");
  const scrollRef = useRef(null);
  const socketRef = useRef(null);

  const loadMessages = useCallback(async ({ showSpinner = false } = {}) => {
    if (!projectId) return;
    if (showSpinner) setLoading(true);
    try {
      const data = await apiService.getTeacherMessages(projectId);
      setMessages(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(`Couldn't load history from ${API_URL || "(no server URL)"}: ${err.message || "unknown error"}`);
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!isOpen || !projectId || !API_URL) return;

    loadMessages({ showSpinner: true });

    const socket = io(API_URL, { timeout: 10000 });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("live");
      setConnError("");
      socket.emit("joinProject", projectId);
      loadMessages();
    });

    socket.on("teacherChatUpdated", (updated) => {
      setMessages(Array.isArray(updated) ? updated : []);
    });

    socket.on("connect_error", (err) => {
      setStatus("error");
      const detail = err?.description ? `${err.message} (status ${err.description})` : (err?.message || "unknown error");
      setConnError(`Realtime connection failed: ${detail}`);
    });

    socket.on("disconnect", (reason) => {
      setStatus("error");
      setConnError(`Realtime disconnected (${reason}). Retrying…`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, projectId, loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending || !projectId) return;
    setSending(true);
    setError("");
    try {
      const updated = await apiService.sendTeacherMessage(projectId, content);
      setMessages(Array.isArray(updated) ? updated : []);
      setInput("");
    } catch (err) {
      setError(`Send failed: ${err.message || "unknown error"}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div className="flex items-center gap-2.5">
            <MessageSquareText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Teacher Chat</span>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${STATUS_META[status].text}`} title={connError || undefined}>
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[status].dot}`} />
              {STATUS_META[status].label}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-zinc-400 dark:text-zinc-500 select-none">
              Loading chat…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-zinc-400 dark:text-zinc-500 py-20">
              <MessageSquareText className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm max-w-xs select-none">
                No messages yet. Chat with your teacher or students here.
              </p>
            </div>
          ) : (
            <div className="space-y-5 pb-2">
              {messages.map((msg, i) => {
                const isOwn = msg.authorId === currentUserId;
                return (
                  <div key={i} className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-zinc-200 dark:bg-zinc-800 text-xs text-zinc-800 dark:text-white">
                        {isOwn ? "ME" : initialsOf(msg.authorName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[80%]`}>
                      <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-600 mb-1 px-1 uppercase tracking-wider select-none">
                        {isOwn ? "You" : (msg.authorName || "User")} · {formatTime(msg.createdAt)}
                      </span>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                          isOwn
                            ? "bg-indigo-600 text-white rounded-tr-sm"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm border border-zinc-200 dark:border-zinc-700"
                        }`}
                      >
                        <span className="select-text font-sans whitespace-pre-wrap">{msg.content}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-950 shrink-0 border-t border-zinc-100 dark:border-zinc-900">
          {(connError || error || status === "disabled") && (
            <div className="mb-2 space-y-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-2.5">
              {status === "disabled" && (
                <p className="text-[11px] leading-snug text-rose-600 dark:text-rose-400 break-words">
                  <span className="font-semibold">Chat unavailable —</span> VITE_API_URL is not set.
                </p>
              )}
              {connError && (
                <p className="text-[11px] leading-snug text-rose-600 dark:text-rose-400 break-words">
                  <span className="font-semibold">Realtime:</span> {connError}
                </p>
              )}
              {error && (
                <p className="text-[11px] leading-snug text-rose-600 dark:text-rose-400 break-words">{error}</p>
              )}
            </div>
          )}
          <div className="relative flex items-center border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 focus-within:border-zinc-400 dark:focus-within:border-zinc-700 transition-colors">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Send message…"
              className="w-full bg-transparent border-0 focus-visible:ring-0 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 pl-4 pr-12 h-12"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              size="icon"
              className={`absolute right-1.5 h-9 w-9 rounded-lg transition-all ${
                input.trim() && !sending
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600"
              }`}
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
