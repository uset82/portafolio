# Approved public email address

**Approved on:** 2026-10-07
**Approved by:** Carlos Carpio (repository owner)
**Address:** `carlos@carloscarpio.dev`

## Decision

Carlos approved publishing `carlos@carloscarpio.dev` on the public contact
route, in both locales. This reverses the earlier position recorded in the
contact copy, which stated that no public email was published and that none was
planned.

The reversal is deliberate and narrow. What changes is that one address is now
published. What does not change:

- no contact form, message field, or file upload exists on the site;
- nothing is collected by this site when a visitor writes — mail leaves through
  the visitor's own provider;
- no response time, availability, employment, or booking promise is attached;
- no additional social accounts are approved.

## How the address is served

The domain's DNS is on Cloudflare, and the address is a Cloudflare Email
Routing rule rather than a mailbox: mail addressed to `carlos@carloscarpio.dev`
is forwarded to the owner's personal inbox. The catch-all rule is set to `Drop`,
so no other address on the domain accepts mail.

Verified live on 2026-10-07:

| Record | Value |
| --- | --- |
| MX | `route1` / `route2` / `route3`.mx.cloudflare.net |
| SPF | `v=spf1 include:_spf.mx.cloudflare.net ~all` |
| DKIM | `cf2024-1._domainkey` present |
| DMARC | `v=DMARC1; p=none; rua=mailto:carlos@carloscarpio.dev` |

DMARC is intentionally at `p=none` while reports are observed. Because no
legitimate mail originates from this domain under forwarding, the intended end
state is `p=reject`.

## Scope

This approval covers publishing the address on the contact route and in the
site footer record. It does not approve publishing any other address, a phone
number, a postal address, or a booking route.
