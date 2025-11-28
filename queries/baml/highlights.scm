; ============================================================================
; Keywords
; ============================================================================

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

; ============================================================================
; Types
; ============================================================================

; Primitive types
(primitive_type) @type.builtin

; Custom types (user-defined types)
(custom_type (identifier) @type)

; Type definitions in declarations
(enum_declaration name: (identifier) @type.enum)
(class_declaration name: (identifier) @type)
(type_alias name: (identifier) @type)

; Map type keyword
(map_type "map" @type.builtin)

; ============================================================================
; Functions and Methods
; ============================================================================

; Function declarations
(function_declaration name: (identifier) @function)

; Template string declarations (treated like functions)
(template_string_declaration name: (identifier) @function)

; Function calls/applications
(function_application function: (identifier) @function)

; Method calls
(method_call method: (identifier) @function.method)

; ============================================================================
; Variables and Parameters
; ============================================================================

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

; ============================================================================
; Literals
; ============================================================================

; Strings
(string_literal) @string
(block_string) @string

; Numbers
(number_literal) @constant.numeric

; Booleans
(boolean_literal) @constant.builtin.boolean

; Null
(null_literal) @constant.builtin

; ============================================================================
; Comments
; ============================================================================

; Line comments
(line_comment) @comment.line

; Documentation comments
(doc_comment) @comment.block.documentation

; Block comments
(block_comment) @comment.block

; ============================================================================
; Operators
; ============================================================================

; Arithmetic operators
[
  "+"
  "-"
  "*"
  "/"
  "%"
] @operator

; Comparison operators
[
  "=="
  "!="
  "<"
  ">"
  "<="
  ">="
] @operator

; Logical operators
[
  "&&"
  "||"
] @operator

; Assignment operators
[
  "="
  "+="
  "-="
  "*="
  "/="
] @operator

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
] @operator

; Arrow
"->" @operator

; ============================================================================
; Attributes
; ============================================================================

; Attribute markers
[
  "@"
  "@@"
] @attribute

; Attribute names
(block_attribute name: (identifier) @attribute)

; ============================================================================
; Special Properties
; ============================================================================

; Client property
(client_property "client" @keyword.special)
(client_property name: (identifier) @constant)

; Prompt property
(prompt_property "prompt" @keyword.special)

; Config block types
(config_block type: _ @keyword.special)
(config_block name: (identifier) @constant)

; ============================================================================
; Markdown Headers (in function bodies)
; ============================================================================

(markdown_header) @markup.heading

; ============================================================================
; Punctuation
; ============================================================================

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
