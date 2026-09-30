# OTT DAV Project — Antigravity Rules

## Mission
Turn the existing OTT Streaming Platforms Content Analytics lab work into a polished, navigable academic website without changing the underlying analysis.

## Source of truth
- MoviesOnStreamingPlatforms.csv is the source of record-level data.
- DAV_Lab_Assignment_1_Movie_Streaming_Analysis.ipynb is the Lab 1 workflow.
- DAV_Lab_Assignment_2_Movie_Streaming_Platform.xlsx is the Lab 2 workbook.
- DAV_Lab_Assignment_3_Movie_Streaming_Analysis.ipynb is the Lab 3 workflow.
- Do not invent columns or findings that are absent from the supplied files.

## Academic guardrails
- Keep conclusions descriptive, not causal.
- Platform flags are non-exclusive; do not sum them as unique movies.
- Preserve the project's RT ≥ 8.0/10 high-rated threshold in the presentation layer.
- Age has substantial missingness; show that caveat.
- Do not invent Genre, IMDb, Directors, Country, Language, Runtime, or audience-preference fields.
- If the source contains an inconsistency, surface it instead of silently changing the original work.

## Website engineering rules
- Preserve the existing working UI unless the task explicitly requests a redesign.
- Prefer small, maintainable changes.
- Keep the static website dependency-light.
- Run a local HTTP server before browser testing because the site loads the CSV.
- Test the navigation, filters, charts, table rendering, and CSV export.
- Check browser console errors.
- Check responsive layout at desktop and mobile widths.
- Do not expose secrets or API keys.

## Antigravity workflow
1. Use /plan for multi-file features.
2. Review the plan before execution.
3. Use /goal for implementation plus build/test/fix loops.
4. Use /browser for UI verification.
5. Use /boost only for difficult bugs or regressions.
6. Before committing, show the Git diff and summarize changes.

## Completion criteria
- Website starts locally.
- All main navigation sections work.
- CSV loads successfully.
- Core charts render.
- Data Explorer filters work.
- Filtered CSV download works.
- Existing notebooks and workbook remain unchanged.
- No unsupported analytics are added.

## Important normalization note
Lab 3's notebook contains a cleaned Rotten Tomatoes field on the original 0–100 scale, while the project presentation uses a normalized 0–10 scale. The website should use the presentation's normalized /10 scale for its dashboard display, while leaving the original notebook unchanged.