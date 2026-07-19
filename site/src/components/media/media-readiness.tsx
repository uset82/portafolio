import { StatusTag } from "@/components/ui";

const readinessItems = [
  {
    label: "Native audio",
    detail: "Mute-first player · transcript and approved source required",
  },
  {
    label: "Native video",
    detail: "Poster-first player · captions, transcript, and fallback required",
  },
  {
    label: "External media",
    detail: "Provider remains unloaded until the visitor gives consent",
  },
] as const;

export function MediaReadiness() {
  return (
    <section className="media-readiness" aria-labelledby="media-readiness-title">
      <div className="media-readiness__heading">
        <h2 id="media-readiness-title">Playback foundation</h2>
        <StatusTag tone="hold">Awaiting sources</StatusTag>
      </div>
      <ul>
        {readinessItems.map((item, index) => (
          <li key={item.label}>
            <span aria-hidden="true">0{index + 1}</span>
            <div>
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
