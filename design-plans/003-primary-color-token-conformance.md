# Plan 003: Primary Color Token Conformance Across Action Elements

## 1. Problem Statement
The global stylesheet (`frontend/src/index.css`) declares primary color theme tokens (`--color-primary` and `--color-primary-hover`), but key action buttons and navigation pills across `App.tsx` and `ProjectsDashboard.tsx` bypass them using hardcoded Tailwind utility classes (`bg-blue-600 hover:bg-blue-700`). This breaks theme centralization and prevents global branding adjustments.

## 2. Runtime Context & Traced Path
- **Surfaces**: Application Shell (`frontend/src/App.tsx`) and Projects Dashboard (`frontend/src/pages/ProjectsDashboard.tsx`)
- **Theme Definition**:
  - `frontend/src/index.css#L3-L6`:
    ```css
    @theme {
      --color-primary: #3b82f6;
      --color-primary-hover: #2563eb;
    }
    ```
  - In Tailwind CSS v4, `@theme` variables generate the utility classes `bg-primary`, `text-primary`, and `hover:bg-primary-hover`.
- **Violations Traced**:
  - `frontend/src/App.tsx#L23-L57`: Active links hardcode `bg-blue-600`.
  - `frontend/src/pages/ProjectsDashboard.tsx#L40`: Loading spinner uses `border-blue-600`.
  - `frontend/src/pages/ProjectsDashboard.tsx#L59`: "New Project" header button uses `bg-blue-600 hover:bg-blue-700`.
  - `frontend/src/pages/ProjectsDashboard.tsx#L72`: Empty state "Create Project" button uses `bg-blue-600 hover:bg-blue-700`.
  - `frontend/src/pages/ProjectsDashboard.tsx#L160`: Modal "Create Project" submit button uses `bg-blue-600 hover:bg-blue-700`.

## 3. Design Contract & Invariant
- **Single Source of Color Truth**: All interactive primary actions and active state highlights must consume the `--color-primary` (`bg-primary`) and `--color-primary-hover` (`hover:bg-primary-hover`) tokens rather than hardcoded palette steps.

## 4. Exact Implementation Specification

### File 1: `frontend/src/App.tsx`
- **Location**: Lines 23, 27, 31, 35, 39, 43, 47, 51, 55
- **Current**:
  ```tsx
  ${isActive(...) ? 'bg-blue-600' : 'hover:bg-gray-800'}
  ```
- **Replacement**:
  ```tsx
  ${isActive(...) ? 'bg-primary' : 'hover:bg-gray-800'}
  ```

### File 2: `frontend/src/pages/ProjectsDashboard.tsx`
- **Location**: Loading spinner (around line 40)
  - Change `border-blue-600` to `border-primary`.
- **Location**: "New Project" button (around line 59)
  - Change `bg-blue-600 hover:bg-blue-700` to `bg-primary hover:bg-primary-hover`.
- **Location**: Empty state "Create Project" button (around line 72)
  - Change `bg-blue-600 hover:bg-blue-700` to `bg-primary hover:bg-primary-hover`.
- **Location**: Creation Wizard submit button (around line 160)
  - Change `bg-blue-600 hover:bg-blue-700` to `bg-primary hover:bg-primary-hover`.

## 5. Verification & Acceptance Criteria
1. Run `npm --prefix frontend run build` to verify Tailwind v4 compiles `bg-primary` and `hover:bg-primary-hover` without errors.
2. In `frontend/src/index.css`, test modifying `--color-primary: #6366f1;` (indigo).
3. **Verification**:
   - The active sidebar pill, "New Project" button, and modal submit buttons immediately adopt the updated theme color without modifying individual component files.
4. Revert test variable back to `#3b82f6`.

## 6. Non-goals & Out of Scope
- Redesigning button border radiuses, icon placements, or typography tokens.
- Updating secondary/destructive action colors (`bg-red-500`, `bg-gray-100`).

