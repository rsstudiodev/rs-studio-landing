# Marketing Content Export Spec

This document defines the deterministic structure for `docs/marketing/<page>-<timestamp>.json` files. These files feed an external Instagram automation tool (video, post, carousel generation). An agent generating a new export must follow this spec exactly, without inventing fields.

This spec applies to any page or page group on the site, not only service pages: service pages (`/landing-pages`, etc.), work case studies (`/work/[slug]`), the home page's own sections, blog posts (`/blog/[slug]`), and any future page type. A "page" for this spec is one exported unit: one route, or one entry of a repeating route group (one work case study, one blog post).

## File naming

`docs/marketing/<slug>-<unix-timestamp>.json`

- `<slug>`: the page's route slug (e.g. `landing-pages`, `work/acme-rebrand`, `blog/how-we-price-projects`).
- `<unix-timestamp>`: seconds since epoch at generation time (`date +%s`).

## Language rule

- All JSON **keys**: English.
- All **content string values** (headlines, body text, list items, FAQ text, CTA labels): Spanish, copied verbatim from the site's `es` locale files. Do not translate, rewrite, or paraphrase.
- **Icon name values**: English, as coded in the source (component prop or icon library id). Never translate.
- **Image filename values**: as coded on disk. Never translate.

## Source of truth

For any given page:

1. Find the page's Astro route under `src/pages/[...locale]/` (a static route, or a dynamic `[slug].astro` for a repeating group like `work` or `blog`).
2. Find the component tree it renders. Service pages compose `Service*.astro` sections under `ServicePage.astro`; other page types may use their own section components, a content-collection entry, or inline markup — read the actual route file, do not assume the `Service*` pattern applies.
3. Resolve the actual render order and which sections are active for that specific page (sections are often conditional or have fallbacks — read the component logic, do not assume every section type applies).
4. Pull Spanish copy from the matching `es` locale namespace (e.g. `services.json`, `work.json`, `blog.json`) or, for content-collection pages, from the page's own Markdown/MDX/JSON entry under `src/content/`.
5. Resolve image filenames against the actual files in `src/assets/` (locale or content files may only hold short keys, not the real filename — verify on disk).
6. Resolve `ogImage` and other page metadata from the relevant registry (`src/content/services.ts` for services, the work/blog content collection frontmatter for those, etc.).

Never guess a missing string. If a locale key or content field is absent, omit it and flag it in the agent's report — do not fabricate content.

## Top-level JSON shape

```json
{
  "pageType": "<service | work | blog | home | ...>",
  "page": "<page key, camelCase or content-collection id>",
  "slug": "<url slug>",
  "metaTitle": "<es>",
  "metaDescription": "<es>",
  "ogImage": "<filename>",
  "seoKeywords": ["<es>", "..."],
  "sections": [ ... ]
}
```

`pageType` names the page category so the marketing tool can branch its templates (e.g. `"service"`, `"work"`, `"blog"`, `"home"`). Any field that is not tied to one visual section (like `seoKeywords`, or a service page's `whatsappMessage`) sits at top level, not inside `sections`. Top-level fields vary by `pageType` — only include fields that page type actually has; do not force every field onto every page type.

## Section objects

Each entry in `sections` is an object with a `"section"` key naming the component or content-block type in English (e.g. `"Hero"`, `"Problem"`, `"Benefits"`, `"Quoter"`, `"DomainOptions"`, `"Showcase"`, `"Process"`, `"Faq"`, or a new name for a section type introduced by another page type). Only include sections actually rendered for the page. Field names inside a section object stay consistent for that section type across every page that uses it, so a downstream tool can pattern-match by `"section"` value regardless of `pageType`. The shapes below are the known catalog, built from service pages so far — reuse a matching shape whenever a section is genuinely the same kind of content (e.g. any FAQ block, on any page type, uses the `Faq` shape). See "Adding a new section type" for section kinds not yet covered.

### Hero
```json
{ "section": "Hero", "icon": "<name>", "headline": "<es>", "intro": "<es>" }
```

### Problem
```json
{ "section": "Problem", "problem": "<es>", "whyItMatters": "<es>" }
```

### Benefits / PainPoints / DesignedFor / Deliverables (list-style sections)
```json
{ "section": "Benefits", "items": ["<es>", "..."] }
```

### Quoter
```json
{
  "section": "Quoter",
  "heading": "<es>",
  "subheading": "<es>",
  "questions": [
    { "id": "<slug>", "label": "<es>", "options": ["<es>", "..."] }
  ]
}
```

### DomainOptions
```json
{
  "section": "DomainOptions",
  "headline": "<es>",
  "intro": "<es>",
  "custom": { "heading": "<es>", "items": ["<es>", "..."] },
  "subdomain": { "heading": "<es>", "items": ["<es>", "..."] }
}
```

### Showcase
```json
{
  "section": "Showcase",
  "headline": "<es>",
  "intro": "<es>",
  "demos": [
    {
      "image": "<filename>",
      "name": "<es>",
      "tagline": "<es>",
      "description": "<es>",
      "tags": ["<es>", "..."]
    }
  ],
  "capabilities": [
    { "icon": "<name>", "title": "<es>", "description": "<es>" }
  ]
}
```

### Process
```json
{
  "section": "Process",
  "steps": [ { "title": "<es>", "body": "<es>" } ]
}
```

### Faq
```json
{
  "section": "Faq",
  "items": [ { "question": "<es>", "answer": "<es>" } ]
}
```

## Adding a new section type

If a page uses a section not listed above, add its shape to this spec in the same style (English keys, Spanish content values, icon/image names as-coded) before generating its JSON, so future exports stay structurally consistent.

## Agent report requirements

After writing the export file, the agent must report:
- File path written.
- Section types included, in render order.
- Any locale strings expected but missing (flagged, not guessed).
- Any icon/image values that could not be verified against source (flagged as unverified, not invented).
