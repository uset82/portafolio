import { EditorialHeading } from "@/components/ui";
import type { AnaDebugSnapshot } from "@/ana/debug";

const formatLatency = (runtimeMs: number): string =>
  runtimeMs < 1_000 ? `${Math.round(runtimeMs)}ms` : `${(runtimeMs / 1_000).toFixed(1)}s`;

const formatTokens = (tokens: AnaDebugSnapshot["tokens"]): string =>
  tokens.reported ? `${tokens.input} in / ${tokens.output} out` : "not reported";

type AnaDebugDashboardProps = {
  snapshots: readonly AnaDebugSnapshot[];
};

export function AnaDebugDashboard({ snapshots }: AnaDebugDashboardProps) {
  return (
    <main id="main-content" className="interior-main ana-debug">
      <div className="layout-container ana-debug__intro">
        <p className="section-label">Internal / ANA</p>
        <EditorialHeading level={1} id="ana-debug-title">
          ANA debug
        </EditorialHeading>
        <p className="prose">
          Observability for orchestrator runs in this process. This is not a visitor assistant and
          does not replace CC AI.
        </p>
      </div>
      {snapshots.length === 0 ? (
        <p className="layout-container prose ana-debug__empty">No recorded ANA runs.</p>
      ) : (
        <ol className="layout-container ana-debug__runs">
          {snapshots.map((snapshot) => (
            <li key={`${snapshot.requestId}:${snapshot.traceId}`}>
              <article className="ana-debug__run" aria-labelledby={`${snapshot.traceId}-request`}>
                <p className="ana-debug__ids">
                  <span>
                    Request ID <code>{snapshot.requestId}</code>
                  </span>
                  <span>
                    Trace ID <code>{snapshot.traceId}</code>
                  </span>
                </p>
                <section>
                  <h2 id={`${snapshot.traceId}-request`}>Request</h2>
                  <p>&ldquo;{snapshot.request.preview}&rdquo;</p>
                </section>
                <section>
                  <h2>Plan</h2>
                  <p>
                    {snapshot.plan.agentCount} {snapshot.plan.agentCount === 1 ? "agent" : "agents"}
                  </p>
                </section>
                <section>
                  <h2>Active</h2>
                  {snapshot.active.length === 0 ? (
                    <p>None</p>
                  ) : (
                    <ul>
                      {snapshot.active.map((agentId) => (
                        <li key={agentId}>{agentId}</li>
                      ))}
                    </ul>
                  )}
                </section>
                <section>
                  <h2>Latency</h2>
                  {snapshot.latency.length === 0 ? (
                    <p>None</p>
                  ) : (
                    <dl>
                      {snapshot.latency.map((entry) => (
                        <div key={`${entry.agentId}:${entry.capability}`}>
                          <dt>
                            {entry.agentId} / {entry.capability}
                          </dt>
                          <dd>{formatLatency(entry.runtimeMs)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </section>
                <section>
                  <h2>Tokens</h2>
                  <p>{formatTokens(snapshot.tokens)}</p>
                </section>
                <section>
                  <h2>Cost</h2>
                  <p>
                    {snapshot.cost.units} / {snapshot.cost.limit} units
                  </p>
                </section>
                <section>
                  <h2>Result</h2>
                  <p>
                    {snapshot.result.status === "answered" ? "Success" : snapshot.result.status}
                  </p>
                  {snapshot.result.errors.length > 0 ? (
                    <ul>
                      {snapshot.result.errors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </article>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
