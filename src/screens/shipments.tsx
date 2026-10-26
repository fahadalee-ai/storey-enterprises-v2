import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Filter, MapPin, MessageCircle, Phone, Search } from "lucide-react";
import {
  AsyncBody,
  Button,
  ChoiceButton,
  ChoiceGroup,
  EmptyState,
  LargeTitle,
  PriceTable,
  PullToRefresh,
  RouteMap,
  Screen,
  ServiceIcon,
  Sheet,
  StackHeader,
  StatusChip,
  TextArea,
  Timeline,
  cardClass,
} from "@/components/app/ui";
import { business } from "@/config/business";
import { services } from "@/data/services";
import type { Shipment } from "@/data/types";
import { formatDateET, formatDateTimeET, formatMoney, isSunday } from "@/lib/format";
import { CANCEL_REASONS, EXCEPTION_TYPES, SHIPMENT_TABS, matchesTab, type ShipmentTab } from "@/lib/labels";
import { DEADLINE_TIMES, slotsFor } from "@/lib/schedule";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ShipmentsScreen() {
  const navigate = useNavigate();
  const { shipments, pushToast } = useApp();
  const [tab, setTab] = useState<ShipmentTab>("Upcoming");
  const [query, setQuery] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const items = useMemo(() => {
    return shipments.filter((shipment) => {
      if (!matchesTab(shipment, tab)) return false;
      if (serviceId && shipment.serviceId !== serviceId) return false;
      const hay = `${shipment.id} ${shipment.pickup.facility} ${shipment.dropoff.facility} ${shipment.pickup.address}`.toLowerCase();
      return hay.includes(query.trim().toLowerCase());
    });
  }, [shipments, tab, query, serviceId]);

  return (
    <Screen tab tone="surface">
      <LargeTitle title="Shipments" />
      <div className="px-5 pb-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#64748B]" strokeWidth={1.75} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID or facility" className="h-11 w-full rounded-[12px] border border-[#E2E8F0] bg-white pl-9 pr-3 text-[16px]" aria-label="Search shipments" />
          </div>
          <button type="button" aria-label="Filter" className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white" onClick={() => setFilterOpen(true)}>
            <Filter className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {SHIPMENT_TABS.map((item) => (
            <button key={item} type="button" onClick={() => setTab(item)} className={cn("h-10 shrink-0 rounded-full px-3 text-[13px] font-semibold", tab === item ? "bg-[#003DF9] text-white" : "bg-white text-[#475569]")}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <PullToRefresh onRefresh={() => pushToast("Shipments updated")}>
        <AsyncBody boot emptyTitle="No shipments yet" emptyBody="Book a delivery and it will show up in the matching tab.">
          {items.length === 0 ? (
            <EmptyState title="No matching shipments" body="Try another status, date, or service." action={<Button onClick={() => { setQuery(""); setServiceId(""); }}>Clear filters</Button>} />
          ) : (
            <div className="space-y-3 px-5 pb-6">
              {items.map((shipment) => (
                <ShipmentCard key={shipment.id} shipment={shipment} onOpen={() => navigate({ to: "/shipments/$id", params: { id: shipment.id } })} />
              ))}
            </div>
          )}
        </AsyncBody>
      </PullToRefresh>
      <Sheet open={filterOpen} title="Filter" onClose={() => setFilterOpen(false)}>
        <p className="text-[14px] font-medium">Service</p>
        <ChoiceGroup className="mt-2">
          <ChoiceButton align="start" selected={!serviceId} onClick={() => setServiceId("")}>
            All
          </ChoiceButton>
          {services.map((service) => (
            <ChoiceButton key={service.id} align="start" selected={serviceId === service.id} onClick={() => setServiceId(service.id)}>
              {service.displayName}
            </ChoiceButton>
          ))}
        </ChoiceGroup>
        <div className="mt-4">
          <Button onClick={() => setFilterOpen(false)}>Show results</Button>
        </div>
      </Sheet>
    </Screen>
  );
}

function ShipmentCard({ shipment, onOpen }: { shipment: Shipment; onOpen: () => void }) {
  const service = services.find((item) => item.id === shipment.serviceId);
  return (
    <button type="button" onClick={onOpen} className={cn(cardClass(), "w-full p-4 text-left")}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[#64748B]">
          <ServiceIcon id={shipment.serviceId} className="h-4 w-4 text-[#003DF9]" />
          {shipment.id}
        </span>
        <StatusChip status={shipment.status} label={shipment.exception} />
      </div>
      <p className="mt-2 text-[16px] font-semibold leading-snug text-[#0F172A]">{service?.displayName}</p>
      <p className="mt-1 text-[14px] text-[#475569]">
        {shipment.pickup.facility} to {shipment.dropoff.facility}
      </p>
      <p className="mt-1 text-[12px] text-[#64748B]">
        {formatDateET(shipment.schedule.date)} · {shipment.schedule.window || shipment.schedule.deadline} ET
      </p>
      <p className="mt-2 text-[14px] font-semibold text-[#0F172A]">{formatMoney(shipment.price.total)}</p>
    </button>
  );
}

export function ShipmentDetailScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const { shipments, cancelShipment, requestReschedule, reorder, refundEstimate, pushToast } = useApp();
  const shipment = shipments.find((item) => item.id === id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [note, setNote] = useState("");
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [date, setDate] = useState("");
  const [windowLabel, setWindowLabel] = useState("");
  const [doc, setDoc] = useState<string | null>(null);
  const [guide, setGuide] = useState(false);
  const service = services.find((item) => item.id === shipment?.serviceId);

  if (!shipment) {
    return (
      <Screen>
        <StackHeader title="Shipment" backTo="/shipments" />
        <EmptyState title="Shipment not found" body="It may have been removed from this preview." />
      </Screen>
    );
  }

  const estimate = refundEstimate(shipment);
  const canCancel = shipment.status !== "delivered" && shipment.status !== "cancelled";

  return (
    <Screen tone="surface">
      <StackHeader title={shipment.id} backTo="/shipments" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <AsyncBody boot emptyTitle="Shipment hidden" emptyBody="Turn preview states back to live data.">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <StatusChip status={shipment.status} label={shipment.exception ?? undefined} />
              <button type="button" className="text-[12px] font-semibold text-[#003DF9]" onClick={() => setGuide(true)}>
                Status guide
              </button>
            </div>
            {shipment.reschedule ? (
              <p className="rounded-[12px] bg-[#003DF9]/10 px-3 py-2 text-[13px] text-[#003DF9]">
                Reschedule requested for {formatDateET(shipment.reschedule.date)} · {shipment.reschedule.window} ET. Pending confirmation.
              </p>
            ) : null}
            <RouteMap pickup={shipment.pickup} dropoff={shipment.dropoff} driver={!!shipment.driver && ["en_route_pickup", "picked_up", "in_transit", "exception"].includes(shipment.status)} distance={shipment.price.distanceMiles} />
            {shipment.eta ? <p className="text-[14px] font-semibold text-[#0F172A]">ETA {shipment.eta} · Eastern Time (ET)</p> : null}
            {shipment.driver ? (
              <section className={cn(cardClass(), "flex items-center gap-3 p-3")}>
                <img src={shipment.driver.photo} alt="" className="h-14 w-14 rounded-full object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-semibold">{shipment.driver.name}</p>
                  <p className="text-[12px] text-[#64748B]">{shipment.driver.vehicle}</p>
                  <p className="text-[12px] text-[#64748B]">{shipment.driver.plate}</p>
                </div>
                <a aria-label="Call courier" href={`tel:${shipment.driver.phone}`} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003DF9]/10 text-[#003DF9]">
                  <Phone className="h-5 w-5" strokeWidth={1.75} />
                </a>
                <button type="button" aria-label="Message courier" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003DF9]/10 text-[#003DF9]" onClick={() => navigate({ to: "/messages/$id", params: { id: shipment.id === "SE-2026-000184" ? "t-184" : `t-${shipment.id}` } })}>
                  <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                </button>
              </section>
            ) : null}
            <section className={cn(cardClass(), "p-4")}>
              <h2 className="text-[16px] font-semibold">Status timeline</h2>
              <div className="mt-3">
                <Timeline events={shipment.timeline.map((event) => ({ ...event, at: event.at ? formatDateTimeET(event.at) : undefined }))} />
              </div>
            </section>
            <section className={cn(cardClass(), "space-y-2 p-4 text-[14px]")}>
              <h2 className="text-[16px] font-semibold">Shipment</h2>
              <p>{service?.title}</p>
              <p className="text-[#64748B]">{shipment.details.type} · {shipment.details.quantity} × {shipment.details.boxSize} · {shipment.details.weightLbs} lbs</p>
              <p className="text-[#64748B]">{shipment.details.temperature} · {shipment.details.handling.join(", ") || "Standard handling"}</p>
              <p>{shipment.details.description}</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#003DF9]" strokeWidth={1.75} /> {shipment.pickup.facility}, {shipment.pickup.address}</p>
              <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[#CF0300]" strokeWidth={1.75} /> {shipment.dropoff.facility}, {shipment.dropoff.address}</p>
              <p className="text-[#64748B]">{formatDateET(shipment.schedule.date, true)} · {shipment.schedule.window || shipment.schedule.deadline} ET</p>
            </section>
            {shipment.custody.length ? (
              <section className={cn(cardClass(), "p-4")}>
                <h2 className="text-[16px] font-semibold">Chain of custody</h2>
                <ul className="mt-2 space-y-2">
                  {shipment.custody.map((event) => (
                    <li key={event.id} className="text-[14px]">
                      <span className="font-medium">{event.label}</span>
                      <span className="block text-[12px] text-[#64748B]">{event.who} · {formatDateTimeET(event.at)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {shipment.pod ? (
              <section className={cn(cardClass(), "p-4")}>
                <h2 className="text-[16px] font-semibold">Proof of delivery</h2>
                <p className="mt-2 text-[14px]">Recipient: {shipment.pod.recipient}</p>
                <p className="text-[12px] text-[#64748B]">{formatDateTimeET(shipment.pod.at)}</p>
                {shipment.pod.hasSignature ? (
                  <svg viewBox="0 0 240 70" className="mt-3 h-16 w-full rounded-[12px] bg-[#F6F7FB]" aria-label="Signature">
                    <path d="M18 46c20-18 28-28 42-20 10 6 8 22-4 24-16 2-18-24 2-30 22-8 36 10 52 8 18-2 20-22 38-18 16 4 18 20 34 16" fill="none" stroke="#0F172A" strokeWidth="2" />
                  </svg>
                ) : null}
                <img src={shipment.pod.photo} alt="Delivery photo" className="mt-3 h-36 w-full rounded-[12px] object-cover" />
              </section>
            ) : null}
            {shipment.documents.length ? (
              <section className={cn(cardClass(), "p-4")}>
                <h2 className="text-[16px] font-semibold">Documents</h2>
                <div className="mt-2 space-y-2">
                  {shipment.documents.map((item) => (
                    <button key={item.id} type="button" className="flex min-h-11 w-full items-center justify-between text-left text-[14px] font-semibold text-[#003DF9]" onClick={() => setDoc(item.name)}>
                      {item.name}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
            <PriceTable price={shipment.price} />
            {shipment.payment.refund ? (
              <section className={cn(cardClass(), "p-4")}>
                <h2 className="text-[16px] font-semibold">Refund status</h2>
                <p className="mt-1 text-[14px] text-[#64748B]">Estimate {formatMoney(shipment.payment.refund.estimate)} · {shipment.payment.refund.reason}</p>
                <ul className="mt-3 space-y-2">
                  {shipment.payment.refund.timeline.map((item) => (
                    <li key={item.label} className="text-[14px]">
                      <span className={item.done ? "font-semibold text-[#0F172A]" : "text-[#94A3B8]"}>{item.label}</span>
                      {item.at ? <span className="block text-[12px] text-[#64748B]">{formatDateTimeET(item.at)}</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <div className="space-y-2">
              {shipment.quote && shipment.quote.status === "sent" ? <Button onClick={() => navigate({ to: "/quotes/$id", params: { id: shipment.id } })}>Review quote</Button> : null}
              {shipment.payment.status === "unpaid" || shipment.payment.status === "failed" ? (
                <Button variant="secondary" onClick={() => navigate({ to: "/pay/$id", params: { id: shipment.id } })}>
                  {shipment.payment.status === "failed" ? "Retry payment" : `Pay ${formatMoney(shipment.price.total)}`}
                </Button>
              ) : null}
              <Button variant="secondary" onClick={() => setRescheduleOpen(true)}>Request reschedule</Button>
              <Button variant="secondary" onClick={() => navigate({ to: "/messages" })}>Contact support</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  reorder(shipment.id);
                  navigate({ to: "/book" });
                }}
              >
                Reorder
              </Button>
              {canCancel ? (
                <Button variant="danger" onClick={() => setCancelOpen(true)}>
                  Cancel shipment
                </Button>
              ) : null}
            </div>
          </div>
        </AsyncBody>
      </div>
      <Sheet open={cancelOpen} title="Cancel shipment" onClose={() => setCancelOpen(false)}>
        <p className="text-[14px] leading-relaxed text-[#475569]">
          You can cancel before the courier arrives at pickup. If a quote was already paid, the refund is reviewed against the delivery window and any completed handoff. Business, payment, and delivery records may be kept for audit. Closed Sunday.
        </p>
        <label className="mt-3 block text-[14px] font-medium">
          Reason
          <select className="mt-1 h-12 w-full rounded-[12px] border border-[#E2E8F0] px-3" value={reason} onChange={(event) => setReason(event.target.value)}>
            {CANCEL_REASONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="mt-3">
          <TextArea value={note} placeholder="Optional note" onChange={(event) => setNote(event.target.value)} />
        </div>
        <p className="mt-3 text-[14px] font-semibold">Refund estimate {formatMoney(estimate)}</p>
        <div className="mt-4">
          <Button
            variant="danger"
            onClick={() => {
              cancelShipment(shipment.id, note.trim() ? `${reason}. ${note.trim()}` : reason);
              setCancelOpen(false);
            }}
          >
            Confirm cancellation
          </Button>
        </div>
      </Sheet>
      <Sheet open={rescheduleOpen} title="Request reschedule" onClose={() => setRescheduleOpen(false)}>
        <p className="text-[12px] text-[#64748B]">{business.timezoneLabel}. {business.hoursHelper}</p>
        <label className="mt-3 block text-[14px] font-medium">
          Date
          <input type="date" className="mt-1 h-12 w-full rounded-[12px] border border-[#E2E8F0] px-3" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
        <ChoiceGroup className="mt-3">
          {(date ? slotsFor(date) : []).map((slot) => (
            <ChoiceButton key={slot} align="start" selected={windowLabel === slot} onClick={() => setWindowLabel(slot)}>
              {slot}
            </ChoiceButton>
          ))}
          {DEADLINE_TIMES.slice(0, 4).map((time) => (
            <ChoiceButton key={time} align="start" selected={windowLabel === time} onClick={() => setWindowLabel(time)}>
              {time} ET
            </ChoiceButton>
          ))}
        </ChoiceGroup>
        <div className="mt-4">
          <Button
            disabled={!date || !windowLabel}
            onClick={() => {
              if (isSunday(date)) {
                pushToast("Sunday is closed", "Choose Monday through Saturday.");
                return;
              }
              requestReschedule(shipment.id, date, windowLabel);
              setRescheduleOpen(false);
              pushToast("Reschedule requested");
            }}
          >
            Submit request
          </Button>
        </div>
      </Sheet>
      <Sheet open={!!doc} title={doc ?? "Document"} onClose={() => setDoc(null)}>
        <p className="text-[14px] leading-relaxed text-[#475569]">
          Preview of {doc} for {shipment.id}. A downloadable file will connect here when the API is added.
        </p>
        <p className="mt-2 text-[12px] text-[#64748B]">Eastern Time (ET) · {business.name}</p>
        <div className="mt-4">
          <Button onClick={() => setDoc(null)}>Close</Button>
        </div>
      </Sheet>
      <Sheet open={guide} title="Status guide" onClose={() => setGuide(false)}>
        <p className="text-[14px] text-[#475569]">Happy-path updates run from request received through delivered.</p>
        <p className="mt-3 text-[14px] font-semibold">Exceptions</p>
        <ul className="mt-1 space-y-1 text-[14px] text-[#475569]">
          {EXCEPTION_TYPES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-3 text-[14px] text-[#475569]">Cancelled shipments keep their refund timeline.</p>
      </Sheet>
    </Screen>
  );
}
