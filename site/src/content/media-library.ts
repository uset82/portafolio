/**
 * The music and video library.
 *
 * Carlos's Suno and YouTube profiles are public and confirmed by him, so they
 * are linked here. Individual tracks and videos are added only once he supplies
 * the URL, which keeps invented titles, durations and dates out of the build.
 *
 * One rights question is still open and is tracked as `M.11`: Suno's free tier
 * does not grant the same commercial rights as a paid tier, so `licence` on a
 * track must state what is actually true for that track rather than assuming.
 */

export type MusicTrack = {
  id: string;
  title: string;
  /** The public Suno song page. Required - this is the proof it is published. */
  url: string;
  /**
   * Suno's own audio file. When present the page plays the song with its own
   * controls, so a visitor presses play once instead of loading a provider's
   * application first. Nothing is requested from Suno until that press.
   */
  audioUrl?: string;
  /** Suno's embeddable player, for a song with no direct file. */
  embedUrl?: string;
  /** ISO date the song was published, when known. */
  publishedOn?: string;
  /** What is actually true about reuse for this track. Never assumed. */
  licence: string;
  description?: string;
};

export type VideoWork = {
  id: string;
  title: string;
  /** The public YouTube watch URL. */
  url: string;
  /** The video id, used to build a privacy-enhanced embed URL. */
  videoId: string;
  publishedOn?: string;
  description?: string;
  /**
   * A local copy of the video's own first frame, so the shelf looks like the
   * video it is offering instead of an empty panel. Serving it from this site
   * keeps the provider uncontacted until the visitor asks for the player.
   */
  poster?: { src: string; alt: string; width: number; height: number };
};

/**
 * Tracks Carlos has sent for publication, in the order he sent them.
 *
 * `ABC on Crete Beach` is reachable by link but is not listed on his Suno
 * profile, so the profile link alone will not lead a visitor to it. Its title
 * is copied exactly as Suno stores it, ellipsis and all.
 */
export const MUSIC_TRACKS: readonly MusicTrack[] = [
  {
    id: "abc-on-crete-beach",
    title: "ABC on Crete Beach — Greek x Indi… x ZORBA vs PUNJABI — BEACH BATTLE (Mashup)",
    url: "https://suno.com/song/474592ab-7d93-4307-831b-7e447b11c11a",
    audioUrl: sunoAudioUrl("474592ab-7d93-4307-831b-7e447b11c11a"),
    description:
      "Greek zorba and sirtaki traded against Punjabi bhangra, with the bouzouki always on top.",
    licence:
      "Made by Carlos with Suno and put here by him. Listening is free; this page grants no reuse rights.",
  },
];

/**
 * Videos Carlos has sent for publication, in the order he sent them.
 *
 * Unlike the Suno song, these are listed on his channel, so their publication
 * dates can be shown. Titles are YouTube's own, and the watch URLs drop the
 * share tokens his links carried.
 *
 * Each poster is a local copy of the video's own frame. Serving it from here is
 * what keeps YouTube uncontacted until a visitor actually asks for the player.
 */
export const VIDEO_WORKS: readonly VideoWork[] = [
  {
    id: "hedra-seedance-2-5",
    title: "HEDRA × SEEDANCE 2.5",
    url: "https://www.youtube.com/watch?v=030X0DYiDS8",
    videoId: "030X0DYiDS8",
    publishedOn: "2026-08-10",
    description:
      "The song above as a video, generated in Hedra with Seedance 2.5. Three minutes fifty-three.",
    poster: {
      src: "/images/hedra-seedance-poster.jpg",
      alt: "Four dancers in Punjabi dress leap barefoot on a Greek beach, with whitewashed houses, bougainvillea and a wooden fishing boat behind them. Overlaid title text reads: Turn your images to life and make them dance, with Hedra + Seedance 2.5.",
      width: 1280,
      height: 720,
    },
  },
  {
    id: "the-second-flood",
    title: "THE SECOND FLOOD",
    url: "https://www.youtube.com/watch?v=jDZoQFzxnMQ",
    videoId: "jDZoQFzxnMQ",
    publishedOn: "2026-08-14",
    description:
      "Made for XPRIZE's FUTURE VISION contest with Flow by Google. Biblical, prophetic, futuristic: what has been will be again — unless we learn. A week of generating, fixing continuity, and rewriting the script around what Flow would render. Three minutes ten.",
    poster: {
      src: "/images/second-flood-poster.jpg",
      alt: "Split scene under a lightning storm. On the left a bearded man in rope-bound sackcloth stands before a large wooden ark under construction. On the right a white humanoid robot marked AURA-9 and two men wade through a flooded city of curved white towers, lifting a lit survival pod with a sleeping person inside. Overlaid title text reads: THE SECOND FLOOD, WILL WE LEARN?",
      width: 1280,
      height: 720,
    },
  },
];

export const MUSIC_PROFILE = {
  platform: "Suno",
  handle: "uset182",
  url: "https://suno.com/@uset182",
  description:
    "Tracks arrive on this page one at a time, as the rights on each one are confirmed. The full catalogue stays on Suno.",
} as const;

export const VIDEO_PROFILE = {
  platform: "YouTube",
  handle: "cucciolo182",
  url: "https://www.youtube.com/@cucciolo182",
  description:
    "The video channel. Selected pieces are embedded here once each one is confirmed as published and cleared.",
} as const;

export const SOUND_ROOM = {
  eyebrow: "Sound / 02",
  heading: "Music you can hear, and video you can watch.",
  description:
    "Music made with Suno, video published on YouTube, and StrudelAI — a live-coding music system open for testing.",
  emptyState: {
    music:
      "No track is embedded here yet. The full published catalogue is on Suno in the meantime.",
    video:
      "No video is embedded here yet. The full published channel is on YouTube in the meantime.",
  },
  playbackNote:
    "Press play and the music streams straight from Suno; nothing is asked of anyone before that. Video players still load on click, and the StrudelAI test build opens in its own site.",
} as const;

export const STRUDEL_AI = {
  title: "StrudelAI",
  status: "Open for testing",
  summary:
    "A public live-coding music system. The build is ready for people to try, and people who want to contribute are welcome.",
  demoUrl: "https://strudelzeroai.app.canner.ca/",
  demoLabel: "Open the test build",
  repositoryUrl: "https://github.com/uset82/StrudelAI",
  repositoryLabel: "View the repository",
} as const;

/**
 * Privacy-enhanced YouTube embed: no cookies until playback actually starts.
 *
 * `autoplay` is honest here rather than intrusive. The frame is mounted only
 * after a visitor has pressed a button naming the provider, so starting the
 * video is the thing they just asked for, and it spares them a second press on
 * YouTube's own play button. `playsinline` keeps it in the page on iOS.
 */
export function youtubeEmbedUrl(videoId: string, { autoplay = false } = {}): string {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}`;
  return autoplay ? `${base}?autoplay=1&playsinline=1` : base;
}

/** Suno's own player for one song. It plays for visitors with no Suno account. */
export function sunoEmbedUrl(songId: string): string {
  return `https://suno.com/embed/${songId}`;
}

/**
 * The song's audio file on Suno's CDN, which serves range requests and needs no
 * Suno account. It is the same master their player streams, so a broken link
 * here means the song moved on Suno rather than that the page is wrong.
 */
export function sunoAudioUrl(songId: string): string {
  return `https://cdn1.suno.ai/${songId}.mp3`;
}
