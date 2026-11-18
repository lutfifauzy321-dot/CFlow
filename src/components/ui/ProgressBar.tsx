type ProgressBarProps = {
  value: number;
  max: number;
  color?: string;
  label: string;
};

export function ProgressBar({ value, max, color = "var(--primary)", label }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-surface-alt"
    >
      <div
        className="h-full rounded-full transition-[width] duration-300"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}
