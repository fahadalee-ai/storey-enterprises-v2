import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { business } from "@/config/business";
import { buildSeed } from "@/data/seed";
import type {
  AppNotification,
  BookingDraft,
  ChatAttachment,
  Connectivity,
  ListPreview,
  NotifyCategory,
  NotifyChannel,
  SavedAddress,
  SavedCard,
  Shipment,
  Stop,
  Thread,
  UserProfile,
} from "@/data/types";
import { formatDateTimeET } from "@/lib/format";
import { draftPrice, round2, submitIntent } from "@/lib/pricing";
import { clearSession, clearStorage, readSession, readStorage, writeSession, writeStorage } from "@/lib/storage";

export type Toast = { id: number; title: string; body?: string };

type NotifyPrefs = Record<NotifyCategory, Record<NotifyChannel, boolean>>;

const DEFAULT_PREFS: NotifyPrefs = {
  Shipments: { push: true, email: true, sms: false },
  "Quotes and payments": { push: true, email: true, sms: true },
  Messages: { push: true, email: false, sms: false },
};

export function emptyStop(): Stop {
  return {
    address: "",
    facility: "",
    contact: "",
    phone: "",
    access: "",
    notes: "",
    milesFromOrigin: null,
    lat: null,
    lng: null,
  };
}

export function emptyDraft(serviceId = "01"): BookingDraft {
  return {
    serviceId,
    deliveryType: "",
    priorityAddon: false,
    cargoVan: false,
    pickup: emptyStop(),
    dropoff: emptyStop(),
    details: {
      type: "",
      quantity: 1,
      boxSize: "",
      length: "",
      width: "",
      height: "",
      weight: "",
      weightRange: "",
      description: "",
      handling: [],
      temperature: "",
      temperatureOther: "",
      declaredValue: "",
      photos: [],
    },
    schedule: { date: "", window: "", deadline: "" },
    priceMode: "auto",
    step: 1,
  };
}

function refundEstimate(shipment: Shipment) {
  const paid = shipment.payment.status === "paid" || shipment.payment.status === "refund_pending";
  if (!paid) return 0;
  const full = shipment.price.total;
  if (["request_received", "quote_sent", "quote_accepted", "booking_confirmed"].includes(shipment.status)) return full;
  if (["driver_assigned", "en_route_pickup"].includes(shipment.status)) return round2(full * 0.75);
  if (shipment.status === "picked_up") return round2(full * 0.5);
  if (["in_transit", "exception"].includes(shipment.status)) return round2(full * 0.25);
  return 0;
}

type Store = {
  hydrated: boolean;
  user: UserProfile | null;
  onboarded: boolean;
  shipments: Shipment[];
  threads: Thread[];
  notifications: AppNotification[];
  addresses: SavedAddress[];
  cards: SavedCard[];
  draft: BookingDraft;
  notify: NotifyPrefs;
  listPreview: ListPreview;
  connectivity: Connectivity;
  toasts: Toast[];
  focusField: string | null;
  typingThread: string | null;
  markOnboarded: () => void;
  login: (email: string, password: string, remember: boolean) => { ok: true } | { ok: false; reason: "invalid" };
  register: (input: Omit<UserProfile, "id" | "photo" | "termsAcceptedAt" | "policyVersion" | "remember" | "taxId"> & { taxId?: string }) =>
    | { ok: true }
    | { ok: false; reason: "exists" };
  sso: (provider: "Google" | "Apple") => void;
  logout: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  deleteAccount: (password: string) => { ok: true } | { ok: false; reason: "password" };
  resetPassword: (email: string, password: string) => void;
  setDraft: (patch: Partial<BookingDraft> | ((draft: BookingDraft) => BookingDraft)) => void;
  startBooking: (serviceId?: string) => void;
  reorder: (shipmentId: string) => void;
  createShipment: (draft: BookingDraft) => Shipment;
  acceptQuote: (shipmentId: string) => void;
  declineQuote: (shipmentId: string, reason: string) => void;
  payShipment: (shipmentId: string, method: string) => { ok: true; reference: string } | { ok: false; reason: string };
  cancelShipment: (shipmentId: string, reason: string) => void;
  requestReschedule: (shipmentId: string, date: string, window: string) => void;
  sendMessage: (threadId: string, text: string, attachment?: ChatAttachment) => void;
  receiveMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  setTypingThread: (threadId: string | null) => void;
  markAllRead: () => void;
  markNotificationRead: (id: string) => void;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
  addCard: (card: Omit<SavedCard, "id">) => void;
  removeCard: (id: string) => void;
  toggleNotify: (category: NotifyCategory, channel: NotifyChannel) => void;
  setListPreview: (value: ListPreview) => void;
  setConnectivity: (value: Connectivity) => void;
  setFocusField: (field: string | null) => void;
  pushToast: (title: string, body?: string) => void;
  dismissToast: (id: number) => void;
  refundEstimate: (shipment: Shipment) => number;
};

const Ctx = createContext<Store | null>(null);

function loadJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [seed] = useState(buildSeed);
  const [hydrated, setHydrated] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>(seed.users);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [shipments, setShipments] = useState<Shipment[]>(seed.shipments);
  const [threads, setThreads] = useState<Thread[]>(seed.threads);
  const [notifications, setNotifications] = useState<AppNotification[]>(seed.notifications);
  const [addresses, setAddresses] = useState<SavedAddress[]>(seed.addresses);
  const [cards, setCards] = useState<SavedCard[]>(seed.cards);
  const [draft, setDraftState] = useState<BookingDraft>(emptyDraft());
  const [notify, setNotify] = useState<NotifyPrefs>(DEFAULT_PREFS);
  const [listPreview, setListPreview] = useState<ListPreview>("live");
  const [connectivity, setConnectivity] = useState<Connectivity>("online");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [typingThread, setTypingThread] = useState<string | null>(null);

  const pushToast = (title: string, body?: string) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, title, body }]);
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200);
  };

  useEffect(() => {
    const savedUsers = loadJson<UserProfile[]>(readStorage("se.users"));
    const savedShips = loadJson<Shipment[]>(readStorage("se.shipments"));
    const savedThreads = loadJson<Thread[]>(readStorage("se.threads"));
    const savedNotes = loadJson<AppNotification[]>(readStorage("se.notifications"));
    const savedAddresses = loadJson<SavedAddress[]>(readStorage("se.addresses"));
    const savedCards = loadJson<SavedCard[]>(readStorage("se.cards"));
    const savedNotify = loadJson<NotifyPrefs>(readStorage("se.notify"));
    const savedUser = loadJson<UserProfile>(readSession("se.user") ?? readStorage("se.user"));
    if (savedUsers) setUsers(savedUsers);
    if (savedShips) setShipments(savedShips);
    if (savedThreads) setThreads(savedThreads);
    if (savedNotes) setNotifications(savedNotes);
    if (savedAddresses) setAddresses(savedAddresses);
    if (savedCards) setCards(savedCards);
    if (savedNotify) setNotify(savedNotify);
    if (savedUser) setUser(savedUser);
    setOnboarded(readStorage("se.onboarded") === "1");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStorage("se.users", JSON.stringify(users));
    writeStorage("se.shipments", JSON.stringify(shipments));
    writeStorage("se.threads", JSON.stringify(threads));
    writeStorage("se.notifications", JSON.stringify(notifications));
    writeStorage("se.addresses", JSON.stringify(addresses));
    writeStorage("se.cards", JSON.stringify(cards));
    writeStorage("se.notify", JSON.stringify(notify));
    writeStorage("se.onboarded", onboarded ? "1" : "0");
  }, [hydrated, users, shipments, threads, notifications, addresses, cards, notify, onboarded]);

  const api = useMemo<Store>(() => {
    const persistUser = (next: UserProfile | null) => {
      setUser(next);
      if (!next) {
        clearStorage("se.user");
        clearSession("se.user");
        return;
      }
      if (next.remember) {
        writeStorage("se.user", JSON.stringify(next));
        clearSession("se.user");
      } else {
        writeSession("se.user", JSON.stringify(next));
        clearStorage("se.user");
      }
    };

    return {
      hydrated,
      user,
      onboarded,
      shipments,
      threads,
      notifications,
      addresses,
      cards,
      draft,
      notify,
      listPreview,
      connectivity,
      toasts,
      focusField,
      typingThread,
      markOnboarded: () => {
        setOnboarded(true);
        writeStorage("se.onboarded", "1");
      },
      login: (email, password, remember) => {
        const found = users.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
        if (!found || found.password !== password) return { ok: false, reason: "invalid" };
        const next = { ...found, remember };
        persistUser(next);
        setUsers((list) => list.map((item) => (item.id === next.id ? next : item)));
        setOnboarded(true);
        return { ok: true };
      },
      register: (input) => {
        if (users.some((item) => item.email.toLowerCase() === input.email.trim().toLowerCase())) {
          return { ok: false, reason: "exists" };
        }
        const created: UserProfile = {
          id: `u-${Date.now()}`,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone.trim(),
          password: input.password,
          accountType: input.accountType,
          companyName: input.companyName.trim(),
          facilityType: input.facilityType,
          billingEmail: input.billingEmail.trim(),
          billingAddress: input.billingAddress.trim(),
          taxId: input.taxId?.trim() ?? "",
          photo: "",
          termsAcceptedAt: new Date().toISOString(),
          policyVersion: business.policyVersion,
          remember: true,
        };
        setUsers((list) => [...list, created]);
        persistUser(created);
        setOnboarded(true);
        return { ok: true };
      },
      sso: (provider) => {
        const existing = users.find((item) => item.email === "jordan@riversideclinic.com") ?? users[0];
        if (existing) {
          persistUser({ ...existing, remember: true });
          pushToast(`Signed in with ${provider}`, "This preview uses a sample account.");
          return;
        }
        const created: UserProfile = {
          ...emptyProfile(),
          id: `u-${Date.now()}`,
          fullName: provider === "Google" ? "Alex Morgan" : "Riley Chen",
          email: provider === "Google" ? "alex.morgan@gmail.com" : "riley.chen@icloud.com",
          password: "Storey123!",
          remember: true,
          termsAcceptedAt: new Date().toISOString(),
          policyVersion: business.policyVersion,
        };
        setUsers((list) => [...list, created]);
        persistUser(created);
        pushToast(`Signed in with ${provider}`);
      },
      logout: () => {
        persistUser(null);
        pushToast("Signed out");
      },
      updateUser: (patch) => {
        if (!user) return;
        const next = { ...user, ...patch };
        persistUser(next);
        setUsers((list) => list.map((item) => (item.id === next.id ? next : item)));
      },
      deleteAccount: (password) => {
        if (!user || user.password !== password) return { ok: false, reason: "password" };
        setUsers((list) => list.filter((item) => item.id !== user.id));
        persistUser(null);
        pushToast("Account deleted", "Delivery and payment records may be retained.");
        return { ok: true };
      },
      resetPassword: (email, password) => {
        setUsers((list) =>
          list.map((item) => (item.email.toLowerCase() === email.trim().toLowerCase() ? { ...item, password } : item)),
        );
        if (user && user.email.toLowerCase() === email.trim().toLowerCase()) {
          persistUser({ ...user, password });
        }
      },
      setDraft: (patch) => {
        setDraftState((current) => (typeof patch === "function" ? patch(current) : { ...current, ...patch }));
      },
      startBooking: (serviceId) => setDraftState(emptyDraft(serviceId || "01")),
      reorder: (shipmentId) => {
        const source = shipments.find((item) => item.id === shipmentId);
        if (!source) return;
        setDraftState({
          ...emptyDraft(source.serviceId),
          deliveryType: source.deliveryType,
          priorityAddon: source.priorityAddon,
          cargoVan: source.cargoVan,
          pickup: source.pickup,
          dropoff: source.dropoff,
          details: {
            ...emptyDraft().details,
            type: source.details.type,
            quantity: source.details.quantity,
            boxSize: source.details.boxSize,
            weight: String(source.details.weightLbs),
            weightRange: source.details.weightRange,
            description: source.details.description,
            handling: source.details.handling,
            temperature: source.details.temperature,
            declaredValue: source.details.declaredValue ? String(source.details.declaredValue) : "",
            photos: source.details.photos,
          },
        });
        pushToast("Shipment copied", "Choose a new delivery window to finish.");
      },
      createShipment: (current) => {
        const intent = submitIntent(current);
        const idNum = Math.max(200, ...shipments.map((item) => Number(item.id.split("-").pop()) || 0)) + 1;
        const year = new Date().getFullYear();
        const id = `SE-${year}-${String(idNum).padStart(6, "0")}`;
        const now = new Date().toISOString();
        const price = draftPrice(current);
        const dims =
          current.details.boxSize === "Custom"
            ? `${current.details.length} × ${current.details.width} × ${current.details.height} in`
            : current.details.boxSize;
        const status = intent === "book" ? "booking_confirmed" : "quote_sent";
        const created: Shipment = {
          id,
          serviceId: current.serviceId,
          deliveryType: (current.deliveryType || "routine") as Shipment["deliveryType"],
          priorityAddon: current.priorityAddon,
          cargoVan: current.cargoVan,
          pickup: current.pickup,
          dropoff: current.dropoff,
          details: {
            type: current.details.type,
            quantity: current.details.quantity,
            boxSize: current.details.boxSize,
            dimensions: dims,
            weightLbs: Number(current.details.weight) || 0,
            weightRange: current.details.weightRange,
            description: current.details.description,
            handling: current.details.handling,
            temperature:
              current.details.temperature === "Other"
                ? current.details.temperatureOther || "Other"
                : current.details.temperature,
            declaredValue: current.details.declaredValue ? Number(current.details.declaredValue) : undefined,
            photos: current.details.photos,
          },
          schedule: current.schedule,
          price,
          status,
          quote:
            intent === "book"
              ? undefined
              : {
                  id: `Q-${idNum}`,
                  validUntil: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
                  notes:
                    intent === "review"
                      ? "This pickup or delivery is outside the standard service area. Our team will review the route before confirming."
                      : "Preview quote based on the details you submitted. Final rate is confirmed by Storey Enterprises.",
                  status: "sent",
                },
          payment: { status: "unpaid" },
          timeline: [
            { key: "request_received", label: "Request received", at: now, state: intent === "book" ? "done" : "done" },
            {
              key: intent === "book" ? "booking_confirmed" : "quote_sent",
              label: intent === "book" ? "Booking confirmed" : "Quote sent",
              at: now,
              state: "current",
            },
          ],
          custody: [],
          documents: [],
          createdAt: now,
        };
        setShipments((list) => [created, ...list]);
        setThreads((list) => [
          {
            id: `t-${id}`,
            title: id,
            subtitle: "Shipment thread",
            shipmentId: id,
            unread: 1,
            messages: [
              {
                id: `m-${Date.now()}`,
                from: "them",
                text: `We received ${id}. ${intent === "book" ? "Your delivery window is held." : "A quote is ready for review."}`,
                at: now,
                status: "delivered",
              },
            ],
          },
          ...list,
        ]);
        setNotifications((list) => [
          {
            id: `n-${Date.now()}`,
            type: intent === "book" ? "booking_confirmed" : "quote_sent",
            title: intent === "book" ? "Booking confirmed" : "Quote sent",
            body: `${id} · ${formatDateTimeET(now)}`,
            at: now,
            read: false,
            target: intent === "book" ? { kind: "shipment", id } : { kind: "quote", id },
          },
          ...list,
        ]);
        pushToast(intent === "book" ? "Booking confirmed" : "Request received", id);
        return created;
      },
      acceptQuote: (shipmentId) => {
        const now = new Date().toISOString();
        setShipments((list) =>
          list.map((item) =>
            item.id === shipmentId
              ? {
                  ...item,
                  status: "quote_accepted",
                  quote: item.quote ? { ...item.quote, status: "accepted" } : item.quote,
                  timeline: item.timeline
                    .map((event) => (event.state === "current" ? { ...event, state: "done" as const } : event))
                    .concat({ key: "quote_accepted", label: "Quote accepted", at: now, state: "current" }),
                }
              : item,
          ),
        );
        pushToast("Quote accepted", business.paymentNote);
      },
      declineQuote: (shipmentId, reason) => {
        const now = new Date().toISOString();
        setShipments((list) =>
          list.map((item) =>
            item.id === shipmentId
              ? {
                  ...item,
                  status: "quote_declined",
                  quote: item.quote ? { ...item.quote, status: "declined", declineReason: reason } : item.quote,
                  timeline: item.timeline.concat({
                    key: "quote_declined",
                    label: "Quote declined",
                    at: now,
                    state: "alert",
                    note: reason,
                  }),
                }
              : item,
          ),
        );
        pushToast("Quote declined");
      },
      payShipment: (shipmentId, method) => {
        const shipment = shipments.find((item) => item.id === shipmentId);
        if (!shipment) return { ok: false, reason: "Shipment not found." };
        if (method.includes("0002")) {
          setShipments((list) =>
            list.map((item) =>
              item.id === shipmentId
                ? {
                    ...item,
                    payment: {
                      ...item.payment,
                      status: "failed",
                      method,
                      failureReason: "Card declined by the issuer (test mode).",
                    },
                  }
                : item,
            ),
          );
          return { ok: false, reason: "Card declined by the issuer (test mode)." };
        }
        const now = new Date().toISOString();
        const reference = `sq_test_${shipmentId.slice(-4)}${Math.floor(Math.random() * 90 + 10)}`;
        setShipments((list) =>
          list.map((item) =>
            item.id === shipmentId
              ? {
                  ...item,
                  status: item.status === "quote_accepted" || item.status === "quote_sent" ? "booking_confirmed" : item.status,
                  payment: { status: "paid", method, reference, paidAt: now },
                  documents: item.documents.some((doc) => doc.name === "Receipt")
                    ? item.documents
                    : [...item.documents, { id: `rc-${Date.now()}`, name: "Receipt", kind: "pdf" }],
                  timeline: item.timeline
                    .map((event) => (event.state === "current" ? { ...event, state: "done" as const } : event))
                    .concat(
                      item.status === "booking_confirmed"
                        ? []
                        : [{ key: "booking_confirmed", label: "Booking confirmed", at: now, state: "current" as const }],
                    ),
                }
              : item,
          ),
        );
        setNotifications((list) => [
          {
            id: `n-${Date.now()}`,
            type: "payment_success",
            title: "Payment received",
            body: `${reference} · ${shipmentId}`,
            at: now,
            read: false,
            target: { kind: "shipment", id: shipmentId },
          },
          ...list,
        ]);
        pushToast("Payment received", reference);
        return { ok: true, reference };
      },
      cancelShipment: (shipmentId, reason) => {
        const source = shipments.find((item) => item.id === shipmentId);
        if (!source) return;
        const estimate = refundEstimate(source);
        const now = new Date().toISOString();
        setShipments((list) =>
          list.map((item) => {
            if (item.id !== shipmentId) return item;
            return {
              ...item,
              status: "cancelled",
              timeline: [
                ...item.timeline.map((event) => (event.state === "current" ? { ...event, state: "done" as const } : event)),
                { key: "cancelled", label: "Cancelled", at: now, state: "alert", note: reason },
              ],
              payment:
                estimate > 0
                  ? {
                      ...item.payment,
                      status: "refund_pending",
                      refund: {
                        reason,
                        estimate,
                        status: "requested",
                        timeline: [
                          { label: "Refund requested", at: now, done: true },
                          { label: "Approved", done: false },
                          { label: "Processing", done: false },
                          { label: "Refunded", done: false },
                        ],
                      },
                    }
                  : item.payment,
            };
          }),
        );
        pushToast("Shipment cancelled", estimate > 0 ? `Refund estimate ${estimate.toFixed(2)}` : undefined);
      },
      requestReschedule: (shipmentId, date, window) => {
        const now = new Date().toISOString();
        setShipments((list) =>
          list.map((item) =>
            item.id === shipmentId
              ? {
                  ...item,
                  reschedule: { date, window },
                  timeline: item.timeline.concat({
                    key: "rescheduled",
                    label: "Rescheduled",
                    at: now,
                    state: "done",
                    note: `Requested ${date} · ${window}`,
                  }),
                }
              : item,
          ),
        );
        pushToast("Reschedule requested", "Our team will confirm the new window.");
      },
      sendMessage: (threadId, text, attachment) => {
        const now = new Date().toISOString();
        setThreads((list) =>
          list.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    { id: `m-${Date.now()}`, from: "user", text, at: now, attachment, status: "sent" },
                  ],
                }
              : thread,
          ),
        );
        setTimeout(() => {
          setThreads((list) =>
            list.map((thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    messages: thread.messages.map((message) =>
                      message.from === "user" && message.status === "sent" ? { ...message, status: "read" } : message,
                    ),
                  }
                : thread,
            ),
          );
        }, 700);
      },
      receiveMessage: (threadId, text) => {
        const now = new Date().toISOString();
        setThreads((list) =>
          list.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  unread: thread.unread + 1,
                  messages: [
                    ...thread.messages,
                    { id: `m-${Date.now()}`, from: "them", text, at: now, status: "delivered" },
                  ],
                }
              : thread,
          ),
        );
        setTypingThread(null);
      },
      markThreadRead: (threadId) => {
        setThreads((list) => {
          const current = list.find((thread) => thread.id === threadId);
          if (!current || current.unread === 0) return list;
          return list.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread));
        });
      },
      setTypingThread,
      markAllRead: () => setNotifications((list) => list.map((item) => ({ ...item, read: true }))),
      markNotificationRead: (id) =>
        setNotifications((list) => list.map((item) => (item.id === id ? { ...item, read: true } : item))),
      addAddress: (address) => setAddresses((list) => [{ ...address, id: `a-${Date.now()}` }, ...list]),
      removeAddress: (id) => setAddresses((list) => list.filter((item) => item.id !== id)),
      addCard: (card) => setCards((list) => [{ ...card, id: `card-${Date.now()}` }, ...list]),
      removeCard: (id) => setCards((list) => list.filter((item) => item.id !== id)),
      toggleNotify: (category, channel) =>
        setNotify((current) => ({
          ...current,
          [category]: { ...current[category], [channel]: !current[category][channel] },
        })),
      setListPreview,
      setConnectivity,
      setFocusField,
      pushToast,
      dismissToast: (id) => setToasts((list) => list.filter((item) => item.id !== id)),
      refundEstimate,
    };
  }, [
    hydrated,
    user,
    onboarded,
    shipments,
    threads,
    notifications,
    addresses,
    cards,
    draft,
    notify,
    listPreview,
    connectivity,
    toasts,
    focusField,
    typingThread,
    users,
  ]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

function emptyProfile(): UserProfile {
  return {
    id: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    accountType: "individual",
    companyName: "",
    facilityType: "",
    billingEmail: "",
    billingAddress: "",
    taxId: "",
    photo: "",
    termsAcceptedAt: "",
    policyVersion: business.policyVersion,
    remember: true,
  };
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function unreadCount(threads: Thread[]) {
  return threads.reduce((sum, thread) => sum + thread.unread, 0);
}