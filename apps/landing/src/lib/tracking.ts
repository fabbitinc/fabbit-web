type EventName =
  | "hero_cta_click"
  | "demo_cta_click"
  | "problem_section_view"
  | "feature_section_view"
  | "pricing_section_view"
  | "lead_form_start"
  | "lead_form_submit"
  | "qualified_lead";

export function trackEvent(event: EventName, data?: Record<string, string>) {
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as Record<string, (...args: unknown[]) => void>).gtag(
      "event",
      event,
      data,
    );
  }
  console.debug("[track]", event, data);
}
