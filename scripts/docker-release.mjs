import { execSync } from "node:child_process"

// The .git directory is excluded from the docker build context, so we read the
// commit here on the host and pass it to the build as GIT_HASH.
const gitHash = execSync("git rev-parse --short HEAD").toString().trim()

// The build copies the working tree, not the commit, so a dirty tree would bake
// in a hash that does not describe what is actually running.
const dirty = execSync("git status --porcelain").toString().trim()
if (dirty) {
  console.error("Working tree is dirty, so git_hash would not match what gets built:")
  console.error(dirty)
  console.error("\nCommit or stash the changes first.")
  process.exit(1)
}

console.log(`Releasing git_hash: ${gitHash}`)

// --pull so the node base image is fetched fresh instead of reusing a cached, possibly unpatched one
const options = { stdio: "inherit", env: { ...process.env, GIT_HASH: gitHash } }
execSync("docker compose build --pull", options)
execSync("docker compose up -d", options)
