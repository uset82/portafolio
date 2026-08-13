import { REDACTED } from "../privacy/mask";

const ISO_DATE = /\b\d{4}-\d{2}-\d{2}\b/g;
const CLOCK_TIME = /\b\d{1,2}:\d{2}\b/g;
const MONTH_DATE =
  /\b(?:\d{1,2}\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})\b/gi;
const NAMED_INTRO = /\bmy name is [a-z][a-z\s'-]{1,80}?(?=[.,]|$)/gi;
const BORN_CLAUSE = /\bi was born\b[^.?!]{0,80}/gi;
const PLACE_CLAUSE = /\bin\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?\b/g;

export const redactDebugPreview = (message: string, maxLength = 200): string => {
  const redacted = message
    .replace(ISO_DATE, REDACTED)
    .replace(MONTH_DATE, REDACTED)
    .replace(CLOCK_TIME, REDACTED)
    .replace(NAMED_INTRO, `my name is ${REDACTED}`)
    .replace(BORN_CLAUSE, `I was born ${REDACTED}`)
    .replace(PLACE_CLAUSE, `in ${REDACTED}`)
    .replace(/\s+/g, " ")
    .trim();
  if (redacted.length <= maxLength) return redacted;
  return `${redacted.slice(0, maxLength - 1).trimEnd()}…`;
};
