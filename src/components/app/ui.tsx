import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, useCanGoBack, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  AlertCircle,
  AlarmClock,
  Calendar,
  Check,
  ChevronLeft,
  FileText,
  FlaskConical,
  Home,
  Loader2,
  MessageCircle,
  Package,
  Pill,
  Plus,
  RefreshCw,
  Truck,
  User,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { business } from "@/config/business";
import { privacyDoc, termsDoc } from "@/data/content";
import type { PriceBreakdown, ShipmentStatus } from "@/data/types";
import { formatMoney } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/labels";
import { unreadCount, useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import logo from "@/img/logo.png";

export function Logo({ className = "h-16 w-16" }: { className?: string }) {
  return <img src={logo} alt="Storey Enterprises" className={cn("rounded-full object-cover", className)} />;
}

export function Screen({
  children,
  tab = false,
  tone = "plain",
}: {
  children?: ReactNode;
  tab?: boolean;
  tone?: "plain" | "surface";
}) {
  return (
    <div className={cn("relative flex h-full min-h-0 flex-col", tone === "surface" ? "bg-[#F6F7FB]" : "bg-white")}>
      <OfflineBanner />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {tab ? <TabBar /> : null}
    </div>
  );
}

export function OfflineBanner() {
  const { connectivity, setConnectivity, pushToast } = useApp();
  if (connectivity !== "offline") return null;
  return (
    <div className="flex items-center gap-2 bg-[#0F172A] px-4 py-2 text-white">
      <WifiOff className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <p className="flex-1 text-[12px] leading-snug">Offline. Saved preview data is still available.</p>
      <button
        type="button"
        className="min-h-11 text-[12px] font-semibold underline"
        onClick={() => {
          setConnectivity("online");
          pushToast("Back online");
        }}
      >
        Retry
      </button>
    </div>
  );
}

export function StackHeader({
  title,
  right,
  backTo = "/home",
}: {
  title: string;
  right?: ReactNode;
  backTo?: "/home" | "/profile" | "/shipments" | "/messages" | "/notifications" | "/services";
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const canGoBack = useCanGoBack();
  return (
    <header className="relative z-30 flex shrink-0 items-center gap-1 bg-inherit px-2 pb-2 pt-[max(10px,env(safe-area-inset-top))] sm:pt-8">
      <button
        type="button"
        aria-label="Back"
        onClick={() => {
          if (canGoBack) router.history.back();
          else navigate({ to: backTo });
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#0F172A] transition active:scale-95"
      >
        <ChevronLeft className="pointer-events-none h-6 w-6" strokeWidth={1.75} />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-[18px] font-semibold text-[#0F172A]">{title}</h1>
      {right}
    </header>
  );
}

export function LargeTitle({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-3 px-5 pb-2 pt-[max(14px,env(safe-area-inset-top))] sm:pt-9">
      <h1 className="text-[28px] font-semibold tracking-tight text-[#0F172A]">{title}</h1>
      {action}
    </div>
  );
}

const buttonStyles = {
  primary: "bg-[#003DF9] text-white",
  secondary: "border border-[#003DF9] bg-white text-[#003DF9]",
  ghost: "bg-transparent text-[#0F172A]",
  danger: "bg-[#CF0300] text-white",
  soft: "bg-[#003DF9]/10 text-[#003DF9]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] px-4 text-[16px] font-semibold transition duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100",
        buttonStyles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[14px] font-medium text-[#0F172A]">
        {label}
        {required ? <span className="text-[#DC2626]">*</span> : null}
        {!required && label.toLowerCase().includes("optional") ? null : null}
      </span>
      {children}
      {error ? (
        <span role="alert" className="mt-1 flex items-start gap-1 text-[12px] leading-snug text-[#DC2626]">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[12px] leading-snug text-[#64748B]">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputClass =
  "h-12 w-full rounded-[12px] border border-[#E2E8F0] bg-white px-3 text-[16px] text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#003DF9] focus:ring-2 focus:ring-[#003DF9]/20";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const { className, invalid, ...rest } = props;
  return <input {...rest} aria-invalid={invalid || undefined} className={cn(inputClass, invalid && "border-[#DC2626]", className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const { className, invalid, ...rest } = props;
  return (
    <textarea
      {...rest}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, "h-auto min-h-24 py-3", invalid && "border-[#DC2626]", className)}
    />
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[#0F172A]/40" onClick={onClose} />
      <div className="relative max-h-[86%] overflow-y-auto rounded-t-[24px] bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,.12)] animate-[sheet-up_220ms_ease-out]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#E2E8F0]" />
        {title ? <h2 className="mb-3 text-[18px] font-semibold text-[#0F172A]">{title}</h2> : null}
        {children}
      </div>
    </div>
  );
}

export function StatusChip({ status, label }: { status: ShipmentStatus | string; label?: string }) {
  const text = label ?? STATUS_LABEL[status as ShipmentStatus] ?? status;
  const tone =
    status === "delivered"
      ? "bg-[#16A34A]/10 text-[#166534]"
      : status === "cancelled" || status === "quote_declined"
        ? "bg-[#F1F5F9] text-[#475569]"
        : status === "exception"
          ? "bg-[#DC2626]/10 text-[#DC2626]"
          : status === "in_transit" || status === "picked_up" || status === "en_route_pickup"
            ? "bg-[#F59E0B]/15 text-[#92400E]"
            : status === "stat"
              ? "bg-[#CF0300] text-white"
              : "bg-[#003DF9]/10 text-[#003DF9]";
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold", tone)}>{text}</span>;
}

export function Timeline({
  events,
}: {
  events: { key: string; label: string; at?: string; state: "done" | "current" | "upcoming" | "alert"; note?: string }[];
}) {
  return (
    <ol className="space-y-0">
      {events.map((event, index) => (
        <li key={`${event.key}-${index}`} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                "mt-1 h-3 w-3 rounded-full border-2",
                event.state === "done" && "border-[#003DF9] bg-[#003DF9]",
                event.state === "current" && "border-[#003DF9] bg-white",
                event.state === "upcoming" && "border-[#E2E8F0] bg-white",
                event.state === "alert" && "border-[#DC2626] bg-[#DC2626]",
              )}
            />
            {index < events.length - 1 ? <span className="w-px flex-1 bg-[#E2E8F0]" /> : null}
          </div>
          <div className="pb-4">
            <p className={cn("text-[14px] font-medium", event.state === "upcoming" ? "text-[#94A3B8]" : "text-[#0F172A]")}>
              {event.label}
            </p>
            {event.at ? <p className="text-[12px] text-[#64748B]">{event.at}</p> : null}
            {event.note ? <p className="mt-1 text-[12px] leading-snug text-[#64748B]">{event.note}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

const SERVICE_ICONS: Record<string, LucideIcon> = {
  "01": Calendar,
  "02": FlaskConical,
  "03": Pill,
  "04": FileText,
  "05": AlarmClock,
  "06": Truck,
};

export function ServiceIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  const Icon = SERVICE_ICONS[id] ?? Package;
  return <Icon className={className} strokeWidth={1.75} />;
}

export function TabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const { threads, startBooking } = useApp();
  const messages = unreadCount(threads);
  const item = (to: "/home" | "/shipments" | "/messages" | "/profile", label: string, icon: LucideIcon, badge = 0) => {
    const on = pathname === to || pathname === `${to}/`;
    const Icon = icon;
    return (
      <Link
        to={to}
        className={cn(
          "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-[14px] px-1 py-2 text-[12px] font-semibold leading-none",
          on ? "bg-white/10 text-white" : "text-white/80",
        )}
      >
        <span className="relative">
          <Icon className="h-6 w-6" strokeWidth={1.75} />
          {badge > 0 ? (
            <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CF0300] px-1 text-[10px] font-semibold text-white">
              {badge}
            </span>
          ) : null}
        </span>
        {label}
      </Link>
    );
  };
  return (
    <nav className="relative z-30 shrink-0 bg-[#070B14] px-3 pt-3 pb-[max(14px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(7,11,20,.18)]">
      <div className="flex items-center gap-1">
        {item("/home", "Home", Home)}
        {item("/shipments", "Shipments", Package)}
        <div className="flex flex-1 justify-center px-1">
          <button
            type="button"
            aria-label="Book"
            onClick={() => {
              startBooking();
              navigate({ to: "/book" });
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#003DF9] text-white shadow-[0_8px_20px_rgba(0,61,249,.45)] transition active:scale-[0.98]"
          >
            <Plus className="pointer-events-none h-7 w-7" strokeWidth={1.75} />
          </button>
        </div>
        {item("/messages", "Messages", MessageCircle, messages)}
        {item("/profile", "Profile", User)}
      </div>
    </nav>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className={index < Math.round(value) ? "text-[#F59E0B]" : "text-[#E2E8F0]"}>
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current" aria-hidden>
            <path d="M10 1.8 12.4 7l5.6.5-4.2 3.7 1.3 5.5L10 13.8 4.9 16.7 6.2 11.2 2 7.5 7.6 7 10 1.8Z" />
          </svg>
        </span>
      ))}
    </span>
  );
}

export function PriceTable({ price, caption = business.priceCaption }: { price: PriceBreakdown; caption?: string }) {
  return (
    <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,.06)]">
      {price.lines.map((line) => (
        <div key={line.label} className="flex items-start justify-between gap-3 py-1.5 text-[14px]">
          <span className="text-[#64748B]">{line.label}</span>
          <span className={cn("font-medium", line.amount < 0 ? "text-[#16A34A]" : "text-[#0F172A]")}>{formatMoney(line.amount)}</span>
        </div>
      ))}
      <div className="mt-2 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
        <span className="text-[16px] font-semibold text-[#0F172A]">Total</span>
        <span className="text-[18px] font-semibold text-[#0F172A]">{formatMoney(price.total)}</span>
      </div>
      {caption ? <p className="mt-2 text-[12px] leading-snug text-[#64748B]">{caption}</p> : null}
    </div>
  );
}

export function RouteMap({
  pickup,
  dropoff,
  driver,
  distance,
}: {
  pickup?: { lat: number | null; lng: number | null; label?: string } | null;
  dropoff?: { lat: number | null; lng: number | null; label?: string } | null;
  driver?: boolean;
  distance?: number;
}) {
  const points = [pickup, dropoff].filter((point): point is { lat: number; lng: number; label?: string } => !!point && point.lat != null && point.lng != null);
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...(lats.length ? lats : [37.3]));
  const maxLat = Math.max(...(lats.length ? lats : [37.7]));
  const minLng = Math.min(...(lngs.length ? lngs : [-77.7]));
  const maxLng = Math.max(...(lngs.length ? lngs : [-77.3]));
  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / Math.max(0.04, maxLng - minLng)) * 280 + 20;
    const y = (1 - (lat - minLat) / Math.max(0.04, maxLat - minLat)) * 140 + 16;
    return { x, y };
  };
  const a = pickup?.lat != null && pickup.lng != null ? project(pickup.lat, pickup.lng) : null;
  const b = dropoff?.lat != null && dropoff.lng != null ? project(dropoff.lat, dropoff.lng) : null;
  const mid = a && b ? { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 - 18 } : null;
  return (
    <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-[#E8EEF9]">
      <svg viewBox="0 0 320 180" className="h-44 w-full" role="img" aria-label="Map preview">
        <rect width="320" height="180" fill="#E8EEF9" />
        {Array.from({ length: 6 }).map((_, index) => (
          <path key={index} d={`M0 ${20 + index * 28} H320`} stroke="#D5DEF0" strokeWidth="1" />
        ))}
        {Array.from({ length: 8 }).map((_, index) => (
          <path key={`v${index}`} d={`M${index * 46} 0 V180`} stroke="#D5DEF0" strokeWidth="1" />
        ))}
        {a && b ? (
          <path d={`M${a.x} ${a.y} Q ${mid?.x} ${mid?.y}, ${b.x} ${b.y}`} fill="none" stroke="#003DF9" strokeWidth="3" strokeLinecap="round" />
        ) : null}
        {a ? <circle cx={a.x} cy={a.y} r="7" fill="#003DF9" /> : null}
        {b ? <circle cx={b.x} cy={b.y} r="7" fill="#CF0300" /> : null}
        {driver && mid ? (
          <g>
            <circle cx={(a!.x + b!.x) / 2} cy={(a!.y + b!.y) / 2} r="11" fill="#003DF9" opacity="0.2" />
            <circle cx={(a!.x + b!.x) / 2} cy={(a!.y + b!.y) / 2} r="6" fill="#0F172A" />
          </g>
        ) : null}
      </svg>
      <div className="flex items-center justify-between bg-white px-3 py-2 text-[12px] text-[#64748B]">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#003DF9]" /> Pickup
          <span className="h-2 w-2 rounded-full bg-[#CF0300]" /> Delivery
        </span>
        {distance ? <span className="font-medium text-[#0F172A]">{distance} mi</span> : <span>Eastern Time (ET)</span>}
      </div>
    </div>
  );
}

export function ListSkeleton() {
  return (
    <div className="space-y-3 px-4 py-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="animate-pulse rounded-[16px] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,.06)]">
          <div className="h-3 w-24 rounded bg-[#E2E8F0]" />
          <div className="mt-3 h-4 w-3/4 rounded bg-[#E2E8F0]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#E2E8F0]" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#003DF9]/10 text-[#003DF9]">
        <Package className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[#0F172A]">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{body}</p>
      {action ? <div className="mt-5 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ onRetry, body = "We couldn't load this. Check the connection and try again." }: { onRetry: () => void; body?: string }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
        <AlertCircle className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h2 className="mt-4 text-[18px] font-semibold text-[#0F172A]">Something went wrong</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-[#64748B]">{body}</p>
      <div className="mt-5 w-full max-w-xs">
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4" strokeWidth={1.75} /> Try again
        </Button>
      </div>
    </div>
  );
}

export function useAsyncPhase(boot = false) {
  const { listPreview, setListPreview, setConnectivity } = useApp();
  const [booting, setBooting] = useState(boot);
  useEffect(() => {
    if (!boot) return;
    const timer = window.setTimeout(() => setBooting(false), 550);
    return () => window.clearTimeout(timer);
  }, [boot]);
  const phase = listPreview === "error" ? "error" : listPreview === "loading" || booting ? "loading" : listPreview === "empty" ? "empty" : "ready";
  const retry = () => {
    setConnectivity("online");
    setListPreview("live");
    if (boot) {
      setBooting(true);
      window.setTimeout(() => setBooting(false), 550);
    }
  };
  return { phase, retry };
}

export function AsyncBody({
  boot = false,
  emptyTitle = "Nothing here yet",
  emptyBody = "Items will show up here when they're available.",
  children,
}: {
  boot?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  children: ReactNode;
}) {
  const { phase, retry } = useAsyncPhase(boot);
  if (phase === "loading") return <ListSkeleton />;
  if (phase === "error") return <ErrorState onRetry={retry} />;
  if (phase === "empty") {
    return (
      <EmptyState title={emptyTitle} body={emptyBody} action={<Button onClick={retry}>Try again</Button>} />
    );
  }
  return <>{children}</>;
}

export function Toasts() {
  const { toasts } = useApp();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-10 z-[70] flex flex-col gap-2 px-4 sm:top-12">
      {toasts.map((toast) => (
        <div key={toast.id} className="rounded-[16px] bg-[#0F172A] px-4 py-3 text-white shadow-lg animate-[pop-in_180ms_ease-out]">
          <p className="text-[14px] font-semibold">{toast.title}</p>
          {toast.body ? <p className="text-[12px] text-white/80">{toast.body}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function LegalSheet({ kind, onClose }: { kind: "terms" | "privacy" | null; onClose: () => void }) {
  const doc = kind === "privacy" ? privacyDoc : termsDoc;
  return (
    <Sheet open={!!kind} title={doc.title} onClose={onClose}>
      <p className="text-[12px] text-[#64748B]">
        Version {doc.version} · Last updated {doc.updated}
      </p>
      <p className="mt-3 rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[12px] leading-snug text-[#92400E]">
        Replace with client-approved text.
      </p>
      <div className="mt-4 space-y-4">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="text-[16px] font-semibold text-[#0F172A]">{section.heading}</h3>
            <p className="mt-1 text-[14px] leading-relaxed text-[#64748B]">{section.body}</p>
          </section>
        ))}
      </div>
    </Sheet>
  );
}

export function SuccessMark() {
  return (
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#16A34A]/10 animate-[pop-in_280ms_ease-out]">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A] text-white">
        <Check className="h-8 w-8" strokeWidth={1.75} />
      </div>
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7C21.7 18.7 23 15.8 23 12.3Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1 7.9-2.8l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.2-6.9-5.1H1.3v3c2 4 6 6.6 10.7 6.6Z" />
      <path fill="#FBBC05" d="M5.1 14.4A7.2 7.2 0 0 1 4.7 12c0-.8.1-1.6.4-2.4V6.6H1.3A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l3.8-3Z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l3.8 3C6.1 7 8.8 4.8 12 4.8Z" />
    </svg>
  );
}

export function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-[#0F172A]" aria-hidden>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.9-3.5.9s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9ZM14.7 6.5c.6-.8 1.1-1.9.9-3-1 .1-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.3Z" />
    </svg>
  );
}

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => void; children: ReactNode }) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scroller}
      className="min-h-0 flex-1 overflow-y-auto no-scrollbar"
      onPointerDown={(event) => {
        if (scroller.current && scroller.current.scrollTop <= 0) startY.current = event.clientY;
      }}
      onPointerMove={(event) => {
        if (startY.current == null || refreshing) return;
        const next = Math.max(0, Math.min(72, event.clientY - startY.current));
        if (scroller.current && scroller.current.scrollTop <= 0) setPull(next);
      }}
      onPointerUp={() => {
        if (pull > 56 && !refreshing) {
          setRefreshing(true);
          onRefresh();
          window.setTimeout(() => {
            setRefreshing(false);
            setPull(0);
          }, 700);
        } else {
          setPull(0);
        }
        startY.current = null;
      }}
    >
      <div className="flex items-center justify-center overflow-hidden text-[12px] text-[#64748B]" style={{ height: refreshing ? 36 : pull / 2 }}>
        {refreshing ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} /> : pull > 20 ? "Release to refresh" : null}
      </div>
      {children}
    </div>
  );
}

export function cardClass() {
  return "rounded-[16px] border border-[#E2E8F0] bg-white shadow-[0_4px_16px_rgba(15,23,42,.06)]";
}
