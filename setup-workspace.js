import path from "node:path";
import { existsSync, renameSync } from "node:fs";

const workspaceDir = path.join(process.env.VIBINGBASE_APP_DIR, ".workspace");
if (existsSync(workspaceDir)) renameSync(workspaceDir, "/workspace");
