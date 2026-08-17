# scripts/debug — hunting configs, not CI configs

Web-test-runner configs for hunting a specific class of failure. Neither is
part of any normal run — `pnpm test` keeps using the plain
`web-test-runner.config.mjs` at the repo root — and neither is wired into CI.
They lived at the repo root until V4-PLAN 4.10 moved them here, because a
root-level config reads as "part of the build" and these are instruments.

Run either from the **repo root** (the `files` globs resolve against the
working directory):

```bash
npx web-test-runner --config scripts/debug/web-test-runner.jitter.mjs
npx web-test-runner --config scripts/debug/web-test-runner.startprobe.mjs
```

- **`web-test-runner.jitter.mjs`** — manufactures main-thread load inside the
  page to flush out load-sensitive tests, instead of staking out natural load.
  The header comment carries the method.
- **`web-test-runner.startprobe.mjs`** — squeezes the per-file start budget
  until files fail, naming the slowest files. Use as a ratchet; the header
  comment carries the method.
