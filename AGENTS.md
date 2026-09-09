# Working in this repository

Tendril is a React component library that draws itself by hand. Every border, fill and
chart is a [rough.js](https://roughjs.com) path over a measured box, so the output reads
as a wireframe sketch rather than a finished design.

This file is the orientation an agent needs before changing anything. `README.md` is for
people consuming the package; `MANIFEST.md` documents the generated manifest.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Storybook on 6006 — the component catalogue, and the fastest way to see a change |
| `npm run typecheck` | `tsc --noEmit` over `src`. **Run this after every change.** |
| `npm run build` | Library bundle, stylesheet, `.d.ts`, then regenerates the manifest |
| `npm run manifest` | Regenerate `tendril.manifest.yaml` |
| `npm run manifest:check` | Fail if the committed manifest is stale — CI runs this |
| `npm run build-storybook` | Static Storybook; a good end-to-end check that every story still compiles |

`npm run lint` and `npm run format` are declared but eslint and prettier are **not
installed**. Do not treat their failure as a regression, and do not add them to CI
without installing them first.

## Layout

```
src/
  lib/            types.ts (shared prop types) and utils.ts (sizing, density, class helpers)
  sketch/         the drawing layer — everything visual is built on this
  widgets/        the components
    primitives/   text, media, code, feedback, boxes
    inputs/       every form control
    charts/       ten chart types, drawn with rough.js rather than a charting library
    layouts/      TabsLayout, SidebarLayout, ResizablePanelGroup, FloatingPanel
    wireframe/    the annotation marks — notes, callouts, arrows, mockups, transforms
  stories/        one Storybook section per component, mirroring the widget folders
  styles/         tendril.css (the shipped sheet) and theme.css (tokens only)
scripts/          the manifest generator
```

## The sketch layer

Three pieces in `src/sketch`, and every widget is built on them:

- **`SketchFrame`** — measures its own box with a `ResizeObserver` and renders the border
  and fill as rough.js paths in an SVG *behind* a content layer.
- **`RoughShape`** — the same idea inside an existing `<svg>`; the charts use it.
- **`SketchProvider`** — pencil settings (roughness, bowing, stroke width) plus the
  `feTurbulence` filters that wobble icons.

### Invariants worth knowing before you touch it

**The border is inset from the element edge.** `SketchLayer` draws at `strokeWidth + 1`
inside the box. The content layer spans the full box, so a full-bleed fill inside a frame
— a highlighted menu row, a selected option — will paint over and past the drawn line.
`SketchFrame` already clips the content layer to the drawn corner *and* that inset, but
only for frames that opted into clipping (`overflow-hidden`/`auto`/`scroll` in
`contentClassName`). If you add a surface with hoverable rows, give it one of those.

**Seeds keep the wobble still.** Every frame and shape takes a `seed`. Without one, the
geometry is re-randomised on each render and the whole page shimmers. Use something
stable and unique — usually `id`, or `` `${id}-part` `` for a sub-shape.

**rough.js drops `strokeLineDash` in `toPaths`.** It only applies dashes when it renders
to the DOM itself, which the sketch layer does not do. `roughPaths` in `useRough.ts`
re-attaches the dash to outline strokes (never to hachure fills, which would fray). Do
not "simplify" that away — dashed borders and dashed arrows depend on it.

**Colours and weights come from tables, not literals.** `src/sketch/colors.ts` holds
`PALETTE`, `SURFACE` and `STROKE`. A border's weight should mean the same thing
everywhere, so reach for `STROKE.hairline`/`thin`/`regular`/`emphasis`/`heavy` rather
than a number, and `SURFACE.raised`/`sunken`/`code`/`highlight` rather than a hex.

## Component conventions

Every component takes `WidgetBaseProps`: `id`, `width`, `height`, `aspectRatio`,
`density`, `visible`, plus `className`, `style`, `data-testid`.

- **Props are named enums**, not booleans plus utility classes: `variant="Destructive"`,
  `borderRadius="Full"`, `formatStyle="Currency"`.
- **Events are ordinary React callbacks** — `onClick`, `onChange`, `onSelect`.
- **Composite widgets take named `ReactNode` props** for their regions (`header`,
  `children`, `footer`), not a slots object.
- **Sizes** go through `toCssSize`: CSS lengths (`"20rem"`), fractions (`"1/2"`) and bare
  numbers, which mean quarter-rem steps.
- **`density` defaults to `Medium` everywhere.** Destructure it as `density = "Medium"`,
  and route every density-dependent value through `byDensity`, which also falls back to
  `Medium`. The one exception is a component that inherits density from a context — see
  `ListItem`, which must leave it `undefined` so `<List density="Large">` reaches its
  rows.

### A label that goes bold when selected must use `steady-bold`

Bold and regular are not the same width, so a label that switches weight on selection
nudges its neighbours by a pixel on every click. `tendril.css` defines a `steady-bold`
utility that reserves the bold width up front:

```tsx
<span className={cn("steady-bold", active && "font-bold")} data-label={label}>
  <span>{label}</span>
</span>
```

Applied in `Toolbar`, `SidebarMenu`, `TabsLayout` and `BoolInput`'s toggle. Any new
selected-goes-bold surface needs it too.

### Popovers must size from the control, not its wrapper

Radix measures the trigger element to size a popover. A bare block `<div>` wrapper fills
its container, and the panel comes out as wide as the page. Trigger wrappers carry
`className="w-fit max-w-full"` for this reason.

## Adding a component

1. Put it in the folder that matches its kind, and export it from that folder's
   `index.ts` (which `src/widgets/index.ts` re-exports).
2. Give it `WidgetBaseProps`, a `density = "Medium"` default, and a `seed` on any frame.
3. Write a JSDoc block on the exported component — the first paragraph becomes the
   manifest description. Add `@tags`, at least one `@example`, and `@category` if the
   folder does not already imply the right one. `MANIFEST.md` has the full tag vocabulary.
4. Add a Storybook section: `src/stories/<category>/<Name>.stories.tsx`, with
   `title: "<Category>/<Name>"`, `component:` set (that is what gives the docs page its
   props table and controls), and a `Default` story plus a few variants. One file per
   section — sub-parts that are never used alone (`TableRow`, `DialogHeader`, `Tab`) go
   in their parent's `subcomponents`, not their own section.
5. `npm run typecheck`, then `npm run manifest`, and commit the manifest with the change.

## The manifest

`tendril.manifest.yaml` is generated and **committed**. Props come from the TypeScript
types via the compiler's own checker, so they cannot drift; prose comes from JSDoc.
Defaults come from the destructuring pattern, falling back to a `@default` tag on the
prop declaration — that is how `density` reports `Medium` on components that only inherit
it.

Regenerate it after any change to a prop, a type or a doc comment. `npm run
manifest:check` fails the build if you forget.

## Consumers, and the two CSS paths

The package ships both a prebuilt stylesheet and a tokens-only sheet, and picking the
wrong one is the most common integration mistake:

- **No Tailwind** → `import "@ivy/tendril/styles.css"`. Self-contained.
- **Tailwind v4** → `@import "@ivy/tendril/theme.css"` plus
  `@source "../node_modules/@ivy/tendril/dist"`.

Importing the prebuilt sheet in a Tailwind app ships preflight twice, and — the part that
actually bites — compiles none of the consuming app's own utility classes. There is a
worked example in `D:\Temp\WireframeTest` (not part of this repo) that takes the second
path.

Icons resolve lucide by name at runtime, so the whole icon map is in the bundle and
cannot be tree-shaken. It is the largest part of the package; that is a deliberate
trade for `icon="Rocket"` ergonomics.

## Before you finish

- `npm run typecheck` passes.
- `npm run manifest:check` passes (or you regenerated and committed the manifest).
- If you changed anything visual, look at it — `npm run dev` and open the component's
  story. Screenshots catch what types cannot: a fill escaping its border, a label
  reflowing, a panel sized from the wrong element.
- Do not commit `dist/` or `storybook-static/`; both are ignored.
