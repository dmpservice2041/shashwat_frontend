# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Frontend Permission Trust Model

The frontend acts purely as a presentation and enforcement layer. It unconditionally trusts explicit permission arrays provided by the backend via `/auth/me` and `/auth/login`.

- **Backend is authority**: The database and backend APIs are the ultimate source of truth for both module enablement and fine-grained permissions.
- **JWT only identity**: JWT tokens are used exclusively for stateless authentication (determining user identity, expiration, tenant ID). They are never parsed on the frontend to determine module access or permissions.
- **Redis cache invisible**: The backend may use Redis or other distributed caches to optimize permission resolution, but this optimization is completely invisible to the frontend.
- **No client-side role logic**: The frontend maintains zero hardcoded roles or organizational bypasses. Menu rendering and route protection are dynamically driven strictly by checking if the required module is present in `user.enabled_modules` and the required action is present in `user.permissions`.
