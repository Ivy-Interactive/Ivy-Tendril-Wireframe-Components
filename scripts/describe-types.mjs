/**
 * Describes the named types the props refer to.
 *
 * A prop typed `Sizing` or `Thickness` told a consumer nothing: the manifest listed the
 * name and never said what it was. An agent reading it guessed that `width={150}` meant
 * 150px -- it is 150 quarter-rem steps, so 600px -- and nothing errored, it just rendered
 * four times too big. Object shapes (`Option`, `MenuItem`, `ChartData`) were the same: only
 * inferable from whichever example happened to use one.
 *
 * So every type declared in this library and reachable from a prop is described here:
 * unions by their members, aliases by what they expand to, objects by their properties,
 * each carrying its own JSDoc. Types from React and from chart libraries are left out --
 * they arrive by the hundred from spread DOM props and are not ours to document.
 */
import ts from "typescript";

/** Identifiers in a type expression, e.g. "Sizing | Thickness" -> [Sizing, Thickness]. */
function referencedNames(text) {
  return new Set(text.match(/\b[A-Z][A-Za-z0-9_]*\b/g) ?? []);
}

function isOurs(declaration, root) {
  const file = declaration.getSourceFile().fileName.replace(/\\/g, "/");
  return file.startsWith(root.replace(/\\/g, "/") + "/src/") && !file.includes("/node_modules/");
}

function docOf(symbol, checker, prose) {
  return prose(ts.displayPartsToString(symbol.getDocumentationComment(checker))) || undefined;
}

/**
 * Collects declarations by name once, so a lookup does not walk the program for each. Only
 * exported aliases and interfaces: a local helper type is not something a consumer can name.
 */
function declarationIndex(program, root) {
  const index = new Map();

  for (const file of program.getSourceFiles()) {
    if (file.isDeclarationFile) continue;
    if (!file.fileName.replace(/\\/g, "/").startsWith(root.replace(/\\/g, "/") + "/src/")) continue;

    ts.forEachChild(file, (node) => {
      if (!ts.isTypeAliasDeclaration(node) && !ts.isInterfaceDeclaration(node)) return;
      if (!index.has(node.name.text)) index.set(node.name.text, node);
    });
  }

  return index;
}

/**
 * @param seeds type expressions from every prop, as written in the manifest
 * @returns { [name]: { kind, ... } } for each library type reachable from them
 */
export function describeTypes({ program, checker, root, seeds, enums, prose, cleanType }) {
  const index = declarationIndex(program, root);
  const described = {};

  const queue = [];
  for (const seed of seeds) for (const name of referencedNames(seed)) queue.push(name);

  while (queue.length) {
    const name = queue.shift();
    if (described[name] || !index.has(name)) continue;

    const declaration = index.get(name);
    if (!isOurs(declaration, root)) continue;

    const symbol = checker.getSymbolAtLocation(declaration.name);
    const description = symbol ? docOf(symbol, checker, prose) : undefined;

    // A union of literals is already in `enums`, collected in source order from the props
    // that use it. Reuse it rather than resolving the type a second time.
    if (enums[name]) {
      described[name] = { kind: "enum", values: enums[name] };
      if (description) described[name].description = description;
      continue;
    }

    const members = ts.isInterfaceDeclaration(declaration)
      ? declaration.members
      : ts.isTypeLiteralNode(declaration.type)
        ? declaration.type.members
        : null;

    if (members) {
      const properties = [];
      for (const member of members) {
        // `{ [key: string]: string | number }` -- ChartData is nothing but this, and
        // reporting it as an object with no properties says the opposite of the truth.
        if (ts.isIndexSignatureDeclaration(member)) {
          const keyType = cleanType(member.parameters[0]?.type?.getText() ?? "string");
          const valueType = cleanType(member.type ? member.type.getText() : "unknown");
          described[name] = {
            kind: "map",
            keyType,
            valueType,
          };
          if (description) described[name].description = description;
          for (const referenced of referencedNames(valueType)) queue.push(referenced);
          continue;
        }

        if (!ts.isPropertySignature(member) || !member.name) continue;

        const propertyName = member.name.getText();
        const typeText = cleanType(member.type ? member.type.getText() : "unknown");
        const entry = { name: propertyName, type: typeText, required: !member.questionToken };

        const memberSymbol = checker.getSymbolAtLocation(member.name);
        const memberDoc = memberSymbol ? docOf(memberSymbol, checker, prose) : undefined;
        if (memberDoc) entry.description = memberDoc;

        properties.push(entry);
        for (const referenced of referencedNames(typeText)) queue.push(referenced);
      }

      if (described[name]?.kind === "map") continue;

      described[name] = { kind: "object", properties };
      if (description) described[name].description = description;
      continue;
    }

    // Everything else -- `number | string`, a function type, a mapped type -- is reported
    // as what it expands to. That is the whole answer for an alias like Sizing.
    const expanded = cleanType(declaration.type ? declaration.type.getText() : "unknown");
    described[name] = { kind: "alias", type: expanded };
    if (description) described[name].description = description;
    for (const referenced of referencedNames(expanded)) queue.push(referenced);
  }

  return described;
}
