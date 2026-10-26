# Source chapter comparison — 30 CCAR-F lessons

The website's only curriculum fact source remains https://claudecertificationguide.com/learn/.

Run:

    npm run audit:curriculum -- --lesson all

Or a single lesson:

    npm run audit:curriculum -- --lesson 2.4

The script fetches the live original HTML from the approved HTTPS /learn/ host, rejects external redirects, extracts **chapter headings only**, and writes `artifacts/ccarf-source-structure/report.md` and `report.json`. It lists the original chapter outline beside the Vietnamese and English section headings, practice-step counts and MCQ counts in the current website.

**This is an inventory of structure, not an automatic accuracy certificate.** Equal section counts cannot prove that all facts, examples, decisions or exam traps are present, and different counts can be legitimate after independently rewriting for learners. All semantic differences must still be checked against the original articles. A failed fetch is marked BLOCKED, never reviewed or passed.

The separate optional CCAR-F AI content review agent can provide evidence-linked candidate corrections with Anthropic API credentials, but also does **not** license any claim of 100% completeness.

No article body text is copied or republished, and the programme does not modify lesson files.
