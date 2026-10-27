/* Job Application Tracker — plain HTML/CSS/JS, data kept in this browser (localStorage). */

const STORAGE_KEY = "jobTrackerApps"; // unchanged so existing saved data still loads
const FOLLOW_UP_DAYS = 14;            // flag "Applied" items with no movement after this many days

const starter = [
{id:1,company:"NBCUniversal",role:"IT Workplace Operations Intern",type:"Internship",location:"Central London",applied:"2026-10-05",stage:"Applied",salary:"",deadline:"",description:"IT/AV technical support; project and vendor management; inventory checks; reporting; service delivery; IT strategy/business engagement. Requires IT/software interest, organisation, proactive independent working, Microsoft 365 (PowerPoint, Outlook, Teams, Excel), basic finance/maths.",notes:"Check UK work eligibility for the full internship period (05/07/2027–21/07/2028)."},
{id:2,company:"MHA",role:"Data & Analytics Junior Apprentice",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"2026-10-12",description:"Extracting, cleaning and analysing financial/operational data; Excel, Power BI, SQL and Python training; dashboards, models, anomaly/risk analysis and process improvement. Level 4 Data Analytics + Level 7 ACA.",notes:""},
{id:3,company:"Cisco",role:"IT Degree Apprentice",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Internal IT, networks, software, AI infrastructure, automation, agile projects, international collaboration and internal-customer engagement. Expected Jan–Feb 2027; 3 years; degree plus industry qualifications.",notes:"Exact vacancy/status needs confirmation."},
{id:4,company:"KPMG",role:"Apprenticeship",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Apprenticeship opportunity discussed as live. Full role requirements were not captured.",notes:"Add exact role title and application date when available."},
{id:5,company:"Netcompany",role:"Apprentice Software Developer / DevOps",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Software development / DevOps-focused opportunity. User's main interest was Cloud and DevOps.",notes:"Exact vacancy details and application stage need confirmation."},
{id:6,company:"Aventum Group",role:"Apprenticeship / Entry Technology Role",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Technology opportunity with an application prompt asking candidates to describe their interest in the position.",notes:"Exact role title/status needs confirmation."},
{id:7,company:"American Express",role:"Software Engineering Apprentice",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"18-month Level 4 Software Engineering Apprenticeship.",notes:""},
{id:8,company:"L'Oréal",role:"IT Workplace Projects Degree Apprentice",type:"Apprenticeship",location:"White City, London",applied:"",stage:"Interested",salary:"£26,950",deadline:"",description:"IT Workplace Projects Degree Apprenticeship; Level 6; start 04/01/2027.",notes:"Check eligibility/fit."},
{id:9,company:"Cundall",role:"IT Apprentice",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"IT apprenticeship opportunity discussed as a target.",notes:"Exact vacancy details/status needs confirmation."},
{id:10,company:"Olympia",role:"Service Desk Analyst",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Service desk / IT support role discussed as a target.",notes:"Exact vacancy details/status needs confirmation."},
{id:11,company:"Jisc",role:"Workplace IT Service Desk",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"£28,600",deadline:"",description:"Workplace IT service desk role.",notes:"Exact deadline/status needs confirmation."},
{id:12,company:"Latham",role:"Technology Support Specialist I",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Technology support role discussed as a target.",notes:"Exact vacancy details/status needs confirmation."},
{id:13,company:"Mastercard",role:"Trainee IT Operation Specialist",type:"Entry Role",location:"Dunstable",applied:"",stage:"Interested",salary:"",deadline:"",description:"Trainee IT operations opportunity.",notes:""},
{id:14,company:"HTB",role:"IT Service",type:"Entry Role",location:"Fenchurch Street, London",applied:"",stage:"Interested",salary:"",deadline:"",description:"IT service role; office-based in Fenchurch Street.",notes:""},
{id:15,company:"Beam",role:"Technology Role",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Technology opportunity discussed as a target.",notes:"Exact vacancy details/status needs confirmation."},
{id:16,company:"Just IT",role:"IT Apprenticeship / Entry Role",type:"Apprenticeship",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"IT apprenticeship/entry opportunities discussed.",notes:"Exact vacancy needs confirmation."},
{id:17,company:"Chandler",role:"CX Technical Sales Specialist",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Technical customer-facing role.",notes:"Follow-up was discussed."},
{id:18,company:"Structure",role:"Junior Webflow Developer",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Junior Webflow development role; relevant to Webflow projects.",notes:""},
{id:19,company:"ElevenLabs",role:"Technology / Prompt-related Role",type:"Entry Role",location:"",applied:"",stage:"Interested",salary:"",deadline:"",description:"Role/opportunity involving prompts was discussed.",notes:"Exact vacancy needs confirmation."},
{id:20,company:"Central London Private Equity Firm",role:"IT Support Intern",type:"Internship",location:"Central London",applied:"",stage:"Interested",salary:"",deadline:"",description:"Microsoft 365 apps, Windows 11 Lenovo devices, Intune iPhones/iPads, joiner/leaver processes, Teams Rooms and asset management.",notes:""}
];

const stages = ["Interested","Preparing Application","Applied","Online Assessment","Video Interview","Interview","Final Interview","Offer","Rejected","Withdrawn","On Hold"];
const FIELDS = ["company","role","type","location","applied","stage","salary","deadline","description","notes"];

// Stage groups, used by the stats, deadlines and badge colours
const SUBMITTED  = new Set(["Applied","Online Assessment","Video Interview","Interview","Final Interview","Offer","Rejected"]);
const PROGRESSED = new Set(["Online Assessment","Video Interview","Interview","Final Interview","Offer"]);
const INTERVIEWS = new Set(["Video Interview","Interview","Final Interview"]);
const CLOSED     = new Set(["Rejected","Withdrawn"]);
const stageTone = s => s==="Offer" ? "good" : CLOSED.has(s) ? "bad" : PROGRESSED.has(s) ? "warm" : s==="Applied" ? "info" : "neutral";

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// Escape text before it goes into innerHTML, so pasted job descriptions with < > & can't break the page
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- storage ---------- */
function load(){
  try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (Array.isArray(saved)) return saved; } catch {}
  return structuredClone(starter);
}
let apps = load();

function save(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(apps)); }
  catch { toast("Couldn't save to this browser. Export a CSV so you don't lose changes."); }
  render();
}

/* ---------- dates ---------- */
const DAY = 86400000;
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const isoToday = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
function fmt(d){ return d ? new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—"; }
function daysUntil(d){ return d ? Math.round((new Date(d+"T00:00:00") - today())/DAY) : null; }
function daysSince(d){ return d ? Math.round((today() - new Date(d+"T00:00:00"))/DAY) : null; }

/* ---------- small helpers ---------- */
function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove("show"), 3200);
}
const plural = (n, w) => `${n} ${w}${n===1?"":"s"}`;
const badge = (text, tone="neutral") => `<span class="badge ${tone}">${esc(text)}</span>`;
const subline = a => esc(a.role) + (a.location ? " · " + esc(a.location) : "");

/* ---------- views ---------- */
const TITLES = {dashboard:"Application Dashboard", applications:"Applications", calendar:"Deadlines"};
function showView(view){
  $$(".view").forEach(v => v.classList.toggle("active", v.id === view+"View"));
  $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  $("#pageTitle").textContent = TITLES[view];
}

function populateStages(){
  const opts = stages.map(s => `<option>${s}</option>`).join("");
  $("#stageFilter").innerHTML = '<option value="">All stages</option>' + opts;
  $("#stage").innerHTML = opts;
}

/* ---------- rendering ---------- */
function renderStats(){
  const submitted  = apps.filter(a => SUBMITTED.has(a.stage)).length;
  const progressed = apps.filter(a => PROGRESSED.has(a.stage)).length;
  const interviews = apps.filter(a => INTERVIEWS.has(a.stage)).length;
  const offers     = apps.filter(a => a.stage === "Offer").length;
  const active     = apps.filter(a => !CLOSED.has(a.stage)).length;
  const rate       = submitted ? Math.round(progressed/submitted*100) + "%" : "—";
  const stats = [["Total opportunities",apps.length],["Submitted",submitted],["Active",active],["Interviews",interviews],["Offers",offers],["Progress rate",rate,"Submitted apps that moved past “Applied”"]];
  $("#stats").innerHTML = stats.map(([l,v,tip]) => `<div class="stat"${tip?` title="${esc(tip)}"`:""}><div class="label">${l}</div><div class="value">${v}</div></div>`).join("");
}

function renderPipeline(){
  const counts = Object.fromEntries(stages.map(s => [s,0]));
  apps.forEach(a => { if (a.stage in counts) counts[a.stage]++; });
  const max = Math.max(1, ...Object.values(counts));
  $("#pipelineCount").textContent = `${apps.length} tracked`;
  $("#pipeline").innerHTML = stages.filter(s => counts[s] || !["Withdrawn","On Hold","Video Interview"].includes(s)).map(s =>
    `<button class="pipeline-row" data-stage-jump="${esc(s)}" title="Show ${esc(s)} applications"><span>${s}</span><div class="bar"><i class="${stageTone(s)}" style="width:${counts[s]/max*100}%"></i></div><strong>${counts[s]}</strong></button>`).join("");
}

// Applications sent per week for the last 8 weeks
function renderWeekly(){
  const weeks = 8, start = today(); start.setDate(start.getDate() - ((start.getDay()+6)%7) - (weeks-1)*7); // Monday, 8 weeks ago
  const buckets = Array(weeks).fill(0);
  apps.forEach(a => { if (!a.applied) return; const i = Math.floor((new Date(a.applied+"T00:00:00") - start)/(7*DAY)); if (i>=0 && i<weeks) buckets[i]++; });
  const max = Math.max(1, ...buckets);
  $("#weeklyTotal").textContent = `${buckets.reduce((x,y)=>x+y,0)} in 8 weeks`;
  $("#weekly").innerHTML = buckets.map((n,i) => {
    const d = new Date(start.getTime() + i*7*DAY);
    const label = d.toLocaleDateString("en-GB",{day:"numeric",month:"short"});
    return `<div class="week" title="Week of ${label}: ${plural(n,"application")}"><span class="week-n">${n||""}</span><div class="week-bar" style="height:${Math.max(n/max*100, n?6:2)}%"></div><span class="week-label">${label}</span></div>`;
  }).join("");
}

function deadlineBadge(a){
  const d = daysUntil(a.deadline);
  if (d < 0)   return badge(`${plural(-d,"day")} overdue`, "bad");
  if (d === 0) return badge("Due today", "bad");
  return badge(`Due in ${plural(d,"day")}`, d <= 3 ? "bad" : d <= 7 ? "warm" : "neutral");
}

// Only open opportunities need deadline reminders; past deadlines on closed/submitted items are hidden
function renderDeadlines(target, limit){
  let list = apps.filter(a => a.deadline && !CLOSED.has(a.stage) && !(SUBMITTED.has(a.stage) && daysUntil(a.deadline) < 0))
                 .sort((a,b) => a.deadline.localeCompare(b.deadline));
  if (limit) list = list.slice(0, limit);
  target.innerHTML = list.length
    ? list.map(a => `<div class="deadline-row" data-edit="${a.id}"><div class="app-main"><strong>${esc(a.company)}</strong><span>${esc(a.role)} · ${fmt(a.deadline)} · ${esc(a.stage)}</span></div>${deadlineBadge(a)}</div>`).join("")
    : '<div class="empty">No upcoming deadlines.</div>';
}

function renderRecent(){
  const list = apps.filter(a => a.applied).sort((a,b) => b.applied.localeCompare(a.applied)).slice(0,5);
  $("#recentApps").innerHTML = list.length
    ? list.map(a => `<div class="app-row" data-edit="${a.id}"><div class="app-main"><strong>${esc(a.company)}</strong><span>${subline(a)} · applied ${fmt(a.applied)}</span></div>${badge(a.stage, stageTone(a.stage))}</div>`).join("")
    : '<div class="empty">No dated applications yet.</div>';
}

// Applications sitting at "Applied" for a while — a nudge to chase or move on
function renderFollowUps(){
  const list = apps.filter(a => a.stage === "Applied" && daysSince(a.applied) >= FOLLOW_UP_DAYS)
                   .sort((a,b) => a.applied.localeCompare(b.applied));
  $("#followUpCard").hidden = !list.length;
  $("#followUps").innerHTML = list.map(a => `<div class="app-row" data-edit="${a.id}"><div class="app-main"><strong>${esc(a.company)}</strong><span>${esc(a.role)} · applied ${fmt(a.applied)}</span></div>${badge(`${daysSince(a.applied)} days, no update`,"warm")}</div>`).join("");
}

function renderTable(){
  const q = $("#search").value.trim().toLowerCase(), type = $("#typeFilter").value, stage = $("#stageFilter").value, sort = $("#sortFilter").value;
  const list = apps.filter(a => (!q || [a.company,a.role,a.location,a.description,a.notes].join(" ").toLowerCase().includes(q))
                             && (!type || a.type === type) && (!stage || a.stage === stage));
  const sorters = {
    company:  (a,b) => a.company.localeCompare(b.company),
    deadline: (a,b) => (a.deadline||"9999").localeCompare(b.deadline||"9999"),
    stage:    (a,b) => stages.indexOf(b.stage) - stages.indexOf(a.stage),
    newest:   (a,b) => (b.applied||"").localeCompare(a.applied||"") || b.id - a.id
  };
  list.sort(sorters[sort] || sorters.newest);
  $("#resultCount").textContent = list.length === apps.length ? plural(apps.length,"application") : `${list.length} of ${apps.length} shown`;
  const stageOpts = cur => stages.map(s => `<option${s===cur?" selected":""}>${s}</option>`).join("");
  $("#appTable").innerHTML = list.length ? list.map(a => `
    <tr>
      <td><button class="company-role" data-edit="${a.id}"><strong>${esc(a.company)}</strong><span>${subline(a)}</span></button>${a.notes?`<div class="note-line">${esc(a.notes)}</div>`:""}</td>
      <td>${badge(a.type)}</td>
      <td>${fmt(a.applied)}</td>
      <td><select class="stage-inline input tone-${stageTone(a.stage)}" data-id="${a.id}" aria-label="Stage for ${esc(a.company)}">${stageOpts(a.stage)}</select></td>
      <td>${a.deadline ? fmt(a.deadline) : "—"}</td>
      <td><div class="row-actions"><button class="icon-btn" data-edit="${a.id}">Edit</button><button class="icon-btn danger" data-delete="${a.id}">Delete</button></div></td>
    </tr>`).join("") : '<tr><td colspan="6" class="empty">No matching applications.</td></tr>';
}

function render(){
  renderStats(); renderPipeline(); renderWeekly(); renderFollowUps(); renderRecent();
  renderDeadlines($("#deadlinePreview"), 5); renderDeadlines($("#deadlineList"));
  renderTable();
}

/* ---------- add / edit modal ---------- */
function openModal(id=null){
  const a = apps.find(x => x.id === id);
  $("#appForm").reset();
  $("#modalTitle").textContent = a ? "Edit application" : "Add application";
  $("#editId").value = a ? a.id : "";
  if (a) FIELDS.forEach(k => $("#"+k).value = a[k] || "");
  $("#modal").classList.add("show");
  $("#company").focus();
}
function closeModal(){ $("#modal").classList.remove("show"); }

// Moving something to "Applied" (or later) with no date fills in today, so the stats stay accurate
function setStage(a, stage){
  a.stage = stage;
  if (SUBMITTED.has(stage) && !a.applied) a.applied = isoToday();
}

$("#appForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = Object.fromEntries(FIELDS.map(k => [k, $("#"+k).value.trim()]));
  const id = Number($("#editId").value);
  const existing = apps.find(a => a.id === id);
  if (existing) { Object.assign(existing, data); setStage(existing, data.stage); toast("Application updated"); }
  else { const a = {id: Date.now(), ...data}; setStage(a, data.stage); apps.unshift(a); toast("Application added"); }
  closeModal(); save();
});

/* ---------- event wiring (one listener per area instead of one per row) ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-edit],[data-delete],[data-view],[data-view-jump],[data-stage-jump]");
  if (!t) return;
  if (t.dataset.edit)      return openModal(Number(t.dataset.edit));
  if (t.dataset.view)      return showView(t.dataset.view);
  if (t.dataset.viewJump)  return showView(t.dataset.viewJump);
  if (t.dataset.stageJump) { $("#stageFilter").value = t.dataset.stageJump; renderTable(); return showView("applications"); }
  if (t.dataset.delete) {
    const a = apps.find(x => x.id === Number(t.dataset.delete));
    if (a && confirm(`Delete ${a.company} – ${a.role}?`)) { apps = apps.filter(x => x !== a); save(); toast("Deleted"); }
  }
});
$("#appTable").addEventListener("change", e => {
  if (!e.target.matches(".stage-inline")) return;
  const a = apps.find(x => x.id === Number(e.target.dataset.id));
  if (a) { setStage(a, e.target.value); save(); }
});

$("#addBtn").onclick = () => openModal();
$("#closeModal").onclick = closeModal;
$("#cancelBtn").onclick = closeModal;
$("#modal").addEventListener("mousedown", e => { if (e.target.id === "modal") closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && $("#modal").classList.contains("show")) closeModal();
  if (e.key === "n" && !e.ctrlKey && !e.metaKey && !e.target.closest("input,textarea,select") && !$("#modal").classList.contains("show")) { e.preventDefault(); openModal(); }
});

let searchTimer;
$("#search").addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderTable, 120); });
["#typeFilter","#stageFilter","#sortFilter"].forEach(s => $(s).addEventListener("change", renderTable));

/* ---------- CSV ---------- */
const csvCell = v => { const s = String(v ?? ""); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${s.replace(/^([=+\-@])/,"'$1").replaceAll('"','""')}"` : s; };

$("#exportBtn").onclick = () => {
  const csv = "﻿" + [FIELDS.join(","), ...apps.map(a => FIELDS.map(k => csvCell(a[k])).join(","))].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
  const link = Object.assign(document.createElement("a"), {href:url, download:`job-applications-${isoToday()}.csv`});
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Exported ${plural(apps.length,"application")}`);
};

// Proper CSV reader: handles quoted fields, commas and line breaks inside descriptions, and files saved from Excel
function parseCSV(text){
  const rows = []; let row = [], cell = "", quoted = false;
  text = text.replace(/^﻿/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i+1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter(r => r.some(v => v.trim()));
}

// Excel often rewrites dates as 05/10/2026 — convert back to 2026-10-05
function toISODate(v){
  v = (v||"").trim();
  const m = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  return m ? `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}` : v;
}

$("#importBtn").onclick = () => $("#fileInput").click();
$("#fileInput").onchange = async e => {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  const rows = parseCSV(await f.text());
  if (rows.length < 2) return toast("That file has no rows to import.");
  const head = rows[0].map(h => h.trim().toLowerCase());
  const idx = FIELDS.map((k,i) => head.includes(k) ? head.indexOf(k) : i); // match by column name, fall back to position
  const out = rows.slice(1).map((r,n) => {
    const a = {id: Date.now() + n};
    FIELDS.forEach((k,i) => a[k] = (r[idx[i]] ?? "").trim().replace(/^'([=+\-@])/,"$1"));
    a.applied = toISODate(a.applied); a.deadline = toISODate(a.deadline);
    if (!stages.includes(a.stage)) a.stage = "Interested";
    return a;
  }).filter(a => a.company);
  if (!out.length) return toast("No applications found in that file.");
  const replace = confirm(`Found ${plural(out.length,"application")}.\n\nOK = replace your current list\nCancel = add them to your current list`);
  apps = replace ? out : [...out, ...apps];
  save(); toast(`Imported ${plural(out.length,"application")}`);
};

$("#resetBtn").onclick = () => {
  if (confirm("Reset to the starter data? Your current changes will be replaced. Export a CSV first if you want a backup.")) { apps = structuredClone(starter); save(); toast("Reset to starter data"); }
};

/* ---------- start ---------- */
$("#todayLabel").textContent = new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
populateStages();
render();
