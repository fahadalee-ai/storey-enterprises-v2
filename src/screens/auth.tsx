import { useEffect, useRef, useState } from "react";
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
import { digits, formatPhone, passwordStrength } from "@/lib/format";
import { profileGaps } from "@/lib/labels";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const { hydrated, user, onboarded } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      if (user) navigate({ to: "/home", replace: true });
      else if (onboarded) navigate({ to: "/welcome", replace: true });
      else navigate({ to: "/onboarding", replace: true });
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [hydrated, user, onboarded, navigate]);

  return (
    <Screen>
      <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(180deg,#F3F6FF_0%,#FFFFFF_58%)] px-8">
        <div className="animate-[logo-in_900ms_ease-out_both]">
          <div className="animate-[logo-pulse_1.6s_ease-in-out_900ms_2]">
            <Logo className="h-36 w-36 shadow-[0_8px_24px_rgba(15,23,42,.12)]" />
          </div>
        </div>
        <p className="mt-6 text-center text-[14px] text-[#64748B]">{business.tagline}</p>
        <div className="mt-8 h-1 w-40 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div className="h-full origin-left bg-[#003DF9] animate-[bar-fill_2.4s_ease-out_forwards]" />
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
    navigate({ to: "/welcome" });
  };

  return (
    <Screen>
      <div
        className="flex h-full flex-col"
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
        <div className="flex justify-end px-4 pt-[max(12px,env(safe-area-inset-top))] sm:pt-8">
          <button type="button" onClick={finish} className="min-h-11 px-2 text-[14px] font-semibold text-[#003DF9]">
            Skip
          </button>
        </div>
        <div className="mx-5 mt-2 h-[52%] overflow-hidden rounded-[16px] bg-[#F6F7FB]">
          <img src={slide.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#0F172A]">{slide.title}</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-[#64748B]">{slide.body}</p>
          <div className="mt-5 flex gap-2">
            {onboardingSlides.map((item, dot) => (
              <button
                key={item.title}
                type="button"
                aria-label={`Slide ${dot + 1}`}
                onClick={() => setIndex(dot)}
                className={cn("h-2 rounded-full transition-all", dot === index ? "w-6 bg-[#CF0300]" : "w-2 bg-[#E2E8F0]")}
              />
            ))}
          </div>
          <div className="mt-auto">
            <Button onClick={() => (last ? finish() : setIndex((value) => value + 1))}>
              {last ? "Let's Get Started" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { sso, user, hydrated } = useApp();
  useEffect(() => {
    if (hydrated && user) navigate({ to: "/home", replace: true });
  }, [hydrated, user, navigate]);
  const social = (provider: "Google" | "Apple") => {
    sso(provider);
    navigate({ to: "/home" });
  };
  return (
    <Screen>
      <div className="flex h-full flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(36px,env(safe-area-inset-top))] sm:pt-16">
        <Logo className="h-20 w-20" />
        <h1 className="mt-6 text-[28px] font-semibold leading-tight text-[#0F172A]">{business.name}</h1>
        <p className="mt-3 text-[16px] leading-relaxed text-[#64748B]">
          Medical courier for clinics, labs, pharmacies, and hospitals across Central Virginia.
        </p>
        <div className="mt-auto space-y-3">
          <Button onClick={() => navigate({ to: "/login" })}>Log In</Button>
          <Button variant="secondary" onClick={() => navigate({ to: "/register" })}>
            Create Account
          </Button>
          <button type="button" onClick={() => social("Google")} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold active:scale-[0.98]">
            <GoogleMark /> Continue with Google
          </button>
          <button type="button" onClick={() => social("Apple")} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold active:scale-[0.98]">
            <AppleMark /> Continue with Apple
          </button>
          <p className="pt-2 text-center text-[12px] text-[#64748B]">
            <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/terms" })}>
              Terms & Conditions
            </button>
            <span> · </span>
            <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/privacy" })}>
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </Screen>
  );
}

function Strength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password);
  const colors = ["bg-[#E2E8F0]", "bg-[#DC2626]", "bg-[#F59E0B]", "bg-[#003DF9]", "bg-[#16A34A]"];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className={cn("h-1.5 flex-1 rounded-full", index < score ? colors[score] : "bg-[#E2E8F0]")} />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-[#64748B]">{label}</p>
    </div>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const { login, sso, user, hydrated } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (hydrated && user) navigate({ to: "/home", replace: true });
  }, [hydrated, user, navigate]);

  const submit = () => {
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    const result = login(email, password, remember);
    if (!result.ok) {
      setError("Email or password doesn't match our records.");
      return;
    }
    navigate({ to: "/home" });
  };

  return (
    <Screen>
      <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-[max(28px,env(safe-area-inset-top))] sm:pt-14">
        <Logo className="h-16 w-16" />
        <h1 className="mt-5 text-[28px] font-semibold text-[#0F172A]">Log in</h1>
        <p className="mt-2 text-[14px] text-[#64748B]">Use your Storey Enterprises account.</p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field label="Email" required error={error && !email ? "Email is required." : undefined}>
            <TextInput type="email" autoComplete="email" value={email} invalid={!!error} onChange={(event) => setEmail(event.target.value)} />
          </Field>
          <Field label="Password" required>
            <div className="relative">
              <TextInput
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                invalid={!!error}
                onChange={(event) => setPassword(event.target.value)}
                className="pr-12"
              />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center" onClick={() => setShow((value) => !value)}>
                {show ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
              </button>
            </div>
          </Field>
          {error ? (
            <p role="alert" className="text-[12px] text-[#DC2626]">
              {error}
            </p>
          ) : null}
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
        <div className="mt-4 space-y-3">
          <button type="button" onClick={() => { sso("Google"); navigate({ to: "/home" }); }} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold">
            <GoogleMark /> Continue with Google
          </button>
          <button type="button" onClick={() => { sso("Apple"); navigate({ to: "/home" }); }} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold">
            <AppleMark /> Continue with Apple
          </button>
        </div>
        <button type="button" className="mt-4 text-left text-[12px] leading-relaxed text-[#64748B]" onClick={() => { setEmail("jordan@riversideclinic.com"); setPassword("Storey123!"); }}>
          Preview account: jordan@riversideclinic.com / Storey123!
        </button>
        <p className="mt-auto pt-6 text-center text-[14px] text-[#64748B]">
          New here?{" "}
          <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/register" })}>
            Create account
          </button>
        </p>
      </div>
    </Screen>
  );
}

export function RegisterScreen() {
  const navigate = useNavigate();
  const { register } = useApp();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [legal, setLegal] = useState<"terms" | "privacy" | null>(null);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = () => {
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Full name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
    if (digits(form.phone).length !== 10) next.phone = "Enter a 10-digit mobile number.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.confirm !== form.password) next.confirm = "Passwords do not match.";
    if (form.accountType === "business" && !form.companyName.trim()) next.companyName = "Company or facility name is required.";
    if (form.accountType === "business" && form.billingEmail && !/^\S+@\S+\.\S+$/.test(form.billingEmail)) next.billingEmail = "Enter a valid billing email.";
    if (!form.agree) next.agree = "Agree to the Terms & Conditions and Privacy Policy to continue.";
    setErrors(next);
    if (Object.keys(next).length) return;
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
    if (!result.ok) {
      setErrors({ email: "An account with this email already exists." });
      return;
    }
    navigate({ to: "/setup" });
  };

  return (
    <Screen>
      <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))] sm:pt-12">
        <Logo className="h-14 w-14" />
        <h1 className="mt-4 text-[28px] font-semibold text-[#0F172A]">Create account</h1>
        <form
          className="mt-5 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Field label="Full name" required error={errors.fullName}>
            <TextInput value={form.fullName} invalid={!!errors.fullName} onChange={(event) => set("fullName", event.target.value)} autoComplete="name" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <TextInput type="email" value={form.email} invalid={!!errors.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" />
          </Field>
          <Field label="Mobile phone" required error={errors.phone}>
            <TextInput inputMode="tel" value={form.phone} invalid={!!errors.phone} onChange={(event) => set("phone", formatPhone(event.target.value))} autoComplete="tel" />
          </Field>
          <Field label="Password" required error={errors.password}>
            <div className="relative">
              <TextInput type={show ? "text" : "password"} value={form.password} invalid={!!errors.password} onChange={(event) => set("password", event.target.value)} className="pr-12" autoComplete="new-password" />
              <button type="button" aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center" onClick={() => setShow((value) => !value)}>
                {show ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
              </button>
            </div>
            <Strength password={form.password} />
          </Field>
          <Field label="Confirm password" required error={errors.confirm}>
            <TextInput type={show ? "text" : "password"} value={form.confirm} invalid={!!errors.confirm} onChange={(event) => set("confirm", event.target.value)} autoComplete="new-password" />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[14px] font-medium text-[#0F172A]">Account type *</legend>
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
              <Field label="Company/Facility name" required error={errors.companyName}>
                <TextInput value={form.companyName} invalid={!!errors.companyName} onChange={(event) => set("companyName", event.target.value)} />
              </Field>
              <Field label="Facility type">
                <select className={inputClass} value={form.facilityType} onChange={(event) => set("facilityType", event.target.value)}>
                  {facilityTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </Field>
              <Field label="Billing email" error={errors.billingEmail}>
                <TextInput type="email" value={form.billingEmail} invalid={!!errors.billingEmail} onChange={(event) => set("billingEmail", event.target.value)} />
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
          {errors.agree ? <p className="text-[12px] text-[#DC2626]">{errors.agree}</p> : null}
          <p className="text-[12px] text-[#64748B]">Acceptance date, time, and policy version are recorded.</p>
          <Button type="submit" disabled={!form.agree}>
            Create Account
          </Button>
        </form>
        <div className="mt-4 space-y-3">
          <button type="button" className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold" onClick={() => navigate({ to: "/login" })}>
            <GoogleMark /> Continue with Google
          </button>
          <button type="button" className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] text-[16px] font-semibold" onClick={() => navigate({ to: "/login" })}>
            <AppleMark /> Continue with Apple
          </button>
        </div>
        <p className="mt-5 text-center text-[14px] text-[#64748B]">
          Already have an account?{" "}
          <button type="button" className="font-semibold text-[#003DF9]" onClick={() => navigate({ to: "/login" })}>
            Log in
          </button>
        </p>
      </div>
      <LegalSheet kind={legal} onClose={() => setLegal(null)} />
    </Screen>
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
  const [error, setError] = useState("");

  return (
    <Screen>
      <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-[max(24px,env(safe-area-inset-top))] sm:pt-12">
        <Logo className="h-14 w-14" />
        {step === "email" ? (
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                setError("Enter the email on your account.");
                return;
              }
              setError("");
              setStep("sent");
            }}
          >
            <h1 className="text-[28px] font-semibold text-[#0F172A]">Reset password</h1>
            <p className="mt-2 text-[14px] text-[#64748B]">We'll send a reset code to your email.</p>
            <div className="mt-5">
              <Field label="Email" required error={error}>
                <TextInput type="email" value={email} invalid={!!error} onChange={(event) => setEmail(event.target.value)} />
              </Field>
            </div>
            <div className="mt-6">
              <Button type="submit">Send code</Button>
            </div>
          </form>
        ) : null}
        {step === "sent" ? (
          <div className="mt-5">
            <SuccessMark />
            <h1 className="mt-5 text-center text-[22px] font-semibold text-[#0F172A]">Check your email</h1>
            <p className="mt-2 text-center text-[14px] leading-relaxed text-[#64748B]">
              If an account exists for {email}, a reset code is on the way. This preview uses a sample code.
            </p>
            <div className="mt-6">
              <Button onClick={() => setStep("otp")}>Enter code</Button>
            </div>
          </div>
        ) : null}
        {step === "otp" ? (
          <form
            className="mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (code !== "123456") {
                setError("That code is not valid. Use the preview code 123456.");
                return;
              }
              setError("");
              setStep("password");
            }}
          >
            <h1 className="text-[28px] font-semibold text-[#0F172A]">Enter code</h1>
            <p className="mt-2 text-[14px] text-[#64748B]">Preview code: 123456</p>
            <div className="mt-5">
              <Field label="6-digit code" required error={error}>
                <TextInput inputMode="numeric" maxLength={6} value={code} invalid={!!error} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="tracking-[0.4em]" />
              </Field>
            </div>
            <div className="mt-6">
              <Button type="submit">Continue</Button>
            </div>
          </form>
        ) : null}
        {step === "password" ? (
          <form
            className="mt-5 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (password.length < 8) {
                setError("Use at least 8 characters.");
                return;
              }
              if (password !== confirm) {
                setError("Passwords do not match.");
                return;
              }
              resetPassword(email, password);
              setError("");
              setStep("done");
            }}
          >
            <h1 className="text-[28px] font-semibold text-[#0F172A]">New password</h1>
            <Field label="New password" required>
              <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Strength password={password} />
            </Field>
            <Field label="Confirm password" required error={error}>
              <TextInput type="password" value={confirm} invalid={!!error} onChange={(event) => setConfirm(event.target.value)} />
            </Field>
            <Button type="submit">Update password</Button>
          </form>
        ) : null}
        {step === "done" ? (
          <div className="mt-8">
            <SuccessMark />
            <h1 className="mt-5 text-center text-[22px] font-semibold text-[#0F172A]">Password updated</h1>
            <p className="mt-2 text-center text-[14px] text-[#64748B]">You can log in with your new password.</p>
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
      </div>
    </Screen>
  );
}

export function SetupScreen() {
  const navigate = useNavigate();
  const { user, updateUser, hydrated } = useApp();
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/welcome", replace: true });
  }, [hydrated, user, navigate]);

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
    const nextErrors: Record<string, string> = {};
    if (!partial && step === 1) {
      if (!fullName.trim()) nextErrors.fullName = "Full name is required.";
      if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email.";
      if (digits(phone).length !== 10) nextErrors.phone = "Enter a 10-digit mobile number.";
    }
    if (!partial && step === 2) {
      if (user?.accountType === "business" && !companyName.trim()) nextErrors.companyName = "Company name is required.";
      if (!billingAddress.trim()) nextErrors.billingAddress = "Billing address is required.";
      if (!/^\S+@\S+\.\S+$/.test(billingEmail)) nextErrors.billingEmail = "Billing email is required.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
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

  const missing = profileGaps(user).length;

  return (
    <Screen>
      <div className="flex h-full flex-col overflow-y-auto px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] sm:pt-10">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[#64748B]">Step {step} of 2</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div className="h-full bg-[#003DF9] transition-all duration-200" style={{ width: step === 1 ? "50%" : "100%" }} />
        </div>
        <h1 className="mt-4 text-[28px] font-semibold text-[#0F172A]">{step === 1 ? "Personal details" : "Business and billing"}</h1>
        <p className="mt-2 text-[14px] text-[#64748B]">
          {missing ? "Booking stays closed until the required fields are complete." : "You can update these any time from your profile."}
        </p>
        {step === 1 ? (
          <div className="mt-5 space-y-4">
            <Field label="Profile photo" hint="Optional">
              <div className="flex items-center gap-3">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#F6F7FB]">
                  {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <span className="text-[12px] text-[#64748B]">Optional</span>}
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
            <Field label="Full name" required error={errors.fullName}>
              <TextInput value={fullName} invalid={!!errors.fullName} onChange={(event) => setFullName(event.target.value)} />
            </Field>
            <Field label="Email" required error={errors.email}>
              <TextInput type="email" value={email} invalid={!!errors.email} onChange={(event) => setEmail(event.target.value)} />
            </Field>
            <Field label="Mobile phone" required error={errors.phone}>
              <TextInput value={phone} invalid={!!errors.phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
            </Field>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <Field label="Company name" required={user?.accountType === "business"} error={errors.companyName}>
              <TextInput value={companyName} invalid={!!errors.companyName} onChange={(event) => setCompanyName(event.target.value)} />
            </Field>
            <Field label="Facility type">
              <select className={inputClass} value={facilityType} onChange={(event) => setFacilityType(event.target.value)}>
                {facilityTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>
            <Field label="Billing address" required error={errors.billingAddress}>
              <TextInput value={billingAddress} invalid={!!errors.billingAddress} onChange={(event) => setBillingAddress(event.target.value)} />
            </Field>
            <Field label="Billing email" required error={errors.billingEmail}>
              <TextInput id="billingEmail" type="email" value={billingEmail} invalid={!!errors.billingEmail} onChange={(event) => setBillingEmail(event.target.value)} />
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
      </div>
    </Screen>
  );
}
