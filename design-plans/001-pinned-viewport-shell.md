# Plan 001: Pinned Viewport Shell and Independent Content Scrolling

## 1. Problem Statement
The VisionStudio desktop layout allows the sidebar navigation spine to scroll out of view when page content exceeds the viewport height. When a user scrolls down on long pages (e.g., project lists, inspection results, or camera feeds), the sidebar ends abruptly, desynchronizing the navigation anchor from the view.

## 2. Runtime Context & Traced Path
- **Surface**: Application Shell Layout
- **Target File**: `frontend/src/App.tsx`
- **Render Path**:
  - `AppWrapper` (`frontend/src/App.tsx#L86-L92`) mounts `BrowserRouter` -> `App` (`#L64-L84`).
  - `App` establishes root layout wrapper `<div className="flex bg-gray-100 min-h-screen">` enclosing `<Sidebar />` and `<main className="flex-1 p-8 overflow-y-auto">`.
  - Because the outer container uses `min-h-screen` without bounding `h-screen overflow-hidden`, document height expansion causes the global window/body to scroll. `<main>`'s `overflow-y-auto` is never bounded by a fixed viewport height, so `<Sidebar className="min-h-screen">` scrolls off the top of the browser viewport.

## 3. Design Contract & Invariant
- **Desktop Metrology Shell Contract**: The CAD/metrology inspection shell requires a pinned, non-scrolling primary navigation spine (`Sidebar`) occupying exactly 100% of the viewport height (`h-screen`), while the active canvas/page container (`<main>`) handles internal scrolling independently.

## 4. Exact Implementation Specification

### File: `frontend/src/App.tsx`

#### Change 1: Pin outer container to viewport height and clip overflow
- **Location**: Line 66
- **Current**:
```tsx
<div className="flex bg-gray-100 min-h-screen">
```
- **Replacement**:
```tsx
<div className="flex bg-gray-100 h-screen overflow-hidden">
```

#### Change 2: Constrain Sidebar to fixed viewport height without shrink
- **Location**: Line 20
- **Current**:
```tsx
<div className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
```
- **Replacement**:
```tsx
<div className="w-64 bg-gray-900 text-white h-screen shrink-0 p-4 flex flex-col">
```

#### Change 3: Ensure `<main>` container occupies remaining height with dedicated scroll
- **Location**: Line 68
- **Current**:
```tsx
<main className="flex-1 p-8 overflow-y-auto">
```
- **Replacement**:
```tsx
<main className="flex-1 p-8 overflow-y-auto h-full">
```

## 5. Verification & Acceptance Criteria
1. Open the application in a desktop browser at `http://localhost:5173/`.
2. Navigate to a page with content taller than the display (or zoom in to 150%).
3. Scroll through the page content using the mouse wheel or scrollbar.
4. **Verification**:
   - The dark sidebar (`VisionStudio` title and all 9 navigation links) remains pinned and visible at all times.
   - Only the light gray content pane (`<main>`) scrolls vertically.
   - No double scrollbars appear on the root browser window.

## 6. Non-goals & Out of Scope
- Modifying sidebar link paths or responsive mobile drawer variants.
- Changing individual page card layouts or data fetching mechanisms.

