# NEXORA UI repair notes

Applied in this pass:
- Complete Job dialog now renders Cancel and Confirm Completion actions directly inside the dialog content (rather than relying on footer template projection).
- Scheduling is blocked with a clear inline explanation when a job has no work summary.
- Work-summary field guidance now clearly states it is required before scheduling.
- Global theme-aware PrimeNG datepicker overlay rules target the body-appended overlay, including date/year/month/deck selection and selected/hover/disabled states.
- Invoice completed-job selector now has theme-aware text, control, and overlay styling.
- Technician portal job rows use full-width box sizing and transparent child surfaces so dark-theme hover covers the whole row.
- Removed duplicate asset-list empty-message template.

Validation note: The archive was not fully built in this environment. The project requires a newer Node 22 patch version than the available runtime (Angular 22.1 requires Node 22.22.3+).