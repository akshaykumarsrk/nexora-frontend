# NEXORA frontend test repair notes

This update addresses failures observed in the uploaded Vitest/Angular test log:

- Adds `MessageService` to standalone component tests that require PrimeNG toast services.
- Supplies a lightweight `ActivatedRoute` test double in route-driven component tests.
- Supplies router providers to the app/layout tests using router directives.
- Sets the required `title` and `value` inputs in the StatCard test.
- Adds a localStorage fallback in AuthService tests and guards Theme storage access so it can be instantiated in non-browser test contexts.
- Updates the App title test to check the root element instead of an outdated `Hello, nexora` template string.

Run from the project directory:

```bash
npm ci
npm test -- --watch=false
```

Important: this archive has not been validated with a full local Angular test run in this environment because the installed `node_modules` directory does not contain the Angular CLI/Vitest executable links. API-driven components may still emit connection-refused console messages unless their service calls are mocked with Angular HTTP testing providers; those should be cleaned up after confirming the current suite's remaining results.
