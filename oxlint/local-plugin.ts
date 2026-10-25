import { definePlugin } from "@oxlint/plugins"

import { noEmptyObjectAssertion } from "./no-empty-object-assertion.ts"
import { noRawObjectKeysEntries } from "./no-raw-object-keys-entries.ts"

export default definePlugin({
  meta: { name: "local" },
  rules: {
    "no-empty-object-assertion": noEmptyObjectAssertion,
    "no-raw-object-keys-entries": noRawObjectKeysEntries,
  },
})
