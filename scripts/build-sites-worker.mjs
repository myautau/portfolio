import { copyFile, mkdir, writeFile } from "node:fs/promises";

const worker = `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");
    if (!acceptsHtml || request.method !== "GET") return response;

    const requestUrl = new URL(request.url);
    const location = response.headers.get("location");
    const redirectsMissingRouteToHome = response.status >= 300
      && response.status < 400
      && requestUrl.pathname !== "/"
      && location
      && new URL(location, request.url).pathname === "/";

    if (response.status !== 404 && !redirectsMissingRouteToHome) return response;

    const fallbackUrl = new URL("/index.html", request.url);
    return env.ASSETS.fetch(new Request(fallbackUrl, {
      method: "GET",
      headers: request.headers,
    }));
  },
};
`;

await mkdir(new URL("../dist/server/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/server/index.js", import.meta.url), worker);
await mkdir(new URL("../dist/.openai/", import.meta.url), { recursive: true });
await copyFile(
  new URL("../.openai/hosting.json", import.meta.url),
  new URL("../dist/.openai/hosting.json", import.meta.url),
);
