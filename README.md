# ✳ Painpoint Radar

**Find what users struggle with—before you build the solution.**

Painpoint Radar turns a public GitHub repository's recent open issues into a browsable research brief: themes, issue-level evidence, recurring title words and a downloadable JSON report. Free to run. No paid API, accounts, model downloads, or third-party packages required.

> This is a deterministic keyword-based research assistant, **not an LLM**. Its groupings and signal scores are leads for investigation, not proof that a problem is widespread or valuable.

## Quick start

Install [Node.js 18 or newer](https://nodejs.org/). Download and extract this repository, open a terminal in the project folder, and run:

```bash
npm start
```

Open **http://localhost:3000**, enter a public repository such as `vercel/next.js`, then select **Find pain points**. Or select **Explore a sample report** to explore fictional sample data without a GitHub request. No `npm install` is required.

On Windows, use PowerShell or Command Prompt. To stop the server, press `Ctrl+C`.

### Optional token for rate limits

Unauthenticated GitHub search requests have strict rate limits. A **free** GitHub token is optional and may increase your rate limit, subject to GitHub's rules. It stays on your server and is never sent to the browser. To analyze public data, use a fine-grained token with public access only; no repository write permission is needed. In PowerShell:

```powershell
$env:GITHUB_TOKEN = 'YOUR_TOKEN'
npm start
```

In macOS/Linux: `export GITHUB_TOKEN='YOUR_TOKEN'` before starting. Do not commit, paste into a chat, or share a token. Restart the server after changing environment variables.

## How it works

1. The server fetches up to **100 most recently updated open issues** using GitHub's Search API (`is:issue`, excluding pull requests). It never accepts arbitrary URLs to fetch.
2. Title and body words are matched against eight transparent keyword lists in `analysis.js`. Issues may appear in multiple themes. Unmatched issues go to **Other**. Only English keywords are covered.
3. Each issue's signal is `1 + min(5, log2(1 + comments)) + min(5, log2(1 + reactions)) + 1 if created in the last 30 days`; issue scores are rounded to one decimal and added per theme. This emphasizes active conversations, not user counts or severity. Ranking can be biased by repository habits, age and engagement.
4. Words appearing in at least two distinct issue titles are shown; common stopwords are excluded. The report links back to real GitHub issues. The sample report uses fictional issues and has no external issue links.

The app is read-only with respect to GitHub. It does not persist issue data, but exporting JSON saves it on your device. Only recent open issues are analyzed; sampling, GitHub search indexing, incomplete results, rate limits, languages and categorization all affect results. Compare with other sources, read original issues, and interview users before building.

## Tests

```bash
npm test
```

Tests cover theme grouping, ranking, recurring words, validation, search errors and the local HTTP endpoint. GitHub API calls in tests are mocked; they don't consume API quota.

## Safety & deployment

The server defaults to listening on `127.0.0.1` for local use. It has no authentication, per-user rate limiting or multi-tenant isolation. **Do not expose it publicly**, particularly with `GITHUB_TOKEN` set. The interface renders issue text using text nodes. Avoid exporting or sharing sensitive data. Public issues remain subject to their original authors' rights and GitHub's terms.

## Project structure

- `server.js` — local server, repository validation, bounded GitHub requests
- `analysis.js` — explainable categorization and ranking
- `public/` — accessible, responsive dashboard
- `sample.json` — fictional, offline demo dataset
- `tests/` — Node's built-in test runner

## Contributing

Issues and pull requests are welcome! Start with a concrete example, expected behavior, and a minimal reproduction. Ideas include multilingual themes, configurable keywords and better grouping. Run `npm test` before opening a PR. Do not include secrets or private user data.

MIT license. Built by Saim Ullah.
