"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { submitLead } from "@/app/actions/submit-lead";
import { TexasMark } from "@/components/brand/TexasMark";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";
import { interest } from "@/content/site";
import { createZodResolver } from "@/lib/forms/zod-resolver";
import { leadSchema, type LeadFormValues } from "@/lib/leads/schema";

/** Ignores repeat submits fired inside this window (double-click, Enter spam). */
const RESUBMIT_GUARD_MS = 1_500;

const EMPTY_VALUES: LeadFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  role: "",
  referral: "",
  consent: false,
  website: "",
  turnstileToken: "",
};

export function LeadForm({ turnstileSiteKey }: { turnstileSiteKey: string | null }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const lastSubmitAt = useRef(0);
  const successRef = useRef<HTMLDivElement>(null);
  const errorId = useId();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: createZodResolver<LeadFormValues>(leadSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  // Move focus to the confirmation so keyboard and screen-reader users are not
  // left on a control that no longer exists.
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const onSubmit = useCallback(
    async (values: LeadFormValues) => {
      const now = Date.now();
      if (now - lastSubmitAt.current < RESUBMIT_GUARD_MS) return;
      lastSubmitAt.current = now;

      setFormError(null);

      const formData = new FormData();
      formData.set("firstName", values.firstName ?? "");
      formData.set("lastName", values.lastName ?? "");
      formData.set("email", values.email ?? "");
      formData.set("company", values.company ?? "");
      formData.set("role", values.role ?? "");
      formData.set("referral", values.referral ?? "");
      formData.set("consent", values.consent ? "true" : "false");
      formData.set("website", values.website ?? "");
      formData.set("turnstileToken", turnstileToken);

      try {
        const result = await submitLead(formData);

        if (result.status === "success") {
          setSubmitted(true);
          return;
        }

        if (result.status === "error") {
          if (result.fieldErrors) {
            for (const [field, message] of Object.entries(result.fieldErrors)) {
              if (!message) continue;
              setError(field as keyof LeadFormValues, {
                type: "server",
                message,
              });
            }
          }
          setFormError(result.message);
        }
      } catch {
        // Network failure, action unreachable, etc. The visitor sees one calm
        // message; the specifics stay in the server logs.
        setFormError(interest.genericError);
      }
    },
    [setError, turnstileToken],
  );

  if (submitted) {
    return <SuccessPanel ref={successRef} />;
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-2 lg:mt-1"
      aria-describedby={formError ? errorId : undefined}
    >
      {/* Two rows of three on desktop, exactly as the comp lays them out. */}
      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label={interest.fields.firstName.label}
          error={errors.firstName?.message}
          {...register("firstName")}
          autoComplete={interest.fields.firstName.autoComplete}
        />
        <Field
          label={interest.fields.lastName.label}
          error={errors.lastName?.message}
          {...register("lastName")}
          autoComplete={interest.fields.lastName.autoComplete}
        />
        <Field
          label={interest.fields.email.label}
          type="email"
          inputMode="email"
          error={errors.email?.message}
          {...register("email")}
          autoComplete={interest.fields.email.autoComplete}
        />
        <Field
          label={interest.fields.company.label}
          error={errors.company?.message}
          {...register("company")}
          autoComplete={interest.fields.company.autoComplete}
        />
        <Field
          label={interest.fields.role.label}
          error={errors.role?.message}
          {...register("role")}
          autoComplete={interest.fields.role.autoComplete}
        />
        <Field
          label={interest.fields.referral.label}
          hint={interest.fields.referral.optionalLabel}
          error={errors.referral?.message}
          {...register("referral")}
          autoComplete={interest.fields.referral.autoComplete}
          className="sm:col-span-2 lg:col-span-1"
        />
      </div>

      {/* Honeypot. Off-screen rather than display:none — some bots skip fields
          they can tell are hidden — and removed from the a11y tree and tab
          order so nobody using assistive tech ever meets it. */}
      <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website-url">Website</label>
        <input
          id="website-url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="mt-10">
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            {...register("consent")}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none border border-champagne-500/50 bg-transparent transition-colors duration-300 checked:border-champagne-400 checked:bg-champagne-500/80 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-champagne-400"
          />
          <span className="measure text-[0.92rem] font-light leading-[1.65] text-muted">
            {interest.consent}
          </span>
        </label>
      </div>

      {turnstileSiteKey && (
        <TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
      )}

      <AnimatePresence>
        {formError && (
          <motion.p
            id={errorId}
            role="alert"
            className="mt-8 border-l border-champagne-500/60 pl-4 text-[0.92rem] font-light leading-[1.6] text-champagne-300"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {formError}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-12 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative inline-flex items-center justify-center overflow-hidden bg-champagne-500 px-9 py-3.5 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-ink transition-[background-color,opacity] duration-500 hover:bg-champagne-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-px">
            {isSubmitting ? interest.submittingLabel : interest.submitLabel}
          </span>

          {/* Loading state: a champagne hairline traversing the button edge.
              No spinner — a spinner would be the loudest thing on the page. */}
          {isSubmitting && !prefersReducedMotion && (
            <motion.span
              aria-hidden
              className="absolute bottom-0 left-0 h-px w-1/3 bg-ink/45"
              animate={{ x: ["-110%", "330%"] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
            />
          )}
        </button>

        <p className="flex items-center gap-2.5 text-[0.78rem] font-light leading-[1.6] text-faint">
          <LockGlyph />
          {interest.privacyNote}
        </p>
      </div>

      {/* Announced politely so assistive tech reports the pending state. */}
      <p className="sr-only" aria-live="polite">
        {isSubmitting ? "Submitting your request." : ""}
      </p>
    </form>
  );
}

/**
 * The small champagne padlock beside the privacy line, as in the comp.
 * Decorative — the sentence next to it already says everything.
 */
function LockGlyph() {
  return (
    <svg
      viewBox="0 0 12 14"
      className="h-3.5 w-3 shrink-0 text-champagne-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden
      focusable="false"
    >
      <rect x="0.75" y="5.75" width="10.5" height="7.5" rx="1" />
      <path d="M3.25 5.75V3.9a2.75 2.75 0 0 1 5.5 0v1.85" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

type FieldProps = React.ComponentPropsWithRef<"input"> & {
  label: string;
  hint?: string;
  error?: string;
};

/**
 * A single labelled field.
 *
 * The label is a real <label>, always visible — never a placeholder standing in
 * for one. Errors are wired through aria-describedby and announced.
 */
function Field({ label, hint, error, className, ...props }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    // A flex column with the input pushed to the bottom, so a label that wraps
    // to two lines never knocks its row of inputs out of alignment.
    <div className={`flex h-full flex-col ${className ?? ""}`}>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="font-sans text-[0.68rem] font-medium uppercase tracking-[0.24em] text-faint"
        >
          {label}
        </label>
        {hint && (
          <span className="font-sans text-[0.64rem] uppercase tracking-[0.2em] text-faint/70">
            {hint}
          </span>
        )}
      </div>

      {/* Spacer: pushes the input to the bottom of the cell. */}
      <span aria-hidden className="grow" />

      <input
        id={id}
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="focus-ring-custom mt-2 w-full border border-rule-soft bg-navy-950/60 px-4 py-3 text-[0.95rem] font-light text-ivory-50 transition-colors duration-500 hover:border-champagne-500/40 focus:border-champagne-400 focus-visible:outline-none"
      />

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-[0.8rem] font-light leading-[1.5] text-champagne-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Confirmation state. Replaces the form entirely, receives focus, and is
 * announced. The Texas mark and the rule beneath it draw in gently — the one
 * flourish on the page that is purely celebratory.
 */
function SuccessPanel({ ref }: { ref: React.Ref<HTMLDivElement> }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="mt-14 border-t border-rule pt-14 focus:outline-none md:mt-16 md:pt-16"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.span
        className="block text-champagne-500"
        initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      >
        <TexasMark className="h-9 w-auto" />
      </motion.span>

      <motion.span
        aria-hidden
        className="mt-8 block h-px w-full max-w-md origin-left"
        style={{
          background:
            "linear-gradient(to right, rgba(200,161,90,0.75), rgba(200,161,90,0.05))",
        }}
        initial={prefersReducedMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />

      <h3 className="mt-10 font-display text-[clamp(1.7rem,1.3rem+1.8vw,2.8rem)] font-light uppercase tracking-[0.14em] text-ivory-50">
        {interest.success.title}
      </h3>

      <p className="measure mt-6 text-[clamp(1rem,0.95rem+0.26vw,1.1rem)] font-light leading-[1.8] text-muted">
        {interest.success.body}
      </p>
    </motion.div>
  );
}
