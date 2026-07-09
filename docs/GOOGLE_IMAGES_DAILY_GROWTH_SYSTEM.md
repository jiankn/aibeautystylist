# Google Images Daily Growth System

Updated: 2026-07-10

This system runs in sync with the Pinterest daily plan. Pinterest is the fast distribution channel; Google Images is the long-term visual search asset channel.

Core judgment:

> Can Google clearly understand what this image shows, and can the visitor click through to try the same makeup look on her own face?

If the answer is no, the image is not ready for Google Images.

## 1. Positioning

Google Images is not a place where we publish posts every day. Google discovers images from crawlable web pages, interprets them through the page context, file name, alt text, captions, structured metadata, and image sitemaps, then may show them in Google Images or image previews.

For AI Beauty Stylist, Google Images should not replace Pinterest. It should reuse every proven Pinterest theme and turn it into a durable search asset.

Daily pairing:

```text
Pinterest Pin topic
-> matching landing page
-> clean Google Images version
-> image SEO metadata
-> image sitemap entry
-> GSC Image performance review
```

## 2. First Principles

- Users on Google Images are searching for visual proof, not a brand feed.
- Google needs crawlable images inside relevant pages, not decorative background images.
- The image must be supported by nearby text that explains the same makeup intent.
- The image should look useful even without text overlays.
- The landing page must let the visitor try the same look immediately.
- Do not create thin standalone pages just to host images.

## 3. Asset Rule

Every Pinterest Pin topic must produce two image assets:

1. Pinterest version
   - 1000 x 1500
   - Text, brand, URL, CTA allowed
   - Used on Pinterest only

2. Google Images version
   - Clean realistic photo
   - No text, no CTA, no logo, no watermark
   - Descriptive filename
   - At least 1200 px wide when possible
   - Used on the website landing page, Open Graph metadata, and image sitemap

Optional third asset:

3. Social / Discover preview
   - 1200 x 630 or 16:9
   - Clean, high-resolution, relevant to the page
   - Only if the page needs a stronger preview image

## 4. Daily Workflow

Run this checklist whenever the Pinterest daily plan creates a new Pin.

### Step 1: Match the topic

Use the same theme as the Pinterest Pin.

Examples:

- `5-minute makeup`
- `office makeup`
- `date night makeup`
- `hooded eyes makeup`
- `soft glam makeup`
- `wedding guest makeup`

### Step 2: Pick one destination page

Use an existing strong page whenever possible.

Examples:

- `/scenarios/quick-5min`
- `/scenarios/office`
- `/scenarios/first-date`
- `/for/hooded-eyes`
- `/looks/soft-glam`
- `/scenarios/wedding-guest`

Do not create a new page unless the topic has a distinct search intent and enough value to stand alone.

### Step 3: Create the Google Images version

Required image quality:

- Real commercial beauty photography feel
- Natural skin texture
- Clear makeup details
- Real setting, not fake AI backdrop
- No text generated inside the image
- No poster layout
- No plastic skin, warped jewelry, distorted hands, or uncanny eyes

Filename format:

```text
topic-keyword-specific-visual.webp
```

Examples:

```text
5-minute-makeup-real-morning-light.webp
office-makeup-natural-workday-look.webp
date-night-soft-mauve-low-light-makeup.webp
hooded-eyes-visible-eyeshadow-placement.webp
```

### Step 4: Put the image into the page

The image must be visible in the page HTML with a real `<img>` tag. Do not rely only on CSS background images.

Required page elements:

- Descriptive `alt`
- Nearby headline or caption
- 1-3 sentences explaining who the look is for
- CTA to the matching no-sign-up try-on path
- Same visual trust chain into `/tryon`
- Google Images retention module in the current language

### Step 5: Add metadata

For each image-ready page, check:

- Page title matches the image intent.
- Meta description mentions the same makeup scenario.
- Open Graph image uses a clean relevant image when possible.
- Structured data image points to the relevant image when applicable.
- `max-image-preview:large` is allowed.

### Step 6: Add image sitemap entry

Every approved Google Images asset must be listed in `/sitemap-images.xml` with:

- Landing page URL
- Image URL
- Image title
- Image caption

If the image has not been added to the registry yet, mark the daily task as `Image sitemap entry: pending`.

### Step 7: Log the task

Daily log fields:

```text
Google Images topic:
Destination page:
Clean image path:
Filename:
Alt text:
Caption / nearby copy:
Added to page:
Image sitemap entry:
Deployed:
GSC Image check due:
```

## 5. Weekly Review

Review once per week in Google Search Console.

Use:

```text
Performance -> Search type: Image
```

Record:

- Image impressions
- Image clicks
- Image CTR
- Queries
- Pages
- Countries
- Devices

Decision rules:

- Impressions up, clicks low: improve image crop, title, and page snippet.
- Clicks up, try-on low: landing page does not continue the same visual promise.
- No impressions after indexing: improve page context, internal links, sitemap, or keyword fit.
- Strong Image query: create a Pinterest variant for the same theme.

## 6. 30 / 60 / 90 Day Targets

### Days 1-30

- Build image sitemap infrastructure.
- Convert the first 8 Pinterest topics into clean Google Images assets.
- Ensure each image has matching page context and alt text.
- Verify GSC can see image URLs.

### Days 31-60

- Add 20-30 image assets tied to existing pages.
- Start reviewing Image impressions and queries weekly.
- Improve pages with impressions but no clicks.

### Days 61-90

- Reach 50+ clean image assets.
- Use GSC Image queries to choose future Pinterest Pin topics.
- Prioritize themes that show both image demand and try-on conversion potential.

## 7. Do Not Do

- Do not upload Pinterest poster images with big text as the main Google Images asset.
- Do not create many thin pages just for image keywords.
- Do not keyword-stuff alt text.
- Do not use unrelated stock-style images.
- Do not show an image on the landing page and a different image in the `/tryon` selected-look panel.
- Do not use East Asia assets for English/global pages unless the topic is specifically East Asian beauty.
- Do not let a Google Images visitor only view a photo with no next action.

## 8. Current P0 Implementation Backlog

These are required before Google Images becomes a fully operational daily channel:

- [x] Add `sitemap-images.xml`.
- [x] Add an image asset registry for approved Google Images assets.
- [x] Add tests that image sitemap entries point to existing files.
- [x] Add a daily log section for Google Images companion tasks.
- [x] Audit the first 8 Pinterest topics and select clean Google Images versions for each.

## 9. Current P1 Retention Backlog

Goal: keep Google Images visitors from bouncing after viewing one image.

- [x] Add a reusable Google Images retention module.
- [x] Localize the module for all 9 active site languages.
- [x] Attach the module to the first 8 Google Images landing themes.
- [x] Hide the module for Pinterest UTM traffic so Pinterest pages do not become overloaded.
- [x] Route each module CTA to a matching no-sign-up try-on path.
- [x] Add tests for language coverage, route coverage, and CTA parameters.

## 10. Sources

- Google Images SEO best practices: https://developers.google.com/search/docs/appearance/google-images
- Google image sitemaps: https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
- Google Discover image guidance: https://developers.google.com/search/docs/appearance/google-discover
- Google Search Console Performance report: https://support.google.com/webmasters/answer/7576553
