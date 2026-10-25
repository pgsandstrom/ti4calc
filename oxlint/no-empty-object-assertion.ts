import { defineRule } from "@oxlint/plugins"

export const noEmptyObjectAssertion = defineRule({
  meta: {
    type: "suggestion",
    messages: {
      noEmptyObjectAssertion:
        "Unnecessary type assertion on empty object literal. Use a type annotation instead.",
    },
    schema: [],
  },
  create(context) {
    return {
      TSAsExpression(node) {
        if (
          node.expression.type === "ObjectExpression" &&
          node.expression.properties.length === 0
        ) {
          context.report({
            node,
            messageId: "noEmptyObjectAssertion",
          })
        }
      },
    }
  },
})
