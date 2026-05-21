interface SkillGroupProps {
  label: string;
  items: readonly string[];
}

export function SkillGroup({ label, items }: SkillGroupProps) {
  return (
    <div className="flex flex-col gap-3 border-2 border-ink p-4">
      <dt className="eyebrow-sm">{label}</dt>
      <dd>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item}
              className="bg-amber/20 border border-amber px-2 py-0.5 font-eyebrow text-xs tracking-[0.04em] text-ink"
            >
              {item}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}
