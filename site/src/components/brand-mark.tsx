import Image from "next/image";

/* Carlos's approved CA²M monogram. It is decorative everywhere it appears —
 * each host already supplies the accessible name ("Carlos Alfredo Carpio Meza — home", the
 * CC AI dialog title), so the mark itself stays out of the accessibility tree. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={compact ? "brand-mark brand-mark--compact" : "brand-mark"} aria-hidden="true">
      <Image src="/images/brand/ca2m-mark.png" alt="" width={256} height={256} />
    </span>
  );
}
