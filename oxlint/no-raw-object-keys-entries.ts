import { defineRule } from '@oxlint/plugins'

export const noRawObjectKeysEntries = defineRule({
  meta: {
    type: 'suggestion',
    messages: {
      noObjectKeys: 'Use objectKeys() from util-object instead of Object.keys() for type safety.',
      noObjectEntries:
        'Use objectEntries() from util-object instead of Object.entries() for type safety.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'Object' &&
          node.callee.property.type === 'Identifier'
        ) {
          const filename = context.filename
          if (filename.endsWith('util-object.ts')) {
            return
          }

          if (node.callee.property.name === 'keys') {
            context.report({ node, messageId: 'noObjectKeys' })
          } else if (node.callee.property.name === 'entries') {
            context.report({ node, messageId: 'noObjectEntries' })
          }
        }
      },
    }
  },
})
