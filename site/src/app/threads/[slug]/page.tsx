import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ActionLink, StatusTag } from "@/components/ui";
import { THREADS, findThread, projectsOnThread } from "@/content/threads";

type ThreadPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return THREADS.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { slug } = await params;
  const thread = findThread(slug);
  return thread ? { title: thread.label, description: thread.description } : {};
}

const roomLabel: Record<string, string> = {
  "/arcade": "Play it",
  "/sound": "Listen to it",
  "/work": "See it",
};

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { slug } = await params;
  const thread = findThread(slug);

  if (!thread) notFound();

  const projects = projectsOnThread(thread.id);
  const rooms = [...new Set(projects.map((project) => project.home))];

  return (
    <main id="main-content" className="thread-page">
      <section className="thread-page__hero" aria-labelledby="thread-title">
        <div className="thread-page__rail">
          <p className="section-label">Thread</p>
          <StatusTag tone="ready">{projects.length} projects</StatusTag>
        </div>

        <div className="thread-page__identity">
          <p>
            {rooms.length > 1
              ? `Across ${rooms.length} rooms of this site`
              : "All in one room of this site"}
          </p>
          <h1 id="thread-title">{thread.label}</h1>
          <strong>{thread.description}</strong>
        </div>
      </section>

      <section className="thread-page__list" aria-labelledby="thread-list-title">
        <header>
          <h2 id="thread-list-title">Everything on this thread.</h2>
          <p>
            Each one lives in a single place on this site. Follow it there for the full record
            rather than a second summary.
          </p>
        </header>

        <ul aria-label={`Projects on the ${thread.label} thread`}>
          {projects.map((project) => (
            <li key={project.id}>
              <div>
                <h3>{project.name}</h3>
                <p>{roomLabel[project.home] ?? "See it"}</p>
              </div>
              <Link href={project.home} prefetch={false}>
                <span>{project.home}</span>
                <span aria-hidden="true">&#8594;</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="thread-page__others" aria-labelledby="thread-others-title">
        <h2 id="thread-others-title">Other threads.</h2>
        <nav aria-label="Other threads">
          {THREADS.filter((candidate) => candidate.id !== thread.id).map((candidate) => (
            <ActionLink key={candidate.id} variant="secondary" href={`/threads/${candidate.slug}`}>
              {candidate.label}
            </ActionLink>
          ))}
        </nav>
      </section>
    </main>
  );
}
