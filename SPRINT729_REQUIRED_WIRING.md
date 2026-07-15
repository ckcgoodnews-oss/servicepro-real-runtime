# Sprint 729 Required Wiring

- Public and authenticated pages expose a keyboard-visible skip link to the main content landmark.
- Authenticated route changes are announced through an atomic polite live region.
- Current navigation uses `aria-current`, and all interactive controls receive a strong `:focus-visible` indicator.
- Accessibility settings provide device-local high-contrast and reduced-motion modes with pressed-state semantics and Escape-key handling.
- System `prefers-reduced-motion`, `prefers-contrast`, and Windows forced-colors preferences are honored.
- Run `npm run test:sprint729`, both web builds, and the complete regression suite before release.
