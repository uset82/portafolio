import { ActionLink, StatusTag } from "@/components/ui";
import type { SiteMetadata } from "@/content/schemas";

type SoundFoundationProps = {
  content: SiteMetadata["mediaTeaser"];
};

const formatRequirements = [
  {
    name: "Music",
    index: "01",
    description:
      "A considered track selection with a title, artwork or an intentional text fallback, complete credits, duration, reuse rights, and an approved source.",
    accessibility: "Transcript or listening notes · visible manual controls · external fallback",
  },
  {
    name: "Moving image",
    index: "02",
    description:
      "A focused film or performance selection with a poster, complete credits, reuse rights, and an approved native file or consent-gated host.",
    accessibility: "Captions · transcript · poster-first loading · external fallback",
  },
] as const;

const publicationGate = [
  {
    label: "Source and rights",
    state: "Required",
    detail: "Ownership, permission, credits, and the exact public source must be approved.",
  },
  {
    label: "Accessible context",
    state: "Required",
    detail: "Captions, transcripts, listening notes, and meaningful poster text must be ready.",
  },
  {
    label: "Playback behavior",
    state: "Mute-first",
    detail: "Playback must begin only after a visitor chooses it, with visible native controls.",
  },
  {
    label: "Provider privacy",
    state: "Consent first",
    detail: "An external provider stays unloaded until its privacy cost is clear and accepted.",
  },
] as const;

export function SoundFoundation({ content }: SoundFoundationProps) {
  return (
    <main id="main-content" className="sound-foundation">
      <section className="sound-foundation__hero" aria-labelledby="sound-foundation-title">
        <div className="sound-foundation__rail">
          <p className="section-label">Sound + moving image / Public room</p>
          <StatusTag tone="hold">{content.status}</StatusTag>
        </div>

        <div className="sound-foundation__identity">
          <p>Mute-first media practice</p>
          <h1 id="sound-foundation-title">Music, harmonic instruments, and responsive systems.</h1>
          <strong>{content.heading}</strong>
          <small>{content.description}</small>
        </div>

        <div className="sound-foundation__instrument" aria-hidden="true">
          <span>Silent score / 02</span>
          <div className="sound-foundation__disc">
            <i />
            <i />
            <i />
            <strong>00</strong>
          </div>
          <div className="sound-foundation__staff">
            <i />
            <i />
            <i />
            <i />
            <i />
            <b />
          </div>
          <small>No source loaded</small>
        </div>
      </section>

      <section className="sound-foundation__formats" aria-labelledby="sound-formats-title">
        <header>
          <p className="section-label">Formats / 01</p>
          <h2 id="sound-formats-title">Two lanes, held to the same publication standard.</h2>
          <p>
            These are format definitions, not published works. They make the intended experience
            legible while the actual selection, credits, and rights remain under review.
          </p>
        </header>

        <ol aria-label="Media formats in preparation">
          {formatRequirements.map((format) => (
            <li key={format.name}>
              <span>{format.index}</span>
              <div>
                <p>Format in preparation</p>
                <h3>{format.name}</h3>
              </div>
              <p>{format.description}</p>
              <small>{format.accessibility}</small>
              <i aria-hidden="true">↗</i>
            </li>
          ))}
        </ol>
      </section>

      <section className="sound-foundation__gate" aria-labelledby="sound-gate-title">
        <header>
          <p className="section-label">Publication gate / 02</p>
          <h2 id="sound-gate-title">Playback begins only when the record is complete.</h2>
          <p>
            Every work must pass all four checks. A working player without provenance,
            accessibility, or a privacy-safe loading path is not ready for this portfolio.
          </p>
        </header>

        <dl>
          {publicationGate.map((item, index) => (
            <div key={item.label}>
              <dt>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {item.label}
              </dt>
              <dd>
                <strong>{item.state}</strong>
                <small>{item.detail}</small>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sound-foundation__boundary" aria-labelledby="sound-boundary-title">
        <div className="sound-foundation__boundary-mark" aria-hidden="true">
          <span>Playback / 00</span>
          <strong>OFF</strong>
          <i />
          <small>Approval hold</small>
        </div>

        <div className="sound-foundation__boundary-copy">
          <p className="section-label">Available now / 03</p>
          <h2 id="sound-boundary-title">A useful room, without a pretend player.</h2>
          <p>
            No track catalog, video, autoplay, waveform, analyser, embed, or provider request is
            present. The page stays quiet until Carlos approves the sources and the complete public
            record for each work.
          </p>
          <nav aria-label="Sound route alternatives">
            <ActionLink variant="primary" href="/work">
              Explore Work
            </ActionLink>
            <ActionLink variant="secondary" href="/contact">
              Visit Contact
            </ActionLink>
          </nav>
        </div>
      </section>
    </main>
  );
}
