import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Check } from "lucide-react";
import {
  AppleMark,
  Button,
  Field,
  GoogleMark,
  LegalSheet,
  Logo,
  Screen,
  SuccessMark,
  TextInput,
  inputClass,
} from "@/components/app/ui";
import { business } from "@/config/business";
import { facilityTypes, onboardingSlides } from "@/data/content";
import { formatPhone } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const { hydrated } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      navigate({ to: "/onboarding", replace: true });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [hydrated, navigate]);

  return (
    <Screen>
      <div className="relative flex h-full flex-col overflow-hidden bg-[#070B14] px-8">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#003DF9]/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-72 -translate-x-1/2 rounded-full bg-[#CF0300]/25 blur-3xl" />
        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="animate-[logo-in_900ms_ease-out_both]">
            <div className="rounded-full p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_18px_50px_rgba(0,0,0,0.45)] animate-[logo-pulse_1.6s_ease-in-out_900ms_2]">
              <Logo className="h-40 w-40" />
            </div>
          </div>
          <h1 className="mt-8 text-center text-[26px] font-semibold leading-tight tracking-tight text-white animate-[logo-in_700ms_ease-out_180ms_both]">
            {business.shortName}
          </h1>
          <p className="mt-3 max-w-[16rem] text-center text-[16px] leading-relaxed text-white animate-[logo-in_700ms_ease-out_280ms_both]">
            {business.tagline}
          </p>
          <span className="mt-5 h-1 w-10 rounded-full bg-[#CF0300] animate-[logo-in_700ms_ease-out_360ms_both]" />
        </div>
        <div className="relative pb-[max(28px,env(safe-area-inset-bottom))]">
          <div className="mx-auto h-1 w-40 overflow-hidden rounded-full bg-white/15">
            <div className="h-full origin-left bg-[#003DF9] animate-[bar-fill_2.4s_ease-out_forwards]" />
          </div>
        </div>
      </div>
    </Screen>
  );
}

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { markOnboarded } = useApp();
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const slide = onboardingSlides[index] ?? onboardingSlides[0];
  const last = index === onboardingSlides.length - 1;

  const finish = () => {
    markOnboarded();
    navigate({ to: "/login" });
  };

  return (
    <Screen>
      <div
        className="relative h-full overflow-hidden bg-[#070B14]"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current == null) return;
          const delta = event.clientX - startX.current;
          if (delta < -40) setIndex((value) => Math.min(onboardingSlides.length - 1, value + 1));
          if (delta > 40) setIndex((value) => Math.max(0, value - 1));
          startX.current = null;
        }}
      >
        <img key={slide.image} src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.62)_0%,rgba(7,11,20,0.08)_22%,rgba(7,11,20,0.08)_38%,rgba(7,11,20,0.78)_62%,rgba(7,11,20,0.96)_100%)]" />
        <div className="relative flex h-full flex-col">
          <div className="flex justify-end px-4 pt-[max(12px,env(safe-area-inset-top))] sm:pt-8">
            <button
              type="button"
              onClick={finish}
              className="min-h-11 rounded-full bg-[#070B14]/55 px-4 text-[14px] font-semibold text-white backdrop-blur-sm"
            >
              Skip
            </button>
          </div>
          <div className="mt-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-16">
            <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
              {slide.title}
            </h1>
            <p className="mt-3 text-[16px] leading-relaxed text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]">
              {slide.body}
            </p>
            <div className="mt-5 flex gap-2">
              {onboardingSlides.map((item, dot) => (
                <button
                  key={item.title}
                  type="button"
                  aria-label={`Slide ${dot + 1}`}
                  aria-current={dot === index ? "true" : undefined}
                  onClick={() => setIndex(dot)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    dot === index ? "w-6 bg-[#CF0300]" : "w-2 bg-white/55",
                  )}
                />
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={() => (last ? finish() : setIndex((value) => value + 1))}>
                {last ? "Let's Get Started" : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

function AuthScreen({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Screen>
      <div className="flex h-full flex-col bg-[#070B14]">
        <div className="relative overflow-hidden px-5 pb-8 pt-[max(20px,env(safe-area-inset-top))] sm:pt-12">
          <div className="pointer-events-none absolute -right-8 -top-16 h-40 w-40 rounded-full bg-[#003DF9]/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#CF0300]/35 blur-2xl" />
          <Logo className="relative h-14 w-14 shadow-[0_0_0_1px_rgba(255,255,255,0.16)]" />
          <h1 className="relative mt-5 text-[28px] font-semibold leading-tight text-white">{title}</h1>
          {subtitle ? <p className="relative mt-2 max-w-[20rem] text-[15px] leading-relaxed text-white/85">{subtitle}</p> : null}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6">
          {children}
        </div>
      </div>
    </Screen>
  );
}

function SocialButtons({ onGoogle, onApple }: { onGoogle: () => void; onApple: () => void }) {
  const button =
    "flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] bg-white text-[16px] font-semibold text-[#0F172A] active:scale-[0.98]";
  return (
    <div className="space-y-3">
      <button type="button" onClick={onGoogle} className={button}>
        <GoogleMark /> Continue with Google
      </button>
      <button type="button" onClick={onApple} className={button}>
        <AppleMark /> Continue with Apple
      </button>
    </div>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, sso } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = () => {
    const result = login(email, password, remember);
    if (!result.ok) sso("Google");
    navigate({ to: "/home" });
  };

  return (
    <AuthScreen title="Log in" subtitle="Use your Storey Enterprises account.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Email">
          <TextInput type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@clinic.com" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <TextInput
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-12"
              placeholder="Password"
            />
            <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center" onClick={() => setShow((value) => !value)}>
              {show ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
            </button>
          </div>
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex min-h-11 items-center gap-2 text-[14px] text-[#0F172A]">
            <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-5 w-5 accent-[#003DF9]" />
            Remember me
          </label>
          <button type="button" className="min-h-11 text-[14px] font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/forgot" })}>
            Forgot password
          </button>
        </div>
        <Button type="submit">Log In</Button>
      </form>
      <div className="mt-5">
        <SocialButtons
          onGoogle={() => {
            sso("Google");
            navigate({ to: "/home" });
          }}
          onApple={() => {
            sso("Apple");
            navigate({ to: "/home" });
          }}
        />
      </div>
      <button type="button" className="mt-4 rounded-[12px] bg-[#F4F7FB] px-3 py-3 text-left text-[13px] leading-relaxed text-[#64748B]" onClick={() => { setEmail("jordan@riversideclinic.com"); setPassword("Storey123!"); }}>
        Preview account: jordan@riversideclinic.com / Storey123!
      </button>
      <p className="mt-auto pt-6 text-center text-[14px] text-[#64748B]">
        New here?{" "}
        <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/register" })}>
          Create account
        </button>
      </p>
    </AuthScreen>
  );
}

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register, sso } = useApp();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    accountType: "business" as "individual" | "business",
    companyName: "",
    facilityType: "Clinic",
    billingEmail: "",
    agree: false,
  });
  const [show, setShow] = useState(false);
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const result = register({
      fullName: form.fullName,
      email: form.email,
      phone: formatPhone(form.phone),
      password: form.password,
      accountType: form.accountType,
      companyName: form.accountType === "business" ? form.companyName : "",
      facilityType: form.accountType === "business" ? form.facilityType : "",
      billingEmail: form.billingEmail,
      billingAddress: "",
    });
    if (!result.ok) sso("Google");
    navigate({ to: "/setup" });
  };

  const social = (provider: "Google" | "Apple") => {
    sso(provider);
    navigate({ to: "/home" });
  };

  return (
    <AuthScreen title="Create account" subtitle="Set up access for your clinic, lab, or pharmacy.">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Field label="Full name">
          <TextInput value={form.fullName} onChange={(event) => set("fullName", event.target.value)} autoComplete="name" placeholder="Jordan Hale" />
        </Field>
        <Field label="Email">
          <TextInput type="email" value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" placeholder="name@clinic.com" />
        </Field>
        <Field label="Mobile phone">
          <TextInput inputMode="tel" value={form.phone} onChange={(event) => set("phone", formatPhone(event.target.value))} autoComplete="tel" placeholder="(804) 555-0100" />
        </Field>
        <Field label="Password">
          <div className="relative">
            <TextInput type={show ? "text" : "password"} value={form.password} onChange={(event) => set("password", event.target.value)} className="pr-12" autoComplete="new-password" placeholder="Password" />
            <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center" onClick={() => setShow((value) => !value)}>
              {show ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
            </button>
          </div>
        </Field>
        <Field label="Confirm password">
          <TextInput type={show ? "text" : "password"} value={form.confirm} onChange={(event) => set("confirm", event.target.value)} autoComplete="new-password" placeholder="Repeat password" />
        </Field>
        <fieldset>
          <legend className="mb-2 text-[14px] font-medium text-[#0F172A]">Account type</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["individual", "business"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set("accountType", type)}
                className={cn(
                  "h-12 rounded-[12px] border text-[14px] font-semibold capitalize",
                  form.accountType === type ? "border-[#003DF9] bg-[#003DF9]/10 text-[#003DF9]" : "border-[#E2E8F0] text-[#0F172A]",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>
        {form.accountType === "business" ? (
          <div className="space-y-4">
            <Field label="Company/Facility name">
              <TextInput value={form.companyName} onChange={(event) => set("companyName", event.target.value)} placeholder="Riverside Family Clinic" />
            </Field>
            <Field label="Facility type">
              <select className={inputClass} value={form.facilityType} onChange={(event) => set("facilityType", event.target.value)}>
                {facilityTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Billing email">
              <TextInput type="email" value={form.billingEmail} onChange={(event) => set("billingEmail", event.target.value)} placeholder="billing@clinic.com" />
            </Field>
          </div>
        ) : null}
        <label className="flex items-start gap-3 py-1">
          <input type="checkbox" checked={form.agree} onChange={(event) => set("agree", event.target.checked)} className="mt-1 h-5 w-5 accent-[#003DF9]" />
          <span className="text-[14px] leading-snug text-[#0F172A]">
            I agree to the{" "}
            <button type="button" className="font-semibold text-[#003DF9]" onClick={(event) => { event.preventDefault(); setLegal("terms"); }}>
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button type="button" className="font-semibold text-[#003DF9]" onClick={(event) => { event.preventDefault(); setLegal("privacy"); }}>
              Privacy Policy
            </button>
          </span>
        </label>
        <Button type="submit">Create Account</Button>
      </form>
      <div className="mt-5">
        <SocialButtons onGoogle={() => social("Google")} onApple={() => social("Apple")} />
      </div>
      <p className="mt-5 text-center text-[14px] text-[#64748B]">
        Already have an account?{" "}
        <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/login" })}>
          Log in
        </button>
      </p>
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
    </AuthScreen>
  );
}

export function ForgotScreen() {
  const navigate = useNavigate();
  const { resetPassword } = useApp();
  const [step, setStep] = useState<"email" | "sent" | "otp" | "password" | "done">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const title = {
    email: "Reset password",
    sent: "Check your email",
    otp: "Enter code",
    password: "New password",
    done: "Password updated",
  }[step];
  const subtitle = {
    email: "We'll send a reset code to your email.",
    sent: "If an account exists, a reset code is on the way.",
    otp: "Type the code from your email.",
    password: "Choose a new password for this account.",
    done: "You can log in with your new password.",
  }[step];

  return (
    <AuthScreen title={title} subtitle={subtitle}>
      {step === "email" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep("sent");
          }}
        >
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@clinic.com" />
          </Field>
          <div className="mt-6">
            <Button type="submit">Send code</Button>
          </div>
        </form>
      ) : null}
      {step === "sent" ? (
        <div>
          <SuccessMark />
          <p className="mt-4 text-center text-[14px] leading-relaxed text-[#64748B]">{email || "your email"}</p>
          <div className="mt-6">
            <Button onClick={() => setStep("otp")}>Enter code</Button>
          </div>
        </div>
      ) : null}
      {step === "otp" ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStep("password");
          }}
        >
          <Field label="Code">
            <TextInput inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" className="tracking-[0.3em]" />
          </Field>
          <div className="mt-6">
            <Button type="submit">Continue</Button>
          </div>
        </form>
      ) : null}
      {step === "password" ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            resetPassword(email, password);
            setStep("done");
          }}
        >
          <Field label="New password">
            <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" />
          </Field>
          <Field label="Confirm password">
            <TextInput type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat password" />
          </Field>
          <Button type="submit">Update password</Button>
        </form>
      ) : null}
      {step === "done" ? (
        <div>
          <SuccessMark />
          <div className="mt-6">
            <Button onClick={() => navigate({ to: "/login" })}>Log In</Button>
          </div>
        </div>
      ) : null}
      {step !== "done" ? (
        <button type="button" className="mt-4 min-h-11 text-[14px] font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/login" })}>
          Back to log in
        </button>
      ) : null}
    </AuthScreen>
  );
}

export function SetupScreen() {
  const navigate = useNavigate();
  const { user, updateUser } = useApp();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(user?.photo ?? "");
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [companyName, setCompanyName] = useState(user?.companyName ?? "");
  const [facilityType, setFacilityType] = useState(user?.facilityType || "Clinic");
  const [billingAddress, setBillingAddress] = useState(user?.billingAddress ?? "");
  const [billingEmail, setBillingEmail] = useState(user?.billingEmail ?? "");
  const [taxId, setTaxId] = useState(user?.taxId ?? "");

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone);
    setCompanyName(user.companyName);
    setFacilityType(user.facilityType || "Clinic");
    setBillingAddress(user.billingAddress);
    setBillingEmail(user.billingEmail);
    setTaxId(user.taxId);
    setPhoto(user.photo);
  }, [user]);

  const save = (partial: boolean) => {
    updateUser({
      fullName,
      email,
      phone: formatPhone(phone),
      photo,
      companyName,
      facilityType,
      billingAddress,
      billingEmail,
      taxId,
    });
    if (partial || step === 2) navigate({ to: "/home" });
    else setStep(2);
  };

  return (
    <AuthScreen
      title={step === 1 ? "Personal details" : "Business and billing"}
      subtitle={step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
    >
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-[#E2E8F0]">
        <div className="h-full bg-[#003DF9] transition-all duration-200" style={{ width: step === 1 ? "50%" : "100%" }} />
      </div>
      {step === 1 ? (
        <div className="space-y-4">
          <Field label="Profile photo" hint="Optional">
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#F6F7FB]">
                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <span className="text-[12px] text-[#64748B]">Photo</span>}
              </span>
              <label className="min-h-11 cursor-pointer rounded-[12px] border border-[#E2E8F0] px-3 py-2 text-[14px] font-semibold text-[#003DF9]">
                Add photo
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
          </Field>
          <Field label="Full name">
            <TextInput value={fullName} onChange={(event) => setFullName(event.target.value)} />
          </Field>
          <Field label="Email">
            <TextInput type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Mobile phone">
            <TextInput value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
          </Field>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Company name">
            <TextInput value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </Field>
          <Field label="Facility type">
            <select className={inputClass} value={facilityType} onChange={(event) => setFacilityType(event.target.value)}>
              {facilityTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Billing address">
            <TextInput value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
          </Field>
          <Field label="Billing email">
            <TextInput id="billingEmail" type="email" value={billingEmail} onChange={(event) => setBillingEmail(event.target.value)} />
          </Field>
          <Field label="Tax ID" hint="Optional">
            <TextInput value={taxId} onChange={(event) => setTaxId(event.target.value)} />
          </Field>
        </div>
      )}
      <div className="mt-6 space-y-3">
        <Button onClick={() => save(false)}>{step === 1 ? "Continue" : "Finish"}</Button>
        <button type="button" className="min-h-11 w-full text-[14px] font-semibold text-[#64748B]" onClick={() => save(true)}>
          Complete later
        </button>
      </div>
      <p className="mt-4 flex items-start gap-2 text-[12px] text-[#64748B]">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#003DF9]" strokeWidth={1.75} />
        Profile details stay separate from shipment addresses.
      </p>
    </AuthScreen>
  );
}
