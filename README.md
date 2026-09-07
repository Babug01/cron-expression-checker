# Cron Expression Checker

Validate a cron expression, see the next several run times, and get a plain-English description of
what it means — with an inline legend explaining each of the 5 fields, since crontab.guru's own
field legend is easy to miss the first few times. Runs entirely in the browser; nothing you type
ever leaves your machine.

## Features

- **Validation** with a clear error for a malformed expression
- **Next run times** — the upcoming several fire times computed from the expression
- **Plain-English description** (e.g. "At 04:30 AM, only on Monday")
- **Field-by-field legend** for minute/hour/day-of-month/month/day-of-week, including `@reboot` and
  the other special shorthand strings

## Why I built this

crontab.guru is great but assumes you already know which field is which — I wanted the legend
front and center. This is also one piece of a larger internal DevOps tool I built at work
consolidating the utility pages a platform engineer reaches for daily into one place — this repo is
the cron checker piece, cleaned up and open-sourced on its own.

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [`cron-parser`](https://github.com/harrisiirak/cron-parser) for validation and computing next run times
- [`cronstrue`](https://github.com/bradymholt/cRonstrue) for the plain-English description

## Running locally

```bash
git clone https://github.com/Babug01/cron-expression-checker.git
cd cron-expression-checker
npm install
npm run dev
```

## License

MIT — see [LICENSE](LICENSE).
