export type AccountType = "individual" | "business";

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  accountType: AccountType;
  companyName: string;
  facilityType: string;
  billingEmail: string;
  billingAddress: string;
  taxId: string;
  photo: string;
  termsAcceptedAt: string;
  policyVersion: string;
  remember: boolean;
};

export type DeliveryType = "routine" | "same-day" | "stat" | "after-hours";

export type ShipmentStatus =
  | "request_received"
  | "quote_sent"
  | "quote_accepted"
  | "quote_declined"
  | "booking_confirmed"
  | "driver_assigned"
  | "en_route_pickup"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "exception";

export type Stop = {
  address: string;
  facility: string;
  contact: string;
  phone: string;
  access: string;
  notes: string;
  milesFromOrigin: number | null;
  lat: number | null;
  lng: number | null;
};

export type ShipmentDetails = {
  type: string;
  quantity: number;
  boxSize: string;
  dimensions: string;
  weightLbs: number;
  weightRange: string;
  description: string;
  handling: string[];
  temperature: string;
  declaredValue?: number;
  photos: string[];
};

export type PriceBreakdown = {
  lines: { label: string; amount: number }[];
  total: number;
  distanceMiles: number;
};

export type TimelineEvent = {
  key: string;
  label: string;
  at?: string;
  state: "done" | "current" | "upcoming" | "alert";
  note?: string;
};

export type CustodyEvent = {
  id: string;
  label: string;
  who: string;
  at: string;
};

export type ProofOfDelivery = {
  recipient: string;
  at: string;
  hasSignature: boolean;
  photo: string;
};

export type Quote = {
  id: string;
  validUntil: string;
  notes: string;
  status: "sent" | "accepted" | "declined";
  declineReason?: string;
};

export type RefundInfo = {
  reason: string;
  estimate: number;
  status: "requested" | "approved" | "processing" | "refunded";
  timeline: { label: string; at?: string; done: boolean }[];
};

export type PaymentInfo = {
  status: "unpaid" | "paid" | "failed" | "refund_pending" | "refunded";
  method?: string;
  reference?: string;
  paidAt?: string;
  failureReason?: string;
  refund?: RefundInfo;
};

export type Driver = {
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  photo: string;
};

export type Shipment = {
  id: string;
  serviceId: string;
  deliveryType: DeliveryType;
  priorityAddon: boolean;
  cargoVan: boolean;
  pickup: Stop;
  dropoff: Stop;
  details: ShipmentDetails;
  schedule: { date: string; window: string; deadline: string };
  price: PriceBreakdown;
  status: ShipmentStatus;
  exception?: string;
  quote?: Quote;
  payment: PaymentInfo;
  driver?: Driver;
  timeline: TimelineEvent[];
  custody: CustodyEvent[];
  pod?: ProofOfDelivery;
  documents: { id: string; name: string; kind: "pdf" | "image" }[];
  eta?: string;
  reschedule?: { date: string; window: string };
  createdAt: string;
};

export type ChatAttachment = { name: string; kind: "photo" | "pdf" };

export type ChatMessage = {
  id: string;
  from: "user" | "them";
  text: string;
  at: string;
  attachment?: ChatAttachment;
  status: "sent" | "delivered" | "read";
};

export type Thread = {
  id: string;
  title: string;
  subtitle: string;
  shipmentId?: string;
  unread: number;
  messages: ChatMessage[];
};

export type NoticeTarget =
  | { kind: "shipment"; id: string }
  | { kind: "quote"; id: string }
  | { kind: "chat"; id: string }
  | { kind: "pay"; id: string }
  | { kind: "home" };

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
  target: NoticeTarget;
};

export type SavedAddress = {
  id: string;
  label: string;
  line: string;
  facility: string;
  placeId: string;
};

export type SavedCard = {
  id: string;
  brand: string;
  last4: string;
  exp: string;
  fails?: boolean;
};

export type NotifyCategory = "Shipments" | "Quotes and payments" | "Messages";
export type NotifyChannel = "push" | "email" | "sms";

export type BookingDraft = {
  serviceId: string;
  deliveryType: DeliveryType | "";
  priorityAddon: boolean;
  cargoVan: boolean;
  pickup: Stop;
  dropoff: Stop;
  details: {
    type: string;
    quantity: number;
    boxSize: string;
    length: string;
    width: string;
    height: string;
    weight: string;
    weightRange: string;
    description: string;
    handling: string[];
    temperature: string;
    temperatureOther: string;
    declaredValue: string;
    photos: string[];
  };
  schedule: { date: string; window: string; deadline: string };
  priceMode: "auto" | "book" | "quote";
  step: number;
};

export type ListPreview = "live" | "loading" | "empty" | "error";
export type Connectivity = "online" | "offline";
