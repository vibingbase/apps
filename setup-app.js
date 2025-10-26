import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Extract } from "unzipper";

const headers = new Headers();

if (
  process.env.VIBINGBASE_DOWNLOAD_SOURCE === "local" &&
  process.env.VIBINGBASE_LOCAL_PROXY_TOKEN
) {
  headers.set(
    "authorization",
    `Bearer ${process.env.VIBINGBASE_LOCAL_PROXY_TOKEN}`,
  );
}

const response = await fetch(process.env.VIBINGBASE_DOWNLOAD_URL, { headers });

if (!response.ok)
  throw new Error(`Failed to download: HTTP ${response.status}`);

await pipeline(
  Readable.fromWeb(response.body),
  Extract({ path: process.env.VIBINGBASE_APP_DIR }),
);
