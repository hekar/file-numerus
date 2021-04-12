const { createServer } = require("http");
const path = require("path");
const { parse } = require("url");
const next = require("next");
const yargs = require("yargs/yargs");
const conf = require("./next.config");
const { assignRef } = require("@chakra-ui/hooks");

const argv = yargs(process.argv.slice(2))
  .env("FILE_NUMERUS")
  .options({
    directory: { type: "string", alias: "d", alias: "dir", default: "." },
    port: { type: "number", alias: "p", default: 8081 },
    verbose: { type: "boolean", alias: "v", default: false },
    quiet: { type: "boolean", alias: "q", default: false },
    dev: { type: "boolean", default: false },
  }).argv;

const directory = path
  .normalize(path.resolve(argv.directory))
  .replace(/\/?$/, "");

console.log("Starting with directory", directory);

const app = next({
  dev: argv.dev,
  quiet: argv.quiet,
  dir: ".",
  conf: Object.assign({}, conf, {
    serverRuntimeConfig: {
      directory,
    },
  }),
});
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname, query } = parsedUrl;
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
