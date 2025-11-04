import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import YAML from "yaml";

console.log("Setting up development dependencies…");

const pnpmWorkspaceFilePath = path.join(
  process.env.VIBINGBASE_APP_DIR,
  "pnpm-workspace.yaml",
);

const pnpmWorkspaceFileData = YAML.parse(
  readFileSync(pnpmWorkspaceFilePath, "utf8"),
);

const oldWorkspaceDir = path.join(process.env.VIBINGBASE_APP_DIR, ".workspace");

const newWorkspaceDir = process.env.VIBINGBASE_WORKSPACE_DIR;

if (existsSync(oldWorkspaceDir)) {
  renameSync(oldWorkspaceDir, newWorkspaceDir);
  execSync("pnpm install --prod", { cwd: newWorkspaceDir, stdio: "inherit" });
  const prefix = `link:${path.join(newWorkspaceDir, "libs")}`;
  pnpmWorkspaceFileData.overrides = {
    "@vibingbase/common-util": `${prefix}/vibingbase-common-util`,
    "@vibingbase/common-client": `${prefix}/vibingbase-common-client`,
    "@vibingbase/sdk": `${prefix}/vibingbase-sdk`,
  };
} else {
  delete pnpmWorkspaceFileData.overrides;
}

console.log("Rewriting pnpm config files…");

writeFileSync(pnpmWorkspaceFilePath, YAML.stringify(pnpmWorkspaceFileData));

execSync(
  "pnpm install --frozen-lockfile=false --fix-lockfile=true --lockfile-only=true --ignore-scripts=true",
  { cwd: process.env.VIBINGBASE_APP_DIR, stdio: "inherit" },
);
