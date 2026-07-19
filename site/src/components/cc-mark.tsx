export function CcMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "cc-mark cc-mark--compact" : "cc-mark"} aria-hidden="true">
      <span>CC</span>
    </span>
  );
}
