# Frontend Development Plan - Medical ERP

## Organization Governance Phases

### Phase 1: Admin Global Organization Management
- **Goal:** Enable global setup and control of the system by platform administrators.
- **Scope:** CRUD for all organization types (Hospital, Doctor, Dealer, Distributor, Sub-Distributor). Only accessible by users belonging to `ADMIN` organization.
- **Key Feature:** Impersonation Flow. An Admin can log in, select an organization, and impersonate them to view stats and manage data directly scoped to that organization.

### Phase 1.2: Organization + Primary Admin Management UI
- **Goal:** Extend Organization Governance by bootstrapping organizations with a Primary Admin account.
- **Scope:** 
  - **Organization Bootstrap with Primary Admin:** Creating an organization automatically provisions its first Primary Admin user.
  - **Admin email/password management:** Manage the Primary Admin credentials directly from the Global Admin UI.
  - **Audit-aware operations:** Changes to the Admin configuration log appropriately with context tracing.

### Phase 2: Inter-Organization Trading & Inventory (Future)
- **Goal:** Enable transactions between organizations (e.g., Distributors selling to Hospitals).

## Admin-only Organization Management
- Rendering logic: Admin modules (like `/admin/organizations`) are guarded by both:
  - `organization_type === 'ADMIN'`
  - User has `organization:manage` permission.

## Impersonation Flow
- Admin views all organizations.
- Clicks "Impersonate" on a specific organization card.
- Makes API call to `/auth/impersonate` with target `organization_id`.
- Receives new JWT reflecting the impersonated org's context.
- Frontend replaces stored token seamlessly without triggering full re-authentication.
- UI state resets: context boundaries, loaded permissions.
- Display permanent banner: "Impersonating: [Organization Name] — [Exit Impersonation]".
- Click "Exit Impersonation" to revert to original Admin token and reset state.

## Permission-based Rendering
- Introduce `<PermissionGate>` component.
- Accepts `requiredPermission` prop.
- Validates against active `user.permissions` (extracted or verified via Context).
- If validation fails, either hides element or redirects.
- In-app routing guarded by `<ProtectedRoute>` which now also checks organizational roles and permissions.

## Security Constraints
- **Never manually pass `organization_id` in requests.** All scoped requests rely entirely on the active JWT.
- API calls automatically include the JWT via `axios` interceptor.
- Backend resolves `active_organization_id` exclusively from the JWT.
