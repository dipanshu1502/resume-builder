# UniResume — University Student Resume Builder

A complete, fully client-side resume builder for university students. The
course suggestions include the university's 33 listed programs, and the
Course / Degree field also accepts custom courses. Built with **HTML5, CSS3 and Vanilla JavaScript** — no backend, no
login, no paid API.

## Run it

Open `index.html` in any modern browser (double-click works).
The PDF library is bundled locally in `vendor/`, so **Download PDF works
offline / from `file://`** too.

## Features

- **Responsive UI** — desktop: editor (left) + live A4 preview (right).
  Tablet/mobile: single column with **Edit / Preview** tabs.
- **8-step guided form** — Personal, Education, Skills, Experience, Projects,
  Certifications & Achievements, Additional, Review.
- **All streams supported** — per-stream skill suggestions and a one-click
  career-objective writer. Optional sections are fully skippable.
- **4 templates** — ATS-Friendly, Modern Professional, Fresher/Student,
  Corporate. Instant switching, accent colour picker, section reordering.
- **Live preview** — true A4 portrait (210×297 mm) with Zoom In/Out/Fit.
- **Exactly one-page PDF** — smart optimizer shortens long text, drops the
  least-relevant entries and applies a compact (still ≥9 pt) layout until the
  content fits a single A4 page. If it still cannot fit legibly, the app asks
  you to shorten instead of producing a bad PDF. Never invents facts.
- **Auto-save** to LocalStorage; **JSON import/export**; **Sample** resume;
  **completion checklist**; loading & error indicators; XSS-safe rendering.

## Files

```
index.html            markup + wizard
css/style.css         all styling incl. 4 templates + compact mode + print
js/data.js            defaults, stream suggestions, sample resume
js/render.js          pure HTML builder (escaping, section order, hide-empty)
js/pdf.js             one-page optimizer + html2canvas/jsPDF export
js/app.js             state, forms, wizard, preview, actions
vendor/               html2canvas + jsPDF (local, offline-capable)
test*.js              Node/headless-Chrome test suites (see below)
```

