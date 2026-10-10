# Plan 002: Active Navigation Route Matching for Child Views

## 1. Problem Statement
The sidebar navigation indicators lose active-state presentation when drilling into sub-routes. Specifically, when a user navigates from the Projects Dashboard (`/`) into an individual Project Details view (`/project/:id`), all navigation links in the sidebar become unselected (`isActive('/')` evaluates to `false`).

## 2. Runtime Context & Traced Path
- **Surface**: Sidebar Navigation Component
- **Target File**: `frontend/src/App.tsx`
- **Render Path**:
  - `Sidebar` (`frontend/src/App.tsx#L15-L62`) receives current browser route via `useLocation()`.
  - Line 17 defines exact equality matching:
    ```tsx
    const isActive = (path: string) => location.pathname === path;
    ```
  - `ProjectsDashboard` renders project titles with click handlers navigating to `/project/${p.id}`:
    ```tsx
    onClick={() => navigate(`/project/${p.id}`)}
    ```
  - When the browser URL matches `/project/proj_stator_01`, `location.pathname === '/'` is `false`. The active blue pill styling (`bg-blue-600`) disappears, causing the navigation hierarchy context to be lost.

## 3. Design Contract & Invariant
- **Hierarchical Navigation Contract**: Navigating to a child view within a domain task (such as inspecting an individual project at `/project/:id`) must preserve the active visual indicator on the parent domain navigation item (`Projects`).

## 4. Exact Implementation Specification

### File: `frontend/src/App.tsx`

#### Change: Update `isActive` route evaluation logic
- **Location**: Line 17
- **Current**:
```tsx
const isActive = (path: string) => location.pathname === path;
```
- **Replacement**:
```tsx
const isActive = (path: string) => {
  if (path === '/') {
    return location.pathname === '/' || location.pathname.startsWith('/project');
  }
  return location.pathname.startsWith(path);
};
```

## 5. Verification & Acceptance Criteria
1. Navigate to `http://localhost:5173/`.
2. Confirm the **Projects** item in the sidebar is highlighted with active background styling (`bg-blue-600`).
3. Click on any project card (e.g., "Stator Motor Pin Inspection") to open its details page at `/project/proj_stator_01`.
4. **Verification**:
   - The **Projects** sidebar item remains highlighted with the active pill styling.
   - Navigating to `/data`, `/inspection`, `/training`, etc., properly transitions the active indicator to that specific section.

## 6. Non-goals & Out of Scope
- Adding breadcrumb components or back navigation buttons inside child pages.
- Altering routes or route definitions in `<Routes>`.

