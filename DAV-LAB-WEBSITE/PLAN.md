# DAV Lab Website — Project Plan

## Goal
Build a new, polished static website inside `DAV-LAB-WEBSITE/` that presents the existing Data Analytics & Visualization laboratory work for the movie-streaming dataset.

## Non-negotiable scope
- Work only inside `DAV-LAB-WEBSITE/` for the new website.
- Do not modify, rename, delete, or replace the original academic files in the repository root.
- Treat the CSV, Lab 1 notebook, Lab 2 workbook, Lab 3 notebook, README, and other existing source material as the source of truth.
- Do not invent unsupported columns, statistics, conclusions, or analysis.
- Preserve the distinction between platform availability counts and unique movie counts.
- Keep the site static and GitHub Pages compatible.

## Experience
The site should feel like a premium academic/data-storytelling portfolio rather than an admin dashboard.

Primary visitor questions:
1. What is this project?
2. What was done in each lab?
3. What techniques were used?
4. What do the results show?
5. Can I explore the data?
6. Can I access the original work?

## Information architecture
- Home
- Labs
  - Lab 1 — Python / cleaning & exploratory analysis
  - Lab 2 — Excel analysis
  - Lab 3 — Seaborn / statistical visualization
- Data Explorer
- Insights
- Resources

## Recommended visual direction
- Editorial + modern academic
- Light/off-white background
- Dark typography
- One strong accent color
- Strong type hierarchy
- Generous whitespace
- Thin borders and restrained cards
- High-quality interactive charts
- Subtle motion only
- Excellent mobile layout
- Avoid glassmorphism, excessive gradients, neon effects, 3D charts, noisy decoration, and generic SaaS-dashboard styling.

## Technical architecture
Static frontend:
- HTML5
- CSS3
- Vanilla JavaScript ES6+
- Plotly.js
- PapaParse
- GitHub Pages

No React, Next.js, Vue, backend, database, authentication, or server/API requirement.

## Suggested structure
DAV-LAB-WEBSITE/
  README.md
  PLAN.md
  ANTIGRAVITY-PROMPT.md
  index.html
  labs.html
  lab1.html
  lab2.html
  lab3.html
  explorer.html
  insights.html
  resources.html
  css/
    global.css
    components.css
    pages.css
  js/
    app.js
    data.js
    charts.js
    explorer.js
    components.js
  assets/
  data/

Antigravity may improve this structure while keeping the same static architecture.

## Home
Hero + project purpose + verified dataset snapshot + three lab cards + workflow + selected verified findings.

## Lab pages
Each lab should be an explorable article:
Objective → Task/Technique → Result → Visualization → Interpretation → Conclusion.

Keep notebook code snippets short and purposeful.

## Data Explorer
Interactive search/filtering over the actual CSV:
- title search
- platform
- age
- minimum/maximum year
- minimum Rotten Tomatoes score
- matching count
- mean
- median
- high-rated count
- responsive result table
- filtered CSV download

Missing numeric filter inputs mean no restriction. Missing data must not automatically become zero.

## Visualizations
Use the actual laboratory work as the basis. Reproduce required assignment visualizations and make them polished and interactive where appropriate.

Lab 1 includes profiling, missing values, Rotten Tomatoes cleaning, descriptive statistics, platform counts/comparison, year analysis, age analysis, highly-rated movies and related visualizations.

Lab 2 must be derived from the actual Excel workbook. Do not guess worksheet contents.

Lab 3 includes Rotten Tomatoes descriptive analysis, boxplot by Age, histogram + KDE, correlation heatmap, violin plot by Age, platform analysis, and year analysis.

## Important score-scale note
Lab 3's original notebook uses Rotten Tomatoes on a 0–100 scale. Other project material may use a normalized 0–10 representation. Do not alter the original notebooks. Clearly label the scale used by each website visualization and keep each visualization internally consistent.

## QA
Before completion, test:
- all links
- all pages
- CSV loading
- filters
- tables
- export
- charts
- desktop
- tablet
- mobile
- console errors
- missing assets
- broken routes
- accessibility and focus states
- source accuracy of displayed statistics

The result should look finished enough to show directly to a professor.
