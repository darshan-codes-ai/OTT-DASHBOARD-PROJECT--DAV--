# Antigravity Build Prompt

Open this file from the repository:

`DAV-LAB-WEBSITE/ANTIGRAVITY-PROMPT.md`

Then follow the instructions below exactly.

## Mission

Build a completely new DAV Lab website inside `DAV-LAB-WEBSITE/`.

The current website in the repository root is not the design to copy. Do not patch it. Create the new experience from scratch in the new folder.

## First: inspect before coding

Read and inspect:

- `DAV-LAB-WEBSITE/PLAN.md`
- root CSV
- Lab 1 notebook
- Lab 2 Excel workbook
- Lab 3 notebook
- root README
- root AGENTS.md
- current root website only to understand what must NOT be reused blindly

Build a source-of-truth map before implementing academic content.

## Critical file boundary

For this task, the new website's implementation must live under:

`DAV-LAB-WEBSITE/`

Do not modify, delete, rename, or replace the original academic files in the repository root.

Do not replace the existing root `index.html`, `styles.css`, or `app.js`.

The root academic materials are inputs to the website, not files to rewrite.

## Product

Create a premium academic/data-storytelling website for:

**Data Analytics & Visualization Lab — Movie Streaming Analysis**

The website should be visually impressive but academically credible.

It should communicate:

**Dataset → Cleaning → Analysis → Visualization → Insights**

without feeling like a generic dashboard.

## Visual direction

Aim for:

- editorial
- modern
- academic
- data-journalism
- premium
- spacious
- highly readable

Use:

- warm/off-white or very light neutral background
- dark charcoal typography
- restrained indigo/violet accent
- strong large headings
- elegant grid
- thin borders
- restrained rounded corners
- subtle shadows
- subtle micro-interactions
- excellent chart presentation

Avoid:

- glassmorphism
- neon
- excessive gradients
- giant animated blobs
- 3D effects
- dashboard-with-100-cards layout
- excessive icons
- excessive animations
- stock imagery that adds no meaning

The page should look like a real student research/analytics portfolio prepared for a professor.

## Pages

Build:

1. Home
2. Labs overview
3. Lab 1
4. Lab 2
5. Lab 3
6. Data Explorer
7. Insights
8. Resources

You may improve the exact static file structure if needed.

## Home

Create:

- strong hero
- concise project introduction
- verified dataset snapshot
- visual workflow
- Lab 1/2/3 cards
- selected verified findings
- clear CTA into Data Explorer

Do not dump all charts on the homepage.

## Labs

Each lab should feel like an interactive academic article.

Use:

Objective
→ What was done
→ Result
→ Visualization
→ Interpretation
→ Conclusion

Avoid overwhelming the user with raw notebook output.

For code, show compact excerpts only when helpful.

## Lab 1 source fidelity

Derive the content from the actual notebook.

Verify the actual tasks/results for:

- dataset profiling
- duplicate detection
- removal of `Unnamed: 0`
- missing-value analysis
- Rotten Tomatoes cleaning
- descriptive statistics
- platform counts
- year visualization
- platform visualization
- age visualization
- highly-rated movies
- highly-rated platform availability

Do not rewrite the academic methodology into something that was not done.

## Lab 2 source fidelity

Read the actual workbook.

Determine the actual:

- worksheets
- tasks
- formulas
- transformations
- tables
- charts
- outputs

Do not infer missing workbook details.

Where browser reproduction is inappropriate, clearly present the actual workbook as the original source.

## Lab 3 source fidelity

Derive content from the actual notebook.

Verify and present:

- Rotten Tomatoes cleaning
- descriptive statistics
- boxplot by Age
- histogram + KDE
- correlation heatmap
- violin plot by Age
- platform analysis
- year analysis

### Score scale

The original Lab 3 notebook uses the Rotten Tomatoes score on a 0–100 scale.

Other project material may use a normalized 0–10 scale.

Do not change the notebooks.

Every website chart must have a clear score scale.

## Data Explorer

Use the real CSV.

Implement:

- title search
- platform filter
- age filter
- min year
- max year
- minimum Rotten Tomatoes score

Display:

- matching records
- mean score
- median score
- high-rated count
- responsive data table

Add filtered CSV export.

Blank year fields must mean “no restriction”.

Handle missing values explicitly; never silently convert missing values to zero.

## Charts

Use Plotly.js.

Charts should be:

- responsive
- readable
- interactive
- properly labeled
- visually consistent

Use the required lab visualization types where the assignments explicitly require them.

Do not invent new metrics merely to create more charts.

## Data architecture

Use:

- HTML5
- CSS3
- Vanilla JavaScript ES6+
- Plotly.js
- PapaParse
- GitHub Pages

No:

- React
- Next.js
- Vue
- backend
- database
- authentication
- Node server
- unnecessary build system

Use modular JS files.

Suggested:

`js/app.js`
shared initialization/navigation

`js/data.js`
CSV loading, normalization, calculations

`js/charts.js`
Plotly chart functions

`js/explorer.js`
filters, table, export

`js/components.js`
shared components if useful

Suggested CSS:

`css/global.css`
`css/components.css`
`css/pages.css`

You may improve this structure if there is a clear reason.

## Resources

Provide clear links/cards for the original:

- CSV
- Lab 1 notebook
- Lab 2 Excel workbook
- Lab 3 notebook
- presentation/PDF if available
- GitHub repository

Never claim that a resource exists if it does not.

## Academic integrity

This is mandatory.

Never invent fields such as:

- Genre
- IMDb
- Directors
- Country
- Language
- Runtime
- Budget
- Revenue
- subscribers
- popularity
- causal relationships

unless verified in the repository.

Platform counts are not automatically unique-movie counts because platform availability can overlap.

Do not make causal claims from descriptive data.

All displayed statistics must be traceable to a source calculation.

## Accessibility

Use:

- semantic HTML
- correct heading hierarchy
- keyboard navigation
- visible focus states
- accessible controls
- good contrast
- responsive tables
- descriptive chart labels

## Responsive design

Test:

- desktop
- tablet
- mobile

Make the mobile layout genuinely usable rather than simply shrinking desktop components.

## Browser verification

Use Antigravity browser tooling after implementation.

Run the static site locally and test every route/page.

Verify:

- navigation
- chart rendering
- CSV loading
- filters
- table
- export
- resource links
- no console errors
- no missing assets
- no broken paths
- correct mobile behavior

Fix problems instead of only reporting them.

## Final quality bar

Do not stop at “functional”.

Perform a final visual review and improve:

- typography
- spacing
- hierarchy
- chart dimensions
- responsive behavior
- empty states
- button consistency
- navigation
- visual rhythm

The finished result should be something I can open in front of my professor and confidently present as my DAV project website.

At the end, report:

1. final project structure
2. major implementation decisions
3. source-data findings used
4. browser tests performed
5. any limitations discovered

Do not ask me to code anything manually.
