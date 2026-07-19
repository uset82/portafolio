import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="not-found">
      <p className="section-label">404 / Unknown instrument</p>
      <h1>This instrument is not in the observatory.</h1>
      <p>The address may have changed, or the system has not been published.</p>
      <div className="hero-actions">
        <Link className="primary-action" href="/">
          Return home
        </Link>
        <Link className="secondary-action" href="/work">
          Browse work <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
