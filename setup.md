Awesome — let’s lock this in as a **browser app** (mobile-first, works great on desktop too). No code yet — just a crystal‑clear plan you can hand to Copilot later.

# Product Blueprint — “QuickBill” (Web + Mobile Web)

## 1) Purpose & Promise

* **Make a professional invoice/receipt in under 60 seconds.**
* **Freemium:** 3 invoices free (with watermark) → **\$5.99/mo Pro** (unlimited, no watermark, saved branding, edit/duplicate).

---

## 2) Platform & Tech (simple, low-cost)

* **Frontend:** React + Vite (fast, minimal) + Tailwind (or utility CSS) for modern UI.
* **Responsive:** Mobile-first, fluid grid, breakpoints for tablet/desktop.
* **PDF:** `pdf-lib` (client-side) for speed + offline; optional server render later if needed.
* **Storage:**

  * Free users: LocalStorage/IndexedDB for drafts + anonymous usage counter.
  * Pro users: Firestore (cloud) for cross-device history & branding.
* **Auth:** Email magic link or Google Sign‑in (only required to subscribe or sync history).
* **Payments:** Stripe Checkout + Stripe Customer Portal (handled with Firebase Functions).
* **Hosting:** Firebase Hosting (free tier friendly).
* **Serverless:** Firebase Cloud Functions (subscription webhooks, anti-abuse checks).
* **PWA:** Installable, offline form & preview.

> Rationale: Zero server management, free or near‑free to run, easy to scale.

---

## 3) Pricing & Entitlements (clear rules)

* **Free (no login required):** create up to **3 invoices lifetime on that device**, watermark on PDFs, no saved branding, no edits after save.
* **Pro (\$5.99/mo):** unlimited invoices, **no watermark**, **branding auto-fill**, **edit/duplicate** from history, cloud sync.

**Soft anti‑abuse:**

* Anonymous counter in LocalStorage + hash of device fingerprint.
* If a user logs in later, merge local count → account record (can’t reset to re‑use free tier).

---

## 4) Core Flows (step-by-step)

### A. First‑time User (Mobile)

1. **Welcome screen** (carousel x3) → “Get Started”.
2. **Home:** “You have 3 free invoices.” Recent = empty. **FAB** “+ New Invoice”.
3. **Create:** Business (optional), Customer, Items (add rows), Tax toggle, Notes, Paid/Unpaid.
4. **Preview:** live PDF mock; shows **watermark** for free.
5. **Actions:** Download / Share / Save to device history. Counter decrements.
6. **Nudge:** At 1 left or on 4th creation → **Upgrade modal**.

### B. Upgrade

* Triggered when:

  * Free invoices used up, or
  * User taps “Remove watermark” on preview, or
  * Tries to save more than 3 to history.
* **Upgrade Modal:** Benefits list → “Unlock Unlimited — \$5.99/mo”.
* **Checkout:** Stripe Checkout → on success return → Pro entitlements set.
* **Customer Portal:** From Settings to manage/cancel.

### C. Pro User

* **Home:** Shows business name, unlimited counter, recent invoices (cloud).
* **Create:** Business info/logo **auto-filled**, live preview **without watermark**.
* **History:** Search, filter, tap to open → **Edit** or **Duplicate**.

---

## 5) Screens & UI (mobile-first, modern)

### 1. Splash / Onboarding

* Minimal logo, big headline: *“Invoices in 60 seconds.”*
* Slides: Create fast • Share as PDF • Upgrade anytime.
* CTA: **Get Started**
* Link: **Sign in / Restore Pro** (small text)

### 2. Home

* Top bar: brand or “QuickBill”.
* Card: **Free remaining:** “2/3 invoices left” (progress bar).
* List: Recent invoices (thumbnail preview, status, total).
* **FAB:** bottom-right “+ New Invoice”.
* Footer: tiny “Upgrade to Pro” pill (free users).

### 3. Invoice Creator

* Sections as collapsible cards:

  * **Business** (logo upload, name, contact) — auto-fill for Pro, editable.
  * **Customer** (name, email/phone).
  * **Items** (rows: item, qty, price; add/remove with smooth animation).
  * **Tax & Notes** (toggle %, note field).
  * **Payment Status** (Paid/Unpaid badge).
* Sticky bar (bottom): **Subtotal • Tax • Total** | **Preview** (primary).
* **Floating “+ Item” mini-FAB** near Items table.

### 4. Preview

* Full-bleed invoice preview (print-like).
* **Free:** semi-transparent diagonal watermark.
* Action row: **Download PDF** | **Share** | **Save**
* If Save causes limit breach → **Upgrade Modal**.
* Toggle: A4 / Letter.

### 5. History

* Search bar (customer, number).
* Cards: mini preview, total, date, status.
* Swipe left: Delete (confirm modal).
* Tap: Open → (Pro) Edit / Duplicate; (Free) View only.
* **Free cap UI:** Message “Save up to 3 invoices on Free.”

### 6. Paywall (Full Screen)

* Hero mock of clean invoice (no watermark).
* Side-by-side **Free vs Pro** comparison.
* \$5.99/mo, cancel any time, secure badge.
* CTA: **Unlock Unlimited**
* FAQ accordion: “How do I cancel?”, refunds, receipts, taxes.

### 7. Settings

* Profile (if signed in).
* Business Branding (Pro): logo, colors, default footer note, number format.
* Subscription: **Manage in Stripe Portal**.
* Data: export all invoices (CSV/ZIP PDFs).
* About, Terms, Privacy.

---

## 6) Visual System (consistent, reusable)

* **Palette:** neutral backgrounds (#F7F8FA), white cards, single strong accent (teal/electric blue) for CTAs + FAB.
* **Typography:** Inter/Poppins, 14–18px base, clear hierarchy.
* **Components:** rounded cards, shadows (subtle), micro‑interactions (200ms).
* **Accessibility:** WCAG AA contrast, focus outlines, keyboard navigable.

---

## 7) Reusable Components (build first)

* Buttons: **PrimaryButton**, **SecondaryButton**, **IconButton**
* **FAB** (mobile+desktop variants)
* **FormField** (label, helper, validation)
* **ItemRow** (with add/remove animation)
* **SectionCard** (collapsible)
* **Money** & **Number** formatters
* **InvoicePreviewCard** (for lists)
* **UpgradeModal**
* **ConfirmDialog**
* **Toast/Snackbar**

---

## 8) Data Model (simple & future-proof)

**Invoice**

```
id, number, createdAt, updatedAt, status (paid/unpaid),
business {name, logoUrl, contact, color},
customer {name, email, phone},
items [{name, qty, unitPrice, lineTotal}],
tax {enabled, rate, amount},
subtotal, total, notes
```

**User (Pro)**

```
uid, email, isPro, proSince, stripeCustomerId,
branding {name, logoUrl, contact, color, defaultNote},
limits {freeInvoicesUsed}
```

**Local (Free)**

```
local.freeInvoicesUsed, local.invoices[] (IndexedDB), deviceHash
```

---

## 9) PDF Templates (clean + on-brand)

* **Template A (Minimal):** left-aligned header with logo + business; bold total; thin dividers; small “Thank you” footer.
* **Template B (Compact):** two-column header (business | customer), compact rows; subtle accent stripe.
* **Pro‑only options:** color accents, hide footer branding.
* **Free watermark text:** “Made with QuickBill — quickbill.app”

---

## 10) Metering & Anti‑Abuse (transparent)

* **Anonymous free usage counter** in LocalStorage + deviceHash → mirrored to Firestore once signed in.
* If LocalStorage is cleared:

  * UX nudges login (“Sign in to keep your 3 free credits and sync across devices”).
  * Soft checks on repeated device hashes/IPs (do not block; only show upgrade nudge sooner).
* Stripe webhook → updates `isPro=true`; on cancel period end → `isPro=false`.

---

## 11) Analytics & Privacy

* Privacy‑friendly analytics (page views, conversion events).
* Track: start invoice, preview, download, open paywall, checkout start/success.
* Store minimal PII, allow **Data Export** in Settings.
* Clear **Terms & Privacy** (plain English).

---

## 12) Project Structure (web app)

```
/quickbill
├─ public/                      # icons, PWA manifest, static assets
├─ src/
│  ├─ app/                      # routing, providers
│  ├─ core/
│  │  ├─ theme/                 # colors, spacing, typography tokens
│  │  ├─ utils/                 # formatters, validators, fp helpers
│  │  └─ hooks/                 # useLocalCount, useAuth, useProStatus
│  ├─ data/
│  │  ├─ models/                # Invoice, Item, User types
│  │  ├─ local/                 # IndexedDB/LocalStorage adapters
│  │  ├─ remote/                # Firestore CRUD (guarded by isPro)
│  │  └─ payments/              # Stripe client helpers
│  ├─ services/
│  │  ├─ pdf/                   # pdf-lib composer, templates A/B
│  │  ├─ auth/                  # email link, google
│  │  └─ subscription/          # entitlement checks, gating
│  ├─ ui/
│  │  ├─ components/            # buttons, FAB, form fields, modals...
│  │  ├─ layout/                # headers, containers, responsive grid
│  │  └─ patterns/              # SectionCard, ItemList, UpgradePrompt
│  ├─ pages/
│  │  ├─ home/
│  │  ├─ invoice-create/
│  │  ├─ invoice-preview/
│  │  ├─ history/
│  │  ├─ paywall/
│  │  └─ settings/
│  └─ state/                    # small global store (Zustand/Context)
├─ functions/                   # Firebase Functions (Stripe webhooks)
└─ scripts/                     # cleanup, lint, duplicate check
```

---

## 13) Build Hygiene (your “no duplicates” rule)

* **Pre‑commit checks:**

  * Lint + Type check.
  * Script to detect **duplicate component names** & orphan files.
  * Script to compare `/ui/components` exports vs actual usage (dead code).
* **Replacement rule:** when refactoring a file/widget:

  * Delete old file first → run build → then create the new file with same export name.
* **Design tokens first:** lock **theme + spacing scale** before any screen work.
* **Widget registry:** a single `index.ts` per folder to expose only approved components.

---

## 14) Content & Legal

* **Paywall copy:** concise benefits, risk‑free tone (“cancel anytime”).
* **Receipts for subscriptions:** Stripe handles, link in Settings.
* **Terms & Privacy:** simple, promise not to sell data, explain watermark & limits.

---

## 15) Phased Rollout (no code, just the plan)

**Day 1:** Brand, theme tokens, components (Button, FAB, SectionCard, FormField).
**Day 2:** Invoice Creator (form logic, item rows, totals).
**Day 3:** Preview + PDF (template A, watermark, download/share).
**Day 4:** History (local for free; cloud for Pro), search, delete.
**Day 5:** Paywall & Upgrade modal, Stripe checkout + webhook.
**Day 6:** Settings (branding, portal link), PWA, accessibility polish.
**Day 7:** QA, duplicate-file sweep, analytics events, launch page.

---

If you want, I can turn this into a **Copilot-ready build brief** (step-by-step TODOs + acceptance criteria per screen and feature) so you can paste it in and let it scaffold everything exactly to spec — still no code, just instructions.
