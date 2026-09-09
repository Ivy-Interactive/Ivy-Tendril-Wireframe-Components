/**
 * Emits a machine-readable description of every exported component and its
 * props, for consumers that generate Tendril markup from outside JavaScript —
 * an Ivy C# app, a codegen step, an LLM tool schema.
 *
 * Prop names, types, enum members and optionality come from the TypeScript
 * checker, so they cannot drift from the code. Everything a type cannot express
 * — the category a component belongs to, the Ivy widget it mirrors, an example —
 * comes from JSDoc tags on the component itself. See MANIFEST.md for the tag
 * vocabulary.
 */
import ts from "typescript";
import { stringify } from "yaml";
import { createRequire } from "node:module";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = createRequire(import.meta.url)("../package.json");

/** Categories inferred from where a component lives, when it has no @category. */
const CATEGORY_BY_PATH = [
  [/src\/widgets\/primitives\//, "Primitives"],
  [/src\/widgets\/inputs\//, "Inputs"],
  [/src\/widgets\/charts\//, "Charts"],
  [/src\/widgets\/layouts\//, "Layouts"],
  [/src\/sketch\//, "Foundations"],
  [/src\/widgets\//, "Widgets"],
];

/** Props that exist for React's sake rather than the component's. */
const PLUMBING = new Set(["className", "style", "children", "key", "ref"]);

function tagText(tag) {
  if (typeof tag.comment === "string") return tag.comment.trim();
  if (Array.isArray(tag.comment)) return tag.comment.map((part) => part.text).join("").trim();
  return "";
}

/** Reads the JSDoc tags authored on a component declaration. */
function readTags(symbol) {
  const tags = {};
  for (const tag of symbol.getJsDocTags() ?? []) {
    const name = tag.name;
    const text =
      typeof tag.text === "string"
        ? tag.text
        : (tag.text ?? []).map((part) => part.text).join("").trim();
    if (name === "example" || name === "slot" || name === "see") {
      (tags[name] ??= []).push(text);
    } else {
      tags[name] = text;
    }
  }
  return tags;
}

/** `Mirrors \`Ivy.Button\`.` in a doc comment is as good as an explicit @ivy tag. */
function inferIvyWidget(description) {
  return /Mirrors `?(Ivy\.[A-Za-z]+)`?/.exec(description ?? "")?.[1];
}

/**
 * The checker qualifies types with the absolute path of the file they came
 * from, which is noise in a published artefact.
 */
function cleanType(text) {
  return text
    .replace(/import\("[^"]*"\)\./g, "")
    .replace(/ \| undefined$/, "")
    .trim();
}

function categoryFor(filePath, tags) {
  if (tags.category) return tags.category;
  const posix = filePath.replace(/\\/g, "/");
  return CATEGORY_BY_PATH.find(([pattern]) => pattern.test(posix))?.[1] ?? "Other";
}

/**
 * The checker returns union members in its own order, but a generator building a
 * dropdown wants them the way they were written — Primary before Ghost.
 */
function sourceOrderedValues(type) {
  const declaration = type.aliasSymbol?.declarations?.[0] ?? type.getSymbol()?.declarations?.[0];
  if (!declaration || !ts.isTypeAliasDeclaration(declaration)) return undefined;
  if (!ts.isUnionTypeNode(declaration.type)) return undefined;
  const values = [];
  for (const member of declaration.type.types) {
    if (!ts.isLiteralTypeNode(member)) return undefined;
    const literal = member.literal;
    if (ts.isStringLiteral(literal)) values.push(literal.text);
    else if (ts.isNumericLiteral(literal)) values.push(Number(literal.text));
    else return undefined;
  }
  return values.length ? values : undefined;
}

/**
 * Unions of string literals are the most useful thing a manifest can carry: they
 * tell a generator exactly which values a prop accepts.
 */
function literalValues(type, checker) {
  const parts = type.isUnion() ? type.types : [type];
  const values = [];
  for (const part of parts) {
    if (part.isStringLiteral()) values.push(part.value);
    else if (part.isNumberLiteral()) values.push(part.value);
    else if (part.flags & ts.TypeFlags.BooleanLiteral) continue;
    else if (part.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)) continue;
    else return undefined; // a non-literal member means this is not an enum
  }
  return values.length ? values : undefined;
}

/** Finds the `({ a = 1, b })` destructure so defaults can be reported. */
function readDefaults(declaration) {
  const defaults = {};
  let pattern;
  const visit = (node) => {
    if (pattern) return;
    if (ts.isObjectBindingPattern(node)) {
      pattern = node;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(declaration);
  if (!pattern) return defaults;
  for (const element of pattern.elements) {
    if (!element.initializer || !ts.isIdentifier(element.name)) continue;
    const text = element.initializer.getText();
    if (text.length > 60) continue; // an expression, not a literal default
    defaults[element.name.text] = text.replace(/^["'`]|["'`]$/g, "");
  }
  return defaults;
}

/** Where a prop was declared, so consumers can group the shared base props. */
function declaringInterface(propSymbol) {
  const declaration = propSymbol.declarations?.[0];
  const parent = declaration?.parent;
  return parent && ts.isInterfaceDeclaration(parent) ? parent.name.text : undefined;
}

const configPath = ts.findConfigFile(root, ts.sys.fileExists, "tsconfig.app.json");
const parsed = ts.parseJsonConfigFileContent(
  ts.readConfigFile(configPath, ts.sys.readFile).config,
  ts.sys,
  root,
);
const program = ts.createProgram(parsed.fileNames, { ...parsed.options, noEmit: true });
const checker = program.getTypeChecker();

const entry = program.getSourceFile(resolve(root, "src/index.ts"));
if (!entry) throw new Error("src/index.ts is not part of the program");

const entrySymbol = checker.getSymbolAtLocation(entry);
const exports = checker.getExportsOfModule(entrySymbol);

const components = [];
const sharedTypes = {};

for (const exported of exports) {
  const symbol =
    exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
  const declaration = symbol.declarations?.[0];
  if (!declaration) continue;

  const filePath = relative(root, declaration.getSourceFile().fileName);
  if (!/^src\/(widgets|sketch)\//.test(filePath.replace(/\\/g, "/"))) continue;
  if (!/^[A-Z]/.test(exported.name)) continue;

  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signature = type.getCallSignatures()[0];
  if (!signature) continue; // a type or constant, not a component

  const parameter = signature.getParameters()[0];
  if (!parameter) continue;
  const propsType = checker.getTypeOfSymbolAtLocation(parameter, declaration);
  const propSymbols = checker.getPropertiesOfType(propsType);
  if (!propSymbols.length) continue;

  const description = ts.displayPartsToString(symbol.getDocumentationComment(checker)).trim();
  const tags = readTags(symbol);
  const defaults = readDefaults(declaration);

  const props = [];
  for (const propSymbol of propSymbols) {
    const name = propSymbol.name;
    if (PLUMBING.has(name)) continue;

    const propType = checker.getTypeOfSymbolAtLocation(propSymbol, declaration);
    const bare = checker.getNonNullableType(propType);
    const typeText = cleanType(
      checker.typeToString(propType, declaration, ts.TypeFormatFlags.NoTruncation),
    );

    const entryProp = {
      name,
      type: typeText,
      required: !(propSymbol.flags & ts.SymbolFlags.Optional),
    };

    // Callbacks are what Ivy models as `events`, so they are worth marking.
    if (/^on[A-Z]/.test(name) && bare.getCallSignatures().length) entryProp.kind = "event";
    else if (/\bReactNode\b/.test(typeText)) entryProp.kind = "slot";

    const values = sourceOrderedValues(bare) ?? literalValues(bare, checker);
    if (values) {
      entryProp.values = values;
      // Remember named unions once, so components can reference them.
      const named = /^[A-Z][A-Za-z]*$/.test(typeText) ? typeText : undefined;
      if (named) sharedTypes[named] = values;
    }

    // A destructuring default is the most direct evidence; failing that, a
    // `@default` tag on the prop declaration states one for the components
    // that only inherit it and never destructure it themselves.
    if (defaults[name] !== undefined) entryProp.default = defaults[name];
    else {
      const declared = propSymbol
        .getJsDocTags(checker)
        .find((tag) => tag.name === "default");
      if (declared) {
        const text = ts.displayPartsToString(declared.text ?? []).trim();
        if (text) entryProp.default = text.replace(/^["'`]|["'`]$/g, "");
      }
    }

    const propDoc = ts.displayPartsToString(propSymbol.getDocumentationComment(checker)).trim();
    if (propDoc) entryProp.description = propDoc;

    const from = declaringInterface(propSymbol);
    if (from && !from.startsWith(exported.name)) entryProp.inherited = from;

    props.push(entryProp);
  }

  props.sort((a, b) => {
    if (a.required !== b.required) return a.required ? -1 : 1;
    if (Boolean(a.inherited) !== Boolean(b.inherited)) return a.inherited ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const component = {
    name: exported.name,
    category: categoryFor(filePath, tags),
    file: filePath.replace(/\\/g, "/"),
  };
  const ivy = tags.ivy ?? inferIvyWidget(description);
  if (ivy) component.ivy = ivy;
  // Exported building blocks are usable but are not part of the Ivy widget
  // surface; a generator should skip them.
  if ("internal" in tags) component.internal = true;
  if (tags.status) component.status = tags.status;
  if (description) component.description = description;
  if (tags.tags) component.tags = tags.tags.split(/[,\s]+/).filter(Boolean);
  if (tags.slot) component.slots = tags.slot.map((line) => {
    const [slotName, ...rest] = line.split(/\s+/);
    return rest.length ? { name: slotName, description: rest.join(" ") } : { name: slotName };
  });
  if (tags.example) component.examples = tags.example;
  component.props = props;

  components.push(component);
}

components.sort(
  (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
);

const byCategory = {};
for (const component of components) {
  byCategory[component.category] = (byCategory[component.category] ?? 0) + 1;
}

const manifest = {
  name: pkg.name,
  version: pkg.version,
  generated:
    "Do not edit. Run `npm run manifest` — props come from the TypeScript types, " +
    "prose from JSDoc tags in the component files.",
  componentCount: components.filter((c) => !c.internal).length,
  categories: byCategory,
  types: Object.fromEntries(Object.entries(sharedTypes).sort(([a], [b]) => a.localeCompare(b))),
  components,
};

// Anchors would make the file smaller but harder for a plain parser to read.
const yaml = stringify(manifest, { lineWidth: 100, aliasDuplicateObjects: false });
const manifestPath = resolve(root, "tendril.manifest.yaml");

if (process.argv.includes("--check")) {
  const current = existsSync(manifestPath) ? readFileSync(manifestPath, "utf8") : "";
  if (current !== yaml) {
    console.error("tendril.manifest.yaml is out of date — run `npm run manifest`.");
    process.exit(1);
  }
  console.log("manifest: up to date");
  process.exit(0);
}

mkdirSync(resolve(root, "dist"), { recursive: true });
writeFileSync(manifestPath, yaml);
writeFileSync(resolve(root, "dist/tendril.manifest.yaml"), yaml);
writeFileSync(
  resolve(root, "dist/tendril.manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const undocumented = components.filter((c) => !c.description).map((c) => c.name);
const publicCount = components.filter((c) => !c.internal).length;
console.log(
  `manifest: ${publicCount} components (+${components.length - publicCount} internal), ${
    components.reduce((sum, c) => sum + c.props.length, 0)
  } props, ${Object.keys(sharedTypes).length} shared enums`,
);
if (undocumented.length) console.log(`  no description: ${undocumented.join(", ")}`);
