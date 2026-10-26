import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Play,
  Settings,
  Shield,
  Trash2,
  Truck,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  AsyncBody,
  Button,
  ChoiceButton,
  ChoiceGroup,
  Field,
  Logo,
  RouteMap,
  Screen,
  Sheet,
  TextArea,
  TextInput,
  cardClass,
  inputClass,
} from "@/components/app/ui";
import { business, fullAddress } from "@/config/business";
import { facilityTypes, faqs, galleryItems, privacyDoc, termsDoc } from "@/data/content";
import { places } from "@/data/places";
import { formatDateTimeET, formatPhone } from "@/lib/format";
import { profileGaps, profileScore } from "@/lib/labels";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const mark = parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  return mark || "SE";
}

function ProfilePage({
  title,
  subtitle,
  backTo = "/profile",
  children,
}: {
  title: string;
  subtitle?: string;
  backTo?: "/profile" | "/home";
  children: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F6F7FB]">
      <div className="relative shrink-0 overflow-hidden bg-[#070B14] px-3 pb-7 pt-[max(10px,env(safe-area-inset-top))] sm:pt-8">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#003DF9]/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-[#CF0300]/30 blur-2xl" />
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate({ to: backTo })}
          className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
        >
          <ChevronLeft className="pointer-events-none h-6 w-6" strokeWidth={1.75} />
        </button>
        <h1 className="relative mt-1 px-2 text-[26px] font-semibold leading-tight text-white">{title}</h1>
        {subtitle ? <p className="relative mt-1 px-2 text-[14px] leading-relaxed text-white/75">{subtitle}</p> : null}
      </div>
      <div className="relative z-10 -mt-4 min-h-0 flex-1 overflow-y-auto rounded-t-[24px] bg-[#F6F7FB] px-4 pb-8 pt-5">{children}</div>
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  hint,
  onClick,
  danger = false,
}: {
  icon: LucideIcon;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-14 w-full items-center gap-3 px-3 text-left active:bg-[#F8FAFC]">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", danger ? "bg-[#CF0300]/10 text-[#CF0300]" : "bg-[#003DF9]/10 text-[#003DF9]")}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[15px] font-semibold", danger ? "text-[#CF0300]" : "text-[#0F172A]")}>{label}</span>
        {hint ? <span className="block truncate text-[12px] text-[#64748B]">{hint}</span> : null}
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-[#94A3B8]" strokeWidth={1.75} />
    </button>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h2 className="px-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{title}</h2>
      <div className={cn(cardClass(), "mt-2 divide-y divide-[#E2E8F0] overflow-hidden")}>{children}</div>
    </section>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout, hydrated } = useApp();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
  }, [hydrated, user, navigate]);
  if (!user) return <Screen tab />;
  const score = profileScore(user);
  const gaps = profileGaps(user);
  return (
    <Screen tab tone="surface">
      <div className="flex h-full min-h-0 flex-col bg-[#F6F7FB]">
        <div className="relative overflow-hidden bg-[#070B14] px-5 pb-8 pt-[max(18px,env(safe-area-inset-top))] sm:pt-10">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-[#003DF9]/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#CF0300]/30 blur-2xl" />
          <p className="relative text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60">Account</p>
          <div className="relative mt-4 flex items-center gap-4">
            <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[22px] font-semibold text-[#003DF9] shadow-[0_0_0_1px_rgba(255,255,255,0.2)]">
              {user.photo ? <img src={user.photo} alt="" className="h-full w-full object-cover" /> : initials(user.fullName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[22px] font-semibold leading-tight text-white">{user.fullName || "Your profile"}</p>
              <p className="mt-1 truncate text-[14px] text-white/80">{user.companyName || user.accountType}</p>
              <p className="truncate text-[13px] text-white/65">{user.email}</p>
            </div>
          </div>
          <div className="relative mt-5 rounded-[16px] bg-white/10 p-3">
            <div className="flex items-center justify-between text-[13px] text-white">
              <span className="font-semibold">Profile completeness</span>
              <span>{score}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-[#003DF9]" style={{ width: `${score}%` }} />
            </div>
            {gaps[0] ? <p className="mt-2 text-[12px] text-white/75">{gaps[0]} is still needed before booking.</p> : <p className="mt-2 text-[12px] text-white/75">Ready to book shipments.</p>}
          </div>
        </div>
        <div className="relative z-10 -mt-4 min-h-0 flex-1 overflow-y-auto rounded-t-[24px] bg-[#F6F7FB] px-4 pb-8 pt-2">
          <AsyncBody boot emptyTitle="Profile unavailable" emptyBody="Sign in to see your account.">
            <Group title="Account">
              <MenuRow icon={UserRound} label="Edit profile" hint={user.phone || "Name, email, and phone"} onClick={() => navigate({ to: "/profile/edit" })} />
              <MenuRow icon={Building2} label="Business and billing" hint={user.billingEmail || "Facility and billing details"} onClick={() => navigate({ to: "/profile/billing" })} />
            </Group>
            <Group title="Courier">
              <MenuRow icon={MapPin} label="Saved addresses" hint="Facilities you use often" onClick={() => navigate({ to: "/profile/addresses" })} />
              <MenuRow icon={CreditCard} label="Payment methods" hint="Square test cards" onClick={() => navigate({ to: "/profile/payments" })} />
              <MenuRow icon={Package} label="My shipments" onClick={() => navigate({ to: "/shipments" })} />
              <MenuRow icon={Truck} label="All services" onClick={() => navigate({ to: "/services" })} />
              <MenuRow icon={ImageIcon} label="Gallery" onClick={() => navigate({ to: "/profile/gallery" })} />
              <MenuRow icon={MessageCircle} label="Messages" onClick={() => navigate({ to: "/messages" })} />
            </Group>
            <Group title="Support">
              <MenuRow icon={Bell} label="Notification settings" onClick={() => navigate({ to: "/notifications/settings" })} />
              <MenuRow icon={HelpCircle} label="Help and FAQs" onClick={() => navigate({ to: "/help" })} />
              <MenuRow icon={Phone} label="Contact us" onClick={() => navigate({ to: "/contact" })} />
              <MenuRow icon={Info} label="About us" onClick={() => navigate({ to: "/about" })} />
              <MenuRow icon={FileText} label="Terms & Conditions" onClick={() => navigate({ to: "/terms" })} />
              <MenuRow icon={Shield} label="Privacy Policy" onClick={() => navigate({ to: "/privacy" })} />
            </Group>
            <Group title="App">
              <MenuRow icon={Settings} label="Settings" hint="Preview states and time zone" onClick={() => navigate({ to: "/profile/settings" })} />
              <MenuRow icon={LogOut} label="Log out" onClick={() => setConfirm(true)} />
              <MenuRow icon={Trash2} label="Delete account" danger onClick={() => navigate({ to: "/profile/delete" })} />
            </Group>
            {user.termsAcceptedAt ? (
              <p className="mt-4 px-1 text-[12px] text-[#64748B]">Terms accepted {formatDateTimeET(user.termsAcceptedAt)} · v{user.policyVersion}</p>
            ) : null}
          </AsyncBody>
        </div>
      </div>
      <Sheet open={confirm} title="Log out" onClose={() => setConfirm(false)}>
        <p className="text-[14px] text-[#475569]">You can log back in with the same email.</p>
        <div className="mt-4 space-y-2">
          <Button
            onClick={() => {
              logout();
              navigate({ to: "/login" });
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
      <ProfilePage title="Edit profile" subtitle="Name, contact, and account type.">
        <form
          className="space-y-4"
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
          <div className={cn(cardClass(), "flex items-center gap-4 p-4")}>
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#003DF9]/10 text-[18px] font-semibold text-[#003DF9]">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(fullName)}
            </span>
            <label className="min-h-11 cursor-pointer text-[15px] font-semibold text-[#003DF9]">
              Change photo
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhoto(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>
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
      </ProfilePage>
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
      <ProfilePage title="Business and billing" subtitle="Used for quotes and receipts, not shipment stops.">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (user?.accountType === "business" && !companyName.trim()) {
              setError("Company name is required.");
              return;
            }
            if (billingEmail.trim() && !billingEmail.includes("@")) {
              setError("Enter a billing email.");
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
          <Field label="Billing address">
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
      </ProfilePage>
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
      <ProfilePage title="Saved addresses" subtitle="These stay separate until you confirm one during booking.">
        <AsyncBody boot emptyTitle="No saved addresses" emptyBody="Add a facility you use often.">
          <div className="space-y-3">
            {addresses.map((address) => (
              <article key={address.id} className={cn(cardClass(), "p-4")}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#003DF9]/10 text-[#003DF9]">
                    <MapPin className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold text-[#0F172A]">{address.label}</p>
                    <p className="text-[14px] text-[#475569]">{address.facility}</p>
                    <p className="text-[12px] leading-relaxed text-[#64748B]">{address.line}</p>
                  </div>
                </div>
                <button type="button" className="mt-3 min-h-11 text-[14px] font-semibold text-[#CF0300]" onClick={() => removeAddress(address.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </AsyncBody>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)}>Add address</Button>
        </div>
      </ProfilePage>
      <Sheet open={open} title="Add address" onClose={() => setOpen(false)}>
        <Field label="Label">
          <TextInput value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Main clinic" />
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
            onClick={() => {
              if (!place) return;
              addAddress({ label: label.trim() || place.facility, line: place.label, facility: place.facility, placeId: place.id });
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
      <ProfilePage title="Payment methods" subtitle="Square test mode. Cards ending in 0002 decline.">
        <p className="mb-3 rounded-[12px] bg-[#F59E0B]/20 px-3 py-2 text-[12px] font-semibold text-[#92400E]">Square · TEST MODE</p>
        <AsyncBody boot emptyTitle="No cards saved" emptyBody="Add a test card. Numbers ending in 0002 will decline.">
          <div className="space-y-3">
            {cards.map((card) => (
              <article key={card.id} className="rounded-[18px] bg-[linear-gradient(135deg,#003DF9,#070B14)] p-4 text-white">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">{card.brand}</p>
                <p className="mt-3 text-[22px] font-semibold tracking-[0.12em]">•••• {card.last4}</p>
                <p className="mt-2 text-[13px] text-white/75">Exp {card.exp}{card.fails ? " · Declines in test mode" : ""}</p>
                <button type="button" className="mt-3 min-h-11 text-[14px] font-semibold text-white" onClick={() => removeCard(card.id)}>
                  Remove
                </button>
              </article>
            ))}
          </div>
        </AsyncBody>
        <div className="mt-4">
          <Button onClick={() => setOpen(true)}>Add card</Button>
        </div>
      </ProfilePage>
      <Sheet open={open} title="Add card" onClose={() => setOpen(false)}>
        <Field label="Card number" required>
          <TextInput value={number} onChange={(event) => setNumber(event.target.value)} placeholder="4242 4242 4242 4242" />
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
              setNumber("");
              setExp("");
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
      <ProfilePage title="Gallery" subtitle="Handoffs, coolers, and proof from completed work.">
        <AsyncBody boot emptyTitle="No gallery items" emptyBody="Completed-work photos will appear here.">
          <div className="grid grid-cols-2 gap-3">
            {galleryItems.map((entry, index) => (
              <button key={entry.id} type="button" className="overflow-hidden rounded-[16px] bg-white text-left shadow-[0_4px_16px_rgba(15,23,42,.06)]" onClick={() => { setActive(index); setPlaying(false); }}>
                <span className="relative block">
                  <img src={entry.src} alt={entry.title} className="h-32 w-full object-cover" />
                  {entry.kind === "video" ? (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[12px] font-semibold text-[#0F172A]">
                      <Play className="h-3 w-3" strokeWidth={1.75} /> Video
                    </span>
                  ) : null}
                </span>
                <span className="block px-2 py-2 text-[13px] font-semibold text-[#0F172A]">{entry.title}</span>
              </button>
            ))}
          </div>
        </AsyncBody>
      </ProfilePage>
      {item ? (
        <div className="absolute inset-0 z-50 flex flex-col bg-[#070B14] text-white">
          <div className="flex items-center justify-between px-2 pt-[max(8px,env(safe-area-inset-top))] sm:pt-8">
            <button type="button" aria-label="Close" className="flex h-11 w-11 items-center justify-center" onClick={() => setActive(null)}>
              <X className="pointer-events-none h-6 w-6" strokeWidth={1.75} />
            </button>
            <p className="text-[14px] font-semibold">{item.title}</p>
            <span className="w-11" />
          </div>
          <button type="button" className="relative flex min-h-0 flex-1 items-center" onClick={() => item.kind === "video" && setPlaying(true)}>
            <img src={item.src} alt="" className="max-h-full w-full object-contain" />
            {item.kind === "video" && !playing ? <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2" strokeWidth={1.75} /> : null}
            {playing ? <span className="absolute bottom-4 left-4 right-4 h-1 overflow-hidden rounded-full bg-white/30"><span className="block h-full w-2/3 bg-white animate-[bar-fill_2s_ease-out_forwards]" /></span> : null}
          </button>
          <p className="px-4 pb-4 text-[14px] leading-relaxed text-white/85">{item.caption}</p>
          <div className="flex justify-between px-4 pb-6">
            <button type="button" className="min-h-11 text-[14px] font-semibold" onClick={() => setActive((index) => (index == null ? 0 : (index + galleryItems.length - 1) % galleryItems.length))}>Previous</button>
            <button type="button" className="min-h-11 text-[14px] font-semibold" onClick={() => setActive((index) => (index == null ? 0 : (index + 1) % galleryItems.length))}>Next</button>
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
      <ProfilePage title="Settings" subtitle="Preview tools for this design build.">
        <section className={cn(cardClass(), "p-4")}>
          <h2 className="text-[16px] font-semibold">Preview states</h2>
          <p className="mt-1 text-[12px] text-[#64748B]">Show loading, empty, and error layouts on list screens.</p>
          <ChoiceGroup className="mt-3 grid-cols-2">
            {(["live", "loading", "empty", "error"] as const).map((mode) => (
              <ChoiceButton key={mode} selected={listPreview === mode} onClick={() => setListPreview(mode)} className="capitalize">
                {mode}
              </ChoiceButton>
            ))}
          </ChoiceGroup>
        </section>
        <section className={cn(cardClass(), "mt-3 p-4")}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[16px] font-semibold">Offline</h2>
              <p className="text-[12px] text-[#64748B]">Show the offline banner.</p>
            </div>
            <button type="button" aria-pressed={connectivity === "offline"} onClick={() => setConnectivity(connectivity === "offline" ? "online" : "offline")} className={cn("h-8 w-14 shrink-0 rounded-full p-1", connectivity === "offline" ? "bg-[#003DF9]" : "bg-[#E2E8F0]")}>
              <span className={cn("block h-6 w-6 rounded-full bg-white transition", connectivity === "offline" && "translate-x-6")} />
            </button>
          </div>
        </section>
        <section className={cn(cardClass(), "mt-3 space-y-2 p-4 text-[14px] text-[#475569]")}>
          <p>Time zone: {business.timezoneLabel}</p>
          <p>{business.hoursChip}</p>
          <p>App preview 1.0 · Design phase</p>
        </section>
      </ProfilePage>
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
      <ProfilePage title="Delete account" subtitle="This removes the sign-in profile on this device.">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const result = deleteAccount(password);
            if (!result.ok) {
              setError("Password does not match.");
              return;
            }
            navigate({ to: "/login" });
          }}
        >
          <div className={cn(cardClass(), "p-4 text-[14px] leading-relaxed text-[#475569]")}>
            Business, payment, audit, and delivery records may be retained as required.
          </div>
          <Field label="Password" required error={error}>
            <TextInput type="password" value={password} invalid={!!error} onChange={(event) => setPassword(event.target.value)} />
          </Field>
          <Button type="submit" variant="danger">
            Delete account
          </Button>
        </form>
      </ProfilePage>
    </Screen>
  );
}

export function AboutScreen() {
  return (
    <Screen>
      <ProfilePage title="About us" subtitle={business.tagline}>
        <div className={cn(cardClass(), "flex items-center gap-4 p-4")}>
          <Logo className="h-16 w-16" />
          <div>
            <p className="text-[18px] font-semibold text-[#0F172A]">{business.name}</p>
            <p className="text-[13px] text-[#64748B]">Chesterfield · Central Virginia</p>
          </div>
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[#475569]">
          Storey Enterprises is a medical courier company serving Chesterfield, Richmond, and Central Virginia. We move specimens, prescriptions, supplies, documents, and equipment between healthcare facilities.
        </p>
        <section className={cn(cardClass(), "mt-3 p-4")}>
          <h2 className="text-[16px] font-semibold">Mission</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">Give clinics, labs, pharmacies, and hospitals a courier they can track, with proof of delivery they can keep.</p>
        </section>
        <section className={cn(cardClass(), "mt-3 p-4")}>
          <h2 className="text-[16px] font-semibold">Licensed and insured</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{business.licensedNote}</p>
        </section>
        <section className={cn(cardClass(), "mt-3 p-4")}>
          <h2 className="text-[16px] font-semibold">Service area</h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{business.serviceAreaNote}</p>
        </section>
      </ProfilePage>
    </Screen>
  );
}

export function ContactScreen() {
  return (
    <Screen tone="surface">
      <ProfilePage title="Contact us" subtitle="Dispatch for Central Virginia.">
        <p className="rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[12px] text-[#92400E]">{business.contactPlaceholder}</p>
        <section className={cn(cardClass(), "mt-3 space-y-3 p-4 text-[14px]")}>
          <p className="text-[16px] font-semibold text-[#0F172A]">{business.name}</p>
          <a className="flex min-h-11 items-center gap-2 font-semibold text-[#003DF9]" href={`mailto:${business.email}`}>
            <Mail className="h-4 w-4" strokeWidth={1.75} /> {business.email}
          </a>
          <a className="flex min-h-11 items-center gap-2 font-semibold text-[#003DF9]" href={`tel:${business.phoneTel}`}>
            <Phone className="h-4 w-4" strokeWidth={1.75} /> {business.phoneDisplay}
          </a>
          <p className="flex items-start gap-2 text-[#475569]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#003DF9]" strokeWidth={1.75} /> {fullAddress()}
          </p>
          <p className="text-[12px] text-[#64748B]">{business.hoursChip}</p>
        </section>
        <div className="mt-3 overflow-hidden rounded-[16px]">
          <RouteMap pickup={{ lat: business.origin.lat, lng: business.origin.lng, label: business.origin.label }} />
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-[#475569]">{business.serviceAreaNote}</p>
      </ProfilePage>
    </Screen>
  );
}

export function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Screen tone="surface">
      <ProfilePage title="Help and FAQs" subtitle="Booking, tracking, and proof of delivery.">
        <div className={cn(cardClass(), "overflow-hidden")}>
          {faqs.map((item, index) => (
            <div key={item.q} className="border-b border-[#E2E8F0] last:border-b-0">
              <button type="button" className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-semibold text-[#0F172A]" aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>
                {item.q}
                <ChevronRight className={cn("h-4 w-4 shrink-0 text-[#94A3B8] transition", open === index && "rotate-90")} strokeWidth={1.75} />
              </button>
              {open === index ? <p className="px-4 pb-4 text-[14px] leading-relaxed text-[#475569]">{item.a}</p> : null}
            </div>
          ))}
        </div>
      </ProfilePage>
    </Screen>
  );
}

export function LegalScreen({ kind }: { kind: "terms" | "privacy" }) {
  const doc = kind === "terms" ? termsDoc : privacyDoc;
  return (
    <Screen>
      <ProfilePage title={doc.title} subtitle={`Version ${doc.version} · Updated ${doc.updated}`}>
        <p className="rounded-[12px] bg-[#F59E0B]/15 px-3 py-2 text-[12px] text-[#92400E]">Replace with client-approved text.</p>
        {doc.sections.map((section) => (
          <section key={section.heading} className={cn(cardClass(), "mt-3 p-4")}>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">{section.heading}</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-[#475569]">{section.body}</p>
          </section>
        ))}
      </ProfilePage>
    </Screen>
  );
}
