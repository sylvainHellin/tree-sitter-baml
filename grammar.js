/**
 * @file Grammar for syntax highlighting for the BAML language.
 * @author Sylvain Hellin <sylvain.hellin@tum.de>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "baml",

  extras: $ => [
    /\s/,
    $.line_comment,
    $.doc_comment,
    $.block_comment,
  ],

  conflicts: $ => [
    [$._expression, $.function_application],
  ],

  rules: {
    source_file: $ => repeat($._definition),

    _definition: $ => choice(
      $.enum_declaration,
      $.class_declaration,
      $.template_string_declaration,
      $.function_declaration,
      $.let_declaration,
      $.config_block,
      $.type_alias,
      $.type_builder,
    ),

    // Comments
    line_comment: $ => token(seq('//', /.*/)),

    doc_comment: $ => token(seq('///', /.*/)),

    block_comment: $ => token(seq(
      '{//',
      repeat(choice(
        /[^\/]/,
        /\/[^\/]/,
        /\/\/[^}]/,
      )),
      '//}',
    )),

    // Enum declaration
    enum_declaration: $ => seq(
      'enum',
      field('name', $.identifier),
      '{',
      repeat(choice(
        $.block_attribute,
        field('value', $.identifier),
      )),
      '}',
    ),

    // Class/Interface declaration
    class_declaration: $ => seq(
      choice('class', 'override'),
      field('name', $.identifier),
      '{',
      repeat(choice(
        $.class_property,
        $.block_attribute,
      )),
      '}',
    ),

    class_property: $ => seq(
      field('name', $.identifier),
      field('type', $.type_definition),
    ),

    // Template string declaration
    template_string_declaration: $ => seq(
      'template_string',
      field('name', $.identifier),
      optional($.function_parameters),
      field('body', $.template_string_body),
    ),

    template_string_body: $ => seq(
      field('start', alias(/#"+/, $.string_delimiter)),
      field('content', optional(alias(/[^"]*/, $.template_content))),
      field('end', alias(/"#+/, $.string_delimiter)),
    ),

    // Function declaration
    function_declaration: $ => seq(
      'function',
      field('name', $.identifier),
      field('parameters', $.function_parameters),
      optional(field('return_type', $.arrow_return_type)),
      field('body', $.function_body),
    ),

    function_parameters: $ => seq(
      '(',
      optional(seq(
        $.parameter,
        repeat(seq(',', $.parameter)),
        optional(','),
      )),
      ')',
    ),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $.type_definition),
    ),

    arrow_return_type: $ => seq(
      '->',
      $.type_definition,
    ),

    function_body: $ => seq(
      '{',
      repeat(choice(
        $.block_attribute,
        $.let_declaration,
        $.assignment_statement,
        $.for_in_loop,
        $.for_c_loop,
        $.if_statement,
        $.while_statement,
        $.client_property,
        $.prompt_property,
        $.markdown_header,
        $._expression,
      )),
      '}',
    ),

    client_property: $ => seq(
      'client',
      field('name', choice($.identifier, $.string_literal)),
    ),

    prompt_property: $ => seq(
      'prompt',
      field('content', $.block_string),
    ),

    // Let declaration
    let_declaration: $ => seq(
      'let',
      field('name', $.identifier),
      '=',
      field('value', $._expression),
      optional(';'),
    ),

    // Assignment statement
    assignment_statement: $ => seq(
      field('target', $.identifier),
      field('operator', choice('=', '+=', '-=', '*=', '/=')),
      field('value', $._expression),
      optional(';'),
    ),

    // Control flow
    for_in_loop: $ => seq(
      'for',
      '(',
      field('variable', $.identifier),
      'in',
      field('iterable', $._expression),
      ')',
      field('body', $.block),
    ),

    for_c_loop: $ => seq(
      'for',
      '(',
      field('init', choice($.for_let_init, $.for_assignment_init)),
      ';',
      field('condition', $._expression),
      ';',
      field('update', choice($.for_assignment_update, $.increment_expression)),
      ')',
      field('body', $.block),
    ),

    for_let_init: $ => seq(
      'let',
      field('name', $.identifier),
      '=',
      field('value', $._expression),
    ),

    for_assignment_init: $ => seq(
      field('target', $.identifier),
      field('operator', choice('=', '+=', '-=', '*=', '/=')),
      field('value', $._expression),
    ),

    for_assignment_update: $ => seq(
      field('target', $.identifier),
      field('operator', choice('=', '+=', '-=', '*=', '/=')),
      field('value', $._expression),
    ),

    increment_expression: $ => seq(
      $.identifier,
      choice('++', '--'),
    ),

    if_statement: $ => seq(
      'if',
      '(',
      field('condition', $._expression),
      ')',
      field('consequence', $.block),
      optional(field('alternative', $.else_clause)),
    ),

    else_clause: $ => seq(
      'else',
      choice(
        $.if_statement,
        $.block,
      ),
    ),

    while_statement: $ => seq(
      'while',
      '(',
      field('condition', $._expression),
      ')',
      field('body', $.block),
    ),

    block: $ => seq(
      '{',
      repeat(choice(
        $.let_declaration,
        $.assignment_statement,
        $.for_in_loop,
        $.for_c_loop,
        $.if_statement,
        $.while_statement,
        $.markdown_header,
        $._expression,
      )),
      '}',
    ),

    // Config blocks
    config_block: $ => seq(
      field('type', choice('client', 'generator', 'retry_policy', 'printer', 'test')),
      optional(seq('<', $.identifier, '>')),
      field('name', $.identifier),
      '{',
      repeat(choice(
        $.block_attribute,
        $.property_assignment,
        $.type_builder,
      )),
      '}',
    ),

    property_assignment: $ => seq(
      field('key', choice($.identifier, $.string_literal)),
      field('value', choice(
        $.string_literal,
        $.block_string,
        $.number_literal,
        $.boolean_literal,
        $.null_literal,
        $.array_literal,
        $.nested_object,
      )),
    ),

    nested_object: $ => seq(
      '{',
      repeat($.property_assignment),
      '}',
    ),

    // Type alias
    type_alias: $ => seq(
      'type',
      field('name', $.identifier),
      '=',
      field('type', $.type_definition),
    ),

    // Type builder
    type_builder: $ => seq(
      'type_builder',
      '{',
      repeat(choice(
        $.class_declaration,
        $.enum_declaration,
        $.type_alias,
      )),
      '}',
    ),

    // Type definitions
    type_definition: $ => choice(
      $.primitive_type,
      $.map_type,
      $.array_type,
      $.optional_type,
      $.union_type,
      $.grouped_type,
      $.custom_type,
    ),

    primitive_type: $ => choice(
      'bool',
      'int',
      'float',
      'string',
      'null',
      'image',
      'audio',
      'pdf',
    ),

    map_type: $ => seq(
      'map',
      '<',
      field('key', $.type_definition),
      ',',
      field('value', $.type_definition),
      '>',
    ),

    array_type: $ => seq(
      field('element', $.type_definition),
      '[]',
    ),

    optional_type: $ => seq(
      field('type', $.type_definition),
      '?',
    ),

    union_type: $ => prec.left(1, seq(
      field('left', $.type_definition),
      '|',
      field('right', $.type_definition),
    )),

    grouped_type: $ => seq(
      '(',
      $.type_definition,
      ')',
    ),

    custom_type: $ => $.identifier,

    // Attributes
    block_attribute: $ => seq(
      choice('@', '@@'),
      field('name', $.identifier),
      '(',
      optional(field('arguments', $.attribute_arguments)),
      ')',
    ),

    attribute_arguments: $ => choice(
      $.string_literal,
      $.block_string,
      $.identifier,
      $.nested_object,
      seq(
        choice($.string_literal, $.identifier),
        ',',
        choice($.string_literal, $.block_string, $.identifier),
      ),
    ),

    // Expressions
    _expression: $ => choice(
      $.identifier,
      $.string_literal,
      $.block_string,
      $.number_literal,
      $.boolean_literal,
      $.null_literal,
      $.array_literal,
      $.object_construction,
      $.function_application,
      $.method_call,
      $.binary_expression,
      $.grouped_expression,
    ),

    binary_expression: $ => {
      const operators = [
        [prec.left, 1, choice('&&', '||')],
        [prec.left, 2, choice('==', '!=', '<', '>', '<=', '>=')],
        [prec.left, 3, choice('+', '-')],
        [prec.left, 4, choice('*', '/', '%')],
      ];

      return choice(...operators.map(([fn, precedence, operator]) =>
        fn(precedence, seq(
          field('left', $._expression),
          field('operator', operator),
          field('right', $._expression),
        ))
      ));
    },

    grouped_expression: $ => seq('(', $._expression, ')'),

    function_application: $ => seq(
      field('function', $.identifier),
      '(',
      optional(seq(
        $._expression,
        repeat(seq(',', $._expression)),
        optional(','),
      )),
      ')',
    ),

    method_call: $ => seq(
      field('object', $.identifier),
      '.',
      field('method', $.identifier),
      '(',
      optional(seq(
        $._expression,
        repeat(seq(',', $._expression)),
        optional(','),
      )),
      ')',
    ),

    object_construction: $ => seq(
      field('type', $.identifier),
      '{',
      optional(seq(
        $.object_field,
        repeat(seq(',', $.object_field)),
        optional(','),
      )),
      '}',
    ),

    object_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('value', $._expression),
    ),

    // Literals
    string_literal: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\]/,
        /\\./,
      )),
      '"',
    )),

    block_string: $ => seq(
      field('start', alias(/#"+/, $.string_delimiter)),
      field('content', optional(alias(/[^"]*/, $.string_content))),
      field('end', alias(/"#+/, $.string_delimiter)),
    ),

    number_literal: $ => /\d+(\.\d+)?/,

    boolean_literal: $ => choice('true', 'false'),

    null_literal: $ => 'null',

    array_literal: $ => seq(
      '[',
      optional(seq(
        $._expression,
        repeat(seq(',', $._expression)),
        optional(','),
      )),
      ']',
    ),

    // Markdown headers (in function bodies)
    markdown_header: $ => seq(
      /#+ /,
      /.*/,
    ),

    // Identifier
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,
  },
});
