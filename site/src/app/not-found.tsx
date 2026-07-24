import { RecoveryState } from "@/components/recovery-state";

export default function NotFound() {
  return (
    <main id="main-content" className="recovery-page">
      <RecoveryState
        className="layout-container recovery-state--not-found"
        eyebrow="404 / Unknown coordinate"
        title="This instrument is outside the observatory."
        description="The address may have changed, or the system has not been published. Nothing is lost—choose a known route to continue."
        marker="404"
        headingLevel={1}
        primaryAction={{ href: "/", label: "Return to the Observatory" }}
        secondaryAction={{ href: "/work", label: "Browse work" }}
      />
    </main>
  );
}
