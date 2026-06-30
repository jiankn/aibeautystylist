# Reference makeup keyword decision — DataForSEO

Market: United States · Language: English · checked 2026-06-30

## Measured candidates

| Keyword | Monthly volume | KD | CPC (USD) | Decision |
|---|---:|---:|---:|---|
| AI makeup generator | 480 | 3 | 4.05 | Build a dedicated tool-intent page |
| makeup try on | 480 | 11 | — | Keep the existing AI try-on page |
| virtual makeup | 260 | 20 | — | Keep the existing virtual makeup pages |
| makeup photo editor | 210 | 28 | 6.60 | Build one dedicated editor-intent page |
| makeup editor | 170 | 27 | 5.90 | Target on the makeup photo editor page |
| makeup simulator | 170 | 24 | — | Do not add; intent overlaps existing try-on pages and game-like SERPs |
| AI makeup editor | no reported volume | 7 | — | Use as a supporting term, not a page |
| AI makeup transfer | no reported volume | — | — | Use in product copy, not a standalone page |
| makeup look transfer | no reported volume | — | — | Use in product copy, not a standalone page |
| makeup style transfer | no reported volume | — | — | Use in product copy, not a standalone page |
| makeup transfer online | no reported volume | — | — | Do not build a page |
| digital makeup transfer | no reported volume | — | — | Do not build a page |

## SERP and cannibalization decision

- `AI makeup generator` has clear standalone tool intent and low measured difficulty. Its search results contain generators and virtual makeup tools, so it gets its own page.
- `makeup photo editor` and `makeup editor` return substantially overlapping products. They share one page to avoid keyword cannibalization.
- `makeup simulator`, `virtual makeup`, and `makeup try on` overlap the site's existing virtual try-on pages. New near-duplicate pages would weaken the cluster rather than expand it.
- Longer reference-transfer phrases describe the new product well but currently have no reported US volume. They are used naturally inside the two selected pages and product UI instead of becoming thin landing pages.

## Pages implemented

- `/ai-makeup-generator` — primary: `AI makeup generator`
- `/makeup-photo-editor` — primary: `makeup photo editor`; secondary: `makeup editor`, `AI makeup editor`
- `/ai-makeup-try-on` — retains `makeup try on` and links to both new pages

The private Premium app itself remains `noindex` at `/reference-tryon`; public landing pages explain the capability, while account photos and results remain outside the search index.
