import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Bell, ChevronLeft, Clock, FileText, LifeBuoy, MessageCircle, Package } from "lucide-react";
import { AsyncBody, Button, Logo, PullToRefresh, Screen, ServiceIcon, StatusChip, cardClass } from "@/components/app/ui";
import { business } from "@/config/business";
import { averageRating, services } from "@/data/services";
import { formatDateET } from "@/lib/format";
import { greeting } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Stars } from "@/components/app/ui";

export function HomeScreen() {
  const navigate = useNavigate();
  const { user, shipments, notifications, startBooking, pushToast, hydrated } = useApp();
  const unread = notifications.filter((item) => !item.read).length;
  const active = shipments.find((item) => ["in_transit", "en_route_pickup", "picked_up", "exception"].includes(item.status)) ?? shipments.find((item) => item.status === "driver_assigned");
  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);
  const first = user?.fullName.split(" ")[0] || "there";
  return (
    <Screen tab tone="surface">
      <PullToRefresh onRefresh={() => pushToast("Updated", "Eastern Time (ET)")}>
        <header className="flex items-center gap-3 px-5 pb-2 pt-[max(14px,env(safe-area-inset-top))] sm:pt-9">
          <Logo className="h-11 w-11" />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-[#64748B]">{greeting()}</p>
            <p className="truncate text-[18px] font-semibold text-[#0F172A]">{first}</p>
          </div>
          <button type="button" aria-label="Notifications" className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white" onClick={() => navigate({ to: "/notifications" })}>
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            {unread > 0 ? <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CF0300] px-1 text-[10px] font-semibold text-white">{unread}</span> : null}
          </button>
        </header>
        <AsyncBody boot emptyTitle="No services to show" emptyBody="Service cards will appear here.">
          <div className="space-y-5 px-5 pb-6">
            <section className="rounded-[16px] bg-[linear-gradient(135deg,#003DF9,#CF0300)] p-5 text-white shadow-[0_4px_16px_rgba(15,23,42,.06)]">
              <p className="text-[12px] font-medium text-white/80">Central Virginia</p>
              <h2 className="mt-1 text-[22px] font-semibold">Need a delivery?</h2>
              <p className="mt-1 text-[14px] leading-relaxed text-white/90">Specimens, prescriptions, supplies, and equipment.</p>
              <button
                type="button"
                className="mt-4 h-[52px] w-full rounded-[14px] bg-white text-[16px] font-semibold text-[#003DF9] transition active:scale-[0.98]"
                onClick={() => {
                  startBooking();
                  navigate({ to: "/book" });
                }}
              >
                Book a Delivery
              </button>
            </section>
            <section>
              <h2 className="text-[18px] font-semibold text-[#0F172A]">Services</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {services.map((service) => (
                  <button key={service.id} type="button" onClick={() => navigate({ to: "/services/$id", params: { id: service.id } })} className={cn(cardClass(), "overflow-hidden text-left active:scale-[0.98]")}>
                    <img src={service.image} alt="" className="h-24 w-full object-cover" />
                    <div className="p-3">
                      <ServiceIcon id={service.id} className="h-5 w-5 text-[#003DF9]" />
                      <p className="mt-2 text-[14px] font-semibold leading-snug text-[#0F172A]">{service.displayName}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>
            {active ? (
              <section className={cn(cardClass(), "p-4")}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-[#64748B]">{active.id}</p>
                  <StatusChip status={active.status} label={active.exception ?? undefined} />
                </div>
                <p className="mt-2 text-[16px] font-semibold leading-snug text-[#0F172A]">
                  {active.pickup.facility} to {active.dropoff.facility}
                </p>
                <p className="mt-1 text-[14px] text-[#64748B]">
                  {formatDateET(active.schedule.date, true)} · {active.schedule.window || active.schedule.deadline} ET
                  {active.eta ? ` · ETA ${active.eta}` : ""}
                </p>
                <button type="button" className="mt-3 h-11 rounded-[14px] bg-[#003DF9] px-4 text-[14px] font-semibold text-white" onClick={() => navigate({ to: "/shipments/$id", params: { id: active.id } })}>
                  Track
                </button>
              </section>
            ) : null}
            <section className="grid grid-cols-4 gap-2">
              {[
                { label: "My Shipments", icon: Package, to: "/shipments" as const },
                { label: "Messages", icon: MessageCircle, to: "/messages" as const },
                { label: "Request a Quote", icon: FileText, to: "/book" as const },
                { label: "Support", icon: LifeBuoy, to: "/help" as const },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-[16px] bg-white px-1 text-center text-[12px] font-medium leading-tight text-[#0F172A] shadow-[0_4px_16px_rgba(15,23,42,.06)]"
                  onClick={() => {
                    if (action.to === "/book") startBooking();
                    navigate({ to: action.to });
                  }}
                >
                  <action.icon className="h-5 w-5 text-[#003DF9]" strokeWidth={1.75} />
                  {action.label}
                </button>
              ))}
            </section>
            <p className="flex items-start gap-2 rounded-full bg-white px-3 py-2 text-[12px] leading-snug text-[#475569] shadow-[0_4px_16px_rgba(15,23,42,.06)]">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#003DF9]" strokeWidth={1.75} />
              {business.hoursChip}
            </p>
          </div>
        </AsyncBody>
      </PullToRefresh>
    </Screen>
  );
}

export function ServicesScreen() {
  const navigate = useNavigate();
  return (
    <Screen tone="surface">
      <header className="px-5 pb-2 pt-[max(14px,env(safe-area-inset-top))] sm:pt-9">
        <button type="button" className="text-[14px] font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/profile" })}>
          Back
        </button>
        <h1 className="mt-2 text-[28px] font-semibold text-[#0F172A]">All services</h1>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <AsyncBody boot emptyTitle="No services" emptyBody="Services will appear here.">
          <div className="space-y-3">
            {services.map((service) => (
              <button key={service.id} type="button" onClick={() => navigate({ to: "/services/$id", params: { id: service.id } })} className={cn(cardClass(), "flex w-full gap-3 p-3 text-left")}>
                <img src={service.image} alt="" className="h-20 w-20 rounded-[12px] object-cover" />
                <span>
                  <span className="block text-[16px] font-semibold leading-snug text-[#0F172A]">{service.displayName}</span>
                  <span className="mt-1 block text-[12px] text-[#64748B]">{service.title}</span>
                  <span className="mt-1 flex items-center gap-1">
                    <Stars value={averageRating(service)} />
                    <span className="text-[12px] text-[#64748B]">{averageRating(service)}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </AsyncBody>
      </div>
    </Screen>
  );
}

export function ServiceDetailScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const { startBooking } = useApp();
  const service = services.find((item) => item.id === id);
  return (
    <Screen tone="surface">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <AsyncBody boot emptyTitle="Service unavailable" emptyBody="This service is not in the preview catalog.">
          {!service ? null : (
            <div className="pb-4">
              <div className="relative h-64">
                <img src={service.image} alt="" className="h-full w-full object-cover" />
                <button type="button" aria-label="Back" className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 sm:top-8" onClick={() => navigate({ to: "/home" })}>
                  <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </button>
              </div>
              <div className="space-y-4 px-5 pt-5">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#003DF9]">{service.displayName}</p>
                  <h1 className="mt-1 text-[28px] font-semibold leading-tight text-[#0F172A]">{service.title}</h1>
                  <p className="mt-3 text-[16px] leading-relaxed text-[#475569]">{service.description}</p>
                </div>
                <section className={cn(cardClass(), "p-4")}>
                  <h2 className="text-[16px] font-semibold text-[#0F172A]">What you can send</h2>
                  <ul className="mt-2 space-y-2">
                    {service.canSend.map((item) => (
                      <li key={item} className="text-[14px] leading-snug text-[#475569]">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className={cn(cardClass(), "p-4")}>
                  <h2 className="text-[16px] font-semibold text-[#0F172A]">Handling notes</h2>
                  <ul className="mt-2 space-y-2">
                    {service.handlingNotes.map((item) => (
                      <li key={item} className="text-[14px] leading-snug text-[#475569]">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
                <section className={cn(cardClass(), "p-4")}>
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Indicative pricing</p>
                  <p className="mt-1 text-[22px] font-semibold text-[#0F172A]">Starting from ${service.startingAt}</p>
                  <p className="text-[12px] text-[#64748B]">*estimate. Final quote confirmed by Storey Enterprises.</p>
                </section>
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[18px] font-semibold text-[#0F172A]">Reviews</h2>
                    <span className="flex items-center gap-1 text-[14px] font-semibold text-[#0F172A]">
                      <Stars value={averageRating(service)} /> {averageRating(service)}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {service.reviews.map((review) => (
                      <article key={review.id} className={cn(cardClass(), "p-4")}>
                        <div className="flex items-center justify-between">
                          <p className="text-[14px] font-semibold text-[#0F172A]">{review.name}</p>
                          <Stars value={review.rating} />
                        </div>
                        <p className="mt-1 text-[12px] text-[#64748B]">{review.date}</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-[#475569]">{review.text}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}
        </AsyncBody>
      </div>
      <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Button
          onClick={() => {
            startBooking(service?.id);
            navigate({ to: "/book" });
          }}
        >
          Book This Service
        </Button>
      </div>
    </Screen>
  );
}
