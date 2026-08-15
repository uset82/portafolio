import Link from "next/link";

import { threadsFor } from "@/content/threads";

type ThreadChipsProps = {
  /** The project id as used in `flagship.ts` or `arcade.ts`. */
  projectId: string;
  /** Describes the set for screen readers, e.g. "Threads for MandelBro". */
  label: string;
};

/**
 * The cross-link layer. A chip says what a project is about and leads to
 * everything else on that thread, which is how work in different rooms finds
 * each other without adding a menu entry.
 */
export function ThreadChips({ projectId, label }: ThreadChipsProps) {
  const threads = threadsFor(projectId);
  if (threads.length === 0) return null;

  return (
    <ul className="thread-chips" aria-label={label}>
      {threads.map((thread) => (
        <li key={thread.id}>
          <Link href={`/threads/${thread.slug}`} prefetch={false}>
            {thread.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
