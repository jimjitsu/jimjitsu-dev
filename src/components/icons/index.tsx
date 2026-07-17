import type { SVGProps } from "react";

/**
 * Flat-vector iconography — bold strokes, no fill, rendered with currentColor.
 * Drop into headings/eyebrows/links wherever a small bowling-alley accent
 * adds personality. Spec §8.5.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Icon({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** A bowling pin — the core motif. */
export function BowlingPinIcon(props: IconProps) {
  return (
    <Icon {...props}>
      {/* Pin silhouette */}
      <path d="M12 2c-2.4 0-3.5 2.2-3.5 5 0 1.6.4 2.6.4 4 0 1.7-2 3-2 6.5C6.9 20.2 9.2 22 12 22s5.1-1.8 5.1-4.5c0-3.5-2-4.8-2-6.5 0-1.4.4-2.4.4-4 0-2.8-1.1-5-3.5-5z" />
      {/* The two stripes near the neck */}
      <path d="M9 7.5h6" />
      <path d="M9.3 9.5h5.4" />
    </Icon>
  );
}

/** A bowling ball — circle with three finger holes. */
export function BowlingBallIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="9" r="0.6" fill="currentColor" />
      <circle cx="13" cy="8" r="0.6" fill="currentColor" />
      <circle cx="11.5" cy="11.5" r="0.6" fill="currentColor" />
    </Icon>
  );
}

/** A lane arrow — the directional triangle painted on bowling lanes. */
export function LaneArrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4 L20 18 L12 14 L4 18 Z" />
    </Icon>
  );
}

/** Strike — the X mark from a score sheet. */
export function StrikeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 5 L19 19" />
      <path d="M19 5 L5 19" />
    </Icon>
  );
}

/** Chat bubble — trigger icon for the Jimbo-t widget. */
export function ChatBubbleIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  );
}

/** Sparkle / stars — decorative flourish. */
export function StarburstIcon(props: IconProps) {
  return (
    <Icon {...props} strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </Icon>
  );
}
