# OTT Atlas — Web MVP

This folder is the interactive website layer for the existing OTT Streaming Platforms Content Analytics academic project.

Included:
- Overview and project workflow
- Lab 1: Python/Pandas profiling, cleaning, statistics and visualizations
- Lab 2: direct access to the original Excel workbook
- Lab 3: boxplot, violin plot, histogram/KDE, correlation heatmap, platform and year analysis
- Interactive Data Explorer with title, platform, age, year and RT filters
- Filtered CSV download
- Evidence-first insights and direct source links

Run locally from the repository root with: python -m http.server 8000
Then open: http://localhost:8000/website/

Data integrity: the website preserves the supplied project scope. It does not invent Genre, IMDb, Directors, Country, Language, Runtime or other unavailable fields. Lab 2 remains linked to the original workbook rather than fabricating sheet-level results.