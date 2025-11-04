import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import YAML from "yaml";

const pnpmWorkspaceFilePath = path.join(
  process.env.VIBINGBASE_APP_DIR,
  "pnpm-workspace.yaml",
);

const pnpmWorkspaceFileData = YAML.parse(
  readFileSync(pnpmWorkspaceFilePath, "utf8"),
);

const workspaceDir = path.join(process.env.VIBINGBASE_APP_DIR, ".workspace");

if (existsSync(workspaceDir)) {
  renameSync(workspaceDir, process.env.VIBINGBASE_WORKSPACE_DIR);
  execSync("pnpm install", {
    cwd: process.env.VIBINGBASE_WORKSPACE_DIR,
    stdio: "inherit",
  });
  pnpmWorkspaceFileData.overrides = {
    "@vibingbase/common-util": `link:${path.join(workspaceDir, "vibingbase-common-util")}`,
    "@vibingbase/common-client": `link:${path.join(workspaceDir, "vibingbase-common-client")}`,
    "@vibingbase/sdk": `link:${path.join(workspaceDir, "vibingbase-sdk")}`,
  };
} else {
  delete pnpmWorkspaceFileData.overrides;
}

writeFileSync(pnpmWorkspaceFilePath, YAML.stringify(pnpmWorkspaceFileData));

execSync(
  "pnpm install --frozen-lockfile=false --fix-lockfile=true --lockfile-only=true --ignore-scripts=true",
  { cwd: process.env.VIBINGBASE_APP_DIR, stdio: "inherit" },
);
