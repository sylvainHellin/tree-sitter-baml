; ============================================================================
; Indentation rules for BAML
; ============================================================================

; Indent on opening braces of declarations and blocks
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
  (if_statement)
  (else_clause)
  (for_in_loop)
  (for_c_loop)
  (while_statement)
  (template_string_declaration)
] @indent

; Outdent on closing braces
[
  "}"
] @outdent
