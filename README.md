# AI Consulting Workbench

An evidence-first consulting studio for research briefs, data analysis, advisory reports, slide storylines, proposals, client emails, and meeting notes.

**Status: working prototype, not a production consulting service.** The hosted application provides editable consulting prompts, structured starters, deterministic analysis, an evidence ledger, review checks, and Markdown/JSON exports. It does not browse the web or run a hosted AI model. Real model drafting is implemented in the local Node service through Ollama. No model credentials are included.

## Try it

Hosted demo: https://subratatec1.github.io/ai-consulting-workbench/ (available after GitHub Pages deployment completes).

1. Load the fictional Northstar engagement.
2. Select a workflow and choose **Build starter** or **Adaptable prompt**.
3. Try Data analysis: the sample produces 500 tickets, 148.7 handling hours, and a 17.84-minute weighted average. No savings are inferred.
4. Add evidence excerpts and source provenance in the ledger.
5. Edit the draft, run checks, and complete the human review checklist.
6. Export a draft or engagement. Nothing is sent to a client automatically.

## Run locally

Requires Node.js 20 or later. No package dependencies or installation step are needed.

```sh
git clone https://github.com/subratatec1/ai-consulting-workbench.git
cd ai-consulting-workbench
npm start
```

Open http://localhost:4173. For live AI drafting, install and run [Ollama](https://ollama.com), install an appropriate model (for example `ollama pull phi4`), then choose **Draft with local AI** and enter the installed model name. Large models may require substantial memory. The workbench uses only the loopback Ollama endpoint.

```sh
npm test
```

Tests cover calculations, input validation, evidence IDs, unsafe source links, draft checks, sensitive-data routing, cross-origin protection, and the local model adapter using a mock. A mock test does not establish real model quality. Real generation needs a running installed Ollama model.

## Consulting method

Prompts carry a decision, audience, context, permitted evidence, method, deliverable structure, voice preferences, and review requirements. Specialty lenses cover management, IT, HR, financial, and marketing work; these are starting guidance, not validated domain expertise.

Source excerpts are treated as untrusted input rather than instructions. Facts should carry source IDs; missing evidence and terms are flagged. Prompt instructions cannot guarantee resistance to prompt injection or correct claims.

## Confidentiality and review

- Hosted engagement content lives in browser memory; no application analytics, browser persistence, or automatic content uploads are used. Hosting providers still see ordinary web request metadata.
- Reloading clears the workspace. Export/import saves your work intentionally. Exported files may contain all evidence and must be handled according to client policy.
- Local generation sends the brief and evidence to local Ollama only on explicit action. Restricted classification is rejected server-side. Confidential content requires explicit approval.
- The local service binds to loopback, checks host/origin, limits request size, and does not log content. It is not a multi-user authenticated production backend.
- Draft checks detect some placeholders, unknown citations, identifiers/credentials, and absolute claims. They do not verify source entailment, comprehensively detect personal data, or certify confidentiality.
- Human approval is a checklist, not an accuracy assurance. No emails, proposals, or agreements are executed.

See [architecture and evaluation plan](architecture.md). No license has been selected; public access does not by itself grant reuse rights.
