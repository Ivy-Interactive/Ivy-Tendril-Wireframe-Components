# Ivy Tendril — hand-drawn wireframe components

A React component library that mirrors the [Ivy Framework](https://github.com/Ivy-Interactive/Ivy-Framework)
widget set, drawn as if someone sketched it on paper. Think Balsamiq: wobbly borders,
hatched fills, a handwriting typeface and a deliberately unfinished feel, so nobody
mistakes a wireframe for a finished design.

Built on React 19, Tailwind CSS v4, Radix primitives (the same base shadcn/ui uses) and
[rough.js](https://roughjs.com), with Storybook for the catalogue.

```bash
npm install
npm run storybook   # browse every component at http://localhost:6006
npm run build       # emit dist/index.js, dist/index.cjs, dist/tendril.css and types
```

## Using it

```tsx
import "@ivy/tendril/styles.css";
import { SketchProvider, Button, Card, TextInput, Field } from "@ivy/tendril";

export function App() {
  return (
    <SketchProvider>
      <div className="tendril">
        <Card title="New project" width="20rem">
          <Field label="Name" required>
            <TextInput value={name} onChange={setName} width="100%" />
          </Field>
          <Button title="Create" icon="Rocket" />
        </Card>
      </div>
    </SketchProvider>
  );
}
```

`SketchProvider` mounts the shared SVG filters and sets the pencil (roughness, bowing,
stroke width) for everything beneath it. The `tendril` class applies the handwriting font
and ink colour — put it on whatever wraps your app.

## How it maps to Ivy

Props keep their Ivy names, casing and value sets: `variant="Destructive"`,
`density="Small"`, `borderRadius="Full"`, `formatStyle="Currency"`, `colorScheme="Rainbow"`
and so on. Two deliberate differences, because Ivy's server-driven model does not apply to
a plain React library:

| Ivy | Tendril |
| --- | --- |
| `events: string[]` plus a widget-tree event handler | ordinary React callbacks — `onClick`, `onChange`, `onSelect`, `onOpenChange` |
| `slots: { Header, Content, Footer }` | named `ReactNode` props — `header`, `children`, `footer` |
| `DataTableConnection` streaming rows | a plain `rows` array |

Layout widgets are intentionally out of scope, as requested: `StackLayout`, `GridLayout`,
`HeaderLayout`, `FooterLayout`, `TabsLayout`, `SidebarLayout`, `ResizablePanelGroup`,
`FloatingPanel` and `CanvasLayout` have no Tendril equivalent — use flexbox, CSS grid or
your app's own layout system. Non-visual Ivy widgets (`Slot`, `Script`, `AppHost`,
`BreakpointListener`, `AutoScroll`, `FileDialog`, `SaveDialog`, `FolderDialog`) are also
skipped, since there is nothing to draw.

### Component index

**Primitives** — `TextBlock`, `Markdown`, `Html`, `Json`, `Xml`, `CodeBlock`, `Terminal`,
`ErrorPanel`, `Svg`, `Image`, `Iframe`, `Embed`, `Separator`, `Skeleton`, `Icon`, `Box`,
`Callout`, `Kbd`, `Empty`, `Avatar`, `Spacer`, `Loading`, `Stepper`, `AudioPlayer`,
`VideoPlayer`

**Widgets** — `Button`, `Badge`, `Card`, `Progress`, `StackedProgress`, `Tooltip`,
`Toolbar`, `Sheet`, `Breadcrumbs`, `Expandable`, `DropDownMenu`, `Pagination`, `Tree`,
`List` + `ListItem`, `Details` + `Detail`, `Table` + `TableRow` + `TableCell`, `DataTable`,
`Dialog` + `DialogHeader` + `DialogBody` + `DialogFooter`, `BladeContainer` + `Blade`,
`Chat` + `ChatMessage` + `ChatLoading` + `ChatStatus`, `Kanban` + `KanbanCard`, `Calendar`,
`WireframeNote`, `WireframeCallout`, `Confetti`, `Animation`

**Inputs** — `Field`, `Form`, `TextInput`, `ReadOnlyInput`, `BoolInput`, `NumberInput`,
`NumberRangeInput`, `SelectInput`, `AsyncSelectInput`, `DateTimeInput`, `DateRangeInput`,
`ColorInput`, `IconInput`, `FeedbackInput`, `FileInput`, `CodeInput`, `SignatureInput`,
`AudioInput`, `CameraInput`, `ContentInput`

**Charts** — `LineChart`, `AreaChart`, `BarChart`, `ScatterChart`, `PieChart`, `RadarChart`,
`FunnelChart`, `GaugeChart`, `SankeyChart`, `ChordChart`

Charts are drawn directly with rough.js rather than wrapping a charting library, so the
geometry matches the rest of the sketch. Series props (`lines`, `bars`, `areas`,
`scatters`, `pies`, `radars`, `funnels`), axis props and `colorScheme` keep their Ivy
shapes.

## The sketch layer

Everything is built on three pieces in `src/sketch`:

- **`SketchFrame`** — measures its own box with a `ResizeObserver` and renders the border
  (and optional fill) as rough.js paths in an SVG behind the content. Corners can be
  `sharp`, `rounded`, `pill` or `ellipse`; fills use rough.js's `hachure`, `cross-hatch`,
  `zigzag`, `dots`, `dashed` or `solid`.
- **`RoughShape`** — the same idea inside an existing `<svg>`, used by the charts.
- **`SketchProvider`** — the pencil settings, plus the `feTurbulence` filters that give
  icons and images their wobble.

Every frame takes a `seed`, so a component redraws with the same wobble on each render
instead of shimmering. Pass `deterministic={false}` to the provider if you want it to
re-scribble.

### Theming

The palette and typeface are Tailwind v4 theme tokens in `src/styles/tendril.css`.
Override them anywhere in your own CSS:

```css
:root {
  --font-sketch: "Comic Neue", cursive;
  --color-ink: #1f2933;
  --color-paper: #ffffff;
}
```

The stylesheet imports Balsamiq Sans from Google Fonts. If you self-host fonts or work
offline, drop the `@import` and point `--font-sketch` at your own face.

## Repository layout

```
src/
  lib/          shared types (Densities, Align, MenuItem, Option, …) and helpers
  sketch/       the rough.js drawing layer and colour palette
  widgets/      the components, grouped the way Ivy groups them
    primitives/
    inputs/
    charts/
  stories/      Storybook catalogue
  styles/       Tailwind theme and keyframes
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run storybook` | Storybook on port 6006 |
| `npm run build` | library bundle, stylesheet and `.d.ts` files into `dist/` |
| `npm run build-storybook` | static Storybook into `storybook-static/` |
| `npm run typecheck` | `tsc --noEmit` over `src` |
