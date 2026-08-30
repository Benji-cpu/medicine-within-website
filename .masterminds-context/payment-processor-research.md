# Payment Processor Research: Recurring €69/mo for The Living Temple

Researched 27 Aug 2026 from live pages (URLs cited inline). Goal: recurring €69/month membership billing for Dutch/EU consumers (iDEAL/SEPA culture), live before 21 Dec 2026, after bans at Stripe and Mollie.

**The single most important structural fact found in this research:** SEPA Direct Debit runs on bank rails, not card rails. Card processors share risk data (Visa/Mastercard high-risk registries, the MATCH blacklist that acquirers check after a merchant is terminated). A bank-debit-only provider like GoCardless never touches the card networks, so whatever data Stripe/Mollie generated about "Medicine Within" as a card merchant has far less surface to propagate through. This is why the top recommendations below lean SEPA-first.

Also relevant: iDEAL is being replaced by Wero (transition starts 2026, iDEAL fully gone by end 2027 per Rabobank/NOS). iDEAL was never a recurring instrument anyway; the standard Dutch subscription pattern is "first payment via iDEAL, then recurring SEPA incasso," or SEPA incasso from day one (a machtiging, which every Dutch consumer knows from gym/energy/charity subscriptions). So "no iDEAL" is a smaller loss than it sounds for a subscription product.

---

## Comparison Table

| Provider | Recurring | Methods | Fees (verified) | Payout | Policy fit for her vertical | Onboarding risk | Verdict |
|---|---|---|---|---|---|---|---|
| **GoCardless** | Yes, native subscriptions, NL merchants explicitly onboarded | SEPA Direct Debit only (no iDEAL, no cards). Customer enters IBAN in hosted form | Standard: 1% + €0.20/txn capped at €2 (≈ €0.89 on €69). No monthly fee. Add-ons: name-on-statement €50/mo (gocardless.com/en-eu/pricing) | 2 business days after collection; first collection needs ~5 interbank working days lead, subsequent 2 (GC support docs) | Restricted list prohibits "online dating or marriage services, adult entertainment related activities, or escort services," narcotics, "prescription medication or medical services," dietary supplements. Coaching, events, memberships, wellness are NOT on the list (gocardless.com/legal/restrictions) | Medium. Compliance review typically 1-3 business days, but Trustpilot shows real cases of weeks of back-and-forth and post-approval closures. They review your website | **#1 pick** |
| **PayPro (Groningen, DNB-licensed)** | Yes, purpose-built "abonnementen" tooling: iDEAL first payment then SEPA incasso, debtor management | iDEAL/Wero, SEPA incasso, Bancontact, cards, PayPal, bank transfer | Professional plan €59/mo (recurring included; €49/mo if paid annually) + €0.29 iDEAL, €0.25 SEPA incasso, 0% variable on both; cards 2.5% + €0.25 (paypro.nl/tarieven) | "In most cases you will directly receive the amount"; you control transfers to your bank (paypro.nl) | Refuses outright: "sex events," erotic/porn material, prostitution/escort, Opium Act products. High-risk list (extra review, not refusal): escort, CBD, 18+, microdosing. Coaching, memberships, wellness NOT listed. Every product individually assessed by Compliance; they invite pre-checks at compliance@paypro.nl (guide.paypro.nl acceptance policy + paypro.nl/hoog-risico) | Medium. The "sex events" refusal is the landmine: if compliance reads the tantra temple events as sex events, it dies. The membership product itself does not match any refused category | **#2, apply in parallel** |
| **Verotel (Amsterdam)** | Yes, subscription billing is their core product | Cards (Visa/MC/JCB/Discover/Diners), EU Direct Debit incl. NL. iDEAL not listed on their price chart | Basic: 15.5% + €500/yr registration. Premium: 13.0-14.0% tiered, +1.5% surcharge on recurring, €25/wk fee if volume < €1,000/wk. 10% rolling reserve held 6 months, all accounts (verotel.com pricechart) | Daily deposit, free | "Processing Payments for High-Risk Webmasters... Adult? No problem!" (verotel.com). Zero categorization risk: they exist for merchants everyone else rejects. First high-risk processor with EMI status from DNB | Very low refusal risk. But on €69: ~€9.70 fee + €6.90 held 6 months = she keeps ~€52 now | Backstop only. Guaranteed home, painful economics |
| **CCBill** | Yes, subscription-first | Cards + SEPA DD + iDEAL in NL (per Merchant Maverick / merchantmachine.co.uk reviews; not verified on ccbill.com directly, their site blocked fetching) | ~3.9% + $0.55 standard, 5.9% high-risk, 10.8-14.5% adult tiers; no setup/monthly fee (merchantmachine.co.uk, pricingnow.com). Card-scheme high-risk registration fees may apply | Weekly (typical, unverified) | Adult-tolerant US processor, EU coverage. Same idea as Verotel with iDEAL on top | Low refusal risk. Card-heavy: if Stripe/Mollie MATCH-listed her, card underwriting could still surface it (unverified whether she is listed) | Backstop #2 |
| **Segpay** | Yes | Cards + "SEPA Direct Debit for High-Risk Merchants" is a named product (segpay.com/solutions/sepa-direct-debit; page blocked full fetch) | High-risk card registration: $950/yr Visa + $500/yr MC; rates 4-15% typical high-risk (third-party) | Not verified | High-risk/adult specialist with EU merchant support | Low refusal risk, high cost | Backstop #3, behind Verotel/CCBill |
| **Patreon** | Yes (platform, they are merchant of record) | Cards + PayPal. No iDEAL/SEPA; Dutch fans can only route iDEAL indirectly through PayPal | 10% platform fee (all new creators since Aug 2025) + processing ~2.9% + $0.30 (5% + $0.10 micro), + currency conversion 2.5%, + payout fee. Effective ~15-19% (support.patreon.com creator fees) | Monthly | Her Stripe ban does NOT propagate: Patreon is the merchant, not her. Adult/18+ content must sit behind the paywall; educational sexuality content permitted; community membership is fine (patreon.com/policy/guidelines, Q4 2025 update) | Low. But platform can change rules any time, and card-only checkout is wrong for Dutch consumers | Plan C. Works, expensive, wrong payment culture |
| **Own bank: Euro-incasso contract (e.g. Rabobank) as eenmanszaak** | Yes, DIY SEPA incasso | SEPA incasso only | Bank incasso fees are cents per debit (exact tariff depends on bank/package; not verified per bank). Needs zakelijke rekening + incassocontract; Rabobank digital mandates require Rabo Business Banking (Pro) (rabobank.nl euro-incasso pages) | Direct to her account | The bank runs its own risk assessment on the incassocontract application. Rules explicitly forbid passing your Incassant ID to a third party | Medium-unknown: bank may ask what the collections are for. Admin burden is real: mandate storage, pre-notification, reversal handling, batch files or software like Moneybird | Viable plan D, cheapest per transaction, most work. bunq: could NOT verify creditor-side collection exists; forum threads suggest it does not. Use a mainstream bank |
| **Dead ends (verified)** | | | | | Plug&Pay checkout connects ONLY to Mollie or Stripe (help.plugandpay.com), both banned for her. Podia/Memberful/Substack/Kajabi-style tools bill through the creator's own Stripe account, so the ban propagates. MultiSafepay prohibits "erotic and pornographic images... aphrodisiacs... mind-altering substances" (docs.multisafepay.com). Buckaroo states it does not serve the gambling and sex industry | | Do not spend time here |

---

## Recommendation

### #1: GoCardless (SEPA Direct Debit subscriptions)

Why:
1. **Her category is simply not on their restricted list.** The list bans adult entertainment, dating, escorts, narcotics, medical services, supplements. A paid community membership with coaching calls, women's circles and event access matches nothing on it. No "wellness," "coaching," "events" or "membership" restriction exists on the page.
2. **No card networks.** Pure SEPA bank debit. The Stripe/Mollie termination data lives largely in card-world (MATCH etc.); GoCardless never queries it. This is the route where her history matters least.
3. **Economics.** ~€0.89 per €69 collection, no monthly fee, payout 2 business days after collection. Compare Verotel at ~€9.70 + reserve.
4. **Native subscription engine** (fixed monthly plans, automatic retries on Advanced plan, customer pre-notification emails handled for her). NL merchants explicitly onboardable.

Known weaknesses, honestly: no iDEAL checkout (customer types IBAN into a GoCardless-hosted mandate form; normal for Dutch subscriptions but slightly more friction than iDEAL), the SEPA 8-week no-questions refund right (below), and a compliance team with mixed Trustpilot reviews on onboarding. Which is why:

### #2 (apply in parallel, same week): PayPro

Dutch, DNB-licensed, built exactly for coaches/course-makers/memberships, iDEAL-first checkout then automatic SEPA incasso, €0.25-0.29 per rebill on a €59/mo plan, debtor management included, affiliate tooling as a bonus. The one risk is the compliance read: "sex events" is a named refusal category. Mitigation: **email compliance@paypro.nl BEFORE applying** (they explicitly invite preliminary assessment) describing the membership truthfully as below. If they pre-clear it in writing, PayPro is arguably the better daily driver and GoCardless becomes the fallback. Applications at both are free; run both and take whichever clears first, keep the other as the spare tire.

### Backstop: Verotel

If both refuse her, Verotel (Amsterdam, "Adult? No problem," EMI licensed by DNB) will take the business including the full tantra branding, with subscriptions and EU direct debit. Cost of that certainty: 13-15.5% + 1.5% recurring surcharge + 10% of revenue held 6 months + €500/yr or weekly minimums. At €69/mo x 30 members that is roughly €300+/month in fees vs ~€27 at GoCardless. Only go here if the clean-presentation route fails twice.

### Exact next steps

1. **Build the membership its own front door first** (1 page, before any application): a dedicated page or subdomain, e.g. `join.medicinewithin.nl` or a standalone `thelivingtemple.nl`. This page is what she submits as "business website" on the application. It must fully and truthfully describe what members get: monthly live calls, women's circles, community gatherings, coaching access, event discounts. Price, cancellation terms (monthly cancellable), contact details, KvK number, T&Cs, privacy policy. Processors reject pages without terms/cancellation/contact info as fast as they reject risky categories.
2. **Category to state on applications** (truthful, and matching what the reviewed page shows): "Membership subscription for a personal development community: live group coaching calls, women's circles and member gatherings/events. €69/month, cancellable monthly." Industry pick: coaching / personal development / community membership, never "health/medical," never "adult," never "other."
3. **Apply at GoCardless** (gocardless.com, NL merchant, eenmanszaak with KvK + zakelijke rekening; ID + proof of bank ownership needed; review typically 1-3 business days).
4. **Same week, email compliance@paypro.nl** with the membership page link and the description above, asking for preliminary acceptance; apply on a written yes.
5. **First-collection mechanics** (GoCardless): member signs the online mandate at signup; allow ~1 week before the first debit lands; payout 2 business days later. For a 21 Dec launch, open signups by early December so first payments clear before the solstice opening.
6. If both decline by mid-October: apply at Verotel (productchoice.html signup), accept Premium tier economics, and plan pricing/margin around ~15% + reserve, or re-scope to Patreon.

### What NOT to have on the page she submits

- **No Kambô. Anywhere on the submitted domain.** This is the hardest rule in this file. GoCardless prohibits "narcotics" and "prescription medication or medical services"; MultiSafepay bans "mind-altering substances"; PayPro refuses Opium Act products and flags even microdosing as high-risk. Kambô is not an Opium Act substance, but no compliance analyst will litigate that nuance in her favor. A frog-medicine ceremony one click from the checkout is the most likely single cause of ban #3. Keep Kambô on the main site only if the membership lives on a separate domain that never links to it; ideally the membership domain has zero Kambô references and no prominent cross-linking.
- **No sexual vocabulary on the membership/checkout page**: tantra as an offering headline, sacred sexuality, erotic, orgasm, s+, intimacy coaching, temple night descriptions. "Embodiment," "feminine practice," "women's circles," "meditation," "community" describe the same membership honestly. This is framing, not misrepresentation: the product genuinely is calls + circles + community access, and that is what the page must say.
- No medical or healing claims ("heals trauma," "detoxifies," "medicine"), which trip the pseudo-medicine/supplement rules at every Dutch PSP.
- No stock-photo-only, no missing T&Cs/KvK/cancellation policy, no "coming soon" sections.

---

## Red flags: what typically gets this vertical banned (grounded in the policies read today)

1. **Website content review, not transaction behavior, is the usual trigger.** Every provider checked (GoCardless, PayPro, MultiSafepay, Buckaroo) reserves acceptance on review of the site. Words on the domain do the damage before a single euro moves: "tantra," "temple night," "sacred sexuality" pattern-match to "adult entertainment related activities" (GoCardless) / "sex events" (PayPro) / "sex industry" (Buckaroo).
2. **Kambô on the same domain** reads as narcotics/unlicensed medicine (see above). Likely a contributor to the Mollie/Stripe outcome alongside the sexuality-adjacent branding.
3. **Statement descriptor mismatch.** If the bank statement says something members do not recognize, disputes spike, and dispute ratio is what escalates accounts to termination. Descriptor should be "LIVING TEMPLE" or "MEDICINE WITHIN," matching the receipt emails. (GoCardless charges €50/mo to put her own name on statements; on the Standard plan the descriptor shows GoCardless Ltd + reference, so receipt emails must bridge the gap.)
4. **SEPA mandate reality check**: under SEPA Core, a member can reverse any debit within 8 weeks through their own bank, no questions asked, and up to 13 months for claimed unauthorized debits (GoCardless SEPA guides). Defenses: signed digital mandate stored, pre-notification before each debit (GoCardless emails 3 working days ahead automatically), instant self-serve cancellation, and refund-before-they-reverse as standing policy. A membership with real ongoing delivery rarely sees reversals; a membership people forget they joined does.
5. **Separate clean domain/entity: does it help?** A separate domain genuinely reduces review surface and is standard, legitimate practice (distinct product, distinct page). A separate KvK entity is heavier and mostly unnecessary for SEPA-rail providers; it matters more if she ever re-applies to card processors, where the terminated-merchant lookup keys on legal name/owner. Do not lie on any application about other activities if asked directly; the defensible position is "this application is for this product, described accurately."
6. **Do not run Kambô or event-ticket money through the membership account once approved.** Off-category transactions on a freshly approved account are exactly what periodic reviews look for. Hipsy keeps doing tickets; the new account does the membership only.
7. **Uncertain, flagged**: whether Stripe/Mollie placed her on MATCH (card blacklist) is unknowable from outside; it does not affect GoCardless (no card rails) but could affect PayPro's card methods, CCBill, Segpay, Verotel card acquiring. If a card-based application asks "have you ever had a merchant account terminated," answer truthfully; lying there is the one unforgivable underwriting sin.

## Timeline check: 21 Dec 2026

Comfortable, if she starts in September. GoCardless verification typically 1-3 business days (worst reported cases: weeks). PayPro pre-clearance + application: allow 2-3 weeks. Building the membership page: days. Even the Verotel fallback path fits inside October. The real deadline driver is member acquisition, not processor setup: to collect first payments before 21 Dec via SEPA, signups should open ~10 days before launch. Recommended: page built + both applications submitted by 30 Sep, processor confirmed by 31 Oct, checkout tested with a real €1-style test debit in November, doors open early December.

## Uncertainties (explicitly not verified)

- Verotel iDEAL support: not on their price chart; their direct debit covers NL. Treat as card + DD only.
- CCBill/Segpay exact current EU fee schedules and payout terms: third-party sources only, their sites blocked fetching. Get quotes if this path activates.
- bunq creditor-side incasso: could not verify it exists; assume no, use Rabobank/ING/ABN for the DIY path.
- PayPro merchant-of-record/reseller mechanics and PayPal pricing: not confirmed on fetched pages.
- Whether GoCardless supports iDEAL-verified mandates in NL: not verified, do not promise iDEAL UX with them.
- Whether she is MATCH-listed: unknowable externally.

## Sources (fetched 27 Aug 2026)

- gocardless.com/legal/restrictions, /en-eu/pricing, SEPA guides + support centre (payout, timings, chargeback), Trustpilot reviews
- paypro.nl/tarieven, /hoog-risico, /en/payment-service-provider, guide.paypro.nl acceptance policy article 5042119
- verotel.com homepage + en/pricechart.html
- docs.multisafepay.com/docs/prohibited-products-services
- Buckaroo terms/site (sex + gambling industry exclusion, via search snippet of their materials)
- rabobank.nl euro-incasso business pages
- support.patreon.com creator-fees articles, patreon.com/policy/guidelines + Q4 2025 policy update
- help.plugandpay.com payment-providers article (Mollie/Stripe only)
- merchantmachine.co.uk, merchantmaverick.com, pricingnow.com (CCBill), segpay.com solution pages (partial)
- Rabobank/NOS on iDEAL → Wero transition
