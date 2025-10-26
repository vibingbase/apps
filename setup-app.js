import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Extract } from "unzipper";

const headers = new Headers();

if (process.env.VIBINGBASE_DOWNLOAD_SERVER === "proxy") {
  let secret;
  switch (process.env.VIBINGBASE_APP_ENV) {
    case "development":
      secret = process.env.VIBINGBASE_PROXY_DEVELOPMENT_SECRET;
      break;
    case "production":
      secret = process.env.VIBINGBASE_PROXY_PRODUCTION_SECRET;
      break;
  }
  if (secret) {
    headers.set("authorization", `Bearer ${secret}`);
  }
}

const response = await fetch(process.env.VIBINGBASE_DOWNLOAD_URL, { headers });

if (!response.ok)
  throw new Error(`Failed to download: HTTP ${response.status}`);

await pipeline(
  Readable.fromWeb(response.body),
  Extract({ path: process.env.VIBINGBASE_APP_DIR }),
);
