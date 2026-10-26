import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { AsyncBody, Button, EmptyState, LargeTitle, PullToRefresh, Screen, Sheet, StackHeader, cardClass } from "@/components/app/ui";
import type { AppNotification } from "@/data/types";
import { formatDateTimeET, isTodayET } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MessagesScreen() {
  const navigate = useNavigate();
  const { threads, pushToast } = useApp();
  return (
    <Screen tab tone="surface">
      <LargeTitle title="Messages" />
      <PullToRefresh onRefresh={() => pushToast("Messages updated")}>
        <AsyncBody boot emptyTitle="No messages" emptyBody="Dispatch and shipment threads will appear here.">
          <div className="space-y-2 px-4 pb-6">
            {threads.map((thread) => (
              <button key={thread.id} type="button" onClick={() => navigate({ to: "/messages/$id", params: { id: thread.id } })} className={cn(cardClass(), "flex w-full items-start gap-3 p-3 text-left")}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003DF9]/10 text-[12px] font-semibold text-[#003DF9]">
                  {thread.title.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[16px] font-semibold text-[#0F172A]">{thread.title}</span>
                    {thread.unread > 0 ? <span className="rounded-full bg-[#CF0300] px-2 py-0.5 text-[12px] font-semibold text-white">{thread.unread}</span> : null}
                  </span>
                  <span className="block text-[12px] text-[#64748B]">{thread.subtitle}{thread.shipmentId ? ` · ${thread.shipmentId}` : ""}</span>
                  <span className="mt-1 block truncate text-[14px] text-[#475569]">{thread.messages[thread.messages.length - 1]?.text}</span>
                </span>
              </button>
            ))}
          </div>
        </AsyncBody>
      </PullToRefresh>
    </Screen>
  );
}

export function ChatScreen({ id }: { id: string }) {
  const { threads, sendMessage, receiveMessage, markThreadRead, typingThread, setTypingThread } = useApp();
  const thread = threads.find((item) => item.id === id);
  const [text, setText] = useState("");
  const [attach, setAttach] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    markThreadRead(id);
  }, [id, thread?.unread, markThreadRead]);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length, typingThread]);

  if (!thread) {
    return (
      <Screen>
        <StackHeader title="Message" />
        <EmptyState title="Conversation not found" body="Open Messages and choose a thread." />
      </Screen>
    );
  }

  const send = (attachment?: { name: string; kind: "photo" | "pdf" }) => {
    const value = text.trim();
    if (!value && !attachment) return;
    sendMessage(thread.id, value || attachment?.name || "Attachment", attachment);
    setText("");
    setAttach(false);
    if (thread.id === "support" || thread.shipmentId) {
      setTypingThread(thread.id);
      window.setTimeout(() => {
        receiveMessage(thread.id, "Thanks. Dispatch has your note and will follow the shipment record.");
      }, 1100);
    }
  };

  return (
    <Screen>
      <StackHeader title={thread.title} right={<span className="pr-3 text-[12px] text-[#64748B]">{thread.shipmentId ?? "Support"}</span>} />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F6F7FB] px-4 py-4">
        {thread.messages.map((message) => (
          <div key={message.id} className={cn("flex", message.from === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-[16px] px-3 py-2", message.from === "user" ? "bg-[#003DF9] text-white" : "bg-white text-[#0F172A]")}>
              {message.attachment ? (
                <p className="mb-1 rounded-[10px] bg-black/10 px-2 py-1 text-[12px]">
                  {message.attachment.kind === "pdf" ? "PDF" : "Photo"} · {message.attachment.name}
                </p>
              ) : null}
              <p className="text-[14px] leading-relaxed">{message.text}</p>
              <p className={cn("mt-1 flex items-center justify-end gap-1 text-[10px]", message.from === "user" ? "text-white/80" : "text-[#64748B]")}>
                {formatDateTimeET(message.at)}
                {message.from === "user" ? message.status === "read" ? <CheckCheck className="h-3 w-3" strokeWidth={1.75} /> : <Check className="h-3 w-3" strokeWidth={1.75} /> : null}
              </p>
            </div>
          </div>
        ))}
        {typingThread === thread.id ? (
          <div className="flex gap-1 rounded-full bg-white px-3 py-2 w-fit">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="h-2 w-2 rounded-full bg-[#94A3B8] animate-[dot-blink_1s_infinite]" style={{ animationDelay: `${dot * 150}ms` }} />
            ))}
          </div>
        ) : null}
        <div ref={end} />
      </div>
      <form
        className="flex items-end gap-2 border-t border-[#E2E8F0] bg-white px-3 py-2 pb-[max(8px,env(safe-area-inset-bottom))]"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <button type="button" aria-label="Add attachment" className="flex h-11 w-11 items-center justify-center" onClick={() => setAttach(true)}>
          <Paperclip className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <label className="sr-only" htmlFor="chat-text">
          Message
        </label>
        <textarea id="chat-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a message" rows={1} className="max-h-24 min-h-11 flex-1 resize-none rounded-[12px] border border-[#E2E8F0] px-3 py-2 text-[16px]" />
        <button type="submit" aria-label="Send" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003DF9] text-white">
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </form>
      <Sheet open={attach} title="Add attachment" onClose={() => setAttach(false)}>
        <div className="space-y-2">
          <Button onClick={() => send({ name: "package-photo.jpg", kind: "photo" })}>Photo</Button>
          <Button variant="secondary" onClick={() => send({ name: "handling-note.pdf", kind: "pdf" })}>
            PDF
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

export function NotificationsScreen() {
  const navigate = useNavigate();
  const { notifications, markAllRead, markNotificationRead, pushToast } = useApp();
  const open = (item: AppNotification) => {
    markNotificationRead(item.id);
    const target = item.target;
    if (target.kind === "shipment") navigate({ to: "/shipments/$id", params: { id: target.id } });
    else if (target.kind === "quote") navigate({ to: "/quotes/$id", params: { id: target.id } });
    else if (target.kind === "chat") navigate({ to: "/messages/$id", params: { id: target.id } });
    else if (target.kind === "pay") navigate({ to: "/pay/$id", params: { id: target.id } });
    else navigate({ to: "/home" });
  };
  const today = notifications.filter((item) => isTodayET(item.at));
  const earlier = notifications.filter((item) => !isTodayET(item.at));
  const group = (title: string, items: AppNotification[]) =>
    items.length ? (
      <section>
        <h2 className="px-1 text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">{title}</h2>
        <div className="mt-2 space-y-2">
          {items.map((item) => (
            <button key={item.id} type="button" onClick={() => open(item)} className={cn(cardClass(), "w-full p-3 text-left", !item.read && "border-[#003DF9]")}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[14px] font-semibold text-[#0F172A]">{item.title}</span>
                {!item.read ? <span className="h-2 w-2 rounded-full bg-[#CF0300]" /> : null}
              </span>
              <span className="mt-1 block text-[14px] text-[#475569]">{item.body}</span>
              <span className="mt-1 block text-[12px] text-[#64748B]">{formatDateTimeET(item.at)}</span>
            </button>
          ))}
        </div>
      </section>
    ) : null;
  return (
    <Screen tone="surface">
      <StackHeader
        title="Notifications"
        right={
          <button type="button" className="min-h-11 pr-2 text-[12px] font-semibold text-[#003DF9]" onClick={() => markAllRead()}>
            Mark all read
          </button>
        }
      />
      <PullToRefresh onRefresh={() => pushToast("Notifications updated")}>
        <AsyncBody boot emptyTitle="You're all caught up" emptyBody="Shipment and payment updates will land here.">
          <div className="space-y-5 px-4 pb-8">
            {group("Today", today)}
            {group("Earlier", earlier)}
            <button type="button" className="min-h-11 text-[14px] font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/notifications/settings" })}>
              Notification settings
            </button>
          </div>
        </AsyncBody>
      </PullToRefresh>
    </Screen>
  );
}

export function NotificationSettingsScreen() {
  const { notify, toggleNotify } = useApp();
  const categories = Object.keys(notify) as Array<keyof typeof notify>;
  return (
    <Screen tone="surface">
      <StackHeader title="Notification settings" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        {categories.map((category) => (
          <section key={category} className={cn(cardClass(), "mb-3 p-4")}>
            <h2 className="text-[16px] font-semibold">{category}</h2>
            {(["push", "email", "sms"] as const).map((channel) => (
              <label key={channel} className="mt-3 flex min-h-11 items-center justify-between text-[14px] capitalize">
                {channel === "sms" ? "SMS" : channel[0].toUpperCase() + channel.slice(1)}
                <input type="checkbox" checked={notify[category][channel]} onChange={() => toggleNotify(category, channel)} className="h-5 w-5 accent-[#003DF9]" />
              </label>
            ))}
          </section>
        ))}
      </div>
    </Screen>
  );
}
