import type { Shipment, ShipmentStatus, UserProfile } from "@/data/types";

export const STATUS_LABEL: Record<ShipmentStatus, string> = {
  request_received: "Request received",
  quote_sent: "Quote sent",
  quote_accepted: "Quote accepted",
  quote_declined: "Quote declined",
  booking_confirmed: "Booking confirmed",
  driver_assigned: "Driver assigned",
  en_route_pickup: "En route to pickup",
  picked_up: "Picked up",
  in_transit: "In transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
  exception: "Exception",
};

export const SHIPMENT_TABS = ["Upcoming", "Pending", "Confirmed", "In Progress", "Completed", "Cancelled"] as const;
export type ShipmentTab = (typeof SHIPMENT_TABS)[number];

export function matchesTab(s: Shipment, tab: ShipmentTab) {
  if (tab === "Upcoming") return s.status === "driver_assigned";
  if (tab === "Pending") return s.status === "request_received" || s.status === "quote_sent";
  if (tab === "Confirmed") return s.status === "booking_confirmed" || s.status === "quote_accepted";
  if (tab === "In Progress") return ["en_route_pickup", "picked_up", "in_transit", "exception"].includes(s.status);
  if (tab === "Completed") return s.status === "delivered";
  return s.status === "cancelled" || s.status === "quote_declined";
}

export function profileGaps(user: UserProfile | null) {
  if (!user) return ["Full name"];
  const gaps: string[] = [];
  if (!user.fullName.trim()) gaps.push("Full name");
  if (!user.email.trim()) gaps.push("Email");
  if (!user.phone.trim()) gaps.push("Mobile phone");
  if (user.accountType === "business" && !user.companyName.trim()) gaps.push("Company name");
  if (!user.billingEmail.trim()) gaps.push("Billing email");
  return gaps;
}

export function profileScore(user: UserProfile | null) {
  const fields = [
    user?.fullName,
    user?.email,
    user?.phone,
    user?.accountType,
    user?.billingEmail,
    user?.billingAddress,
    user?.accountType === "business" ? user.companyName : "ok",
  ];
  const filled = fields.filter((v) => String(v ?? "").trim()).length;
  return Math.round((filled / fields.length) * 100);
}

export function gapRoute(gap: string): "/profile/edit" | "/profile/billing" {
  if (gap === "Company name" || gap === "Billing address" || gap === "Billing email") return "/profile/billing";
  return "/profile/edit";
}

export const EXCEPTION_TYPES = [
  "Delay",
  "Failed pickup",
  "Recipient unavailable",
  "Incorrect address",
  "Failed delivery attempt",
  "Rescheduled",
];

export const CANCEL_REASONS = [
  "Plans changed",
  "Wrong address",
  "Duplicate request",
  "Delivery window no longer works",
  "Other",
];

export const DECLINE_REASONS = [
  "Price",
  "Timing",
  "No longer needed",
  "Booked another courier",
  "Other",
];
