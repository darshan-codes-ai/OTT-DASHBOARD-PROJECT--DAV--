/**
 * DAV LAB WEBSITE - UI COMPONENTS (components.js)
 * Code Copy, Tabs, Formula Inspector Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCodeCopy();
  initTabs();
});

function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('.code-block');
  codeBlocks.forEach(block => {
    const header = block.querySelector('.code-header');
    const pre = block.querySelector('pre');
    if (!header || !pre) return;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-secondary btn-sm';
    copyBtn.style.padding = '2px 8px';
    copyBtn.style.fontSize = '0.72rem';
    copyBtn.textContent = 'Copy';

    copyBtn.addEventListener('click', async () => {
      const text = pre.innerText;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
      } catch (err) {
        console.error('Clipboard copy failed:', err);
      }
    });

    header.appendChild(copyBtn);
  });
}

function initTabs() {
  const tabContainers = document.querySelectorAll('.tabs-container');
  tabContainers.forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panes = container.querySelectorAll('.tab-pane');

    buttons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        if (panes[idx]) {
          panes[idx].classList.add('active');
          // Trigger resize for Plotly charts or responsive elements inside the newly visible pane
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            panes[idx].querySelectorAll('.plotly-chart, .js-plotly-plot, .chart-body').forEach(chartEl => {
              if (window.Plotly && chartEl.data) {
                Plotly.Plots.resize(chartEl);
              }
            });
          }, 60);
        }
      });
    });
  });
}
