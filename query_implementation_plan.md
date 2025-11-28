# Tree-sitter BAML Query Implementation Plan

This document outlines the plan for implementing tree-sitter queries for the BAML grammar to enable proper syntax highlighting in editors like Helix.

## Directory Structure

Create the following directory structure:

```
queries/
├── baml/
│   ├── highlights.scm
│   ├── injections.scm (optional - for embedded languages)
│   ├── indents.scm (optional - for auto-indentation)
│   └── textobjects.scm (optional - for text object selection)
```

## 1. Highlights Query (`queries/baml/highlights.scm`)

### Keywords

```scheme
; Declaration keywords
[
  "enum"
  "class"
  "override"
  "function"
  "template_string"
  "type"
  "client"
  "generator"
  "retry_policy"
  "printer"
  "test"
  "type_builder"
] @keyword

; Control flow keywords
[
  "if"
  "else"
  "for"
  "while"
  "in"
] @keyword.control

; Variable declaration
"let" @keyword.storage
```

### Types

```scheme
; Primitive types
(primitive_type) @type.builtin

; Custom types (class names, enum names)
(custom_type (identifier) @type)

; Type definitions in declarations
(enum_declaration name: (identifier) @type.enum)
(class_declaration name: (identifier) @type)
(type_alias name: (identifier) @type)

; Map type keyword
(map_type "map" @type.builtin)
```

### Functions and Methods

```scheme
; Function declarations
(function_declaration name: (identifier) @function)

; Function calls/applications
(function_application function: (identifier) @function)

; Method calls
(method_call method: (identifier) @function.method)

; Template string declarations
(template_string_declaration name: (identifier) @function)
```

### Variables and Parameters

```scheme
; Function parameters
(parameter name: (identifier) @variable.parameter)

; Let declarations
(let_declaration name: (identifier) @variable)

; Assignment targets
(assignment_statement target: (identifier) @variable)

; For loop variables
(for_in_loop variable: (identifier) @variable)
(for_let_init name: (identifier) @variable)

; Object fields
(object_field name: (identifier) @variable.other.member)

; Class properties
(class_property name: (identifier) @variable.other.member)

; Generic identifiers (fallback)
(identifier) @variable
```

### Literals

```scheme
; Strings
(string_literal) @string
(block_string) @string

; Numbers
(number_literal) @constant.numeric

; Booleans
(boolean_literal) @constant.builtin.boolean

; Null
(null_literal) @constant.builtin
```

### Comments

```scheme
; Line comments
(line_comment) @comment.line

; Documentation comments
(doc_comment) @comment.block.documentation

; Block comments
(block_comment) @comment.block
```

### Operators

```scheme
; Arithmetic operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
] @operator.arithmetic

; Comparison operators
[
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
] @operator.comparison

; Logical operators
[
  "&&"
  "||"
] @operator.logical

; Assignment operators
[
  "="
  "+="
  "-="
  "*="
  "/="
] @operator.assignment

; Increment/decrement
[
  "++"
  "--"
] @operator

; Type operators
[
  "?"
  "|"
  "[]"
] @operator.type

; Arrow
"->" @operator
```

### Attributes

```scheme
; Attribute markers
(block_attribute "@" @attribute)
(block_attribute "@@" @attribute)

; Attribute names
(block_attribute name: (identifier) @attribute)
```

### Punctuation

```scheme
; Brackets
["(" ")"] @punctuation.bracket
["{" "}"] @punctuation.bracket
["[" "]"] @punctuation.bracket
["<" ">"] @punctuation.bracket

; Delimiters
"," @punctuation.delimiter
";" @punctuation.delimiter
":" @punctuation.delimiter
"." @punctuation.delimiter
```

### Special Properties

```scheme
; Client property
(client_property "client" @keyword.special)
(client_property name: (identifier) @constant)

; Prompt property
(prompt_property "prompt" @keyword.special)

; Config block types
(config_block type: _ @keyword.special)
(config_block name: (identifier) @constant)
```

### Markdown Headers (in function bodies)

```scheme
(markdown_header) @markup.heading
```

## 2. Injections Query (`queries/baml/injections.scm`)

This will enable syntax highlighting for embedded languages (Jinja, Python, TypeScript) within BAML.

```scheme
; Note: This requires extending the grammar to properly mark embedded content
; For now, this is a placeholder for future implementation

; Jinja templates in block strings (prompt content)
; ((block_string) @injection.content
;  (#set! injection.language "jinja"))

; Python code blocks
; ((language_block_python) @injection.content
;  (#set! injection.language "python"))

; TypeScript code blocks
; ((language_block_ts) @injection.content
;  (#set! injection.language "typescript"))
```

**Note**: The current grammar doesn't have specific nodes for embedded languages. To implement injections properly, the grammar would need to be extended with:
- `language_block_python`
- `language_block_ts`
- `language_block_jinja`

See the tmLanguage files for reference on how these were handled.

## 3. Indents Query (`queries/baml/indents.scm`)

For auto-indentation support:

```scheme
; Indent on opening braces
[
  (enum_declaration)
  (class_declaration)
  (function_declaration)
  (function_body)
  (config_block)
  (type_builder)
  (block)
  (nested_object)
  (object_construction)
] @indent

; Outdent on closing braces
[
  "}"
] @outdent
```

## 4. Text Objects Query (`queries/baml/textobjects.scm`)

For vim-style text object selection (optional):

```scheme
; Functions
(function_declaration) @function.around
(function_body) @function.inside

; Classes
(class_declaration) @class.around

; Parameters
(parameter) @parameter.inside

; Comments
[
  (line_comment)
  (doc_comment)
  (block_comment)
] @comment.around
```

## Implementation Steps

1. **Create directory structure**:
   ```bash
   mkdir -p queries/baml
   ```

2. **Implement highlights.scm** (highest priority):
   - Start with basic keywords, types, and comments
   - Add operators and punctuation
   - Test with various BAML files
   - Refine based on visual results

3. **Test in Helix**:
   ```bash
   hx --grammar build
   hx test.baml
   ```

4. **Implement indents.scm** (medium priority):
   - Define indent/outdent rules
   - Test with auto-formatting

5. **Consider injections.scm** (future work):
   - May require grammar updates to properly capture embedded language blocks
   - Refer to `baml.tmlanguage.json` lines 936-1004 for Jinja/Python/TypeScript block patterns

6. **Optional: Add textobjects.scm**:
   - Useful for vim-style text manipulation
   - Low priority

## Testing

Create diverse BAML test files covering:
- Enum declarations
- Class declarations with various property types
- Function declarations with complex type signatures
- Template strings
- Control flow statements
- Nested structures
- Comments (all three types)
- Attributes
- Config blocks

## Reference Files

- Grammar: `grammar.js`
- Original tmLanguage: `baml.tmlanguage.json`
- Jinja tmLanguage: `jinja.tmlanguage.json`
- Test file: `test.baml`

## Future Enhancements

1. **Embedded Language Support**:
   - Update grammar to capture Jinja template blocks
   - Update grammar to capture Python code blocks (`python#"..."#`)
   - Update grammar to capture TypeScript code blocks (`typescript#"..."#`)
   - Implement proper injection queries

2. **Semantic Highlighting**:
   - Could add `locals.scm` for scope-aware highlighting
   - Track variable definitions and references

3. **Additional Queries**:
   - `folds.scm` for code folding
   - `tags.scm` for symbol indexing (LSP-like features)

## Notes

- The tree-sitter highlighting system is more structured than tmLanguage regex-based matching
- Some tmLanguage patterns may need to be simplified or omitted if they don't map cleanly to the tree structure
- Helix uses different capture names than some other editors (e.g., Neovim), so consult Helix's theme documentation for available capture groups
- Test with different Helix themes to ensure consistent highlighting
