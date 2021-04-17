# File Numerus

File Numerus. Simple. Read-only. HTTP file browser.

The good 'old days of listing file directories for download. Easy to use. Responsive. Made for modern browsers.

## Why?

[http-server](https://github.com/http-party/http-server) already exists, but I needed an application that was mobile friendly, easy to copy links and fast.

File Numerus is simple on purpose. That doesn't mean it can't be extended.

There may be more features in the future.

But at its core. It's meant to be an HTTP directory listing. No uploads. No folder creation. No modifications of any files or folders.

Need more? Check out [filebrowser](https://filebrowser.org/features).

## Install

npm

```
npm install -g file-numerus
```

release

> See the releases page for packaged binaries

## Usage

Quick start

```
file-numerus --dir ~/myfolder
```

http://localhost:8081 by default

Arguments

```
$ file-numerus --help
Options:
      --help              Show help                                    [boolean]
      --version           Show version number                          [boolean]
      --directory, --dir                                 [string] [default: "."]
  -h, --host                                       [string] [default: "0.0.0.0"]
  -p, --port                                            [number] [default: 8081]
  -v, --verbose                                       [boolean] [default: false]
  -q, --quiet                                         [boolean] [default: false]
      --dev                                           [boolean] [default: false]
```

## Develop

Developed with [Typescript](https://www.typescriptlang.org/), [Next.js](https://nextjs.org/) and [Chakra](https://github.com/chakra-ui/chakra-ui).

Clone

```
git clone git@github.com:hekar/file-numerus.git
```

Run development server

```
yarn install
node ./server.js --dev --dir ~/myfolder
```

Tests

```
yarn test
```

## License

[MIT](./LICENSE.md)

## Acknowledgements

Based on Next.js and the [Typescript Chakra UI example.](https://github.com/vercel/next.js/tree/canary/examples/with-chakra-ui-typescript)

To create your own project

```
yarn create next-app --example with-chakra-ui-typescript my-app
```
