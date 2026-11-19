const { createHash } = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");

const publisher = "https://chankay-demo-publisher-preview.navelorange1999.workers.dev";
const dist = path.resolve(__dirname, "../dist");

module.exports = async function publish({ core, release }) {
  if (!/^[a-f0-9]{40}$/.test(release)) {
    throw new Error("Invalid release ID");
  }
  const inventoryPath = path.join(dist, "release.json");
  if (await fs.realpath(inventoryPath) !== inventoryPath) {
    throw new Error("Invalid inventory path");
  }
  const inventory = await fs.readFile(inventoryPath);
  const { locale, files } = JSON.parse(inventory);
  if (locale !== "en" || !Array.isArray(files) || !files.length || files.length > 512) {
    throw new Error("Invalid preview inventory");
  }
  const readiness = await fetch(new URL("/ready", publisher), {
    redirect: "error",
    signal: AbortSignal.timeout(10000),
  });
  const status = readiness.status === 200 ? await readiness.json() : null;
  if (status?.service !== "bezier-preview-publisher" || status.version !== 1) {
    throw new Error(`Preview publisher is not ready (HTTP ${readiness.status})`);
  }
  const identity = await core.getIDToken(publisher);
  const releaseUrl = new URL(`/v1/bezier/${release}/`, publisher);

  async function request(method, resource, body) {
    const response = await fetch(new URL(resource, releaseUrl), {
      method,
      redirect: "error",
      headers: { Authorization: `Bearer ${identity}` },
      body,
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      throw new Error(`Preview publisher returned HTTP ${response.status}`);
    }
  }

  const seen = new Set();
  for (const file of files) {
    if (
      typeof file?.path !== "string" ||
      !file.path.split("/").every((part) => /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(part)) ||
      file.path === "release.json" || seen.has(file.path) ||
      !Number.isSafeInteger(file.size) || file.size < 0 || !/^[a-f0-9]{64}$/.test(file.sha256)
    ) {
      throw new Error("Invalid inventory entry");
    }
    const filePath = path.join(dist, file.path);
    if (await fs.realpath(filePath) !== filePath) {
      throw new Error("Invalid artifact path");
    }
    const bytes = await fs.readFile(filePath);
    if (bytes.length !== file.size || createHash("sha256").update(bytes).digest("hex") !== file.sha256) {
      throw new Error("Artifact content differs from its inventory");
    }
    const resource = "files/" + file.path.split("/").map(encodeURIComponent).join("/");
    await request("PUT", resource, bytes);
    seen.add(file.path);
  }
  await request("PUT", "files/release.json", inventory);
  await request("POST", "promote");
};
