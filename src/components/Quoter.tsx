import { useEffect, useRef } from "react";
import { useQuoter, type QuoterLabels } from "./useQuoter";
import { formatAnswersMessage, type QuoterAnswerRecord, type QuoterQuestion } from "@/lib/quoter";
import CalWidget from "./CalWidget";

export interface QuoterSecondaryCta {
  label: string;
  eventSlug: string;
}

export interface QuoterProps {
  instanceId: string;
  sectionTitle: string;
  questions: QuoterQuestion[];
  whatsappNumber: string;
  whatsappTemplate: string;
  className?: string;
  onSubmit?: (answers: QuoterAnswerRecord) => void;
  labels?: QuoterLabels;
  secondaryCta?: QuoterSecondaryCta;
  collectContact?: boolean;
  introText?: string;
  /**
   * The background of the section the quoter is placed in. The card takes the
   * other one, so it always reads as a panel sitting on the page rather than
   * dissolving into it. Callers pass their own section background here, not
   * the colour they want the card to be.
   */
  surface?: "paper" | "substrate";
}

/**
 * Card fill and option hover, each the opposite of the host section. Fields
 * take the section colour back, so an input never sits on the same fill as
 * the card it is drawn on whichever way round the pair is used.
 */
const SURFACE = {
  paper: { card: "bg-substrate", field: "bg-paper", optionHover: "hover:bg-paper" },
  substrate: { card: "bg-paper", field: "bg-substrate", optionHover: "hover:bg-substrate" },
} as const;

const optionButtonClass = (checked: boolean, optionHover: string) =>
  `flex min-h-13 w-full cursor-pointer items-center gap-3 border px-5 py-3.5 text-left text-lead-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss ${
    checked
      ? "border-moss bg-moss text-paper"
      : `border-rule text-ink hover:border-moss ${optionHover}`
  }`;

export default function Quoter({
  instanceId,
  sectionTitle,
  questions,
  whatsappNumber,
  whatsappTemplate,
  className,
  onSubmit,
  labels,
  secondaryCta,
  collectContact,
  introText,
  surface = "paper",
}: QuoterProps) {
  const { card, field, optionHover } = SURFACE[surface];
  const cardClass = `relative border border-rule-strong ${card} ${className ?? ""}`;
  const fieldClass = `w-full border border-rule ${field} px-4 py-3 text-lead text-ink placeholder:text-mute focus:border-moss focus:outline-none`;

  const q = useQuoter({
    questions,
    sectionTitle,
    whatsappNumber,
    whatsappTemplate,
    labels,
    onSubmit,
    collectContact,
  });
  const t = q.labels;
  const rootRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  }, [q.stepIndex, q.showContact, q.showSummary, q.showThankYou]);

  if (q.showThankYou) {
    return (
      <div
        ref={rootRef}
        data-quoter-instance={instanceId}
        className={cardClass}
      >
        <div className="h-1.5 w-full bg-fern" />
        <div className="p-6 sm:p-10">
          <p className="font-display text-xl text-ink">{t.thankYouMessage}</p>
        </div>
      </div>
    );
  }

  const introBlock = introText && (
    <p className="mb-6 max-w-2xl text-lead-sm text-graphite">{introText}</p>
  );

  if (q.showContact) {
    return (
      <>
      {introBlock}
      <div
        ref={rootRef}
        data-quoter-instance={instanceId}
        className={cardClass}
      >
        <div className="h-1.5 w-full bg-fern" />
        <div className="p-6 sm:p-10">
          <h3 className="font-display text-xl text-ink">{t.contactStepTitle}</h3>
          <p className="mt-1.5 text-sm text-mute">{t.contactHint}</p>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label htmlFor={`${instanceId}-contact-name`} className="text-sm font-medium text-ink">
                {t.contactNameLabel}
              </label>
              <input
                id={`${instanceId}-contact-name`}
                type="text"
                value={q.contactName}
                onChange={(e) => q.setContactName(e.target.value)}
                placeholder={t.contactNamePlaceholder}
                className={`mt-1.5 ${fieldClass}`}
              />
            </div>
            <div>
              <label htmlFor={`${instanceId}-contact-email`} className="text-sm font-medium text-ink">
                {t.contactEmailLabel}
              </label>
              <input
                id={`${instanceId}-contact-email`}
                type="email"
                value={q.contactEmail}
                onChange={(e) => q.setContactEmail(e.target.value)}
                placeholder={t.contactEmailPlaceholder}
                className={`mt-1.5 ${fieldClass}`}
              />
            </div>
            <div>
              <label htmlFor={`${instanceId}-contact-phone`} className="text-sm font-medium text-ink">
                {t.contactPhoneLabel}
              </label>
              <input
                id={`${instanceId}-contact-phone`}
                type="tel"
                value={q.contactPhone}
                onChange={(e) => q.setContactPhone(e.target.value)}
                placeholder={t.contactPhonePlaceholder}
                className={`mt-1.5 ${fieldClass}`}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={q.goBack}
              className="border border-rule px-6 py-3 text-left text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
            >
              {t.back}
            </button>
            <button
              type="button"
              disabled={!q.contactAnswered}
              onClick={q.goNext}
              className="bg-moss px-6 py-3 text-left text-sm font-medium text-paper transition-colors duration-200 hover:bg-ink-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (q.showSummary) {
    return (
      <>
      {introBlock}
      <div
        ref={rootRef}
        data-quoter-instance={instanceId}
        className={cardClass}
      >
        <div className="h-1.5 w-full bg-fern" />
        <div className="p-6 sm:p-10">
          <h3 className="font-display text-xl text-ink">{t.summaryTitle}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {q.questions.map((question) => {
              const summary = q.summaryFor(question);
              if (!summary) return null;
              return (
                <li key={question.id} className="border-b border-rule pb-3 text-sm text-graphite">
                  <span className="text-ink">{question.label}</span>
                  <br />
                  {summary}
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <label htmlFor={`${instanceId}-extra-notes`} className="font-display text-lead text-ink">
              {t.extraNotesTitle}
            </label>
            <textarea
              id={`${instanceId}-extra-notes`}
              rows={3}
              maxLength={q.extraNotesMaxLength}
              value={q.extraNotes}
              onChange={(e) => q.setExtraNotes(e.target.value)}
              placeholder={t.extraNotesPlaceholder}
              className={`mt-3 resize-none ${fieldClass}`}
            />
            <p className="mt-1 text-right text-xs text-mute">{q.charactersLeftText}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={q.goBack}
              className="border border-rule px-6 py-3 text-left text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={q.handleSend}
              className="flex items-center gap-2.5 bg-moss px-6 py-3 text-left text-sm font-medium text-paper transition-colors duration-200 hover:bg-ink-soft active:scale-[0.99]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4.5 w-4.5">
                <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
                <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.84 9.84 0 0 0 4.69 1.19h.01c5.43 0 9.85-4.42 9.85-9.86A9.8 9.8 0 0 0 19 4.87 9.8 9.8 0 0 0 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.17-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.34c0-4.52 3.68-8.2 8.2-8.2a8.14 8.14 0 0 1 5.8 2.41 8.14 8.14 0 0 1 2.4 5.8c0 4.52-3.68 8.19-8.2 8.19Z" />
              </svg>
              {t.sendToWhatsApp}
            </button>
            {secondaryCta && (
              <CalWidget
                eventSlug={secondaryCta.eventSlug}
                triggerLabel={secondaryCta.label}
                mode="popup"
                theme={{ brandColor: "#000000", borderRadius: 0 }}
                prefillName={q.contactName || undefined}
                prefillEmail={q.contactEmail || undefined}
                prefillNotes={formatAnswersMessage(
                  q.questions,
                  q.answers,
                  t.otherLabel,
                  t.unspecified,
                  q.extraNotes,
                  t.extraNotesLabel,
                )}
                onBookingSuccess={q.handleBookingSuccess}
                className="border border-rule px-6 py-3 text-left text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
              />
            )}
          </div>
        </div>
      </div>
      </>
    );
  }

  const question = q.question;
  if (!question) return null;

  return (
    <>
    {introBlock}
    <div
      ref={rootRef}
      data-quoter-instance={instanceId}
      className={cardClass}
    >
      <div className="h-1.5 w-full bg-rule">
        <div
          className="h-full bg-fern transition-[width] duration-300"
          style={{ width: `${Math.max(q.progress, q.total ? 100 / q.total / 2 : 0)}%` }}
        />
      </div>
      <div className="p-6 sm:p-10">
        <p className="font-mono text-xs tracking-wide text-mute uppercase">
          {t.step.replace("{current}", String(q.stepIndex + 1)).replace("{total}", String(q.total))}
        </p>
        <fieldset className="mt-3">
          <legend className="font-display text-xl text-ink">{question.label}</legend>
          <p className="mt-1.5 text-sm text-mute">
            {question.type === "single" ? t.singleSelectHint : t.multiSelectHint}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const checked = q.isOptionSelected(option.id);
              return (
                <div key={option.id} className={option.includeOtherField ? "sm:col-span-2" : undefined}>
                  <label className={optionButtonClass(checked, optionHover)}>
                    <input
                      type={question.type === "single" ? "radio" : "checkbox"}
                      name={question.id}
                      checked={checked}
                      onChange={() => q.selectOption(option.id)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                  {q.showsOtherField(option.id) && (
                    <input
                      type="text"
                      maxLength={100}
                      value={q.answer?.otherValue ?? ""}
                      onChange={(e) => q.setOtherValue(e.target.value)}
                      placeholder={option.otherFieldPlaceholder}
                      className="mt-2 w-full border border-rule px-4 py-3 text-lead text-ink placeholder:text-mute focus:border-moss focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-8 flex gap-3">
          {q.stepIndex > 0 && (
            <button
              type="button"
              onClick={q.goBack}
              className="border border-rule px-6 py-3 text-left text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
            >
              {t.back}
            </button>
          )}
          <button
            type="button"
            disabled={!q.answered}
            onClick={q.goNext}
            className="bg-moss px-6 py-3 text-left text-sm font-medium text-paper transition-colors duration-200 hover:bg-ink-soft active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
