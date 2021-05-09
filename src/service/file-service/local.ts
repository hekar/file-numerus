import fs from "fs"
import path from "path"
import { StatusError } from "src/error/status-error";
import { FileService } from "./file-service";
import { FileList, FileEntry } from "./types";
import { orderBy } from "natural-orderby";

export class LocalFileService implements FileService {
  constructor(private readonly root: string) {
  }

  ls(key: string): Promise<FileList> {
    const normalized = this.normalize(key)
    const stats = this.stats(normalized)

    if (stats.isFile()) {
      throw new StatusError(500, "this api does not access files")
    } else if (stats.isDirectory()) {
      const files = await fs.promises.readdir(normalized);
      const entries: Array<FileEntry> = [];
      const parent = path.relative(this.root, normalized);
      let fileCount = 0;
      let folderCount = 0;
      for (const file of files) {
        const absolutePath = path.normalize(path.resolve(this.root, normalized, file));
        const relativePath = path.relative(this.root, path.join(normalized, file));
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
        .relative(this.root, normalized)
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
        path.relative(this.root, path.dirname(normalized)) || "/";
      const parentPath =
        possibleParentPath !== path.dirname(this.root)
          ? possibleParentPath
          : undefined;
      const currentPath = path.relative(this.root, normalized);

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
    }

    return responseBody
  }

  getEntry(key: string): Promise<FileEntry> {
  }

  getObject(key: string): Promise<ReadableStream<any>> {
  }

  private stats(key: string): fs.Stats {
    let resolvedStats: fs.Stats | undefined;
    try {
      resolvedStats = await fs.promises.lstat(key);
    } catch (err) {
      console.error({ err });
    }
    if (!resolvedStats) {
      throw new StatusError(404, "cannot find file")
    } else if (resolvedStats.isSymbolicLink()) {
      throw new StatusError(500, "cannot access symbolic links")
    }
    return resolvedStats
  }

  private normalize(key: string): string {
    const removeFirstSlash = key.replace(/^\/?/, "");
    const resolved = path.normalize(path.resolve(this.root, removeFirstSlash));
    if (!path.isAbsolute(resolved)) {
      throw new StatusError(400, "failure to create absolute path");
    }

    if (!resolved.startsWith(this.root)) {
      throw new StatusError(400, "trying to access a folder outside your file browser folder?"),
    }

    return resolved
  }
}
