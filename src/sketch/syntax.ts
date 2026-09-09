/**
 * A small syntax highlighter, so `CodeBlock` and `CodeInput` colour the same
 * code the same way.
 *
 * It is deliberately not a full parser and not a dependency: a wireframe needs
 * code to *read* as code — keywords, strings, numbers and comments telling
 * themselves apart at a glance — not to be semantically correct about generics.
 * A handful of token classes over a C-family scan covers every language the
 * library is likely to be shown with, and degrades to plain text for the rest.
 */

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "function"
  | "punctuation";

export interface Token {
  text: string;
  kind: TokenKind;
}

/** Words that read as structure rather than as names, by language family. */
const COMMON = [
  "as", "async", "await", "break", "case", "catch", "class", "const", "continue",
  "default", "delete", "do", "else", "enum", "export", "extends", "false",
  "finally", "for", "from", "function", "if", "implements", "import", "in",
  "instanceof", "interface", "let", "new", "null", "of", "package", "private",
  "protected", "public", "return", "static", "super", "switch", "this", "throw",
  "true", "try", "type", "typeof", "undefined", "var", "void", "while", "yield",
];

const BY_LANGUAGE: Record<string, string[]> = {
  sql: [
    "select", "from", "where", "join", "left", "right", "inner", "outer", "on",
    "group", "order", "by", "having", "insert", "into", "values", "update",
    "set", "delete", "create", "table", "alter", "drop", "index", "view", "as",
    "and", "or", "not", "null", "distinct", "limit", "offset", "union", "all",
    "primary", "key", "foreign", "references", "default", "case", "when",
    "then", "else", "end",
  ],
  python: [
    "and", "as", "assert", "async", "await", "break", "class", "continue",
    "def", "del", "elif", "else", "except", "False", "finally", "for", "from",
    "global", "if", "import", "in", "is", "lambda", "None", "nonlocal", "not",
    "or", "pass", "raise", "return", "True", "try", "while", "with", "yield",
  ],
  csharp: [
    ...COMMON, "bool", "byte", "decimal", "double", "float", "int", "long",
    "namespace", "object", "override", "params", "readonly", "record", "ref",
    "sealed", "string", "struct", "using", "virtual", "where",
  ],
  json: ["true", "false", "null"],
  css: ["important", "and", "not", "only", "from", "to"],
};

/** Languages whose comments start with `#`, and SQL's `--`. */
const HASH_COMMENTS = new Set(["python", "py", "sh", "bash", "shell", "yaml", "yml", "ruby", "rb"]);

function normalise(language?: string) {
  const key = (language ?? "").toLowerCase();
  const aliases: Record<string, string> = {
    ts: "typescript", tsx: "typescript", js: "javascript", jsx: "javascript",
    py: "python", cs: "csharp", "c#": "csharp", yml: "yaml", sh: "shell", bash: "shell",
  };
  return aliases[key] ?? key;
}

function keywordsFor(language: string): Set<string> {
  return new Set(BY_LANGUAGE[language] ?? COMMON);
}

/**
 * One pass, longest-match-first. Order matters: a `//` inside a string must be
 * claimed by the string rule, so strings and comments come before everything.
 */
function scanner(language: string) {
  const lineComment = language === "sql" ? "--" : HASH_COMMENTS.has(language) ? "#" : "//";
  const escaped = lineComment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    [
      `${escaped}[^\\n]*`, // line comment
      "/\\*[\\s\\S]*?(?:\\*/|$)", // block comment
      '"(?:\\\\.|[^"\\\\])*"?', // double-quoted string
      "'(?:\\\\.|[^'\\\\])*'?", // single-quoted string
      "`(?:\\\\.|[^`\\\\])*`?", // template string
      "\\b\\d[\\d_]*(?:\\.\\d+)?(?:e[+-]?\\d+)?\\b", // number
      "[A-Za-z_$][\\w$]*", // identifier
      "[^\\sA-Za-z_$\\d]", // punctuation
    ].join("|"),
    "gi",
  );
}

/**
 * Splits `code` into one token array per line. Tokens never span a newline, so
 * a multi-line comment or template string comes back as one token per line and
 * both renderers can lay code out line by line.
 */
export function tokenize(code: string, language?: string): Token[][] {
  const lang = normalise(language);
  const keywords = keywordsFor(lang);
  const pattern = scanner(lang);
  const isComment = lang === "sql" ? /^--/ : HASH_COMMENTS.has(lang) ? /^#/ : /^\/\//;

  const flat: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  const push = (text: string, kind: TokenKind) => {
    if (text) flat.push({ text, kind });
  };

  while ((match = pattern.exec(code))) {
    if (match.index > last) push(code.slice(last, match.index), "plain");
    const text = match[0];
    const head = text[0];

    let kind: TokenKind = "plain";
    if (isComment.test(text) || text.startsWith("/*")) kind = "comment";
    else if (head === '"' || head === "'" || head === "`") kind = "string";
    else if (/\d/.test(head)) kind = "number";
    else if (/[A-Za-z_$]/.test(head)) {
      // A name immediately before `(` is being called, whatever it is called.
      const after = code.slice(match.index + text.length);
      if (keywords.has(text) || keywords.has(text.toLowerCase())) kind = "keyword";
      else if (/^\s*\(/.test(after)) kind = "function";
    } else kind = "punctuation";

    push(text, kind);
    last = match.index + text.length;
  }
  push(code.slice(last), "plain");

  // Break tokens on newlines so each line can be rendered on its own row.
  const lines: Token[][] = [[]];
  for (const token of flat) {
    const parts = token.text.split("\n");
    parts.forEach((part, index) => {
      if (index > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, kind: token.kind });
    });
  }
  return lines;
}

/**
 * Token colours, in the same desaturated pencil range as the rest of the
 * palette — enough hue to tell a string from a keyword, not enough to look like
 * an IDE theme dropped into a wireframe.
 */
export const CODE_COLORS: Record<TokenKind, string> = {
  plain: "#2f2f2f",
  comment: "#9a9a92",
  string: "#4f7d4a",
  number: "#b0663f",
  keyword: "#3f6fa8",
  function: "#6f579e",
  punctuation: "#8b8b8b",
};
