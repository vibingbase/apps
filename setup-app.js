import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Extract } from "unzipper";

const requestHeaders = new Headers();

const downloadHeaders = new Headers();

switch (process.env.VIBINGBASE_APP_ENV) {
  case "development": {
    const authorization = `Bearer ${process.env.VIBINGBASE_DEVELOPMENT_SECRET}`;
    requestHeaders.set("authorization", authorization);
    downloadHeaders.set("authorization", authorization);
    break;
  }
  case "production": {
    requestHeaders.set(
      "authorization",
      `Bearer ${process.env.VIBINGBASE_PRODUCTION_SECRET}`,
    );
    break;
  }
}

const prePublishResponse = await fetch(
  `${process.env.VIBINGBASE_REQUEST_URL}/v1/app/${process.env.VIBINGBASE_APP_ID}/pre-publish`,
  {
    headers: requestHeaders,
    method: "POST",
    body: JSON.stringify({
      type: "gha",
      id: Number(process.env.GITHUB_RUN_ID),
      attempt: Number(process.env.GITHUB_RUN_ATTEMPT),
    }),
  },
);

if (!prePublishResponse.ok)
  throw new Error(`Failed to pre-publish: HTTP ${prePublishResponse.status}`);

const downloadResponse = await fetch(process.env.VIBINGBASE_DOWNLOAD_URL, {
  headers: downloadHeaders,
});

if (!downloadResponse.ok)
  throw new Error(`Failed to download: HTTP ${downloadResponse.status}`);

await pipeline(
  Readable.fromWeb(downloadResponse.body),
  Extract({ path: process.env.VIBINGBASE_APP_DIR }),
);
