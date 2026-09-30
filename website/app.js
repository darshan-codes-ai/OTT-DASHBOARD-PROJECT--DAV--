const CSV_URL='https://raw.githubusercontent.com/darshan-codes-ai/OTT-DASHBOARD-PROJECT--DAV--/main/MoviesOnStreamingPlatforms.csv';
const platforms=['Netflix','Hulu','Prime Video','Disney+'];
const ageOrder=['all','7+','13+','16+','18+'];
let allRows=[];
let filteredRows=[];

const $=id=>document.getElementById(id);
const fmt=n=>Number(n).toLocaleString('en-IN');
const round1=n=>Number.isFinite(n)?n.toFixed(1):'—';

function normalizeRow(r){
  const age=(r['Age']||'').trim();
  const raw=(r['Rotten Tomatoes']||'').trim();
  const rt=raw?Number(raw.replace('/100',''))/10:null;
  return {ID:Number(r.ID),Title:(r.Title||'').trim(),Year:Number(r.Year),Age:age,
    rt:Number.isFinite(rt)?Math.round(rt*10)/10:null,
    Netflix:Number(r.Netflix)||0,Hulu:Number(r.Hulu)||0,
    'Prime Video':Number(r['Prime Video'])||0,'Disney+':Number(r['Disney+'])||0,
    Type:Number(r.Type)||0};
}
function numericValues(rows){return rows.map(r=>r.rt).filter(v=>Number.isFinite(v));}
function mean(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:null;}
function median(values){if(!values.length)return null;const s=[...values].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;}
function platformCounts(rows=allRows){return platforms.map(p=>rows.reduce((s,r)=>s+r[p],0));}
function baseLayout(){
  return {paper_bgcolor:'transparent',plot_bgcolor:'transparent',
    font:{color:'#c9d6dc',family:'Inter,system-ui,sans-serif',size:11},
    margin:{l:48,r:18,t:14,b:48},
    xaxis:{gridcolor:'rgba(255,255,255,.07)',zerolinecolor:'rgba(255,255,255,.07)'},
    yaxis:{gridcolor:'rgba(255,255,255,.07)',zerolinecolor:'rgba(255,255,255,.07)'},
    hoverlabel:{bgcolor:'#0e1a24',font:{color:'#eef5f8'}},legend:{orientation:'h',y:-0.18}};
}
const plotConfig={displayModeBar:false,responsive:true};

function plotPlatformCharts(){
  const counts=platformCounts();
  Plotly.newPlot('platformChart',[{x:platforms,y:counts,type:'bar'}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Platform'},yaxis:{...baseLayout().yaxis,title:'Records'}},plotConfig);

  const high=allRows.filter(r=>Number.isFinite(r.rt)&&r.rt>=8);
  const hc=platformCounts(high);
  Plotly.newPlot('highRatedChart',[{y:platforms,x:hc,type:'bar',orientation:'h'}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Records'},yaxis:{...baseLayout().yaxis,autorange:'reversed'}},plotConfig);
}

function yearData(rows){
  const map=new Map();
  rows.forEach(r=>{if(Number.isFinite(r.Year))map.set(r.Year,(map.get(r.Year)||0)+1);});
  const xs=[...map.keys()].sort((a,b)=>a-b);
  return {xs,ys:xs.map(x=>map.get(x))};
}
function plotYearChart(rows=allRows){
  const d=yearData(rows);
  Plotly.newPlot('yearChart',[{x:d.xs,y:d.ys,type:'scatter',mode:'lines'}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Year'},yaxis:{...baseLayout().yaxis,title:'Movies'}},plotConfig);
}
function plotAgeChart(rows=allRows){
  const map=new Map();
  rows.forEach(r=>{const a=r.Age||'Unknown';map.set(a,(map.get(a)||0)+1);});
  const xs=[...map.keys()].sort((a,b)=>{const ai=ageOrder.indexOf(a),bi=ageOrder.indexOf(b);return(ai<0?99:ai)-(bi<0?99:bi);});
  Plotly.newPlot('ageChart',[{x:xs,y:xs.map(x=>map.get(x)),type:'bar'}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Age rating'},yaxis:{...baseLayout().yaxis,title:'Records'}},plotConfig);
}
function plotRtHistogram(rows=allRows){
  Plotly.newPlot('rtHistogram',[{x:numericValues(rows),type:'histogram',nbinsx:20}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Rotten Tomatoes / 10'},yaxis:{...baseLayout().yaxis,title:'Movies'}},plotConfig);
}
function kernel(values,bw){
  if(!values.length)return {xs:[],ys:[]};
  const min=Math.min(...values),max=Math.max(...values),steps=70,xs=[],ys=[];
  for(let i=0;i<steps;i++){
    const x=min+(max-min)*i/(steps-1||1);let d=0;
    values.forEach(v=>{const z=(x-v)/bw;d+=Math.exp(-0.5*z*z);});
    xs.push(x);ys.push(d/(values.length*bw*Math.sqrt(2*Math.PI)));
  }
  return {xs,ys};
}
function plotKde(rows=allRows){
  const vals=numericValues(rows),k=kernel(vals,0.35);
  Plotly.newPlot('kdeChart',[{x:vals,type:'histogram',nbinsx:20,histnorm:'probability density',opacity:.52,showlegend:false},
    {x:k.xs,y:k.ys,type:'scatter',mode:'lines',showlegend:false}],
    {...baseLayout(),xaxis:{...baseLayout().xaxis,title:'Rotten Tomatoes / 10'},yaxis:{...baseLayout().yaxis,title:'Density'}},plotConfig);
}
function plotBox(){
  const traces=ageOrder.map(age=>({y:allRows.filter(r=>r.Age===age&&Number.isFinite(r.rt)).map(r=>r.rt),type:'box',name:age,boxpoints:false}));
  Plotly.newPlot('boxChart',traces,{...baseLayout(),yaxis:{...baseLayout().yaxis,title:'Rotten Tomatoes / 10'},showlegend:false},plotConfig);
}
function plotViolin(){
  const traces=ageOrder.map(age=>({y:allRows.filter(r=>r.Age===age&&Number.isFinite(r.rt)).map(r=>r.rt),type:'violin',name:age,box:{visible:true},meanline:{visible:true},points:false}));
  Plotly.newPlot('violinChart',traces,{...baseLayout(),yaxis:{...baseLayout().yaxis,title:'Rotten Tomatoes / 10'},showlegend:false},plotConfig);
}
function correlationMatrix(rows){
  const keys=['Year','rt','Netflix','Hulu','Prime Video','Disney+','Type'];
  const series={Year:rows.map(r=>r.Year),rt:rows.map(r=>r.rt),Netflix:rows.map(r=>r.Netflix),Hulu:rows.map(r=>r.Hulu),'Prime Video':rows.map(r=>r['Prime Video']),'Disney+':rows.map(r=>r['Disney+']),Type:rows.map(r=>r.Type)};
  const corr=(a,b)=>{
    const pairs=[];for(let i=0;i<a.length;i++)if(Number.isFinite(a[i])&&Number.isFinite(b[i]))pairs.push([a[i],b[i]]);
    if(pairs.length<2)return 0;
    const av=mean(pairs.map(p=>p[0])),bv=mean(pairs.map(p=>p[1]));let num=0,da=0,db=0;
    pairs.forEach(p=>{const dx=p[0]-av,dy=p[1]-bv;num+=dx*dy;da+=dx*dx;db+=dy*dy;});
    return da&&db?num/Math.sqrt(da*db):0;
  };
  return {keys,z:keys.map(a=>keys.map(b=>corr(series[a],series[b])))};
}
function plotHeatmap(){
  const c=correlationMatrix(allRows);
  Plotly.newPlot('heatmap',[{z:c.z,x:c.keys,y:c.keys,type:'heatmap',zmin:-1,zmax:1,colorscale:'Viridis'}],
    {...baseLayout(),margin:{l:100,r:15,t:10,b:72}},plotConfig);
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function renderTopTitles(){
  const top=allRows.filter(r=>Number.isFinite(r.rt)).sort((a,b)=>b.rt-a.rt||a.Title.localeCompare(b.Title)).slice(0,10);
  $('topTitles').innerHTML=top.map(r=>'<div class="title-row"><div><div class="title">'+escapeHtml(r.Title)+'</div><div class="meta">'+r.Year+' · '+(r.Age||'Age unknown')+'</div></div><div class="title-score">'+r.rt.toFixed(1)+'</div></div>').join('');
}
function populateAgeFilter(){
  const ages=[...new Set(allRows.map(r=>r.Age).filter(Boolean))].sort((a,b)=>{const ai=ageOrder.indexOf(a),bi=ageOrder.indexOf(b);return(ai<0?99:ai)-(bi<0?99:bi);});
  $('ageFilter').innerHTML='<option value="all">All / unknown</option>'+ages.map(a=>'<option value="'+escapeHtml(a)+'">'+escapeHtml(a)+'</option>').join('');
}
function renderTable(rows){
  $('dataTable').innerHTML=rows.map(r=>'<tr><td>'+escapeHtml(r.Title)+'</td><td>'+(Number.isFinite(r.Year)?r.Year:'—')+'</td><td>'+(r.Age||'Unknown')+'</td><td>'+(Number.isFinite(r.rt)?r.rt.toFixed(1):'—')+'</td><td>'+r.Netflix+'</td><td>'+r.Hulu+'</td><td>'+r['Prime Video']+'</td><td>'+r['Disney+']+'</td></tr>').join('');
}
function renderExplorerCharts(rows){plotYearChart(rows);plotRtHistogram(rows);plotAgeChart(rows);}
function applyFilters(){
  const search=$('searchInput').value.trim().toLowerCase(),platform=$('platformFilter').value,age=$('ageFilter').value;
  const minYearRaw=$('yearMin').value.trim(),maxYearRaw=$('yearMax').value.trim();
  const minYear=minYearRaw===''?null:Number(minYearRaw),maxYear=maxYearRaw===''?null:Number(maxYearRaw),minRt=Number($('rtFilter').value)||0;
  filteredRows=allRows.filter(r=>{
    if(search&&!r.Title.toLowerCase().includes(search))return false;
    if(platform!=='all'&&!r[platform])return false;
    if(age!=='all'&&r.Age!==age)return false;
    if(minYear!==null&&Number.isFinite(minYear)&&r.Year<minYear)return false;
    if(maxYear!==null&&Number.isFinite(maxYear)&&r.Year>maxYear)return false;
    if(Number.isFinite(minRt)&&(r.rt??-Infinity)<minRt)return false;
    return true;
  });
  const vals=numericValues(filteredRows);
  $('matchCount').textContent=fmt(filteredRows.length);$('matchMean').textContent=round1(mean(vals));$('matchMedian').textContent=round1(median(vals));
  $('matchHigh').textContent=fmt(filteredRows.filter(r=>Number.isFinite(r.rt)&&r.rt>=8).length);
  renderTable(filteredRows.slice(0,100));renderExplorerCharts(filteredRows);
}
function updateHeadlineStats(){
  const vals=numericValues(allRows);
  $('statRecords').textContent=fmt(allRows.length);$('statPrime').textContent=fmt(allRows.reduce((s,r)=>s+r['Prime Video'],0));
  $('statMedian').textContent=round1(median(vals));$('statHigh').textContent=fmt(allRows.filter(r=>Number.isFinite(r.rt)&&r.rt>=8).length);
}
function downloadFilteredCsv(){
  const rows=filteredRows.map(r=>({ID:r.ID,Title:r.Title,Year:r.Year,Age:r.Age,'Rotten Tomatoes Score':r.rt,Netflix:r.Netflix,Hulu:r.Hulu,'Prime Video':r['Prime Video'],'Disney+':r['Disney+'],Type:r.Type}));
  const blob=new Blob([Papa.unparse(rows)],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='ott_filtered_records.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function setup(){
  ['searchInput','yearMin','yearMax','rtFilter'].forEach(id=>$(id).addEventListener('input',applyFilters));
  ['platformFilter','ageFilter'].forEach(id=>$(id).addEventListener('change',applyFilters));
  $('resetFilters').addEventListener('click',()=>{$('searchInput').value='';$('platformFilter').value='all';$('ageFilter').value='all';$('yearMin').value='';$('yearMax').value='';$('rtFilter').value='0';applyFilters();});
  $('downloadCsv').addEventListener('click',downloadFilteredCsv);
  const links=[...document.querySelectorAll('.nav-link')],sections=[...document.querySelectorAll('section[id]')];
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id));}),{rootMargin:'-20% 0px -65% 0px'});
  sections.forEach(s=>obs.observe(s));
}
function init(){
  setup();
  Papa.parse(CSV_URL,{download:true,header:true,skipEmptyLines:true,complete:results=>{
    allRows=results.data.map(normalizeRow).filter(r=>r.Title);filteredRows=[...allRows];
    $('loadStatus').textContent='Loaded '+fmt(allRows.length)+' records';
    updateHeadlineStats();$('qualityAgeMissing').textContent=fmt(allRows.filter(r=>!r.Age).length);$('qualityRtMissing').textContent=fmt(allRows.filter(r=>!Number.isFinite(r.rt)).length);
    populateAgeFilter();plotPlatformCharts();plotYearChart();plotRtHistogram();plotAgeChart();plotBox();plotViolin();plotHeatmap();plotKde();renderTopTitles();applyFilters();
  },error:err=>{$('loadStatus').textContent='Dataset failed to load';console.error(err);}});
}
window.addEventListener('load',init);