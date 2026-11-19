const { build } = require("vite");
const vue = require("@vitejs/plugin-vue");

function demoTemplate(base) {
  const canonical = "https://demos.chankay.com/bezier/";
  const preview = "https://chankay-demos-preview.navelorange1999.workers.dev";
  const releaseRoot = new URL(base, preview).href;

  return {
    name: "bezier-demo-preview-template",
    transformIndexHtml: {
      enforce: "pre",
      transform(html) {
        return {
          html: html
            .replaceAll("https://bezier.chankay.com/favicon/", releaseRoot + "favicon/")
            .replaceAll("https://bezier.chankay.com/", canonical)
            .replace('src="/src/main.ts"', 'src="/src/preview.ts"')
            .replace('content="index,follow"', 'content="noindex,nofollow"')
            .replace(/<script async src="https:\/\/pagead2\.googlesyndication\.com\/[^>]*><\/script>/, ""),
          tags: [
            { tag: "meta", attrs: { name: "chankay-shell", content: "v1" }, injectTo: "head" },
            { tag: "div", attrs: { "data-shell-slot": "header" }, injectTo: "body-prepend" },
            { tag: "div", attrs: { "data-shell-slot": "footer" }, injectTo: "body" },
          ],
        };
      },
    },
  };
}

async function main() {
  const release = process.env.DEMO_RELEASE || "";
  if (!/^[0-9a-f]{40}$/.test(release)) {
    throw new Error("DEMO_RELEASE must be the full Git commit SHA.");
  }
  const base = `/bezier/_r/${release}/`;
  await build({
    mode: "demo-preview",
    configFile: false,
    envFile: false,
    base,
    plugins: [vue(), demoTemplate(base)],
  });
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
