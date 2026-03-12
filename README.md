## Architectural Evolution: The Monorepo Transition

Focal has transitioned from a standalone mobile application to a **TypeScript Monorepo** (powered by Turborepo). This shift was driven by several core engineering goals:

- **End-to-End Type Safety:** By sharing a common `packages/types` directory, both the Expo mobile app and the Node.js API consume the exact same TypeScript interfaces and Zod validation schemas. This eliminates "schema drift" and ensures the frontend never receives data it doesn't expect.
- **Unified Logic:** Core business logic, such as nutrition calculation formulas and ingredient flagging rules, is now centralized. A single change in a shared package propagates across the entire ecosystem.
- **Atomic Feature Development:** New features requiring both backend and frontend changes (e.g., adding new micronutrient tracking) can be developed, tested, and committed in a single, cohesive workflow.
- **Scalable Tooling:** Shared configurations for ESLint, Prettier, and TypeScript ensure a consistent coding standard across the mobile app and the backend services.

**Monorepo Link:** [https://github.com/emreutkan/focal](https://github.com/emreutkan/focal)
