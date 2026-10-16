/* =========================================================
   render.js — builds resume HTML from data (pure, testable)
   Exposes window.RR
   ========================================================= */
(function (global) {
  "use strict";

  // --- HTML escaping (secure handling of user text) ---
  function esc(v) {
    if (v === null || v === undefined) return "";
    return String(v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Render multi-line description: bullets for newlines, else paragraph.
  function descHTML(text, asBullets) {
    const t = (text || "").trim();
    if (!t) return "";
    const lines = t.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (asBullets && lines.length > 1) {
      return "<ul>" + lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>";
    }
    if (lines.length === 1) return "<p class=\"rp-line\">" + esc(lines[0]) + "</p>";
    // multiple lines without bullet mode -> separate paragraphs
    return lines.map(function (l) { return "<p class=\"rp-line\">" + esc(l) + "</p>"; }).join("");
  }

  function linkify(url, label) {
    if (!url) return "";
    let href = url.trim();
    if (!/^https?:\/\//i.test(href)) href = "https://" + href;
    const safe = esc(href).replace(/"/g, "&quot;");
    return "<a class=\"rp-link\" href=\"" + safe + "\" target=\"_blank\" rel=\"noopener noreferrer\">" + esc(label || url) + "</a>";
  }

  function initials(name) {
    return (name || "").trim().split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
  }

  // ---------- HEADER ----------
  function headerHTML(p) {
    const contact = [];
    if (p.phone) contact.push("<span class=\"rp-c\"><b>Phone</b>" + esc(p.phone) + "</span>");
    if (p.email) contact.push("<span class=\"rp-c\"><b>Email</b>" + linkify("mailto:" + p.email, p.email) + "</span>");
    if (p.location) contact.push("<span class=\"rp-c\"><b>Location</b>" + esc(p.location) + "</span>");
    if (p.linkedin) contact.push("<span class=\"rp-c\"><b>LinkedIn</b>" + linkify(p.linkedin, p.linkedin) + "</span>");
    if (p.portfolio) contact.push("<span class=\"rp-c\"><b>Portfolio</b>" + linkify(p.portfolio, p.portfolio) + "</span>");

    let head = "<header class=\"rp-header\">";
    head += "<h1 class=\"rp-name\">" + esc(p.fullName || "Your Name") + "</h1>";
    const sub = [p.course, p.careerGoal].filter(Boolean).join("  •  ");
    if (sub) head += "<p class=\"rp-role\">" + esc(sub) + "</p>";
    if (contact.length) head += "<div class=\"rp-contact\">" + contact.join("") + "</div>";
    head += "</header>";
    return head;
  }

  function section(title, inner) {
    return "<section class=\"rp-section\"><h2 class=\"rp-sec-title\">" + esc(title) + "</h2>" + inner + "</section>";
  }

  // ---------- SECTION BUILDERS ----------
  function objectiveHTML(d) {
    const o = (d.personal.objective || "").trim();
    if (!o) return "";
    // Preserve the author's line breaks so 3-5 line objectives read naturally.
    const lines = o.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
    const inner = lines.map(function (l) { return esc(l); }).join("<br>");
    return section("Career Objective", "<p class=\"rp-obj\">" + inner + "</p>");
  }

  function educationHTML(d) {
    if (!d.education.length) return "";
    const items = d.education.map(function (e) {
      const left = "<div><div class=\"rp-item-title\">" + esc(e.degree) + (e.field ? (", " + esc(e.field)) : "") + "</div>" +
        (e.institution ? "<div class=\"rp-item-sub\">" + esc(e.institution) + (e.board ? ("  •  " + esc(e.board)) : "") + "</div>" : "") + "</div>";
      const yrs = [e.startYear, e.endYear].filter(Boolean).join(" – ");
      const meta = [];
      if (yrs) meta.push(esc(yrs));
      if (e.score) meta.push(esc((e.scoreType ? e.scoreType + " " : "") + e.score));
      return "<div class=\"rp-item\"><div class=\"rp-row\">" + left + (meta.length ? "<div class=\"rp-item-meta\">" + meta.join("  •  ") + "</div>" : "") + "</div></div>";
    }).join("");
    return section("Education", items);
  }

  function skillsHTML(d) {
    if (!d.skills.length) return "";
    const tags = d.skills.map(function (s) { return "<span class=\"rp-tag\">" + esc(s) + "</span>"; }).join("");
    return section("Skills & Strengths", "<div class=\"rp-tags\">" + tags + "</div>");
  }

  function experienceHTML(d) {
    if (!d.experience.length) return "";
    const items = d.experience.map(function (x) {
      const left = "<div class=\"rp-item-title\">" + esc(x.role) + "</div>";
      const sub = [x.company, x.type, x.location].filter(Boolean).join("  •  ");
      const leftBlock = left + (sub ? "<div class=\"rp-item-sub\">" + esc(sub) + "</div>" : "");
      const dates = [x.startDate, x.current ? "Present" : x.endDate].filter(Boolean).join(" – ");
      return "<div class=\"rp-item\"><div class=\"rp-row\">" + leftBlock +
        (dates ? "<div class=\"rp-item-meta\">" + esc(dates) + "</div>" : "") + "</div>" +
        descHTML(x.description, true) + "</div>";
    }).join("");
    return section("Experience & Internships", items);
  }

  function projectsHTML(d) {
    if (!d.projects.length) return "";
    const items = d.projects.map(function (p) {
      const titleRow = "<div class=\"rp-item-title\">" + esc(p.title) +
        (p.techstack ? " <span class=\"rp-item-sub\" style=\"font-weight:400\">— " + esc(p.techstack) + "</span>" : "") + "</div>";
      const link = p.link ? "<div>" + linkify(p.link, p.link) + "</div>" : "";
      return "<div class=\"rp-item\">" + titleRow + link + descHTML(p.description, true) + "</div>";
    }).join("");
    return section("Projects & Practical Work", items);
  }

  function certificationsHTML(d) {
    if (!d.certifications.length) return "";
    const items = d.certifications.map(function (c) {
      const left = "<div><div class=\"rp-item-title\">" + esc(c.name) + "</div>" +
        (c.issuer ? "<div class=\"rp-item-sub\">" + esc(c.issuer) + "</div>" : "") + "</div>";
      const right = [];
      if (c.date) right.push("<div class=\"rp-item-meta\">" + esc(c.date) + "</div>");
      if (c.credentialLink) right.push(linkify(c.credentialLink, "View"));
      return "<div class=\"rp-item\"><div class=\"rp-row\">" + left + (right.length ? "<div>" + right.join("") + "</div>" : "") + "</div></div>";
    }).join("");
    return section("Certifications", items);
  }

  function achievementsHTML(d) {
    if (!d.achievements.length) return "";
    const items = d.achievements.map(function (a) {
      const left = "<div><div class=\"rp-item-title\">" + esc(a.title) + "</div>" + descHTML(a.description, false) + "</div>";
      return "<div class=\"rp-item\"><div class=\"rp-row\">" + left + (a.date ? "<div class=\"rp-item-meta\">" + esc(a.date) + "</div>" : "") + "</div></div>";
    }).join("");
    return section("Achievements", items);
  }

  function activitiesHTML(d) {
    if (!d.activities.length) return "";
    const items = d.activities.map(function (a) {
      return "<div class=\"rp-item\"><div class=\"rp-item-title\">" + esc(a.title) + "</div>" + descHTML(a.description, true) + "</div>";
    }).join("");
    return section("Activities & Responsibilities", items);
  }

  function languagesHTML(d) {
    if (!d.languages.length) return "";
    const cells = d.languages.map(function (l) {
      return "<span class=\"rp-c\">" + esc(l.name) + (l.level ? (" (" + esc(l.level) + ")") : "") + "</span>";
    }).join("");
    return section("Languages", "<div class=\"rp-cols\">" + cells + "</div>");
  }

  function interestsHTML(d) {
    if (!d.interests.length) return "";
    const cells = d.interests.map(function (i) { return "<span class=\"rp-c\">" + esc(i) + "</span>"; }).join("");
    return section("Interests", "<div class=\"rp-cols\">" + cells + "</div>");
  }

  function customSectionHTML(c) {
    if (!c || !c.title || !c.items || !c.items.length) return "";
    const items = c.items.map(function (it) {
      return "<div class=\"rp-item\">" + descHTML(it, true) + "</div>";
    }).join("");
    return section(c.title, items);
  }

  // ---------- ORCHESTRATOR ----------
  const BUILDERS = {
    objective: objectiveHTML,
    education: educationHTML,
    skills: skillsHTML,
    experience: experienceHTML,
    projects: projectsHTML,
    certifications: certificationsHTML,
    achievements: achievementsHTML,
    activities: activitiesHTML,
    languages: languagesHTML,
    interests: interestsHTML
  };

  // Build the full inner HTML of the resume page (without wrapper).
  // Honors sectionOrder and auto-hides empty sections.
  function buildResumeBody(d) {
    let order = (d.sectionOrder && d.sectionOrder.length) ? d.sectionOrder.slice() : RD.SECTIONS.map(function (s) { return s.key; });
    // append any custom sections
    (d.customSections || []).forEach(function (c) { order.push("custom:" + c.id); });

    const parts = [];
    parts.push(headerHTML(d.personal));
    order.forEach(function (key) {
      if (key.indexOf("custom:") === 0) {
        const id = key.slice(7);
        const c = (d.customSections || []).find(function (x) { return x.id === id; });
        const html = customSectionHTML(c);
        if (html) parts.push(html);
        return;
      }
      if (!RD.sectionHasContent(d, key)) return; // hide empty
      const b = BUILDERS[key];
      if (b) { const html = b(d); if (html) parts.push(html); }
    });
    return parts.join("");
  }

  function splitTwoColumnBody(body) {
    const headerEnd = body.indexOf("</header>");
    const header = headerEnd < 0 ? "" : body.slice(0, headerEnd + 9);
    const sections = headerEnd < 0 ? body : body.slice(headerEnd + 9);
    const sectionParts = sections.match(/<section class="rp-section">[\s\S]*?<\/section>/g) || [];
    const sideTitles = ["Skills &amp; Strengths", "Certifications", "Achievements", "Languages", "Interests"];
    const left = [], right = [];
    sectionParts.forEach(function (part) {
      const isSideSection = sideTitles.some(function (title) { return part.indexOf(">" + title + "</h2>") !== -1; });
      (isSideSection ? right : left).push(part);
    });
    return header + '<div class="rp-two-col"><div class="rp-col rp-col-main">' + left.join("") + '</div><div class="rp-col rp-col-side">' + right.join("") + '</div></div>';
  }

  // Full page markup including wrapper class + accent variable.
  function buildResumeHTML(d) {
    const template = d.template || "ats";
    const tpl = "tpl-" + template;
    const accent = d.accent || "#1e3a8a";
    const body = buildResumeBody(d);
    const layoutBody = template === "two-column" ? splitTwoColumnBody(body) : body;
    return '<div class="resume-page ' + tpl + '" style="--rp-accent:' + accent + '">' + layoutBody + "</div>";
  }

  global.RR = {
    esc: esc,
    descHTML: descHTML,
    linkify: linkify,
    initials: initials,
    buildResumeBody: buildResumeBody,
    splitTwoColumnBody: splitTwoColumnBody,
    buildResumeHTML: buildResumeHTML
  };
})(window);
