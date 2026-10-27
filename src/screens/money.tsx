import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button, EmptyState, Field, PriceTable, Screen, Sheet, StackHeader, SuccessMark, TextArea, TextInput, inputClass } from "@/components/app/ui";
import { business } from "@/config/business";
import { DECLINE_REASONS } from "@/lib/labels";
import { formatDateTimeET, formatMoney } from "@/lib/format";
import { useApp } from "@/lib/store";

export function QuoteScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const { shipments, acceptQuote, declineQuote } = useApp();
  const shipment = shipments.find((item) => item.id === id);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(DECLINE_REASONS[0]);
  const [note, setNote] = useState("");
  if (!shipment?.quote) {
    return (
      <Screen>
        <StackHeader title="Quote" backTo="/shipments" />
        <EmptyState title="No quote yet" body="When dispatch sends a quote, the itemized rate will show here." />
      </Screen>
    );
  }
  const quote = shipment.quote;
  return (
    <Screen tone="surface">
      <StackHeader title={quote.id} backTo="/shipments" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#003DF9]">Quote received</p>
        <h1 className="mt-1 text-[22px] font-semibold text-[#0F172A]">{shipment.id}</h1>
        <p className="mt-2 text-[14px] text-[#64748B]">Valid until {formatDateTimeET(quote.validUntil)}</p>
        <p className="mt-3 rounded-[16px] bg-white p-4 text-[14px] leading-relaxed text-[#475569]">{quote.notes}</p>
        <div className="mt-3">
          <PriceTable price={shipment.price} />
        </div>
        <p className="mt-3 text-[12px] text-[#64748B]">{business.paymentNote}</p>
        {quote.status === "declined" ? <p className="mt-3 text-[14px] text-[#DC2626]">Declined{quote.declineReason ? `: ${quote.declineReason}` : ""}</p> : null}
      </div>
      {quote.status === "sent" ? (
        <div className="space-y-2 border-t border-[#E2E8F0] bg-white px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Button
            onClick={() => {
              acceptQuote(shipment.id);
              navigate({ to: "/pay/$id", params: { id: shipment.id } });
            }}
          >
            Accept Quote
          </Button>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Decline
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/messages/$id", params: { id: "support" } })}>
            Message Us
          </Button>
        </div>
      ) : null}
      <Sheet open={open} title="Decline quote" onClose={() => setOpen(false)}>
        <label className="block text-[14px] font-medium">
          Reason
          <select className={inputClass + " mt-1"} value={reason} onChange={(event) => setReason(event.target.value)}>
            {DECLINE_REASONS.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="mt-3">
          <TextArea value={note} placeholder="Optional note" onChange={(event) => setNote(event.target.value)} />
        </div>
        <div className="mt-4">
          <Button
            variant="danger"
            onClick={() => {
              declineQuote(shipment.id, note.trim() ? `${reason}. ${note.trim()}` : reason);
              setOpen(false);
            }}
          >
            Decline quote
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

export function PaymentScreen({ id }: { id: string }) {
  const navigate = useNavigate();
  const { shipments, cards, payShipment, addCard } = useApp();
  const shipment = shipments.find((item) => item.id === id);
  const [method, setMethod] = useState(cards[0] ? `${cards[0].brand} •••• ${cards[0].last4}` : "");
  const [adding, setAdding] = useState(false);
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvv: "", zip: "" });
  const [phase, setPhase] = useState<"form" | "processing" | "success" | "failure">("form");
  const [reference, setReference] = useState("");
  const [failure, setFailure] = useState("");

  if (!shipment) {
    return (
      <Screen>
        <StackHeader title="Payment" backTo="/shipments" />
        <EmptyState title="Shipment not found" body="Return to shipments and open the quote again." />
      </Screen>
    );
  }

  const pay = (label: string) => {
    setPhase("processing");
    window.setTimeout(() => {
      const result = payShipment(shipment.id, label);
      if (result.ok) {
        setReference(result.reference);
        setPhase("success");
      } else {
        setFailure(result.reason);
        setPhase("failure");
      }
    }, 1200);
  };

  const saveCard = () => {
    const digits = card.number.replace(/\D/g, "");
    const last4 = (digits.slice(-4) || "4242").padStart(4, "0");
    const brand = digits.startsWith("5") ? "Mastercard" : "Visa";
    addCard({ brand, last4, exp: card.exp || "12/28", fails: last4 === "0002" });
    setMethod(`${brand} •••• ${last4}`);
    setAdding(false);
  };

  const download = () => {
    const text = [
      business.name,
      "Receipt",
      `Shipment ${shipment.id}`,
      `Reference ${reference}`,
      `Amount ${formatMoney(shipment.price.total)}`,
      `Method ${method}`,
      business.paymentNote,
      "Square TEST MODE — no real charge was made.",
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${shipment.id}-receipt.txt`;
    link.click();
  };

  return (
    <Screen tone="surface">
      <StackHeader title="Payment" backTo="/shipments" />
      <div className="bg-[#F59E0B] px-4 py-2 text-[12px] font-semibold text-[#0F172A]">Square · TEST MODE. No real charge will be made.</div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {phase === "processing" ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#003DF9] border-t-transparent" />
            <p className="mt-4 text-[16px] font-semibold">Processing payment</p>
          </div>
        ) : null}
        {phase === "success" ? (
          <div className="py-6 text-center">
            <SuccessMark />
            <h1 className="mt-4 text-[22px] font-semibold">Payment received</h1>
            <p className="mt-2 text-[14px] text-[#64748B]">Reference {reference}</p>
            <p className="mt-1 text-[18px] font-semibold">{formatMoney(shipment.price.total)}</p>
            <div className="mt-6 space-y-3">
              <Button onClick={download}>Download Receipt</Button>
              <Button variant="secondary" onClick={() => navigate({ to: "/shipments/$id", params: { id: shipment.id } })}>
                View shipment
              </Button>
            </div>
          </div>
        ) : null}
        {phase === "failure" ? (
          <div className="rounded-[16px] bg-white p-4">
            <h1 className="text-[22px] font-semibold text-[#0F172A]">Payment failed</h1>
            <p className="mt-2 flex items-start gap-2 text-[14px] text-[#DC2626]">{failure}</p>
            <div className="mt-4 space-y-2">
              <Button onClick={() => setPhase("form")}>Retry</Button>
              <Button variant="secondary" onClick={() => setPhase("form")}>
                Change method
              </Button>
            </div>
          </div>
        ) : null}
        {phase === "form" ? (
          <div className="space-y-4">
            <div className="rounded-[16px] bg-white p-4">
              <p className="text-[12px] text-[#64748B]">{shipment.id}</p>
              <p className="text-[22px] font-semibold">{formatMoney(shipment.price.total)}</p>
              <p className="text-[12px] text-[#64748B]">{business.paymentNote}</p>
            </div>
            {shipment.payment.status === "failed" ? (
              <p className="rounded-[12px] bg-[#DC2626]/10 px-3 py-2 text-[13px] text-[#DC2626]">{shipment.payment.failureReason}</p>
            ) : null}
            <div className="space-y-2">
              {cards.map((item) => {
                const label = `${item.brand} •••• ${item.last4}`;
                return (
                  <button key={item.id} type="button" onClick={() => setMethod(label)} className={`flex min-h-14 w-full items-center justify-between rounded-[16px] border px-3 text-left ${method === label ? "border-[#003DF9] bg-white" : "border-[#E2E8F0] bg-white"}`}>
                    <span>
                      <span className="block text-[14px] font-semibold">{label}</span>
                      <span className="text-[12px] text-[#64748B]">Exp {item.exp}{item.fails ? " · Declines in test mode" : ""}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {adding ? (
              <div className="space-y-3 rounded-[16px] bg-white p-4">
                <Field label="Name on card">
                  <TextInput value={card.name} onChange={(event) => setCard({ ...card, name: event.target.value })} />
                </Field>
                <Field label="Card number">
                  <TextInput inputMode="numeric" value={card.number} onChange={(event) => setCard({ ...card, number: event.target.value })} placeholder="ACCT-000015" />
                </Field>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Exp">
                    <TextInput placeholder="MM/YY" value={card.exp} onChange={(event) => setCard({ ...card, exp: event.target.value })} />
                  </Field>
                  <Field label="CVV">
                    <TextInput inputMode="numeric" value={card.cvv} onChange={(event) => setCard({ ...card, cvv: event.target.value })} />
                  </Field>
                  <Field label="ZIP">
                    <TextInput inputMode="numeric" value={card.zip} onChange={(event) => setCard({ ...card, zip: event.target.value })} />
                  </Field>
                </div>
                <Button onClick={saveCard}>Save card</Button>
              </div>
            ) : (
              <button type="button" className="min-h-11 text-[14px] font-semibold text-[#003DF9]" onClick={() => setAdding(true)}>
                Add card
              </button>
            )}
            <Button onClick={() => pay(method || "Card")}>
              Pay {formatMoney(shipment.price.total)}
            </Button>
          </div>
        ) : null}
      </div>
    </Screen>
  );
}
