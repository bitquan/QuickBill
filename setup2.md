Below is a **Copilot‑ready build brief** you can paste into your repo README or a “BUILD\_BRIEF.md”. It’s written as **step‑by‑step TODOs with acceptance criteria** (no code). Follow it top‑to‑bottom and Copilot will scaffold exactly to spec.

---

# QuickBill — Build Brief (Web + Mobile Web)

**Goal:** Ship a browser app that creates professional invoices/receipts in <60 seconds.
**Pricing:** 3 free invoices (watermarked) → **\$5.99/mo Pro** (unlimited, saved branding, no watermark, edit/duplicate).
**Tone:** Modern, minimal, mobile‑first, FAB‑driven UX.

---

## 0) Global Guardrails (apply to all tasks)

* **No duplicate files/components.** When refactoring, **delete** the old file first, then recreate.
* **Design tokens first** (colors, spacing, radii, typography). No ad‑hoc styling.
* **Mobile‑first**: Any layout must work on 360px width before desktop.
* **Accessibility**: Meet WCAG AA; keyboard navigable; visible focus.
* **Performance**: TTI < 3s on 4G/low‑end device; first bundle < 200KB gz; images optimized.
* **Privacy**: No PII beyond what the feature requires. Export/delete controls in Settings.

**Definition of Done (DoD) for every PR**

* [ ] Lints & type checks pass.
* [ ] No orphan/duplicate components.
* [ ] Unit test for business rules included (where applicable).
* [ ] UI matches tokens (colors/spacing/typography).
* [ ] Keyboard + screen reader pass on changed screens.
* [ ] Analytics events fire (if applicable).

---

## 1) Stack & Structure (scaffold)

**Intent:** Set up the skeleton once; enforce hygiene.

### TODOs

1. Create project with folders:

   ```
   /public                (PWA manifest, icons)
   /src
     /app                 (routing/providers)
     /core                (theme, utils, hooks)
       /theme
       /utils
       /hooks
     /data                (models, local, remote, payments)
       /models
       /local
       /remote
       /payments
     /services            (pdf, auth, subscription)
     /ui                  (components, layout, patterns)
       /components
       /layout
       /patterns
     /pages               (home, invoice-create, invoice-preview, history, paywall, settings)
     /state               (global store)
   /functions             (webhooks & server logic)
   /scripts               (duplicate/orphan check, bundle report)
   ```
2. Register a **single export index** per component folder (`/ui/components/index`) and import components only from there.
3. Add PWA manifest and offline shell (only core screens/cache first).

### Acceptance Criteria

* Given the repo is cloned, when I run the app, **all routes exist** as empty pages with headers and FAB placeholders.
* When I list files, **no duplicate component names** exist under `/ui/components`.
* When I run the hygiene script, it reports **zero orphans** and **zero duplicates**.

---

## 2) Design Tokens & Theme (build first)

**Intent:** Lock the visual language before screens.

### TODOs

* Define tokens (names only; values are part of theme system):

  * Colors: `primary`, `onPrimary`, `surface`, `onSurface`, `muted`, `success`, `danger`, `warning`
  * Typography scales: `h1, h2, h3, body, caption`
  * Spacing scale: `xs, sm, md, lg, xl`
  * Radii: `sm, md, lg`
  * Shadows: `elev1, elev2` (subtle)
* Create **AppTheme** that exposes tokens via context/hook.
* Create **ThemePreview** page (dev‑only) to visualize buttons, inputs, cards, FAB.

### Acceptance Criteria

* All UI uses theme tokens (no hard‑coded hex, px, or ad‑hoc font sizes).
* Changing `primary` color updates buttons, FAB, and links across all pages.

---

## 3) Reusable Components (library)

**Intent:** Build the “LEGO bricks” once.

### TODOs

* Buttons: `PrimaryButton`, `SecondaryButton`, `IconButton`
* FAB: `FloatingActionButton` (mobile: bottom‑right; desktop: bottom‑right with safe area)
* Inputs: `FormField` (label, helper, error), `MoneyField`, `NumberField`
* Patterns: `SectionCard` (collapsible), `ItemRow` (add/remove animation), `InvoicePreviewCard`, `UpgradeModal`, `ConfirmDialog`, `Toast`
* Layout: `AppHeader`, `BottomSheet` (for mobile actions)

### Acceptance Criteria

* Components are **stateless & theme‑aware** (styles come from tokens).
* `ItemRow` supports add/remove with smooth 200ms animation and recalculates totals via callbacks.
* `UpgradeModal` can be launched from anywhere with a single function/hook.

---

## 4) Data Models (types only)

**Intent:** Align on shape; no persistence yet.

### TODOs

* **Invoice** fields:
  `id, number, createdAt, updatedAt, status(paid|unpaid), business{name, logoUrl, contact, color}, customer{name, email, phone}, items[{name, qty, unitPrice, lineTotal}], tax{enabled, rate, amount}, subtotal, total, notes`
* **User** fields:
  `uid, email, isPro, proSince, stripeCustomerId, branding{name, logoUrl, contact, color, defaultNote}, limits{freeInvoicesUsed}`
* **Local (free)** fields:
  `freeInvoicesUsed, deviceHash, invoices[]`

### Acceptance Criteria

* All UI and services reference **only these models**; no stray fields.
* Business logic relies on `status`, `subtotal`, `tax.amount`, `total` as computed values.

---

## 5) Home Screen

**User Story:** As a user, I see how many free invoices remain and can start a new one quickly.

### TODOs

* Header shows app name or **business name** (if Pro + branding).
* Card displays **free remaining**: “X/3 invoices left” (progress bar).
* Recent invoices list: thumbnail, total, status, date.
* **FAB** “+ New Invoice” always visible.
* “Upgrade to Pro” pill for free users.

### Acceptance Criteria

* Free user with 2 used sees “**1/3 invoices left**”.
* Tapping FAB when free invoices remain → **Invoice Creator**.
* Tapping FAB when limit reached → **UpgradeModal** appears.
* Recent list adapts to empty state with a helpful message.

---

## 6) Invoice Creator Screen

**User Story:** I can input business, customer, items, tax, notes, and payment status easily on mobile.

### TODOs

* Sections in collapsible `SectionCard`s:

  1. Business (logo upload, name, contact) — **auto‑filled** if Pro branding exists.
  2. Customer (name, email, phone).
  3. Items (multi‑row with `ItemRow`: name, qty, price; add/remove).
  4. Tax toggle (% with validation) & Notes.
  5. Payment status toggle (Paid/Unpaid).
* Sticky bottom summary: **Subtotal • Tax • Total** and primary **Preview** button.
* Mini **“+ Item”** floating icon near Items list for fast add.

### Acceptance Criteria

* Totals update **live** as qty/price change.
* Tax toggle off → `tax.amount=0` and total recalculates.
* Pro user sees Business prefilled; Free user starts blank each time.
* Validation prevents negative qty/price and malformed emails.

---

## 7) Invoice Preview Screen

**User Story:** I can see an accurate PDF‑like preview and export/share it.

### TODOs

* Full‑bleed preview using selected template (Template A default).
* **Free:** diagonal semi‑transparent watermark “Made with QuickBill”.
* Actions: **Download PDF**, **Share**, **Save**.
* Paper size toggle: **A4 / Letter** (remembers last used).
* If **Save** would exceed free storage limit (3) → show **UpgradeModal**.

### Acceptance Criteria

* Downloaded PDF **matches** preview (totals, items, status).
* Free user’s downloaded PDF **includes watermark**; Pro’s does not.
* Share uses native share where available; fallback to download.
* Toggling paper size changes the preview and exported PDF size.

---

## 8) History Screen

**User Story:** I can see and manage past invoices. Pro can edit/duplicate; Free only view.

### TODOs

* Search by customer or invoice number.
* List with `InvoicePreviewCard` (mini preview, total, date, status).
* Swipe left/right to reveal **Delete** with `ConfirmDialog`.
* Tap row:

  * **Pro:** open details with **Edit** and **Duplicate** actions.
  * **Free:** open read‑only view (no edit/duplicate).
* Free cap messaging: “Save up to 3 invoices on Free.”

### Acceptance Criteria

* Deleting an invoice removes it from list and storage.
* **Duplicate** creates a new draft with a new invoice number and today’s date.
* **Edit** preserves original invoice `id` and updates `updatedAt`.

---

## 9) Paywall (Modal + Full Page)

**User Story:** I understand the value and can subscribe quickly and safely.

### TODOs

* **UpgradeModal** (triggered inline) with benefits list:

  * Unlimited invoices
  * Save branding & logo
  * No watermarks
  * Edit & duplicate
  * \$5.99/month, cancel anytime
* **Paywall page** with Free vs Pro comparison, FAQs, and Stripe Checkout button.
* Link to **Stripe Customer Portal** in Settings.

### Acceptance Criteria

* From any upgrade trigger, clicking **Unlock** opens Checkout and returns with **isPro=true** on success.
* Cancelling in Portal → **isPro=false** after period ends (reflected in UI).
* Paywall loads fast (<1s interactive on repeat visits).

---

## 10) Subscription & Entitlements

**User Story:** The app gates features correctly based on plan.

### TODOs

* At app start, check `isPro` from remote (if signed in) or **anonymous free** mode (local).
* **Free metering:** `freeInvoicesUsed` increments on **Save** or **Download** (choose one and document). Display remaining on Home.
* Device **fingerprint hash** stored with local count; on login, **merge** local counts → user record.
* Entitlement hook: `useProStatus()` returns `{ isPro, remainFreeCount, canCreate, showUpgrade }`.

### Acceptance Criteria

* Free user cannot **Save** more than 3 invoices to history.
* Free user’s PDFs **always** watermarked.
* Pro user always sees **no watermark**, unlimited create/save, branding auto‑fill.
* If subscription lapses, app **downgrades** cleanly to Free.

---

## 11) Storage & Sync

**User Story:** Free works offline on device; Pro syncs across devices.

### TODOs

* **Free**: IndexedDB/LocalStorage for invoices + `freeInvoicesUsed` + `deviceHash`.
* **Pro**: Firestore collections for invoices and branding; real‑time sync.
* On login: **migrate** local invoices to cloud with user approval.

### Acceptance Criteria

* Free user can create/preview/download offline.
* Pro user logging into another device sees the same **History** within 2s.
* Migration flow lists counts (“Move 2 local invoices to your account?”).

---

## 12) PDF Service

**User Story:** PDFs look clean and professional, and match preview.

### TODOs

* Template A (Minimal): Logo & business header; customer block; items table; totals; notes; footer.
* Template B (Compact): Two‑column header; denser rows; accent stripe (Pro‑only).
* Watermark logic (Free only).
* Page size logic (A4/Letter).
* Number formatting helpers (currency, qty, rates).

### Acceptance Criteria

* Exported PDFs render correctly in common viewers (macOS Preview, Chrome, mobile).
* Totals are accurate to 2 decimals; currency formatting obeys locale.
* Watermark is **unobtrusive but visible**; does not cover totals.

---

## 13) Settings

**User Story:** I can manage branding and my subscription.

### TODOs

* Branding (Pro): upload logo; set name, contact, color accent, default note.
* Subscription: show current plan; **Manage in Stripe Portal** link.
* Data: **Export all invoices** (CSV + ZIP PDFs).
* Legal: Terms & Privacy (plain English).

### Acceptance Criteria

* Saving branding updates default values in **Invoice Creator**.
* Export produces valid CSV with totals and a ZIP of PDFs.
* Portal link opens Stripe hosted page and returns correctly.

---

## 14) Auth (lightweight)

**User Story:** I can sign in quickly to unlock Pro/sync, or continue anonymously.

### TODOs

* Options: Email magic link + Google Sign‑in.
* Anonymous mode by default; prompt to sign in when:

  * Approaching free limit (1 left).
  * Visiting History (to sync).
  * Opening Settings → Subscription.

### Acceptance Criteria

* Signing in preserves anonymous **free count** (merged) and offers to migrate invoices.
* Sign‑out returns to anonymous mode without data loss from local store.

---

## 15) PWA & Offline

**User Story:** I can add to home screen and work offline for Free features.

### TODOs

* PWA manifest, icons, install prompt.
* Cache app shell + theme + core fonts.
* Offline page for non‑critical areas (e.g., Paywall shows “Connect to subscribe”).

### Acceptance Criteria

* “Add to Home Screen” works on Android and desktop Chrome.
* Offline mode allows: Home, Creator, Preview, local Save and Download (Free).

---

## 16) Analytics & Events

**Intent:** Minimal, privacy‑friendly.

### TODOs (event names)

* `view_home`, `tap_new_invoice`, `start_invoice`, `preview_invoice`, `download_pdf`, `save_invoice`, `open_paywall`, `start_checkout`, `checkout_success`, `checkout_cancel`, `export_data`
* Include plan context: `plan: free|pro`, `free_remaining: n`.

### Acceptance Criteria

* Events fire once per user action (no duplicates).
* Events continue to work offline and backfill when online (if possible).

---

## 17) Stripe + Webhooks (Functions)

**User Story:** Subscription state is always correct.

### TODOs

* Stripe Checkout session creation; on success, store `stripeCustomerId` and `isPro=true`.
* Webhooks: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
* On cancellation end date, set `isPro=false`.

### Acceptance Criteria

* Successful payment immediately unlocks Pro.
* Cancelling in Portal downgrades at the end of the current period.
* Webhook retries idempotent (safe on duplicate delivery).

---

## 18) QA Scenarios (must pass)

* Free → Create 3 invoices → 4th attempt shows **UpgradeModal**.
* Free → Download always watermarked; Save limited to 3 in History.
* Pro → Create, Save, Edit, Duplicate without limits; no watermarks.
* Toggle Paid/Unpaid updates the badge and the PDF.
* Switch paper size A4↔Letter; exported size matches.
* Branding logo missing → layout still clean; default color used.
* Offline Free user can create/preview/download; Paywall prompts to reconnect.
* Sign in after using Free → merge counts and optionally migrate invoices.

---

## 19) Performance & Accessibility Checks

* **Performance:** Largest contentful paint < 2.5s on Moto G4 profile; bundle report under 200KB gz initial.
* **A11y:** All inputs labeled; tab order sensible; focus visible; ARIA for collapsibles and dialogs; color contrast AA.

---

## 20) Launch Checklist

* [ ] Theme tokens locked; components reference tokens only.
* [ ] All screens implemented with acceptance criteria above.
* [ ] Duplicate/orphan script returns 0 issues.
* [ ] Analytics events verified end‑to‑end.
* [ ] Stripe live keys configured; test purchase run on live mode (small \$).
* [ ] Terms & Privacy published; links visible in Settings and Paywall.
* [ ] PWA install tested; offline flows verified.
* [ ] 10 sample PDFs visually reviewed (desktop + mobile).

---

## 21) Stretch (post‑launch, optional)

* Multiple branding profiles (Pro).
* Additional PDF templates.
* Payment links on invoices (Stripe Payment Links).
* CSV import for item catalogs.
* Team seats (shared branding & history).

---

### How to use this brief with Copilot

When you start a task, copy the corresponding **TODOs + Acceptance Criteria** into a new comment at the top of the file(s) you’re working on. Phrase prompts like:

* “Create a `SectionCard` component per the brief: collapsible, theme tokens only, supports title and children, 200ms animation, keyboard accessible. Pass the following acceptance criteria.”

This keeps Copilot aligned and prevents scope drift.

If you want, I can also generate a **one‑pager “Prompts Pack”** with ready‑to‑paste Copilot prompts for each section above (still no code) so you don’t have to rephrase anything while you build.
