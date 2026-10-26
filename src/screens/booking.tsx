import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, ChevronLeft, ImagePlus, Info, Lock, Minus, Pencil, Plus, X } from "lucide-react";
import {
  Button,
  Field,
  LegalSheet,
  PriceTable,
  RouteMap,
  Screen,
  ServiceIcon,
  Sheet,
  SuccessMark,
  TextArea,
  TextInput,
  inputClass,
} from "@/components/app/ui";
import { business } from "@/config/business";
import { boxSizes, handlingOptions, shipmentTypes, temperatureOptions, weightRanges } from "@/data/content";
import { placeById, placeFromAddress, searchPlaces } from "@/data/places";
import { services } from "@/data/services";
import type { BookingDraft, Shipment, Stop } from "@/data/types";
import { digits, formatDateET, formatMoney, formatPhone, isSaturday, isSunday, todayET } from "@/lib/format";
import { gapRoute, profileGaps } from "@/lib/labels";
import { DELIVERY_TYPES, draftMiles, draftPrice, intentLabel, outOfArea, submitIntent, weightRangeFor } from "@/lib/pricing";
import { DEADLINE_TIMES, alternativeSlots, isHoliday, isPastDate, monthMatrix, slotLostOnSubmit, slotState, slotsFor } from "@/lib/schedule";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const TITLES = ["", "Service and delivery type", "Pickup details", "Drop-off details", "Shipment details", "Schedule", "Review and price", "Confirmation"];

function validate(step: number, draft: BookingDraft) {
  const errors: Record<string, string> = {};
  if (step === 1 && !draft.deliveryType) errors.deliveryType = "Choose a delivery type.";
  if (step === 2 || step === 3) {
    const stop = step === 2 ? draft.pickup : draft.dropoff;
    const key = step === 2 ? "pickup" : "drop";
    if (!stop.address || stop.lat == null) errors[`${key}Address`] = "Select an address from the suggestions.";
    if (!stop.facility.trim()) errors[`${key}Facility`] = "Facility or business name is required.";
    if (!stop.contact.trim()) errors[`${key}Contact`] = "Contact name is required.";
    if (digits(stop.phone).length !== 10) errors[`${key}Phone`] = "Enter a 10-digit phone number.";
  }
  if (step === 4) {
    const details = draft.details;
    if (!details.type) errors.type = "Choose a shipment type.";
    if (details.quantity < 1) errors.quantity = "Add at least 1 box.";
    if (!details.boxSize) errors.boxSize = "Choose a box size.";
    if (details.boxSize === "Custom" && (!Number(details.length) || !Number(details.width) || !Number(details.height))) {
      errors.custom = "Enter length, width, and height in inches.";
    }
    if (!details.weight || Number(details.weight) <= 0) errors.weight = "Enter the weight in pounds.";
    if (!details.weightRange) errors.weightRange = "Choose a weight range.";
    if (!details.description.trim()) errors.description = "Describe the shipment.";
    if (!details.temperature) errors.temperature = "Choose a temperature requirement.";
    if (details.temperature === "Other" && !details.temperatureOther.trim()) errors.temperatureOther = "Describe the temperature requirement.";
  }
  if (step === 5) {
    if (!draft.schedule.date) errors.date = "Choose a date.";
    else if (isPastDate(draft.schedule.date)) errors.date = "Past dates are closed.";
    else if (isSunday(draft.schedule.date)) errors.date = "Sunday is closed.";
    const urgent = draft.deliveryType === "stat" || draft.deliveryType === "after-hours";
    if (urgent && !draft.schedule.deadline) errors.deadline = "Choose a requested delivery deadline.";
    if (!urgent && !draft.schedule.window) errors.window = "Choose a delivery window.";
    if (!urgent && draft.schedule.date && draft.schedule.window && slotState(draft.schedule.date, draft.schedule.window) !== "open") {
      errors.window = "That window is no longer open.";
    }
  }
  return errors;
}

export function BookingScreen() {
  const navigate = useNavigate();
  const { draft, setDraft, user, createShipment, setFocusField, pushToast } = useApp();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slotError, setSlotError] = useState(false);
  const [done, setDone] = useState<Shipment | null>(null);
  const [priorityInfo, setPriorityInfo] = useState(false);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  const [confirmProfile, setConfirmProfile] = useState<null | "pickup" | "dropoff">(null);
  const [confirmSaved, setConfirmSaved] = useState<null | { target: "pickup" | "dropoff"; placeId: string; label: string }>(null);
  const { addresses } = useApp();
  const step = done ? 7 : draft.step;
  const price = useMemo(() => draftPrice(draft), [draft]);
  const intent = submitIntent(draft);
  const gaps = profileGaps(user);
  const urgent = draft.deliveryType === "stat" || draft.deliveryType === "after-hours";

  const patchStop = (target: "pickup" | "dropoff", patch: Partial<Stop>) => {
    setDraft((current) => ({ ...current, [target]: { ...current[target], ...patch } }));
  };

  const go = (next: number) => {
    if (next > step) {
      const found = validate(step, draft);
      setErrors(found);
      if (Object.keys(found).length) return;
    }
    setSlotError(false);
    setDraft({ step: next });
  };

  const submit = () => {
    const found = validate(5, draft);
    if (Object.keys(found).length) {
      setErrors(found);
      setDraft({ step: 5 });
      return;
    }
    if (!urgent && slotLostOnSubmit(draft.schedule.date, draft.schedule.window)) {
      setSlotError(true);
      return;
    }
    if (gaps.length) return;
    setDone(createShipment(draft));
  };

  const applyPlace = (target: "pickup" | "dropoff", placeId: string, extra?: Partial<Stop>) => {
    const place = placeById(placeId);
    if (!place) return;
    patchStop(target, {
      address: place.label,
      facility: extra?.facility || place.facility,
      milesFromOrigin: place.milesFromOrigin,
      lat: place.lat,
      lng: place.lng,
      ...extra,
    });
  };

  return (
    <Screen tone="surface">
      {step < 7 ? (
        <>
          <header className="shrink-0 bg-white px-3 pb-3 pt-[max(8px,env(safe-area-inset-top))] sm:pt-8">
            <div className="flex items-center">
              <button type="button" aria-label="Back" className="flex h-11 w-11 items-center justify-center" onClick={() => (step === 1 ? navigate({ to: "/home" }) : go(step - 1))}>
                <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
              </button>
              <p className="flex-1 text-center text-[12px] font-semibold text-[#64748B]">Step {step} of 7</p>
              <span className="w-11" />
            </div>
            <div className="mx-2 mt-1 h-1 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div className="h-full bg-[#003DF9] transition-all duration-200" style={{ width: `${(step / 7) * 100}%` }} />
            </div>
            <h1 className="px-2 pt-3 text-[22px] font-semibold text-[#0F172A]">{TITLES[step]}</h1>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {step === 1 ? <StepService draft={draft} setDraft={setDraft} errors={errors} onInfo={() => setPriorityInfo(true)} /> : null}
            {step === 2 ? (
              <StopForm
                target="pickup"
                title="Pickup"
                stop={draft.pickup}
                errors={errors}
                onChange={(patch) => patchStop("pickup", patch)}
                onProfile={() => setConfirmProfile("pickup")}
                onSaved={(placeId, label) => setConfirmSaved({ target: "pickup", placeId, label })}
                addresses={addresses}
              />
            ) : null}
            {step === 3 ? (
              <>
                <StopForm
                  target="drop"
                  title="Drop-off"
                  stop={draft.dropoff}
                  errors={errors}
                  onChange={(patch) => patchStop("dropoff", patch)}
                  onProfile={() => setConfirmProfile("dropoff")}
                  onSaved={(placeId, label) => setConfirmSaved({ target: "dropoff", placeId, label })}
                  addresses={addresses}
                />
                <div className="mt-4">
                  <RouteMap pickup={draft.pickup} dropoff={draft.dropoff} distance={draftMiles(draft) || undefined} />
                </div>
              </>
            ) : null}
            {step === 4 ? <StepShipment draft={draft} setDraft={setDraft} errors={errors} pushToast={pushToast} /> : null}
            {step === 5 ? <StepSchedule draft={draft} setDraft={setDraft} errors={errors} urgent={urgent} /> : null}
            {step === 6 ? (
              <StepReview
                draft={draft}
                priceMiles={price.distanceMiles}
                slotError={slotError}
                gaps={gaps}
                onEdit={(next) => {
                  setSlotError(false);
                  setDraft({ step: next });
                }}
                onPickSlot={(window) => {
                  setDraft((current) => ({ ...current, schedule: { ...current.schedule, window } }));
                  setSlotError(false);
                }}
                onMode={(priceMode) => setDraft({ priceMode })}
                onTerms={() => setLegal("terms")}
                onComplete={() => {
                  const gap = gaps[0];
                  if (!gap) return;
                  setFocusField(gap);
                  navigate({ to: gapRoute(gap) });
                }}
              />
            ) : null}
          </div>
          <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] text-[#64748B]">Estimated total</span>
              <span className="text-[18px] font-semibold text-[#0F172A]">{formatMoney(price.total)}</span>
            </div>
            <Button disabled={step === 6 && gaps.length > 0} onClick={() => (step === 6 ? submit() : go(step + 1))}>
              {step === 6 ? intentLabel(intent) : "Continue"}
            </Button>
          </div>
        </>
      ) : done ? (
        <Confirmation shipment={done} quoted={done.status !== "booking_confirmed"} />
      ) : null}

      <Sheet open={priorityInfo} title="Priority add-on" onClose={() => setPriorityInfo(false)}>
        <p className="text-[14px] leading-relaxed text-[#475569]">
          Priority add-on (+$10) asks dispatch to place this shipment ahead of routine work when capacity allows. Benefits and final rate pending client confirmation.
        </p>
        <div className="mt-4">
          <Button onClick={() => setPriorityInfo(false)}>Close</Button>
        </div>
      </Sheet>
      <Sheet open={!!confirmProfile} title="Use my profile address" onClose={() => setConfirmProfile(null)}>
        <p className="text-[14px] leading-relaxed text-[#475569]">
          Profile addresses are kept separate from shipments. Confirm to use this billing address for the {confirmProfile === "dropoff" ? "drop-off" : "pickup"}.
        </p>
        <p className="mt-3 rounded-[12px] bg-[#F6F7FB] p-3 text-[14px] text-[#0F172A]">{user?.billingAddress || "No billing address on the profile yet."}</p>
        <div className="mt-4 space-y-2">
          <Button
            disabled={!user?.billingAddress}
            onClick={() => {
              if (!confirmProfile || !user?.billingAddress) return;
              const place = placeFromAddress(user.billingAddress);
              if (!place) {
                patchStop(confirmProfile, { address: user.billingAddress, facility: user.companyName, lat: null, lng: null, milesFromOrigin: null });
              } else {
                applyPlace(confirmProfile, place.id, { facility: user.companyName || place.facility, contact: user.fullName, phone: user.phone });
              }
              setConfirmProfile(null);
            }}
          >
            Confirm address
          </Button>
          <Button variant="secondary" onClick={() => setConfirmProfile(null)}>
            Cancel
          </Button>
        </div>
      </Sheet>
      <Sheet open={!!confirmSaved} title="Use saved address" onClose={() => setConfirmSaved(null)}>
        <p className="text-[14px] text-[#475569]">Saved addresses are not applied until you confirm them for this shipment.</p>
        <p className="mt-3 text-[14px] font-medium text-[#0F172A]">{confirmSaved?.label}</p>
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => {
              if (!confirmSaved) return;
              applyPlace(confirmSaved.target, confirmSaved.placeId);
              setConfirmSaved(null);
            }}
          >
            Confirm address
          </Button>
          <Button variant="secondary" onClick={() => setConfirmSaved(null)}>
            Cancel
          </Button>
        </div>
      </Sheet>
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
    </Screen>
  );
}

function StepService({
  draft,
  setDraft,
  errors,
  onInfo,
}: {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft> | ((draft: BookingDraft) => BookingDraft)) => void;
  errors: Record<string, string>;
  onInfo: () => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Service" required>
        <div className="space-y-2">
          {services.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => setDraft({ serviceId: service.id, cargoVan: service.id === "06" ? draft.cargoVan : false })}
              className={cn("flex w-full items-center gap-3 rounded-[16px] border p-3 text-left", draft.serviceId === service.id ? "border-[#003DF9] bg-[#003DF9]/5" : "border-[#E2E8F0] bg-white")}
            >
              <ServiceIcon id={service.id} className="h-5 w-5 text-[#003DF9]" />
              <span className="text-[14px] font-semibold leading-snug text-[#0F172A]">{service.displayName}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Delivery type" required error={errors.deliveryType}>
        <div className="space-y-2">
          {DELIVERY_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setDraft({ deliveryType: type.id })}
              className={cn("w-full rounded-[16px] border p-3 text-left", draft.deliveryType === type.id ? "border-[#003DF9] bg-white" : "border-[#E2E8F0] bg-white")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-semibold text-[#0F172A]">{type.title}</span>
                <span className="flex items-center gap-2">
                  {type.stat ? <span className="rounded-full bg-[#CF0300] px-2 py-0.5 text-[12px] font-semibold text-white">STAT</span> : null}
                  <span className="text-[12px] font-semibold text-[#003DF9]">{type.fee}</span>
                </span>
              </span>
              <span className="mt-1 block text-[14px] text-[#64748B]">{type.body}</span>
            </button>
          ))}
        </div>
      </Field>
      <div className="rounded-[16px] bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[14px] font-semibold text-[#0F172A]">Priority add-on (+$10)</p>
            <button type="button" className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-[#003DF9]" onClick={onInfo}>
              <Info className="h-3.5 w-3.5" strokeWidth={1.75} /> Benefits and final rate
            </button>
          </div>
          <button type="button" aria-pressed={draft.priorityAddon} onClick={() => setDraft({ priorityAddon: !draft.priorityAddon })} className={cn("h-8 w-14 rounded-full p-1 transition", draft.priorityAddon ? "bg-[#003DF9]" : "bg-[#E2E8F0]")}>
            <span className={cn("block h-6 w-6 rounded-full bg-white transition", draft.priorityAddon && "translate-x-6")} />
          </button>
        </div>
      </div>
      {draft.serviceId === "06" ? (
        <div className="rounded-[16px] bg-white p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[14px] font-semibold text-[#0F172A]">Cargo van rental request</p>
            <button type="button" aria-pressed={draft.cargoVan} onClick={() => setDraft({ cargoVan: !draft.cargoVan })} className={cn("h-8 w-14 rounded-full p-1", draft.cargoVan ? "bg-[#003DF9]" : "bg-[#E2E8F0]")}>
              <span className={cn("block h-6 w-6 rounded-full bg-white transition", draft.cargoVan && "translate-x-6")} />
            </button>
          </div>
          <p className="mt-1 text-[12px] text-[#64748B]">Arranged in advance, subject to rental availability.</p>
        </div>
      ) : null}
    </div>
  );
}

function StopForm({
  target,
  title,
  stop,
  errors,
  onChange,
  onProfile,
  onSaved,
  addresses,
}: {
  target: "pickup" | "drop";
  title: string;
  stop: Stop;
  errors: Record<string, string>;
  onChange: (patch: Partial<Stop>) => void;
  onProfile: () => void;
  onSaved: (placeId: string, label: string) => void;
  addresses: { id: string; label: string; line: string; placeId: string }[];
}) {
  const [query, setQuery] = useState(stop.address);
  const suggestions = searchPlaces(query);
  const outside = outOfArea(stop);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-11 rounded-full bg-white px-3 text-[12px] font-semibold text-[#003DF9]" onClick={onProfile}>
          Use my profile address
        </button>
        {addresses.map((address) => (
          <button key={address.id} type="button" className="min-h-11 rounded-full bg-white px-3 text-[12px] font-semibold text-[#0F172A]" onClick={() => onSaved(address.placeId, address.line)}>
            {address.label}
          </button>
        ))}
      </div>
      <Field label={`${title} address`} required error={errors[`${target}Address`]}>
        <TextInput
          value={query}
          invalid={!!errors[`${target}Address`]}
          placeholder="Search street, city, or facility"
          onChange={(event) => {
            setQuery(event.target.value);
            onChange({ address: event.target.value, lat: null, lng: null, milesFromOrigin: null });
          }}
        />
        {suggestions.length > 0 && query.trim().length > 1 ? (
          <div className="mt-2 overflow-hidden rounded-[12px] border border-[#E2E8F0] bg-white">
            {suggestions.map((place) => (
              <button
                key={place.id}
                type="button"
                className="block w-full px-3 py-3 text-left text-[14px] text-[#0F172A] active:bg-[#F6F7FB]"
                onClick={() => {
                  setQuery(place.label);
                  onChange({
                    address: place.label,
                    facility: stop.facility || place.facility,
                    milesFromOrigin: place.milesFromOrigin,
                    lat: place.lat,
                    lng: place.lng,
                  });
                }}
              >
                <span className="block font-medium">{place.facility}</span>
                <span className="block text-[12px] text-[#64748B]">
                  {place.label} · {place.milesFromOrigin} mi from Chesterfield
                </span>
              </button>
            ))}
          </div>
        ) : null}
      </Field>
      {outside ? (
        <p className="rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[13px] leading-snug text-[#92400E]">
          This location is outside our standard service area. You can still submit a request for review.
        </p>
      ) : null}
      <Field label="Facility/Business name" required error={errors[`${target}Facility`]}>
        <TextInput value={stop.facility} invalid={!!errors[`${target}Facility`]} onChange={(event) => onChange({ facility: event.target.value })} />
      </Field>
      <Field label={target === "pickup" ? "Contact person" : "Recipient/Contact name"} required error={errors[`${target}Contact`]}>
        <TextInput value={stop.contact} invalid={!!errors[`${target}Contact`]} onChange={(event) => onChange({ contact: event.target.value })} />
      </Field>
      <Field label="Contact phone" required error={errors[`${target}Phone`]}>
        <TextInput inputMode="tel" value={stop.phone} invalid={!!errors[`${target}Phone`]} onChange={(event) => onChange({ phone: formatPhone(event.target.value) })} />
      </Field>
      <Field label={target === "pickup" ? "Floor/Suite/Access instructions" : "Access/receiving instructions"}>
        <TextInput value={stop.access} onChange={(event) => onChange({ access: event.target.value })} />
      </Field>
      <Field label={target === "pickup" ? "Pickup notes" : "Delivery notes"}>
        <TextArea value={stop.notes} onChange={(event) => onChange({ notes: event.target.value })} />
      </Field>
    </div>
  );
}

function StepShipment({
  draft,
  setDraft,
  errors,
  pushToast,
}: {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft> | ((draft: BookingDraft) => BookingDraft)) => void;
  errors: Record<string, string>;
  pushToast: (title: string, body?: string) => void;
}) {
  const details = draft.details;
  const setDetails = (patch: Partial<BookingDraft["details"]>) => setDraft((current) => ({ ...current, details: { ...current.details, ...patch } }));
  const addPhotos = (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    if (details.photos.length + list.length > 5) pushToast("Photo limit", "You can add up to 5 photos.");
    list.slice(0, Math.max(0, 5 - details.photos.length)).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const url = String(reader.result);
        setDraft((current) => ({
          ...current,
          details: { ...current.details, photos: [...current.details.photos, url].slice(0, 5) },
        }));
      };
      reader.readAsDataURL(file);
    });
  };
  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[#64748B]">Share packaging and handling instructions before pickup.</p>
      <Field label="Shipment type" required error={errors.type}>
        <div className="flex flex-wrap gap-2">
          {shipmentTypes.map((type) => (
            <button key={type} type="button" onClick={() => setDetails({ type })} className={cn("min-h-11 rounded-full px-3 text-[13px] font-semibold", details.type === type ? "bg-[#003DF9] text-white" : "bg-white text-[#0F172A]")}>
              {type}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Box quantity" required error={errors.quantity}>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Decrease quantity" className="flex h-11 w-11 items-center justify-center rounded-full bg-white" onClick={() => setDetails({ quantity: Math.max(1, details.quantity - 1) })}>
            <Minus className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <span className="w-8 text-center text-[18px] font-semibold">{details.quantity}</span>
          <button type="button" aria-label="Increase quantity" className="flex h-11 w-11 items-center justify-center rounded-full bg-white" onClick={() => setDetails({ quantity: details.quantity + 1 })}>
            <Plus className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
      </Field>
      <Field label="Box size" required error={errors.boxSize || errors.custom}>
        <div className="grid grid-cols-2 gap-2">
          {boxSizes.map((size) => (
            <button key={size.id} type="button" onClick={() => setDetails({ boxSize: size.id })} className={cn("rounded-[12px] border p-3 text-left", details.boxSize === size.id ? "border-[#003DF9] bg-white" : "border-[#E2E8F0] bg-white")}>
              <span className="block text-[14px] font-semibold">{size.id}</span>
              <span className="block text-[12px] text-[#64748B]">{size.hint}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-end gap-2" aria-hidden>
          {[16, 24, 34, 44].map((size) => (
            <span key={size} className="rounded-sm border border-[#003DF9]/40 bg-[#003DF9]/10" style={{ width: size, height: size * 0.72 }} />
          ))}
          <span className="text-[12px] text-[#64748B]">Size guide</span>
        </div>
      </Field>
      {details.boxSize === "Custom" ? (
        <div className="grid grid-cols-3 gap-2">
          {(["length", "width", "height"] as const).map((key) => (
            <Field key={key} label={key === "length" ? "L (in)" : key === "width" ? "W (in)" : "H (in)"} required>
              <TextInput inputMode="decimal" value={details[key]} onChange={(event) => setDetails({ [key]: event.target.value })} />
            </Field>
          ))}
        </div>
      ) : null}
      <Field label="Weight (lbs)" required error={errors.weight}>
        <TextInput
          inputMode="decimal"
          value={details.weight}
          invalid={!!errors.weight}
          onChange={(event) => {
            const weight = event.target.value;
            const numeric = Number(weight);
            setDetails({ weight, weightRange: numeric > 0 ? weightRangeFor(numeric) : details.weightRange });
          }}
        />
      </Field>
      <Field label="Weight range" required error={errors.weightRange}>
        <div className="flex flex-wrap gap-2">
          {weightRanges.map((range) => (
            <button key={range} type="button" onClick={() => setDetails({ weightRange: range })} className={cn("min-h-11 rounded-full px-3 text-[13px] font-semibold", details.weightRange === range ? "bg-[#003DF9] text-white" : "bg-white")}>
              {range} lbs
            </button>
          ))}
        </div>
      </Field>
      <Field label="Shipment description" required error={errors.description}>
        <TextArea value={details.description} invalid={!!errors.description} onChange={(event) => setDetails({ description: event.target.value })} />
      </Field>
      <Field label="Handling instructions">
        <div className="flex flex-wrap gap-2">
          {handlingOptions.map((option) => {
            const on = details.handling.includes(option);
            return (
              <button key={option} type="button" onClick={() => setDetails({ handling: on ? details.handling.filter((item) => item !== option) : [...details.handling, option] })} className={cn("min-h-11 rounded-full px-3 text-[13px] font-semibold", on ? "bg-[#003DF9] text-white" : "bg-white")}>
                {option}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Temperature requirement" required error={errors.temperature}>
        <div className="grid grid-cols-2 gap-2">
          {temperatureOptions.map((option) => (
            <button key={option} type="button" onClick={() => setDetails({ temperature: option })} className={cn("min-h-12 rounded-[12px] border px-2 text-[13px] font-semibold", details.temperature === option ? "border-[#003DF9] text-[#003DF9]" : "border-[#E2E8F0] bg-white")}>
              {option}
            </button>
          ))}
        </div>
      </Field>
      {details.temperature === "Other" ? (
        <Field label="Other temperature" required error={errors.temperatureOther}>
          <TextInput value={details.temperatureOther} invalid={!!errors.temperatureOther} onChange={(event) => setDetails({ temperatureOther: event.target.value })} />
        </Field>
      ) : null}
      <Field label="Declared value" hint="Optional">
        <TextInput inputMode="decimal" value={details.declaredValue} onChange={(event) => setDetails({ declaredValue: event.target.value })} placeholder="0.00" />
      </Field>
      <Field label="Item photos" hint="Optional, up to 5. Camera or gallery.">
        <div className="flex gap-2">
          <label className="flex h-11 items-center gap-2 rounded-[12px] bg-white px-3 text-[14px] font-semibold text-[#003DF9]">
            <Camera className="h-4 w-4" strokeWidth={1.75} /> Camera
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => addPhotos(event.target.files)} />
          </label>
          <label className="flex h-11 items-center gap-2 rounded-[12px] bg-white px-3 text-[14px] font-semibold text-[#003DF9]">
            <ImagePlus className="h-4 w-4" strokeWidth={1.75} /> Gallery
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addPhotos(event.target.files)} />
          </label>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {details.photos.map((photo, index) => (
            <span key={photo.slice(0, 24) + index} className="relative h-16 w-16 shrink-0">
              <img src={photo} alt="" className="h-16 w-16 rounded-[12px] object-cover" />
              <button type="button" aria-label="Remove photo" className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-white" onClick={() => setDetails({ photos: details.photos.filter((_, photoIndex) => photoIndex !== index) })}>
                <X className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </span>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StepSchedule({
  draft,
  setDraft,
  errors,
  urgent,
}: {
  draft: BookingDraft;
  setDraft: (patch: Partial<BookingDraft> | ((draft: BookingDraft) => BookingDraft)) => void;
  errors: Record<string, string>;
  urgent: boolean;
}) {
  const today = todayET();
  const [cursor, setCursor] = useState(() => {
    const [year, month] = today.split("-").map(Number);
    return { year, month: month - 1 };
  });
  const cells = monthMatrix(cursor.year, cursor.month);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(cursor.year, cursor.month, 1));
  const slots = slotsFor(draft.schedule.date);
  const holiday = draft.schedule.date && isHoliday(draft.schedule.date);
  return (
    <div className="space-y-4">
      <p className="text-[12px] font-semibold text-[#003DF9]">{business.timezoneLabel}</p>
      <p className="text-[12px] text-[#64748B]">{business.hoursHelper}</p>
      <div className="rounded-[16px] bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <button type="button" className="h-11 px-2 text-[14px] font-semibold text-[#003DF9]" onClick={() => setCursor((current) => ({ year: current.month === 0 ? current.year - 1 : current.year, month: current.month === 0 ? 11 : current.month - 1 }))}>
            Prev
          </button>
          <p className="text-[16px] font-semibold">{monthLabel}</p>
          <button type="button" className="h-11 px-2 text-[14px] font-semibold text-[#003DF9]" onClick={() => setCursor((current) => ({ year: current.month === 11 ? current.year + 1 : current.year, month: current.month === 11 ? 0 : current.month + 1 }))}>
            Next
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[12px] text-[#64748B]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day} className={day === "Sun" ? "text-[#CF0300]" : ""}>
              {day}
              {day === "Sun" ? <span className="block text-[10px]">Closed</span> : null}
            </span>
          ))}
          {cells.map((date, index) => {
            if (!date) return <span key={`e-${index}`} />;
            const disabled = isPastDate(date) || isSunday(date);
            const selected = draft.schedule.date === date;
            return (
              <button
                key={date}
                type="button"
                disabled={disabled}
                onClick={() => setDraft((current) => ({ ...current, schedule: { ...current.schedule, date, window: "" } }))}
                className={cn("h-11 rounded-[10px] text-[14px]", selected && "bg-[#003DF9] text-white", !selected && !disabled && "bg-[#F6F7FB]", disabled && "text-[#CBD5E1]")}
              >
                {Number(date.slice(-2))}
                {isHoliday(date) ? <span className="block text-[9px] leading-none">Hol</span> : null}
              </button>
            );
          })}
        </div>
      </div>
      {errors.date ? <p className="text-[12px] text-[#DC2626]">{errors.date}</p> : null}
      {holiday ? <p className="text-[12px] text-[#92400E]">{business.holidayNames[draft.schedule.date]} is a holiday. A holiday surcharge may apply.</p> : null}
      {draft.schedule.date && isSaturday(draft.schedule.date) ? <p className="text-[12px] text-[#64748B]">Saturday windows end at 5:00 PM ET.</p> : null}
      {urgent ? (
        <Field label="Requested delivery deadline" required error={errors.deadline} hint="Availability is confirmed by our team.">
          <select className={inputClass} value={draft.schedule.deadline} onChange={(event) => setDraft((current) => ({ ...current, schedule: { ...current.schedule, deadline: event.target.value, window: "" } }))}>
            <option value="">Select a time</option>
            {DEADLINE_TIMES.map((time) => (
              <option key={time} value={time}>
                {time} ET
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Delivery window" required error={errors.window}>
          <div className="grid grid-cols-2 gap-2">
            {slots.map((slot) => {
              const state = slotState(draft.schedule.date, slot);
              const selected = draft.schedule.window === slot;
              return (
                <button key={slot} type="button" disabled={state !== "open"} onClick={() => setDraft((current) => ({ ...current, schedule: { ...current.schedule, window: slot } }))} className={cn("min-h-12 rounded-[12px] border px-2 text-[13px] font-semibold", selected && "border-[#003DF9] bg-[#003DF9] text-white", !selected && state === "open" && "border-[#E2E8F0] bg-white", state !== "open" && "border-[#E2E8F0] bg-[#F1F5F9] text-[#94A3B8]")}>
                  <span className="flex items-center justify-center gap-1">
                    {state === "booked" ? <Lock className="h-3.5 w-3.5" strokeWidth={1.75} /> : null}
                    {slot}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>
      )}
      {!urgent ? (
        <Field label="Requested delivery deadline" hint="Optional. Eastern Time (ET).">
          <select className={inputClass} value={draft.schedule.deadline} onChange={(event) => setDraft((current) => ({ ...current, schedule: { ...current.schedule, deadline: event.target.value } }))}>
            <option value="">No deadline</option>
            {DEADLINE_TIMES.map((time) => (
              <option key={time}>{time}</option>
            ))}
          </select>
        </Field>
      ) : null}
    </div>
  );
}

function StepReview({
  draft,
  onEdit,
  slotError,
  gaps,
  onPickSlot,
  onMode,
  onTerms,
  onComplete,
}: {
  draft: BookingDraft;
  priceMiles: number;
  onEdit: (step: number) => void;
  slotError: boolean;
  gaps: string[];
  onPickSlot: (window: string) => void;
  onMode: (mode: BookingDraft["priceMode"]) => void;
  onTerms: () => void;
  onComplete: () => void;
}) {
  const service = services.find((item) => item.id === draft.serviceId);
  const price = draftPrice(draft);
  const cards = [
    { step: 1, title: "Service and type", body: `${service?.displayName ?? "Service"} · ${draft.deliveryType || "Not set"}${draft.priorityAddon ? " · Priority add-on" : ""}${draft.cargoVan ? " · Cargo van" : ""}` },
    { step: 2, title: "Pickup", body: `${draft.pickup.facility}\n${draft.pickup.address}\n${draft.pickup.contact} · ${draft.pickup.phone}` },
    { step: 3, title: "Drop-off", body: `${draft.dropoff.facility}\n${draft.dropoff.address}\n${draft.dropoff.contact} · ${draft.dropoff.phone}` },
    { step: 4, title: "Shipment details", body: `${draft.details.type} · ${draft.details.quantity} × ${draft.details.boxSize}\n${draft.details.weight} lbs (${draft.details.weightRange})\n${draft.details.temperature}\n${draft.details.handling.join(", ") || "No special handling"}\n${draft.details.description}` },
    { step: 5, title: "Schedule", body: `${draft.schedule.date ? formatDateET(draft.schedule.date, true) : "Date not set"}\n${draft.schedule.window || draft.schedule.deadline || "Window not set"} · Eastern Time (ET)` },
  ];
  return (
    <div className="space-y-3">
      {gaps[0] ? (
        <div className="rounded-[16px] bg-[#F59E0B]/15 p-3">
          <p className="text-[14px] font-semibold text-[#92400E]">{gaps[0]} is required</p>
          <button type="button" className="mt-2 min-h-11 text-[14px] font-semibold text-[#003DF9]" onClick={onComplete}>
            Complete Now
          </button>
        </div>
      ) : null}
      {slotError ? (
        <div className="rounded-[16px] border border-[#DC2626]/30 bg-white p-3">
          <p className="text-[14px] font-semibold text-[#DC2626]">Slot no longer available</p>
          <p className="mt-1 text-[13px] text-[#475569]">Choose another Eastern Time window.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {alternativeSlots(draft.schedule.date, draft.schedule.window).map((slot) => (
              <button key={slot} type="button" className="min-h-11 rounded-full bg-[#003DF9]/10 px-3 text-[12px] font-semibold text-[#003DF9]" onClick={() => onPickSlot(slot)}>
                {slot}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {cards.map((card) => (
        <section key={card.title} className="rounded-[16px] bg-white p-3 shadow-[0_4px_16px_rgba(15,23,42,.06)]">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-[14px] font-semibold text-[#0F172A]">{card.title}</h2>
            <button type="button" aria-label={`Edit ${card.title}`} className="flex h-11 w-11 items-center justify-center" onClick={() => onEdit(card.step)}>
              <Pencil className="h-4 w-4 text-[#003DF9]" strokeWidth={1.75} />
            </button>
          </div>
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-[#475569]">{card.body}</p>
        </section>
      ))}
      <section className="rounded-[16px] bg-white p-3">
        <h2 className="text-[14px] font-semibold">Add-ons</h2>
        <p className="mt-1 text-[14px] text-[#475569]">{draft.priorityAddon ? "Priority add-on" : "No priority add-on"}{draft.cargoVan ? " · Cargo van rental" : ""}</p>
      </section>
      <div className="rounded-[16px] bg-white p-3">
        <p className="text-[12px] font-semibold text-[#64748B]">Preview price state</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([
            ["auto", "Automatic"],
            ["book", "Instant rate"],
            ["quote", "Needs review"],
          ] as const).map(([mode, label]) => (
            <button key={mode} type="button" onClick={() => onMode(mode)} className={cn("min-h-11 rounded-[12px] px-1 text-[12px] font-semibold", draft.priceMode === mode ? "bg-[#003DF9] text-white" : "bg-[#F6F7FB] text-[#0F172A]")}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <PriceTable price={price} />
      <p className="text-[12px] leading-snug text-[#64748B]">
        By submitting you agree to the{" "}
        <button type="button" className="font-semibold text-[#003DF9]" onClick={onTerms}>
          Terms & Conditions
        </button>
        .
      </p>
    </div>
  );
}

function Confirmation({ shipment, quoted }: { shipment: Shipment; quoted: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-[max(28px,env(safe-area-inset-top))] sm:pt-14">
      <SuccessMark />
      <h1 className="mt-5 text-center text-[28px] font-semibold text-[#0F172A]">{quoted ? "Request received" : "Booking confirmed"}</h1>
      <p className="mt-2 text-center text-[14px] text-[#64748B]">{shipment.id}</p>
      <div className="mt-4 rounded-[16px] bg-[#F6F7FB] p-4 text-[14px] leading-relaxed text-[#0F172A]">
        <p className="font-semibold">{quoted ? "Request received" : "Booking confirmed"}</p>
        <p className="mt-2">{shipment.pickup.facility} to {shipment.dropoff.facility}</p>
        <p className="text-[#64748B]">
          {formatDateET(shipment.schedule.date, true)} · {shipment.schedule.window || shipment.schedule.deadline} ET
        </p>
        <p className="mt-2 font-semibold">{formatMoney(shipment.price.total)}</p>
        <p className="text-[12px] text-[#64748B]">{business.priceCaption}</p>
      </div>
      <div className="mt-6 space-y-3">
        <Button onClick={() => navigate({ to: "/shipments/$id", params: { id: shipment.id } })}>Track Shipment</Button>
        <Button variant="secondary" onClick={() => navigate({ to: "/messages/$id", params: { id: `t-${shipment.id}` } })}>
          Message Support
        </Button>
        <Button variant="ghost" onClick={() => navigate({ to: "/home" })}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
