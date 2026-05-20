interface PageHeaderProps {
  eyebrow: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  headingLevel?: "h1" | "h2";
}

export function PageHeader({
  eyebrow,
  icon,
  title,
  description,
  headingLevel = "h1",
}: PageHeaderProps) {
  const Heading = headingLevel;
  return (
    <header className="flex flex-col gap-4">
      <p className="eyebrow flex items-center gap-2">
        {icon}
        {eyebrow}
      </p>
      <Heading className="display-heading">{title}</Heading>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-ink-muted">{description}</p>
      )}
    </header>
  );
}
