interface ProjectMetaBarProps {
  role?: string;
  technologies?: string[];
  liveUrl?: string;
  repoUrl?: string;
}

export function ProjectMetaBar({ role, technologies, liveUrl, repoUrl }: ProjectMetaBarProps) {
  if (!role && !technologies?.length && !liveUrl && !repoUrl) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-4 border-y-2 border-ink py-6 sm:grid-cols-3">
      {role && (
        <div>
          <dt className="eyebrow-sm">Role</dt>
          <dd className="mt-1 text-sm text-ink">{role}</dd>
        </div>
      )}
      {technologies && technologies.length > 0 && (
        <div>
          <dt className="eyebrow-sm">Tech</dt>
          <dd className="mt-1 text-sm text-ink">{technologies.join(" · ")}</dd>
        </div>
      )}
      {(liveUrl || repoUrl) && (
        <div>
          <dt className="eyebrow-sm">Links</dt>
          <dd className="mt-1 flex flex-col gap-1 text-sm">
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
              >
                Live site ↗
              </a>
            )}
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink decoration-amber decoration-2 underline-offset-4 hover:underline"
              >
                Repository ↗
              </a>
            )}
          </dd>
        </div>
      )}
    </dl>
  );
}
