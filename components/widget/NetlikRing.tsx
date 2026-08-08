interface NetlikRingProps {
  size?: number;
  spinning?: boolean;
  className?: string;
}

export default function NetlikRing({
  size = 28,
  spinning = false,
  className = "",
}: NetlikRingProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      className={`${spinning ? "animate-spin" : ""} ${className}`}
      style={spinning ? { animationDuration: "1.4s" } : undefined}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="netlikRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-cyan)" />
          <stop offset="100%" stopColor="var(--accent-orange)" />
        </linearGradient>
      </defs>
      <circle
        cx="20"
        cy="20"
        r="16"
        fill="none"
        stroke="url(#netlikRingGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="70 30"
      />
    </svg>
  );
}
