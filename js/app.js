/* =========================================================
   app.js — state, forms, wizard, preview, actions
   ========================================================= */
(function () {
  "use strict";

  const LS_KEY = "uniresume.data.v1";
  const LS_BACKUP = "uniresume.backup.v1";

  let state = RD.blankResume();
  let currentStep = 1;
  const TOTAL_STEPS = 8;
  let zoom = 1;
  let saveTimer = null;

  // ---------- helpers ----------
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function getByPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return (o || {})[k]; }, obj);
  }
  function setByPath(obj, path, val) {
    const keys = path.split(".");
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) { o[keys[i]] = o[keys[i]] || {}; o = o[keys[i]]; }
    o[keys[keys.length - 1]] = val;
  }

  function debounce(fn, ms) {
    let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }

  // ---------- toast + loader ----------
  let toastTimer = null;
  function notify(msg, type) {
    const el = $("#toast");
    el.textContent = msg;
    el.className = "toast show" + (type ? " " + type : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.className = "toast"; }, 5200);
  }
  function setLoader(on, msg) {
    const el = $("#loader");
    if (msg) $("#loader-msg").textContent = msg;
    el.hidden = !on;
  }

  // ---------- storage ----------
  function saveNow() {
    state.meta = state.meta || {};
    state.meta.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
      const s = $("#save-state"); if (s) s.textContent = "Saved " + new Date().toLocaleTimeString();
    } catch (e) {
      const s = $("#save-state"); if (s) s.textContent = "Could not save locally";
    }
  }
  const scheduleSave = debounce(saveNow, 500);

  function loadSaved() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      // merge onto a blank to stay resilient to schema additions
      const base = RD.blankResume();
      state = Object.assign(base, parsed);
      state.personal = Object.assign(base.personal, parsed.personal || {});
      ["education","skills","experience","projects","certifications","achievements","activities","languages","interests","customSections","sectionOrder"].forEach(function (k) {
        if (!Array.isArray(state[k])) state[k] = base[k];
      });
      return true;
    } catch (e) { return false; }
  }

  // ---------- preview + checklist ----------
  function renderPreview() {
    const el = $("#resume-preview");
    const body = RR.buildResumeBody(state);
    el.innerHTML = state.template === "two-column" ? RR.splitTwoColumnBody(body) : body;
    // wrapper class handled on #resume-preview itself
    el.className = "resume-page tpl-" + (state.template || "ats");
    el.style.setProperty("--rp-accent", state.accent || "#1e3a8a");
    el.style.minHeight = "1123px";
  }

  function computeChecklist() {
    const items = [
      { key: "name", label: "Add your full name", done: !!state.personal.fullName.trim() },
      { key: "contact", label: "Add a phone or email", done: !!(state.personal.phone.trim() || state.personal.email.trim()) },
      { key: "objective", label: "Write a career objective", done: !!state.personal.objective.trim() },
      { key: "education", label: "Add at least one education entry", done: state.education.length > 0 },
      { key: "skills", label: "Add a few skills", done: state.skills.length >= 3 },
      { key: "work", label: "Add experience or a project", done: (state.experience.length + state.projects.length) > 0 },
      { key: "stream", label: "Choose your academic stream", done: !!state.personal.stream }
    ];
    return items;
  }

  function renderChecklist() {
    const wrap = $("#checklist");
    const items = computeChecklist();
    const doneCount = items.filter(function (i) { return i.done; }).length;
    wrap.innerHTML = items.map(function (i) {
      return '<div class="check-item ' + (i.done ? "done" : "") + '"><span class="box"></span><span class="c-label">' + RR.esc(i.label) + '</span></div>';
    }).join("") +
      '<div class="check-item" style="background:var(--navy-soft);border-color:#c7d2fe"><span class="box" style="border-color:var(--navy)"></span><span class="c-label" style="font-weight:700;color:var(--navy-dark)">' + doneCount + ' of ' + items.length + ' complete</span></div>';
  }

  // ---------- sync static fields FROM state (used on load/sample) ----------
  function syncStaticFields() {
    $$("[data-model]").forEach(function (el) {
      const v = getByPath(state, el.getAttribute("data-model"));
      if (el.type === "checkbox") el.checked = !!v; else el.value = v == null ? "" : v;
    });
    $("#template-select").value = state.template || "ats";
    $("#accent-color").value = state.accent || "#1e3a8a";
    updateObjectiveMeta();
  }

  function updateObjectiveMeta() {
    const o = (state.personal.objective || "").trim();
    const meta = $("#objective-meta");
    if (!o) { meta.textContent = "3–5 lines works best — press Enter for a new line."; return; }
    const words = o.split(/\s+/).filter(Boolean).length;
    const nLines = o.split(/\n+/).map(function (l) { return l.trim(); }).filter(Boolean).length;
    let tip = "";
    if (nLines < 3) tip = " — try 3–5 lines.";
    else if (nLines > 6) tip = " — a bit long; 3–5 lines is ideal.";
    else tip = " — looks good.";
    meta.textContent = nLines + " line" + (nLines === 1 ? "" : "s") + " · " + words + " word" + (words === 1 ? "" : "s") + tip;
  }

  // ---------- bind static inputs ----------
  function bindStaticInputs() {
    $$("[data-model]").forEach(function (el) {
      const path = el.getAttribute("data-model");
      const handler = function () {
        const val = el.type === "checkbox" ? el.checked : el.value;
        setByPath(state, path, val);
        if (path === "personal.stream") { updateSuggestions(); }
        if (path === "personal.objective") updateObjectiveMeta();
        renderPreview(); renderChecklist(); renderSectionOrder();
        scheduleSave();
      };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    });
  }

  // ---------- generic dynamic list engine ----------
  // config per section key
  const LISTS = {
    education:      { addBtn: "#education-add",      wrap: "#education-list",      title: "Education", blank: function () { return { id: RD.uid(), degree: "", field: "", institution: "", board: "", startYear: "", endYear: "", scoreType: "%", score: "" }; } },
    experience:     { addBtn: "#experience-add",     wrap: "#experience-list",     title: "Experience", blank: function () { return { id: RD.uid(), role: "", company: "", type: "Internship", location: "", startDate: "", endDate: "", current: false, description: "" }; } },
    projects:       { addBtn: "#projects-add",       wrap: "#projects-list",       title: "Project", blank: function () { return { id: RD.uid(), title: "", techstack: "", link: "", description: "" }; } },
    certifications: { addBtn: "#certifications-add", wrap: "#certifications-list", title: "Certification", blank: function () { return { id: RD.uid(), name: "", issuer: "", date: "", credentialLink: "" }; } },
    achievements:   { addBtn: "#achievements-add",   wrap: "#achievements-list",   title: "Achievement", blank: function () { return { id: RD.uid(), title: "", description: "", date: "" }; } },
    activities:     { addBtn: "#activities-add",     wrap: "#activities-list",     title: "Activity", blank: function () { return { id: RD.uid(), title: "", description: "" }; } },
    languages:      { addBtn: "#languages-add",      wrap: "#languages-list",      title: "Language", blank: function () { return { id: RD.uid(), name: "", level: "Fluent" }; } }
  };

  // Field definitions per section for the card body
  function fieldsFor(key, item) {
    const two = function (a, b) { return '<div class="grid two">' + a + b + "</div>"; };
    const f = function (name, label, type, value, extra) {
      if (type === "textarea") {
        return '<div class="field"><label>' + RR.esc(label) + '</label><textarea data-f="' + name + '" rows="3" placeholder="' + RR.esc(extra || "") + '">' + RR.esc(value || "") + "</textarea></div>";
      }
      if (type === "checkbox") {
        return '<label class="check-inline"><input type="checkbox" data-f="' + name + '" ' + (value ? "checked" : "") + "/> " + RR.esc(label) + "</label>";
      }
      if (type === "select") {
        const opts = (extra || []).map(function (o) { return '<option ' + (o === value ? "selected" : "") + ">" + RR.esc(o) + "</option>"; }).join("");
        return '<div class="field"><label>' + RR.esc(label) + '</label><select data-f="' + name + '">' + opts + "</select></div>";
      }
      return '<div class="field"><label>' + RR.esc(label) + '</label><input type="' + type + '" data-f="' + name + '" value="' + RR.esc(value || "") + '" placeholder="' + RR.esc(extra || "") + '" /></div>';
    };

    switch (key) {
      case "education":
        return f("degree","Degree / Qualification","text",item.degree,"e.g. B.Tech") +
               f("institution","Institution","text",item.institution,"College / School name") +
               two(f("startYear","Start year","text",item.startYear,"2021"), f("endYear","End year","text",item.endYear,"2025")) +
               f("field","Stream / Specialisation","text",item.field,"e.g. Computer Science") +
               two(f("board","Board / University","text",item.board,"e.g. CBSE, VTU"),
                   '<div class="field"><label>Score</label><div style="display:flex;gap:6px"><select data-f="scoreType" style="flex:0 0 90px">' +
                     ["%","CGPA","CGPA/10","Grade"].map(function(o){return "<option "+(o===item.scoreType?"selected":"")+">"+o+"</option>";}).join("") +
                     '</select><input type="text" data-f="score" value="' + RR.esc(item.score||"") + '" placeholder="8.6" style="flex:1"/></div></div>');
      case "experience":
        return f("role","Role / Title","text",item.role,"e.g. Marketing Intern") +
               f("company","Company / Organisation","text",item.company) +
               two(f("type","Type","select",item.type,["Internship","Full-time","Part-time","Volunteer","Freelance","Training"]),
                   f("location","Location","text",item.location,"City / Remote")) +
               two(f("startDate","Start","text",item.startDate,"Jun 2024"), f("endDate","End","text",item.endDate,"Aug 2024")) +
               '<div class="field">' + f("current","I currently work here","checkbox",item.current) + "</div>" +
               f("description","What did you do? (one point per line)","textarea",item.description,"Built X that improved Y by Z%\nCollaborated with a team of 4");
      case "projects":
        return f("title","Project title","text",item.title,"e.g. Library Management System") +
               two(f("techstack","Tools / Tech / Subjects","text",item.techstack,"Java, MySQL"), f("link","Link (optional)","text",item.link,"github.com/…")) +
               f("description","Description (one point per line)","textarea",item.description,"What it does and your role\nImpact or result");
      case "certifications":
        return f("name","Certificate name","text",item.name,"e.g. Python for Everybody") +
               two(f("issuer","Issued by","text",item.issuer,"Coursera"), f("date","Year","text",item.date,"2024")) +
               f("credentialLink","Credential link (optional)","text",item.credentialLink,"https://…");
      case "achievements":
        return f("title","Title","text",item.title,"e.g. 1st place hackathon") +
               f("date","Date / Year","text",item.date,"2024") +
               f("description","Details (optional)","textarea",item.description,"Led a team of 3 to build…");
      case "activities":
        return f("title","Title / Role","text",item.title,"e.g. Volunteer, NSS, Club lead") +
               f("description","Details (one point per line)","textarea",item.description,"What you did and any impact");
      case "languages":
        return two(f("name","Language","text",item.name,"e.g. English"),
                   f("level","Level","select",item.level,["Native","Fluent","Intermediate","Basic"]));
    }
    return "";
  }

  // ---------- render a dynamic list ----------
  function renderList(key) {
    const cfg = LISTS[key];
    const arr = state[key];
    const wrap = $(cfg.wrap);
    if (!arr.length) { wrap.innerHTML = '<p class="empty-note">No entries yet — this section is optional.</p>'; return; }
    wrap.innerHTML = arr.map(function (item, i) {
      const title = item.title || item.role || item.degree || item.name || (cfg.title + " " + (i + 1));
      return '<div class="entry-card" data-id="' + item.id + '">' +
        '<div class="entry-card-head"><span class="ec-title">' + RR.esc(title) + '</span>' +
        '<span class="entry-actions">' +
          '<button type="button" class="icon-btn move-up" title="Move up" ' + (i === 0 ? "disabled" : "") + '>\u2191</button>' +
          '<button type="button" class="icon-btn move-down" title="Move down" ' + (i === arr.length - 1 ? "disabled" : "") + '>\u2193</button>' +
          '<button type="button" class="icon-btn danger remove" title="Remove">\u2715</button>' +
        '</span></div>' +
        '<div class="entry-body">' + fieldsFor(key, item) + "</div></div>";
    }).join("");
  }

  function renderAllLists() {
    Object.keys(LISTS).forEach(renderList);
    renderTagCloud("skills", "#skills-tags");
    renderTagCloud("interests", "#interests-tags");
    renderCustomSections();
  }

  // ---------- delegated events on a list container ----------
  function bindList(key) {
    const cfg = LISTS[key];
    const wrap = $(cfg.wrap);
    wrap.addEventListener("input", function (e) {
      const t = e.target;
      const card = t.closest(".entry-card"); if (!card) return;
      const id = card.getAttribute("data-id");
      const field = t.getAttribute("data-f"); if (!field) return;
      const item = state[key].find(function (x) { return x.id === id; }); if (!item) return;
      item[field] = t.type === "checkbox" ? t.checked : t.value;
      // live update card title
      const titleEl = card.querySelector(".ec-title");
      if (titleEl) titleEl.textContent = item.title || item.role || item.degree || item.name || (cfg.title);
      renderPreview(); scheduleSave();
    });
    wrap.addEventListener("click", function (e) {
      const btn = e.target.closest("button"); if (!btn) return;
      const card = btn.closest(".entry-card"); if (!card) return;
      const id = card.getAttribute("data-id");
      const idx = state[key].findIndex(function (x) { return x.id === id; });
      if (idx < 0) return;
      if (btn.classList.contains("remove")) {
        state[key].splice(idx, 1);
      } else if (btn.classList.contains("move-up") && idx > 0) {
        const tmp = state[key][idx - 1]; state[key][idx - 1] = state[key][idx]; state[key][idx] = tmp;
      } else if (btn.classList.contains("move-down") && idx < state[key].length - 1) {
        const tmp = state[key][idx + 1]; state[key][idx + 1] = state[key][idx]; state[key][idx] = tmp;
      } else { return; }
      renderList(key); renderPreview(); renderChecklist(); scheduleSave();
    });
    $(cfg.addBtn).addEventListener("click", function () {
      state[key].push(cfg.blank());
      renderList(key); renderPreview(); renderChecklist(); renderSectionOrder(); scheduleSave();
      // focus first input of new card
      const cards = $(cfg.wrap).querySelectorAll(".entry-card");
      const last = cards[cards.length - 1];
      if (last) { const inp = last.querySelector("input,textarea,select"); if (inp) inp.focus(); }
    });
  }

  // ---------- tag clouds (skills / interests) ----------
  function renderTagCloud(key, sel) {
    const wrap = $(sel);
    if (!state[key].length) { wrap.innerHTML = '<span class="empty-note">Nothing added yet.</span>'; return; }
    wrap.innerHTML = state[key].map(function (val, i) {
      return '<span class="tag">' + RR.esc(val) + '<button type="button" data-i="' + i + '" title="Remove">\u2715</button></span>';
    }).join("");
  }
  function bindTagInput(key, inputSel, addSel, cloudSel) {
    const input = $(inputSel);
    function add() {
      const v = input.value.trim();
      if (!v) return;
      if (state[key].some(function (s) { return s.toLowerCase() === v.toLowerCase(); })) { input.value = ""; return; }
      state[key].push(v); input.value = "";
      renderTagCloud(key, cloudSel); renderPreview(); renderChecklist(); renderSectionOrder(); scheduleSave();
    }
    $(addSel).addEventListener("click", add);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); add(); } });
    $(cloudSel).addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-i]"); if (!btn) return;
      state[key].splice(parseInt(btn.getAttribute("data-i"), 10), 1);
      renderTagCloud(key, cloudSel); renderPreview(); renderChecklist(); scheduleSave();
    });
  }

  // ---------- custom sections ----------
  function renderCustomSections() {
    const wrap = $("#custom-list");
    if (!state.customSections.length) { wrap.innerHTML = '<p class="empty-note">No custom sections. Add one for anything else (e.g. Publications, Workshops).</p>'; return; }
    wrap.innerHTML = state.customSections.map(function (c) {
      const items = (c.items || []).map(function (it, i) {
        return '<div class="cust-item" data-i="' + i + '"><input type="text" data-ci="' + i + '" value="' + RR.esc(it) + '" placeholder="Point / line" />' +
          '<button type="button" class="icon-btn danger cust-del" data-i="' + i + '" title="Remove line">\u2715</button></div>';
      }).join("");
      return '<div class="entry-card" data-id="' + c.id + '">' +
        '<div class="entry-card-head"><input class="cust-title" type="text" value="' + RR.esc(c.title) + '" placeholder="Section title" style="font-weight:700;border:1px solid transparent;background:transparent;padding:2px 4px;border-radius:6px"/>' +
        '<span class="entry-actions"><button type="button" class="icon-btn danger cust-remove" title="Remove section">\u2715</button></span></div>' +
        '<div class="entry-body"><div class="cust-items">' + items + '</div>' +
        '<button type="button" class="btn btn-mini cust-add-line" style="margin-top:8px">+ Add line</button></div></div>';
    }).join("");
  }
  function bindCustomSections() {
    $("#custom-add").addEventListener("click", function () {
      state.customSections.push({ id: RD.uid(), title: "", items: [""] });
      renderCustomSections(); renderSectionOrder(); scheduleSave();
    });
    const wrap = $("#custom-list");
    wrap.addEventListener("input", function (e) {
      const t = e.target;
      const card = t.closest(".entry-card"); if (!card) return;
      const id = card.getAttribute("data-id");
      const c = state.customSections.find(function (x) { return x.id === id; }); if (!c) return;
      if (t.classList.contains("cust-title")) { c.title = t.value; }
      else if (t.hasAttribute("data-ci")) { c.items[parseInt(t.getAttribute("data-ci"), 10)] = t.value; }
      renderPreview(); scheduleSave();
    });
    wrap.addEventListener("click", function (e) {
      const btn = e.target.closest("button"); if (!btn) return;
      const card = btn.closest(".entry-card"); if (!card) return;
      const id = card.getAttribute("data-id");
      const cIdx = state.customSections.findIndex(function (x) { return x.id === id; }); if (cIdx < 0) return;
      const c = state.customSections[cIdx];
      if (btn.classList.contains("cust-remove")) {
        state.customSections.splice(cIdx, 1);
      } else if (btn.classList.contains("cust-add-line")) {
        c.items.push("");
      } else if (btn.classList.contains("cust-del")) {
        c.items.splice(parseInt(btn.getAttribute("data-i"), 10), 1);
      } else { return; }
      renderCustomSections(); renderPreview(); renderSectionOrder(); scheduleSave();
    });
  }

  // ---------- section reorder (step 8) ----------
  function renderSectionOrder() {
    const ul = $("#section-order");
    let order = (state.sectionOrder && state.sectionOrder.length) ? state.sectionOrder.slice() : RD.SECTIONS.map(function (s) { return s.key; });
    // include custom
    const all = order.slice();
    state.customSections.forEach(function (c) { if (all.indexOf("custom:" + c.id) < 0) all.push("custom:" + c.id); });

    function labelOf(key) {
      if (key.indexOf("custom:") === 0) {
        const c = state.customSections.find(function (x) { return x.id === key.slice(7); });
        return (c && c.title) || "Custom section";
      }
      const s = RD.SECTIONS.find(function (x) { return x.key === key; });
      return s ? s.label : key;
    }
    ul.innerHTML = all.map(function (key, i) {
      const has = RD.sectionHasContent(state, key);
      return '<li data-key="' + key + '"><span class="so-name">' + RR.esc(labelOf(key)) +
        (has ? "" : ' <span class="so-empty">(empty — hidden)</span>') + "</span>" +
        '<span class="so-btns">' +
        '<button type="button" class="icon-btn so-up" ' + (i === 0 ? "disabled" : "") + '>\u2191</button>' +
        '<button type="button" class="icon-btn so-down" ' + (i === all.length - 1 ? "disabled" : "") + '>\u2193</button>' +
        "</span></li>";
    }).join("");
  }
  function bindSectionOrder() {
    const ul = $("#section-order");
    ul.addEventListener("click", function (e) {
      const btn = e.target.closest("button"); if (!btn) return;
      const li = btn.closest("li"); const key = li.getAttribute("data-key");
      let order = state.sectionOrder.slice();
      // ensure custom appended
      state.customSections.forEach(function (c) { if (order.indexOf("custom:" + c.id) < 0) order.push("custom:" + c.id); });
      const i = order.indexOf(key);
      if (btn.classList.contains("so-up") && i > 0) { const t = order[i-1]; order[i-1] = order[i]; order[i] = t; }
      else if (btn.classList.contains("so-down") && i < order.length - 1) { const t = order[i+1]; order[i+1] = order[i]; order[i] = t; }
      else { return; }
      state.sectionOrder = order;
      renderSectionOrder(); renderPreview(); scheduleSave();
    });
  }

  // ---------- stream-based suggestions ----------
  function updateSuggestions() {
    const stream = state.personal.stream;
    const box = $("#skills-suggest");
    const chips = $("#skills-suggest-chips");
    if (!stream || !RD.STREAM_DATA[stream]) { box.hidden = true; return; }
    const sd = RD.STREAM_DATA[stream];
    box.hidden = false;
    chips.innerHTML = sd.skills.map(function (s) {
      const have = state.skills.some(function (x) { return x.toLowerCase() === s.toLowerCase(); });
      const extra = have ? " disabled" : "";
      return '<button type="button" class="chip" data-skill="' + RR.esc(s) + '"' + extra + '>' + RR.esc(s) + '</button>';
    }).join("");
  }
  function bindSuggestions() {
    $("#skills-suggest-chips").addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-skill]"); if (!btn || btn.disabled) return;
      const s = btn.getAttribute("data-skill");
      if (!state.skills.some(function (x) { return x.toLowerCase() === s.toLowerCase(); })) {
        state.skills.push(s); renderTagCloud("skills", "#skills-tags"); renderPreview(); renderChecklist(); renderSectionOrder(); scheduleSave();
      }
      updateSuggestions();
    });
    $("#btn-suggest-objective").addEventListener("click", function () {
      const stream = state.personal.stream;
      const sd = stream && RD.STREAM_DATA[stream];
      if (!sd) { notify("Choose your academic stream first to get a suggested objective.", "error"); return; }
      const course = (state.personal.course || "").trim();
      const goal = (state.personal.careerGoal || "").trim();
      // Base sentence from stream data, with the course name swapped in.
      const base = sd.objective.replace(/B.Tech/g, course || "B.Tech");
      // Build a tidy 3-4 line objective: intro / strengths / goal.
      const topSkills = (state.skills || []).slice(0, 4);
      const l1 = base;
      const l2 = topSkills.length >= 2
        ? ("Key strengths include " + topSkills.slice(0, 3).join(", ") + (topSkills.length > 3 ? " and more" : "") + ".")
        : "Eager to learn, dependable, and comfortable working in a team.";
      const l3 = goal ? ("Seeking a " + goal + " opportunity where I can contribute from day one and keep growing.") : "Looking for a role where I can contribute meaningfully and keep learning.";
      state.personal.objective = [l1, l2, l3].join("\n");
      $("#pi-objective").value = state.personal.objective;
      updateObjectiveMeta(); renderPreview(); renderChecklist(); scheduleSave();
      notify("Suggested a 3-line objective — edit it to sound like you.", "success");
    });
  }

  function populateSelects() {
    const streamSel = $("#pi-stream");
    RD.STREAMS.forEach(function (s) { const o = document.createElement("option"); o.value = s; o.textContent = s; streamSel.appendChild(o); });
    const goalSel = $("#pi-goal");
    RD.CAREER_GOALS.forEach(function (s) { const o = document.createElement("option"); o.value = s; o.textContent = s; goalSel.appendChild(o); });
    const dl = $("#course-list");
    RD.COURSES.forEach(function (s) { const o = document.createElement("option"); o.value = s; dl.appendChild(o); });
  }

  // ---------- stepper / wizard ----------
  const STEP_LABELS = ["Personal","Education","Skills","Experience","Projects","Certifications","Additional","Review"];
  function buildStepper() {
    const ol = $("#stepper");
    ol.innerHTML = STEP_LABELS.map(function (lbl, i) {
      const n = i + 1;
      return "<li data-step=\"" + n + "\"><span class=\"num\">" + n + "</span><span class=\"lbl\">" + lbl + "</span></li>";
    }).join("");
    ol.addEventListener("click", function (e) {
      const li = e.target.closest("li"); if (!li) return;
      goToStep(parseInt(li.getAttribute("data-step"), 10));
    });
  }
  function markStepError(show) {
    // highlight name/email visually
    ["#pi-name","#pi-email"].forEach(function (sel) { const el = $(sel); if (el) el.classList.toggle("invalid", show); });
  }
  function validateStep(step) {
    // returns {ok, message}
    if (step === 1) {
      const name = state.personal.fullName.trim();
      const email = state.personal.email.trim();
      if (!name) { markStepError(true); return { ok: false, message: "Please enter your full name." }; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { markStepError(true); return { ok: false, message: "That email address doesn't look valid." }; }
      markStepError(false);
    }
    return { ok: true };
  }
  function goToStep(n) {
    currentStep = Math.max(1, Math.min(TOTAL_STEPS, n));
    $$(".step").forEach(function (s) { s.classList.toggle("active", parseInt(s.getAttribute("data-step"), 10) === currentStep); });
    $$("#stepper li").forEach(function (li) {
      const st = parseInt(li.getAttribute("data-step"), 10);
      li.classList.toggle("active", st === currentStep);
      li.classList.toggle("done", st < currentStep);
    });
    $("#btn-prev").disabled = currentStep === 1;
    $("#btn-next").textContent = currentStep === TOTAL_STEPS ? "Finish" : "Next";
    if (currentStep === 8) { renderChecklist(); renderSectionOrder(); }
    $("#editor-panel").scrollTop = 0;
  }
  function bindWizard() {
    $("#btn-next").addEventListener("click", function () {
      const v = validateStep(currentStep);
      if (!v.ok) { notify(v.message, "error"); return; }
      if (currentStep < TOTAL_STEPS) goToStep(currentStep + 1);
      else { saveNow(); notify("All set! Use Download PDF above.", "success"); }
    });
    $("#btn-prev").addEventListener("click", function () { goToStep(currentStep - 1); });
  }

  // ---------- zoom ----------
  function applyZoom() {
    const stage = $(".preview-stage");
    stage.style.transform = "scale(" + zoom + ")";
    // reserve scaled height so scroll container is correct
    const page = $("#resume-preview");
    const h = page.offsetHeight || 1123;
    stage.style.marginBottom = ((zoom - 1) * h) + "px";
    $("#zoom-label").textContent = Math.round(zoom * 100) + "%";
  }
  function setZoom(z) { zoom = Math.max(0.3, Math.min(2, z)); applyZoom(); }
  function fitZoom() {
    const scroll = $("#preview-scroll");
    const availW = scroll.clientWidth - 40;
    const availH = scroll.clientHeight - 40;
    const page = $("#resume-preview");
    const w = page.offsetWidth || 794;
    const h = page.offsetHeight || 1123;
    const z = Math.min(availW / w, availH / h, 1.4);
    setZoom(z);
  }
  function bindZoom() {
    $("#zoom-in").addEventListener("click", function () { setZoom(zoom + 0.1); });
    $("#zoom-out").addEventListener("click", function () { setZoom(zoom - 0.1); });
    $("#zoom-fit").addEventListener("click", fitZoom);
  }

  // ---------- template + accent ----------
  function bindTemplate() {
    $("#template-select").addEventListener("change", function (e) {
      state.template = e.target.value; renderPreview(); scheduleSave();
      notify("Template switched to " + e.target.options[e.target.selectedIndex].text + ".");
    });
    $("#accent-color").addEventListener("input", function (e) {
      state.accent = e.target.value; renderPreview(); scheduleSave();
    });
  }

  // ---------- sample ----------
  function loadSample() {
    state = RD.sampleResume();
    refreshAll();
    goToStep(1);
    notify("Sample resume loaded — edit anything you like.", "success");
    fitZoom();
  }

  function refreshAll() {
    syncStaticFields();
    renderAllLists();
    renderPreview();
    renderChecklist();
    renderSectionOrder();
    updateSuggestions();
    saveNow();
  }

  // ---------- JSON import / export ----------
  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = ((state.personal.fullName || "resume").replace(/[^a-z0-9]+/gi, "_") || "resume") + "_data.json";
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 0);
    notify("Resume data exported as JSON.", "success");
  }
  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const parsed = JSON.parse(reader.result);
        const base = RD.blankResume();
        state = Object.assign(base, parsed);
        state.personal = Object.assign(base.personal, parsed.personal || {});
        ["education","skills","experience","projects","certifications","achievements","activities","languages","interests","customSections","sectionOrder"].forEach(function (k) { if (!Array.isArray(state[k])) state[k] = base[k]; });
        refreshAll(); notify("Resume imported successfully.", "success");
      } catch (e) { notify("That file is not a valid resume JSON.", "error"); }
    };
    reader.readAsText(file);
  }

  // ---------- actions ----------
  function bindActions() {
    $("#btn-sample").addEventListener("click", loadSample);
    $("#btn-export-json").addEventListener("click", exportJSON);
    $("#btn-import").addEventListener("click", function () { $("#import-file").click(); });
    $("#import-file").addEventListener("change", function (e) { if (e.target.files[0]) importJSON(e.target.files[0]); e.target.value = ""; });

    const doPdf = function () { RP.exportPDF(state, { notify: notify, setLoader: setLoader }); };
    $("#btn-pdf").addEventListener("click", doPdf);
    $("#btn-pdf-2").addEventListener("click", doPdf);

    const doOptimize = function () {
      setLoader(true, "Analysing your resume…");
      setTimeout(function () {
        const info = RP.analyzePages(state);
        setLoader(false);
        if (!info.ok) { notify("Could not analyse the resume.", "error"); return; }
        if (info.pages === 1) {
          notify("Your resume will fit on 1 page" + (info.fitScale < 1 ? " (text size adjusted to fit)" : info.compact ? " (compact layout)" : "") + ".", "success");
        } else {
          notify("Your resume will be " + info.pages + " pages. All content is included — nothing is cut.", "success");
        }
      }, 30);
    };
    $("#btn-optimize").addEventListener("click", doOptimize);
    $("#btn-optimize-2").addEventListener("click", doOptimize);
  }

  // ---------- mobile tabs ----------
  function bindTabs() {
    $("#tab-edit").addEventListener("click", function () {
      document.body.classList.remove("view-preview"); document.body.classList.add("view-edit");
      this.classList.add("active"); $("#tab-preview").classList.remove("active");
    });
    $("#tab-preview").addEventListener("click", function () {
      document.body.classList.remove("view-edit"); document.body.classList.add("view-preview");
      this.classList.add("active"); $("#tab-edit").classList.remove("active");
      setTimeout(fitZoom, 50);
    });
  }

  // ---------- init ----------
  function init() {
    let restored = loadSaved();
    if (!restored) { state = RD.sampleResume(); try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} restored = true; }
    populateSelects();
    buildStepper();
    bindStaticInputs();
    Object.keys(LISTS).forEach(bindList);
    bindTagInput("skills", "#skills-input", "#skills-add", "#skills-tags");
    bindTagInput("interests", "#interests-input", "#interests-add", "#interests-tags");
    bindCustomSections();
    bindSectionOrder();
    bindSuggestions();
    bindWizard();
    bindZoom();
    bindTemplate();
    bindActions();
    bindTabs();

    syncStaticFields();
    renderAllLists();
    renderPreview();
    renderChecklist();
    renderSectionOrder();
    updateSuggestions();
    goToStep(1);
    setTimeout(fitZoom, 60);

    if (false) {
      notify("Welcome! Fill in your details or load the Sample to see how it works.");
    } else {
      notify("Restored your saved resume.");
    }
    window.addEventListener("resize", debounce(function () { if (document.body.classList.contains("view-preview")) fitZoom(); }, 200));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
