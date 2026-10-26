import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Play, X } from "lucide-react";
import {
  AsyncBody,
  Button,
  Field,
  LargeTitle,
  Logo,
  Screen,
  Sheet,
  StackHeader,
  TextArea,
  TextInput,
  cardClass,
  inputClass,
} from "@/components/app/ui";
import { business, fullAddress } from "@/config/business";
import { faqs, galleryItems, privacyDoc, termsDoc } from "@/data/content";
import { facilityTypes } from "@/data/content";
import { places } from "@/data/places";
import { formatDateTimeET, formatPhone } from "@/lib/format";
import { profileGaps, profileScore } from "@/lib/labels";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { RouteMap } from "@/components/app/ui";

function Row({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-12 w-full items-center justify-between border-b border-[#E2E8F0] py-3 text-left text-[16px]">
      <span className={danger ? "text-[#CF0300]" : "text-[#0F172A]"}>{label}</span>
      <ChevronRight className="h-4 w-4 text-[#94A3B8]" strokeWidth={1.75} />
    </button>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, hydrated } = useApp();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/welcome", replace: true });
  }, [hydrated, user, navigate]);
  if (!user) return <Screen tab />;
  const score = profileScore(user);
  const gaps = profileGaps(user);
  return (
    <Screen tab tone="surface">
      <LargeTitle title="Profile" />
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
        <AsyncBody boot emptyTitle="Profile unavailable" emptyBody="Sign in to see your account.">
          <div className={cn(cardClass(), "flex items-center gap-3 p-4")}>
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#F6F7FB] text-[12px] text-[#64748B]">
              {user.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : "Optional"}
            </span>
            <div>
              <p className="text-[18px] font-semibold">{user.fullName}</p>
              <p className="text-[14px] text-[#64748B]">{user.email}</p>
              <p className="text-[14px] text-[#64748B]">{user.phone}</p>
              <p className="text-[12px] font-semibold capitalize text-[#003DF9]">{user.accountType}</p>
            </div>
          </div>
          <div className="mt-3 rounded-[16px] bg-white p-4">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold">Profile completeness</span>
              <span>{score}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div className="h-full bg-[#003DF9]" style={{ width: `${score}%` }} />
            </div>
            {gaps[0] ? <p className="mt-2 text-[12px] text-[#92400E]">{gaps[0]} is required before booking.</p> : null}
            {user.termsAcceptedAt ? (
              <p className="mt-2 text-[12px] text-[#64748B]">Terms accepted {formatDateTimeET(user.termsAcceptedAt)} · v{user.policyVersion}</p>
            ) : null}
          </div>
          <div className="mt-3 rounded-[16px] bg-white px-4">
            <Row label="Edit Profile" onClick={() => navigate({ to: "/profile/edit" })} />
            <Row label="Business and Billing Info" onClick={() => navigate({ to: "/profile/billing" })} />
            <Row label="Saved Addresses" onClick={() => navigate({ to: "/profile/addresses" })} />
            <Row label="Payment Methods" onClick={() => navigate({ to: "/profile/payments" })} />
            <Row label="My Shipments" onClick={() => navigate({ to: "/shipments" })} />
            <Row label="All Services" onClick={() => navigate({ to: "/services" })} />
            <Row label="Gallery" onClick={() => navigate({ to: "/profile/gallery" })} />
            <Row label="Messages" onClick={() => navigate({ to: "/messages" })} />
            <Row label="Notification Settings" onClick={() => navigate({ to: "/notifications/settings" })} />
            <Row label="Terms & Conditions" onClick={() => navigate({ to: "/terms" })} />
            <Row label="Privacy Policy" onClick={() => navigate({ to: "/privacy" })} />
            <Row label="About Us" onClick={() => navigate({ to: "/about" })} />
            <Row label="Help and FAQs" onClick={() => navigate({ to: "/help" })} />
            <Row label="Contact Us" onClick={() => navigate({ to: "/contact" })} />
            <Row label="Settings" onClick={() => navigate({ to: "/profile/settings" })} />
            <Row label="Logout" onClick={() => setConfirm(true)} />
            <Row label="Delete Account" danger onClick={() => navigate({ to: "/profile/delete" })} />
          </div>
        </AsyncBody>
      </div>
      <Sheet open={confirm} title="Log out" onClose={() => setConfirm(false)}>
        <p className="text-[14px] text-[#475569]">You can log back in with the same email.</p>
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => {
              logout();
              navigate({ to: "/welcome" });
            }}
          >
            Log out
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Stay signed in
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

export function EditProfileScreen() {
  const { user, updateUser, focusField } = useApp();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [photo, setPhoto] = useState(user?.photo ?? "");
  const [accountType, setAccountType] = useState(user?.accountType ?? "individual");
  const [error, setError] = useState("");
  useEffect(() => {
    if (focusField === "Full name") document.getElementById("fullName")?.focus();
    if (focusField === "Email") document.getElementById("email")?.focus();
    if (focusField === "Mobile phone") document.getElementById("phone")?.focus();
  }, [focusField]);
  return (
    <Screen>
      <StackHeader title="Edit profile" />
      <form
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (!fullName.trim() || !email.includes("@") || phone.replace(/\D/g, "").length !== 10) {
            setError("Check name, email, and a 10-digit phone.");
            return;
          }
          updateUser({ fullName, email, phone: formatPhone(phone), photo, accountType });
          navigate({ to: "/profile" });
        }}
      >
        <Field label="Profile photo" hint="Optional">
          <label className="flex min-h-11 items-center gap-3 text-[14px] font-semibold text-[#003DF9]">
            {photo ? <img src={photo} alt="" className="h-12 w-12 rounded-full object-cover" /> : <span>Optional</span>}
            Change photo
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setPhoto(String(reader.result));
              reader.readAsDataURL(file);
            }} />
          </label>
        </Field>
        <Field label="Full name" required>
          <TextInput id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </Field>
        <Field label="Email" required>
          <TextInput id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Mobile phone" required>
          <TextInput id="phone" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
        </Field>
        <Field label="Account type" required>
          <select className={inputClass} value={accountType} onChange={(event) => setAccountType(event.target.value as "individual" | "business")}>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        </Field>
        {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}
        <Button type="submit">Save</Button>
      </form>
    </Screen>
  );
}

export function BillingScreen() {
  const { user, updateUser, focusField, setFocusField } = useApp();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [facilityType, setFacilityType] = useState(user?.facilityType || "Clinic");
  const [billingAddress, setBillingAddress] = useState(user?.billingAddress ?? "");
  const [billingEmail, setBillingEmail] = useState(user?.billingEmail ?? "");
  const [taxId, setTaxId] = useState(user?.taxId ?? "");
  const [error, setError] = useState("");
  useEffect(() => {
    const id = focusField === "Billing email" ? "billingEmail" : focusField === "Billing address" ? "billingAddress" : focusField === "Company name" ? "companyName" : "";
    if (id) document.getElementById(id)?.focus();
    return () => setFocusField(null);
  }, [focusField, setFocusField]);
  return (
    <Screen>
      <StackHeader title="Business and billing" />
      <form
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-8"
        onSubmit={(event) => {
          event.preventDefault();
          if (user?.accountType === "business" && !companyName.trim()) {
            setError("Company name is required.");
            return;
          }
          if (!billingAddress.trim() || !billingEmail.includes("@")) {
            setError("Billing address and billing email are required.");
            return;
          }
          updateUser({ companyName, facilityType, billingAddress, billingEmail, taxId });
          navigate({ to: "/profile" });
        }}
      >
        <Field label="Company name" required={user?.accountType === "business"}>
          <TextInput id="companyName" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
        </Field>
        <Field label="Facility type">
          <select className={inputClass} value={facilityType} onChange={(event) => setFacilityType(event.target.value)}>
            {facilityTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </Field>
        <Field label="Billing address" required>
          <TextArea id="billingAddress" value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
        </Field>
        <Field label="Billing email" required>
          <TextInput id="billingEmail" type="email" value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} />
        </Field>
        <Field label="Tax ID" hint="Optional">
          <TextInput value={taxId} onChange={(event) => setTaxId(event.target.value)} />
        </Field>
        {error ? <p className="text-[12px] text-[#DC2626]">{error}</p> : null}
        <Button type="submit">Save</Button>
      </form>
    </Screen>
  );
}

export function AddressesScreen() {
  const { addresses, addAddress, removeAddress } = useApp();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [placeId, setPlaceId] = useState(places[0]?.id ?? "");
  const place = places.find((item) => item.id === placeId);
  return (
    <Screen tone="surface">
      <StackHeader title="Saved addresses" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-3 text-[12px] text-[#64748B]">Saved addresses stay separate from shipment addresses until you confirm one during booking.</p>
        <AsyncBody boot emptyTitle="No saved addresses" emptyBody="Add a facility you use often.">
          <div className="space-y-2">
            {addresses.map((address) => (
              <article key={address.id} className={cn(cardClass(), "p-3")}>
                <p className="text-[16px] font-semibold">{address.label}</p>
                <p className="text-[14px] text-[#475569]">{address.facility}</p>
                <p className="text-[12px] text-[#64748B]">{address.line}</p>
                <button type="button" className="mt-2 min-h-11 text-[14px] font-semibold text-[#CF0300]" onClick={() => removeAddress(address.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </AsyncBody>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)}>Add address</Button>
        </div>
      </div>
      <Sheet open={open} title="Add address" onClose={() => setOpen(false)}>
        <Field label="Label" required>
          <TextInput value={label} onChange={(event) => setLabel(event.target.value)} />
        </Field>
        <label className="mt-3 block text-[14px] font-medium">
          Facility
          <select className={inputClass + " mt-1"} value={placeId} onChange={(event) => setPlaceId(event.target.value)}>
            {places.map((item) => (
              <option key={item.id} value={item.id}>
                {item.facility}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4">
          <Button
            disabled={!label.trim() || !place}
            onClick={() => {
              if (!place) return;
              addAddress({ label, line: place.label, facility: place.facility, placeId: place.id });
              setLabel("");
              setOpen(false);
            }}
          >
            Save address
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

export function PaymentMethodsScreen() {
  const { cards, removeCard, addCard } = useApp();
  const [open, setOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  return (
    <Screen tone="surface">
      <StackHeader title="Payment methods" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-3 rounded-[12px] bg-[#F59E0B]/20 px-3 py-2 text-[12px] font-semibold">Square · TEST MODE</p>
        <AsyncBody boot emptyTitle="No cards saved" emptyBody="Add a test card. Numbers ending in 0002 will decline.">
          <div className="space-y-2">
            {cards.map((card) => (
              <article key={card.id} className={cn(cardClass(), "p-3")}>
                <p className="text-[16px] font-semibold">{card.brand} •••• {card.last4}</p>
                <p className="text-[12px] text-[#64748B]">Exp {card.exp}{card.fails ? " · Declines in test mode" : ""}</p>
                <button type="button" className="mt-2 min-h-11 text-[14px] font-semibold text-[#CF0300]" onClick={() => removeCard(card.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </AsyncBody>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)}>Add card</Button>
        </div>
      </div>
      <Sheet open={open} title="Add card" onClose={() => setOpen(false)}>
        <Field label="Card number" required>
          <TextInput value={number} onChange={(event) => setNumber(event.target.value)} />
        </Field>
        <div className="mt-3">
          <Field label="Exp" required>
            <TextInput placeholder="MM/YY" value={exp} onChange={(event) => setExp(event.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              const last4 = number.replace(/\D/g, "").slice(-4);
              if (last4.length < 4) return;
              addCard({ brand: "Visa", last4, exp: exp || "12/28", fails: last4 === "0002" });
              setOpen(false);
            }}
          >
            Save card
          </Button>
        </div>
      </Sheet>
    </Screen>
  );
}

export function GalleryScreen() {
  const [active, setActive] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const item = active != null ? galleryItems[active] : null;
  return (
    <Screen tone="surface">
      <StackHeader title="Gallery" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
        <AsyncBody boot emptyTitle="No gallery items" emptyBody="Completed-work photos will appear here.">
          <div className="grid grid-cols-2 gap-2">
            {galleryItems.map((entry, index) => (
              <button key={entry.id} type="button" className="relative overflow-hidden rounded-[16px]" onClick={() => { setActive(index); setPlaying(false); }}>
                <img src={entry.src} alt={entry.title} className="h-36 w-full object-cover" />
                {entry.kind === "video" ? (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[12px] font-semibold">
                    <Play className="h-3 w-3" strokeWidth={1.75} /> Video
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </AsyncBody>
      </div>
      {item ? (
        <div className="absolute inset-0 z-50 flex flex-col bg-black text-white">
          <div className="flex items-center justify-between px-2 pt-[max(8px,env(safe-area-inset-top))] sm:pt-8">
            <button type="button" aria-label="Close" className="flex h-11 w-11 items-center justify-center" onClick={() => setActive(null)}>
              <X className="h-6 w-6" strokeWidth={1.75} />
            </button>
            <p className="text-[14px]">{item.title}</p>
            <span className="w-11" />
          </div>
          <button type="button" className="relative flex min-h-0 flex-1 items-center" onClick={() => item.kind === "video" && setPlaying(true)}>
            <img src={item.src} alt="" className="max-h-full w-full object-contain" />
            {item.kind === "video" && !playing ? <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2" strokeWidth={1.75} /> : null}
            {playing ? <span className="absolute bottom-4 left-4 right-4 h-1 overflow-hidden rounded-full bg-white/30"><span className="block h-full w-2/3 bg-white animate-[bar-fill_2s_ease-out_forwards]" /></span> : null}
          </button>
          <p className="px-4 pb-6 text-[14px]">{item.caption}</p>
          <div className="flex justify-between px-4 pb-4">
            <button type="button" className="min-h-11 text-[14px]" onClick={() => setActive((index) => (index == null ? 0 : (index + galleryItems.length - 1) % galleryItems.length))}>Previous</button>
            <button type="button" className="min-h-11 text-[14px]" onClick={() => setActive((index) => (index == null ? 0 : (index + 1) % galleryItems.length))}>Next</button>
          </div>
        </div>
      ) : null}
    </Screen>
  );
}

export function SettingsScreen() {
  const { listPreview, setListPreview, connectivity, setConnectivity } = useApp();
  return (
    <Screen tone="surface">
      <StackHeader title="Settings" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        <section className={cn(cardClass(), "p-4")}>
          <h2 className="text-[16px] font-semibold">Preview states</h2>
          <p className="mt-1 text-[12px] text-[#64748B]">Show loading, empty, and error layouts on list screens.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["live", "loading", "empty", "error"] as const).map((mode) => (
              <button key={mode} type="button" onClick={() => setListPreview(mode)} className={cn("h-11 rounded-[12px] text-[14px] font-semibold capitalize", listPreview === mode ? "bg-[#003DF9] text-white" : "bg-[#F6F7FB]")}>
                {mode}
              </button>
            ))}
          </div>
        </section>
        <section className={cn(cardClass(), "mt-3 p-4")}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-semibold">Offline</h2>
              <p className="text-[12px] text-[#64748B]">Show the offline banner.</p>
            </div>
            <button type="button" aria-pressed={connectivity === "offline"} onClick={() => setConnectivity(connectivity === "offline" ? "online" : "offline")} className={cn("h-8 w-14 rounded-full p-1", connectivity === "offline" ? "bg-[#003DF9]" : "bg-[#E2E8F0]")}>
              <span className={cn("block h-6 w-6 rounded-full bg-white transition", connectivity === "offline" && "translate-x-6")} />
            </button>
          </div>
        </section>
        <section className={cn(cardClass(), "mt-3 p-4 text-[14px] text-[#475569]")}>
          <p>Time zone: {business.timezoneLabel}</p>
          <p className="mt-1">{business.hoursChip}</p>
          <p className="mt-1">App preview 1.0 · Design phase</p>
        </section>
      </div>
    </Screen>
  );
}

export function DeleteAccountScreen() {
  const navigate = useNavigate();
  const { deleteAccount } = useApp();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Screen>
      <StackHeader title="Delete account" />
      <form
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-8"
        onSubmit={(event) => {
          event.preventDefault();
          const result = deleteAccount(password);
          if (!result.ok) {
            setError("Password does not match.");
            return;
          }
          navigate({ to: "/welcome" });
        }}
      >
        <p className="text-[14px] leading-relaxed text-[#475569]">
          Deleting your account removes the sign-in profile from this device. Business, payment, audit, and delivery records may be retained as required.
        </p>
        <Field label="Password" required error={error}>
          <TextInput type="password" value={password} invalid={!!error} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Button type="submit" variant="danger">
          Delete account
        </Button>
      </form>
    </Screen>
  );
}

export function AboutScreen() {
  return (
    <Screen>
      <StackHeader title="About us" />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-8">
        <Logo className="h-20 w-20" />
        <h1 className="text-[28px] font-semibold">{business.name}</h1>
        <p className="text-[16px] leading-relaxed text-[#475569]">
          Storey Enterprises is a medical courier company serving Chesterfield, Richmond, and Central Virginia. We move specimens, prescriptions, supplies, documents, and equipment between healthcare facilities.
        </p>
        <section className={cn(cardClass(), "p-4")}>
          <h2 className="text-[16px] font-semibold">Mission</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">Give clinics, labs, pharmacies, and hospitals a courier they can track, with proof of delivery they can keep.</p>
        </section>
        <section className={cn(cardClass(), "p-4")}>
          <h2 className="text-[16px] font-semibold">Licensed and insured</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{business.licensedNote}</p>
        </section>
        <section className={cn(cardClass(), "p-4")}>
          <h2 className="text-[16px] font-semibold">Service area</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{business.serviceAreaNote}</p>
        </section>
      </div>
    </Screen>
  );
}

export function ContactScreen() {
  return (
    <Screen tone="surface">
      <StackHeader title="Contact us" />
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-8">
        <p className="rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[12px] text-[#92400E]">{business.contactPlaceholder}</p>
        <section className={cn(cardClass(), "space-y-2 p-4 text-[14px]")}>
          <p className="text-[16px] font-semibold">{business.name}</p>
          <a className="block text-[#003DF9]" href={`mailto:${business.email}`}>{business.email}</a>
          <a className="block text-[#003DF9]" href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a>
          <p>{fullAddress()}</p>
          <p className="text-[12px] text-[#64748B]">{business.hoursChip}</p>
        </section>
        <RouteMap pickup={{ lat: business.origin.lat, lng: business.origin.lng, label: business.origin.label }} />
        <p className="text-[14px] text-[#475569]">{business.serviceAreaNote}</p>
      </div>
    </Screen>
  );
}

export function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen tone="surface">
      <StackHeader title="Help and FAQs" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8">
        {faqs.map((item, index) => (
          <div key={item.q} className="border-b border-[#E2E8F0]">
            <button type="button" className="flex min-h-12 w-full items-center justify-between py-3 text-left text-[16px] font-semibold" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>
              {item.q}
              <ChevronRight className={cn("h-4 w-4 transition", open === index && "rotate-90")} strokeWidth={1.75} />
            </button>
            {open === index ? <p className="pb-3 text-[14px] leading-relaxed text-[#475569]">{item.a}</p> : null}
          </div>
        ))}
      </div>
    </Screen>
  );
}

export function LegalScreen({ kind }: { kind: "terms" | "privacy" }) {
  const doc = kind === "terms" ? termsDoc : privacyDoc;
  return (
    <Screen>
      <StackHeader title={doc.title} />
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-8">
        <p className="text-[12px] text-[#64748B]">Version {doc.version} · Last updated {doc.updated}</p>
        <p className="rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[12px] text-[#92400E]">Replace with client-approved text.</p>
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-[18px] font-semibold">{section.heading}</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{section.body}</p>
          </section>
        ))}
      </div>
    </Screen>
  );
}
