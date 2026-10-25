import { execSync } from "node:child_process"

// In Docker the .git directory is excluded from the build context, so the hash
// is passed in as a build arg instead of being read from git.
function resolveGitHash() {
  if (process.env.GIT_HASH !== undefined && process.env.GIT_HASH !== "") {
    return process.env.GIT_HASH
  }
  try {
    return execSync("git rev-parse --short HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()
  } catch {
    return "unknown"
  }
}

export default {
  output: "standalone",
  env: {
    GIT_HASH: resolveGitHash(),
  },
}
