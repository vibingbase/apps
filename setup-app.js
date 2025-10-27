import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Extract } from "unzipper";

const downloadHeaders = new Headers();

switch (process.env.VIBINGBASE_APP_ENV) {
  case "development": {
    downloadHeaders.set(
      "authorization",
      `Bearer ${process.env.VIBINGBASE_DEVELOPMENT_SECRET}`,
    );
    break;
  }
}

const downloadResponse = await fetch(process.env.VIBINGBASE_DOWNLOAD_URL, {
  headers: downloadHeaders,
});

if (!downloadResponse.ok)
  throw new Error(`Failed to download: HTTP ${downloadResponse.status}`);

await pipeline(
  Readable.fromWeb(downloadResponse.body),
  Extract({ path: process.env.VIBINGBASE_APP_DIR }),
);
