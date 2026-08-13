import { extractProvided, understandIntent } from "./intent";
import { anaRequestSchema, type AnaPlan, type AnaRequest } from "./schemas";

export {
  extractProvided,
  hintCapability,
  isAskPortfolioQuestion,
  understandIntent,
} from "./intent";

export const parseAnaRequest = (value: unknown): AnaRequest => anaRequestSchema.parse(value);

export const draftPlan = (
  request: AnaRequest,
): Omit<AnaPlan, "steps" | "missingInputs" | "unavailableAgents" | "dag"> => {
  const parsed = parseAnaRequest(request);
  const { kind, goals, domains } = understandIntent(parsed.message);
  return {
    kind,
    goals,
    domains,
    provided: extractProvided(parsed),
  };
};
