<!-- generatedBy: brain:sync-github; source: https://github.com/uset82/portafolio/blob/main/docs/content/ifoundyou-source-pack.md; checkedOn: 2026-07-31; redactions: 0 -->

# iFoundYou / Dommedag ? case-study source pack

Reviewed 2026-07-19 from the public repository, current source tree, Supabase schema and policies, Web/Native implementations, continuity ledger, deployment configuration, commit metadata, and media paths. This pack intentionally separates implemented prototype code from safety claims and future intent.

## Identity and classification

- **Canonical repository:** <https://github.com/uset82/iFoundYou>
- **Repository name:** iFoundYou
- **README and Web title:** Dommedag / Dommedag ? Mesh Guardian
- **PWA manifest name:** iFoundYou ? Mesh Guardian
- **Portfolio status:** experimental location/community and off-grid communication prototype
- **Public release:** none
- **Canonical live demo:** none recorded in repository metadata or current documentation
- **License:** none present or detected

The product name is unresolved. Use **?iFoundYou / Dommedag prototype?** until Carlos approves one public name.

## Contribution evidence

The public repository belongs to Carlos's confirmed GitHub account, `uset82`, and all 47 visible commits are linked to that account.

Safe wording: **?Carlos maintains the public iFoundYou repository and is the documented GitHub contributor to the current prototype.?**

This evidence does not establish sole authorship, production ownership, or the provenance of research documents and media.

## Implemented Web surface

Current source supports a Vite/React/TypeScript prototype with:

- MapLibre maps, browser geolocation, friend markers, and nearby discovery;
- Supabase Auth, Postgres/PostGIS tables, Realtime behavior, and row-level-security policies;
- friend requests, profiles, discovery controls, direct/group chat surfaces, notifications, and blocking/reporting schema;
- community-alert flows carrying category, message, coordinates, radius, and expiry;
- PWA configuration and offline caching;
- Meshtastic Web Bluetooth/HTTP transport modules and emergency-message adapters;
- Netlify Functions for server-side operations.

These source surfaces are not evidence of end-to-end production reliability, emergency-service integration, guaranteed offline delivery, or a currently operating public backend.

## Location and privacy behavior

The source contains meaningful privacy controls:

- new privacy settings default `discoverable` to `false`;
- row-level policies limit location history reads to the owner;
- last-location reads are allowed to the owner, accepted friends, or other users when the location owner is discoverable;
- the UI exposes a discovery toggle and a stop-sharing action;
- location and alert writes require an authenticated user.

However, the current implementation does **not** support a strong ?explicit opt-in location sharing? claim:

- after a user session exists, the Web app automatically calls the sharing flow unless permission was denied;
- when browser permission is already granted, exact coordinates can resume without a separate in-app confirmation;
- location updates are written about every 15 seconds to both history and last-location tables while sharing;
- stopping the watcher does not visibly delete the stored last location or history;
- a `coarse_location` field exists in the schema, but this review did not find it applied to the coordinates written by the current Web flow;
- community alerts attach the sender's current coordinates.

Portfolio copy must therefore describe **privacy controls under development**, not a privacy-safe or privacy-first shipped system. Publication requires an explicit in-app consent gate, retention/deletion rules, coarse-location behavior, policy tests, and a security/privacy review.

## Community and emergency behavior

The prototype includes friend/discovery flows, group/emergency channel structures, proximity notifications, nearby people, and community alerts for needs such as water, food, medical help, shelter, or a lost person.

These are experimental communication features. Do not imply affiliation with emergency services, verified alerts, safety guarantees, moderation coverage, identity verification, delivery guarantees, or suitability for life-critical use.

## Mesh and native status

The repository contains real Web Meshtastic transport code and a React Native scaffold with iOS Multipeer and Android Wi-Fi Direct modules. The native Home screen simultaneously labels BLE discovery and a store-and-forward queue as the **next milestone**.

Safe status: **?The prototype explores Web Meshtastic and native peer-to-peer transport paths.?**

Blocked wording: ?works without internet,? ?catastrophe-ready,? ?reliable mesh,? ?offline emergency calling,? or any claim of field-tested delivery.

## Privileged Wi-Fi companion boundary

The optional Python companion binds to localhost and exposes Wi-Fi scanning, network-device discovery, network connection, and MAC-address change/reset routes. Some operations require administrator/root privileges. The reviewed server does not implement its own authentication and permits configured browser origins including Netlify subdomains.

Treat this as a high-risk local experiment. Do not advertise, demo, deploy, or recommend the Wi-Fi/MAC functionality from the portfolio until it has a dedicated threat model, authorization design, platform review, and clear lawful-use documentation.

## Verified stack

- Vite 7, React 19, TypeScript, and PWA tooling;
- MapLibre GL JS;
- Supabase client, Auth, Postgres/PostGIS, Realtime, SQL migrations, and RLS;
- Netlify Functions;
- Meshtastic browser transports and IndexedDB;
- React Native experiments with iOS Multipeer and Android Wi-Fi Direct;
- optional Flask/Python local networking helper.

## Prototype and outcome evidence

- The public repository is not archived and was last pushed on 2026-05-14.
- GitHub exposes no releases, tags, or workflow runs.
- The Web package has a build command but no test script; the repository contains one baseline mobile test file.
- The continuity ledger records past local build/deployment experiments and unresolved UI/backend issues, but no canonical live URL is currently documented.
- No verified users, installations, field tests, uptime, delivery, accessibility, privacy, security, or emergency-response outcomes are available.

The defensible outcome is a broad public prototype and research/code exploration?not a shipped safety product.

## Visuals and rights

The repository contains a small number of screenshots/schema images and generated mobile launcher assets, but no file-level authorship, license, consent, or portfolio permission is recorded. The repository itself has no license.

The portfolio media allowlist is **empty**. Do not copy or hotlink repository screenshots, map captures, contact/location data, schema screenshots, phone UI, or device imagery. Any future visual must use synthetic accounts and coordinates, redact secrets/identifiers, avoid real contact or location data, and receive explicit rights approval.

## Safe facts for later drafting

- iFoundYou / Dommedag is an experimental project exploring trusted-circle location, community alerts, chat, and off-grid communication paths.
- The Web prototype combines React, MapLibre, Supabase/PostGIS, Netlify Functions, and Meshtastic modules.
- The repository also explores native iOS Multipeer and Android Wi-Fi Direct integrations.
- Carlos maintains the public repository and is its documented GitHub contributor.
- Privacy, retention, offline reliability, and emergency-safety claims remain unresolved design work.

## Claims that remain blocked

- private, privacy-first, or explicit opt-in location sharing;
- production readiness or a currently operating public service;
- reliable offline/mesh communication or catastrophe readiness;
- emergency-service affiliation, verified alerts, or life-safety suitability;
- secure or approved Wi-Fi scanning, device discovery, or MAC-address changes;
- user, performance, delivery, accessibility, privacy, or security outcomes;
- reuse of any repository screenshot, schema image, launcher asset, contact, or map data.

## Primary-source trail

- Repository and README: <https://github.com/uset82/iFoundYou>
- Web application source: <https://github.com/uset82/iFoundYou/blob/main/web/src/App.tsx>
- Supabase row-level policies: <https://github.com/uset82/iFoundYou/blob/main/supabase/rls.sql>
- Native companion plan: <https://github.com/uset82/iFoundYou/blob/main/docs/native-companion-plan.md>
