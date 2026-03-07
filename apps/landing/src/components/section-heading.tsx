interface SectionHeadingProps {
  anchorId?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  className?: string;
}

export function SectionHeading({
  anchorId,
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
  className = "",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  const eyebrowClass = tone === "inverse" ? "text-background/56" : "text-brand-500/80";
  const titleClass = tone === "inverse" ? "text-background" : "text-text-primary";
  const descriptionClass = tone === "inverse" ? "text-background/72" : "text-text-secondary";

  return (
    <div
      id={anchorId}
      className={`flex flex-col ${alignClass} ${className}`.trim()}
    >
      {eyebrow ? (
        <p className={`text-sm font-700 uppercase tracking-[0.24em] ${eyebrowClass}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`mt-4 max-w-3xl whitespace-pre-line font-display text-3xl font-700 tracking-tight sm:text-[2.5rem] sm:leading-[1.1] lg:text-[3rem] ${titleClass}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 max-w-2xl text-base leading-relaxed lg:text-lg ${descriptionClass}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
