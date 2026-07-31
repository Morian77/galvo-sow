# Galvo's SOW — onsite job sheet

Offline-capable web app for filling out and signing Engagis Statements of Work onsite.
Built for Galvo's IT Solutions (Steven Galvin).

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app — UI, storage, signature pads, PDF output |
| `jobs.json` | Job list. Regenerated from Outlook; the app reads it on load and on "Refresh" |
| `pdf-lib.min.js` | Writes into the Engagis SOW, offline |
| `pdf.min.js` + `pdf.worker.min.js` | Reads the SOW to locate its fields at runtime |
| `sw.js` | Service worker — makes the app work with no signal |
| `manifest.json` | Lets it install to the home screen as a real app |

All six files must sit in the same folder.

The ☰ menu shows the build number. If a change doesn't seem to have landed, check it
there, and use **Force update to latest build** to clear the cache (your jobs are stored
separately and aren't touched).

## Getting it onto your phone

**Option A — Netlify Drop (fastest, no account needed to start)**

1. Go to https://app.netlify.com/drop
2. Drag the whole `sow-app` folder onto the page.
3. You get a URL like `https://random-name.netlify.app`. Open it on your phone.
4. iPhone: Share → Add to Home Screen. Android: menu → Install app.

**Option B — GitHub Pages**

1. Create a repo, upload the four files to the root.
2. Settings → Pages → Deploy from branch → `main` / root.
3. Open the published URL on your phone and add to home screen.

Either way, once it's been opened online the app is cached and works with **no signal at all**.
Everything you type, every photo and both signatures are stored on the device only —
nothing leaves the phone until you hit "Email to Engagis".

## Using it onsite

1. Open the app, tap the job.
2. **On arrival:** tap *Now* next to Tech arrival time, then call 1300 203 810 (Option 1) — the button is right there.
3. Do the work. Take photos in the Photos section as you go.
4. Fill root cause, steps taken, preventative recommendations, screen health check, LED brightness.
   All are mandatory — Engagis rejects SOWs without them.
5. **Before you leave:** tap *Now* next to departure time, call Support again for check-out.
   Billable time auto-calculates (1 hr minimum, rounded up to the next half hour) — edit if needed.
6. Sign yourself, then hand the phone to the store contact for their signature.
7. Produce the PDF — two options, see below.
8. **Email** → opens a pre-addressed draft to installations@engagis.com.
   Attach the PDF, then send.

The job moves to "Completed" once you've sent it.

## The two PDF outputs

**Build SOW pack** — the one to use by default.

Attach the SOW PDF Engagis emailed for that job (the *Engagis SOW PDF* card on the job
screen). The app fills in **their form, in place** — arrival, departure, billable time,
root cause, steps, recommendations, returned items, screen health check, LED brightness,
both signatures, the circle around Yes or No, and the names and dates. Photos are added
as extra pages. What you send back is their document, completed.

**Own PDF** — the fallback.

The same content as a standalone job sheet on your letterhead, via your phone's print
dialog → Save as PDF. Use it if you haven't got their SOW PDF on the phone.

Both are validated the same way — neither produces anything until every mandatory field
is filled and both signatures are captured.

Verified against three real layouts: the 2-page SOW, the 3-page SOW, and the older
single-page template (which has no items or screen-health rows, different column widths,
and rows only ~10pt tall). Type is sized to the row it's going into, so nothing spills.

If a field can't be found on a template, the app tells you which ones are still blank
rather than quietly leaving gaps.

### How it finds the fields

Engagis regenerate the SOW per job and the job brief varies in length, so the summary
table doesn't sit in the same place twice — on a long brief the "IMPORTANT NOTE" block
spills onto page 2 and shoves the table down, sometimes onto page 3. Writing at fixed
coordinates puts text in the wrong place the moment that happens.

Instead the app reconstructs the table from the PDF itself. It reads the drawing
instructions to recover every rule in the grid, finds each label ("Tech Arrival Time",
"Identified Root Cause", "LED Brightness", the Yes/No row) wherever Engagis put it, and
writes into whichever cell the grid says is next to that label. No measurement is
hard-coded, so page count, row height and column widths can all change without breaking
it.

Two wrinkles it accounts for, both of which caused visible misalignment before:

- Merged cells are made by painting a **white line over a real rule**. The rule is still
  in the file, so it has to be treated as erased or a full-width cell reads as a narrow
  first column.
- The older template paints a background rectangle behind **every line of text**. Those
  aren't row borders, and treating them as such chops each cell into 10pt slivers.

If a field's text is too long for their cell, what fits goes in the cell, marked
"(continued on attached page)", and the full text is printed on a continuation sheet at
the back — nothing is silently truncated.

If the labels can't be found at all (wrong file attached, or a scanned SOW with no text
layer), the app says so rather than producing a mangled document, and you fall back to
"Own PDF".

## Getting new jobs into the list

Three ways, all in the ☰ menu:

- **Refresh jobs from jobs.json** — pulls whatever is in the hosted `jobs.json`.
- **Import jobs (paste JSON)** — paste a block Claude gives you. Safe to re-run: it updates
  job details but never overwrites work you've already entered onsite.
- **New blank job sheet** — for anything that didn't come through Engagis.

Ask Claude *"scan Outlook for new Engagis jobs"* and it will produce the JSON to paste.

## Job JSON format

```json
{
  "store": "Telstra Store Raymond Terrace (FRE 1.5)",
  "case": "454132",
  "po": "PO90548",
  "requestedBy": "Andreane Kharl Gurrea",
  "issueDate": "2026-07-24",
  "contactName": "", "contactPhone": "", "contactEmail": "",
  "siteAddress": "35-39 William Street, Raymond Terrace NSW 2324",
  "issue": "TSAURAYTREIPR01 TSN FRE Offline PC",
  "device": "TSAURAYTREIPR01",
  "ltId": "", "token": "N/A",
  "jobDate": "2026-07-28",
  "timeAllocated": "", "jobTime": "During trading hours",
  "brief": "Full job brief text..."
}
```

Jobs are matched on `case` + `po` + `store`.

## Backups

☰ → **Download backup of all jobs** writes a JSON file with every job, including
signatures and photos. Worth doing after a big week — browser storage can be cleared
if you wipe site data.

## Notes on the signature

Both PDFs record, alongside each signature, the typed name, the date and the exact
timestamp the signature was captured. That's a stronger record than an ink signature on
a printed form, which carries no timestamp at all.

## If Engagis changes their form

Nothing to do. The pack appends rather than overwrites, so a template change on their end
can't break it. If they ever add a field, tell Claude and it can add the matching input.
