# Architecture and current boundaries

## Web path

The Web prototype combines React with MapLibre for map presentation and Supabase for identity,
relational/geospatial data, and realtime behavior. Its schema and interfaces cover profiles,
friend requests, discovery controls, location records, direct and group communication,
notifications, blocking/reporting, and expiring community alerts.

## Off-grid experiments

The repository contains Meshtastic browser transport adapters plus native experiments for iOS
Multipeer and Android Wi-Fi Direct. These are implementation paths under exploration, not
evidence of guaranteed offline delivery or a field-tested mesh product.

## Privacy and safety boundary

The code includes discoverability controls, owner-scoped location history, a stop-sharing
action, and authenticated writes. The reviewed flow can also resume exact-coordinate updates
after browser permission exists, retains location records, and does not demonstrate complete
coarse-location, deletion, or retention behavior. CC AI must describe these as controls and
unresolved design work, never as a privacy or emergency-safety guarantee.

Source: `docs/content/ifoundyou-source-pack.md`.
