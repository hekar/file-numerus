import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { orderBy } from "natural-orderby";
import { FileEntry } from "../../../model/file-entry";
import { Breadcrumb } from "../../../model/breadcrumb";
import { DirApiResponse } from "../../../model/dir-api-response";

const { serverRuntimeConfig } = getConfig();
const { directory } = serverRuntimeConfig;
const root = directory;

export default async function slug(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ message: "unsupported method" });
    return;
  }

  const slug: string = Array.isArray(req.query.slug)
    ? req.query.slug[0]
    : req.query.slug;
  const removeFirstSlash = slug.replace(/^\/?/, "");
  const resolved = path.normalize(path.resolve(root, removeFirstSlash));
  if (!path.isAbsolute(resolved)) {
    res.status(500).json({ message: "failure to create absolute path" });
    return;
  }

  if (!resolved.startsWith(root)) {
    res.status(500).json({
      message: "trying to access a folder outside your file browser folder?",
    });
    return;
  }

  let resolvedStats: fs.Stats | undefined;
  try {
    resolvedStats = await fs.promises.lstat(resolved);
  } catch (err) {
    console.error({ err });
  }
  if (!resolvedStats) {
    res.status(404).json({
      message: "cannot find file",
    });
    return;
  } else if (resolvedStats.isSymbolicLink()) {
    res.status(500).json({
      message: "cannot access symbolic links",
    });
    return;
  } else if (resolvedStats.isFile()) {
    res.status(500).json({
      message: "this api does not access files",
    });
    return;
  } else if (resolvedStats.isDirectory()) {
    const files = await fs.promises.readdir(resolved);
    const entries: Array<FileEntry> = [];
    const parent = path.relative(root, resolved);
    let fileCount = 0;
    let folderCount = 0;
    for (const file of files) {
      const absolutePath = path.normalize(path.resolve(root, resolved, file));
      const relativePath = path.relative(root, path.join(resolved, file));
      const name = path.basename(absolutePath);
      try {
        const fileStat = await fs.promises.lstat(absolutePath);
        if (
          fileStat.isFIFO() ||
          fileStat.isSocket() ||
          fileStat.isCharacterDevice() ||
          fileStat.isSymbolicLink()
        ) {
          continue;
        }
        const isDir = fileStat.isDirectory();
        const isSymLink = fileStat.isSymbolicLink();
        if (fileStat.isFile()) fileCount++;
        if (fileStat.isDirectory()) folderCount++;

        if (fileStat.isFile() || fileStat.isDirectory()) {
          const href = fileStat.isDirectory()
            ? relativePath
            : `/api/file/${encodeURIComponent(relativePath)}`;
          entries.push({
            parent,
            relativePath,
            href,
            name,
            isDir,
            isSymLink,
          });
        }
      } catch (err) {
        console.error(err.stack);
      }
    }

    const orderedEntries = orderBy(
      entries,
      [(v) => v.isDir, (v) => v.name],
      ["desc", "asc"]
    );

    const breadcrumbs = path
      .relative(root, resolved)
      .split("/")
      .reduce((acc, val) => {
        const sofar = acc.map((s) => s.name);
        acc.push({
          href: new Array<string>().concat(sofar).concat([val]).join("/"),
          name: val,
        });
        return acc;
      }, new Array<Breadcrumb>());

    const possibleParentPath =
      path.relative(root, path.dirname(resolved)) || "/";
    const parentPath =
      possibleParentPath !== path.dirname(root)
        ? possibleParentPath
        : undefined;
    const currentPath = path.relative(root, resolved);

    const responseBody: DirApiResponse = {
      breadcrumbs,
      parentPath,
      path: currentPath,
      entries: orderedEntries,
      stats: {
        totalCount: orderedEntries.length,
        fileCount,
        folderCount,
      },
    };
    orderedEntries.unshift({
      parent: path.dirname(path.dirname(parent)),
      relativePath: path.dirname("parent"),
      href: path.dirname("parent"),
      name: "..",
      isDir: true,
      isSymLink: false,
    });
    orderedEntries.unshift({
      parent: path.dirname(parent),
      relativePath: parent,
      href: parent,
      name: ".",
      isDir: true,
      isSymLink: false,
    });
    res.status(200).json(responseBody);
  } else {
    res.status(500).json({
      message: "it appears this file does not exist",
    });
    return;
  }
}
