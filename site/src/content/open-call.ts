/**
 * The OpenEyes open call.
 *
 * The contact route publishes no email, form, or booking path. Instead it makes
 * one offer, and the offer needs somewhere to land. That somewhere is a public
 * GitHub repository: a submission is an issue, filed under GitHub's terms, on
 * the one account Carlos has approved for this portfolio. Nothing is collected
 * by this site, so the privacy boundaries on the page stay literally true.
 *
 * OpenEyes is a working project name for a proposal, not a funded programme and
 * not a company. Nothing here may claim partners, backing, or an accepted
 * application until those are real.
 */

/** The public intake repository. Must exist before this route ships. */
export const OPEN_CALL_REPOSITORY = "https://github.com/uset82/openeyes";

/**
 * Issue templates, addressed directly so a visitor lands on the right form on
 * GitHub rather than on a chooser they have to read first.
 */
export const OPEN_CALL_ROUTES = {
  opportunity: `${OPEN_CALL_REPOSITORY}/issues/new?template=opportunity.yml`,
  coFounder: `${OPEN_CALL_REPOSITORY}/issues/new?template=co-founder.yml`,
} as const;
