/**
 * The paper the redox flow battery prototype came out of.
 *
 * This is somebody else's research, and the story route says so in as many
 * words. Carlos is not an author, was not involved in the work, and claims no
 * connection to the people who did it. What the page claims is narrower and
 * true: he read it, he had no background in the subject, and he built a
 * prototype afterwards.
 *
 * The paper is open access under CC BY 4.0, which permits reuse and requires
 * attribution — so the title, both authors, the journal, the volume and pages,
 * the licence and the DOI are all carried here rather than paraphrased away.
 *
 * The link is the DOI, deliberately. The publisher's own CDN hands out URLs
 * carrying an expiry and a signature; one of those on a page would be a dead
 * link within weeks and would leak a credential in the meantime.
 */
export const OPPORTUNITY_PAPER = {
  title:
    "Next-generation vanadium redox flow batteries: harnessing ionic liquids for enhanced performance",
  authors: "Kalyan Sundar Krishna Chivukula and Yansong Zhao",
  journal: "RSC Advances",
  citation: "2025, 15, 25310–25321",
  published: "17 July 2025",
  /** The authors' own department, and the same institution Carlos studies at. */
  institution:
    "Department of Safety, Chemistry and Biomedical Laboratory Sciences, Western Norway University of Applied Sciences (HVL), Bergen",
  licence: "CC BY 4.0",
  doi: "10.1039/d5ra02901e",
  href: "https://doi.org/10.1039/d5ra02901e",
} as const;

/**
 * The prototype that followed, on the account Carlos publishes it from.
 *
 * A demonstration, and nothing more than that: no performance figure, no
 * comparison against the paper, no claim that anything was validated.
 */
export const OPPORTUNITY_PROTOTYPE = {
  href: "https://www.tiktok.com/@carloscarpio82/video/7627784389979770114",
} as const;
