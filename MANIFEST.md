# The component manifest

`tendril.manifest.yaml` describes every exported component and every prop it takes, so
something outside JavaScript — an Ivy C# app, a code generator, an LLM tool schema — can
enumerate the library without hard-coding a copy of it.

```bash
npm run manifest         # regenerate (also runs as part of `npm run build`)
npm run manifest:check   # fail if the committed file is stale — use this in CI
```

The file is committed at the repo root and published in the package:

```
tendril-wireframes/manifest.yaml    dist/tendril.manifest.yaml
tendril-wireframes/manifest.json    dist/tendril.manifest.json   (same data, if YAML is inconvenient)
```

## Where the data comes from

**Props are read from the TypeScript types**, through the compiler's own checker — names,
types, optionality, enum members and inherited props all come from the code, so they
cannot drift from it. Adding a prop to an interface adds it to the manifest; there is
nothing to keep in sync by hand.

**Prose comes from JSDoc in the component files.** A type cannot say which category a
component belongs to or what a good example looks like, so that part is authored.

## Writing metadata in a widget file

Put tags in the component's doc comment. Everything is optional — a component with no
tags still appears, with its category inferred from its folder and its Ivy mapping picked
up from the `Mirrors \`Ivy.X\`` sentence the components already carry.

```tsx
/**
 * The workhorse control. Mirrors `Ivy.Button`, including its variant list,
 * icon placement, badge and shortcut hint.
 *
 * @tags action submit cta
 * @example <Button title="Save" icon="Save" onClick={save} />
 * @example <Button title="Delete" variant="Destructive" icon="Trash2" />
 */
export const Button = ({ ... }: ButtonProps) => { ... };
```

| Tag | Effect |
| --- | --- |
| *(first paragraph)* | Becomes `description`. |
| `@ivy Ivy.Button` | The Ivy widget this mirrors. Inferred from `Mirrors \`Ivy.X\`` when absent. |
| `@category Widgets` | Overrides the category inferred from the folder. |
| `@tags a b c` | Free-text keywords for search. Whitespace or comma separated. |
| `@example <Button … />` | One usage snippet. Repeat the tag for more than one. |
| `@slot header Rendered above the title` | Names a `ReactNode` prop that acts as a slot, with an optional description. |
| `@status beta` | Free-text lifecycle marker. |
| `@internal` | Marks an exported building block that is not part of the Ivy widget surface. It still appears, flagged `internal: true`, so generators can filter it out. |

Prop descriptions come from the JSDoc on the interface member:

```tsx
export interface ButtonProps extends WidgetBaseProps {
  /** Keyboard shortcut shown on the right, e.g. `"Ctrl+S"`. */
  shortcutKey?: string;
}
```

## Shape of the file

```yaml
name: "tendril-wireframes"
version: 0.1.0
componentCount: 98
categories:
  Charts: 13
  Foundations: 5
  Inputs: 23
  Primitives: 25
  Widgets: 39

# Every named type a prop refers to, described once. A prop that says `Sizing` or
# `Option` is useless on its own -- this is where a consumer finds out what it means.
# Types from React and the chart libraries are left out; they are not ours to document.
#
#   kind: enum    values
#   kind: object  properties (name, type, required, description)
#   kind: map     keyType, valueType, for an index signature
#   kind: alias   type, what it expands to
types:
  ButtonVariant:
    kind: enum
    values: [Primary, Secondary, Destructive, Outline, Ghost, Link, Inline, Ai]
  Sizing:
    kind: alias
    type: number | string
    description: >-
      A number is a Tailwind spacing unit, not pixels: the value is multiplied by 4px,
      so `width={64}` is 256px. Pass a string for an exact size: `width="150px"`.
  Option:
    kind: object
    description: A choice in a `SelectInput`, `RadioInput` or any other list of options.
    properties:
      - name: value
        type: string | number
        required: true
      - name: label
        type: string
        required: false

components:
  - name: Button
    category: Widgets
    file: src/widgets/Button.tsx
    ivy: Ivy.Button
    description: The workhorse control. …
    tags: [action, submit, cta]
    examples:
      - <Button title="Save" icon="Save" onClick={save} />
    props:
      - name: variant
        type: ButtonVariant
        required: false
        values: [Primary, Secondary, Destructive, Outline, Ghost, Link, Inline, Ai]
        default: Primary
      - name: onClick
        type: React.MouseEventHandler<HTMLElement>
        required: false
        kind: event
      - name: density
        type: Densities
        required: false
        values: [Small, Medium, Large]
        default: Medium
        inherited: WidgetBaseProps
```

Per-prop fields:

| Field | Meaning |
| --- | --- |
| `name`, `type` | As declared. `type` is the resolved TypeScript type, with import paths stripped. |
| `required` | `false` when the prop is optional. Required props are listed first. |
| `values` | Present when the type is a union of literals, in the order they were written. This is what a generator needs to offer valid choices. |
| `default` | The value from the component's destructuring default, when there is a literal one. |
| `kind` | `event` for `on*` callbacks — what Ivy models as `events`. `slot` for `ReactNode` props. |
| `inherited` | The interface the prop came from, e.g. `WidgetBaseProps`, so shared base props can be grouped or skipped. |

`className`, `style`, `children`, `key` and `ref` are omitted as React plumbing.

## Reading it from C#

The file is plain YAML with no anchors or aliases, so any parser handles it:

```csharp
var manifest = new DeserializerBuilder()
    .WithNamingConvention(CamelCaseNamingConvention.Instance)
    .IgnoreUnmatchedProperties()
    .Build()
    .Deserialize<TendrilManifest>(File.ReadAllText("tendril.manifest.yaml"));

var widgets = manifest.Components.Where(c => !c.Internal);
var buttonVariants = manifest.Types["ButtonVariant"];
```

If YAML is awkward, `dist/tendril.manifest.json` carries exactly the same data.
