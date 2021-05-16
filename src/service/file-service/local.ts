import fs from "fs";
import path from "path";
import { orderBy } from "natural-orderby";
import { StatusError } from "src/error/status-error";
import { FileService } from "./file-service";
import {
  FileList,
  FileEntry,
  GetObjectResult,
  GetObjectOptions,
} from "./types";

export type LocalFileServiceOptions = {
  allowSymbolicLinks?: boolean;
};

export class LocalFileService implements FileService {
  constructor(
    private readonly root: string,
    private readonly options: LocalFileServiceOptions = {
      allowSymbolicLinks: false,
    }
  ) {}

  async ls(key: string): Promise<FileList> {
    const normalized = this.normalize(key);
    const stats = await this.stats(normalized);

    if (stats.isFile()) {
      throw new StatusError(500, "this api does not access files");
    } else if (stats.isDirectory()) {
      if (!this.isAccessibleChild(stats)) {
        throw new StatusError(400, "inaccessible path");
      }

      const files = await fs.promises.readdir(normalized);
      const entries: Array<FileEntry> = [];
      let fileCount = 0;
      let folderCount = 0;
      for (const file of files) {
        const absolutePath = path.normalize(
          path.resolve(this.root, normalized, file)
        );
        const relativePath = path.relative(
          this.root,
          path.join(normalized, file)
        );
        const name = path.basename(absolutePath);
        try {
          const fileStat = await fs.promises.lstat(absolutePath);
          if (!this.isAccessibleChild(fileStat)) {
            continue;
          }
          const isDir = fileStat.isDirectory();
          const isSymLink = fileStat.isSymbolicLink();
          if (fileStat.isFile()) fileCount++;
          if (fileStat.isDirectory()) folderCount++;

          if (fileStat.isFile() || fileStat.isDirectory()) {
            entries.push({
              key: relativePath,
              name,
              size: fileStat.size,
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

      const fileList: FileList = {
        key,
        name: path.basename(key),
        isSymLink: stats.isSymbolicLink(),
        isDir: stats.isDirectory(),
        size: stats.size,
        fileCount,
        folderCount,
        totalCount: orderedEntries.length,
        children: orderedEntries,
      };

      return fileList;
    } else {
      throw new StatusError(500, "not a directory");
    }
  }

  async getEntry(key: string): Promise<FileEntry> {
    const normalized = this.normalize(key);
    const stats = await this.stats(normalized);

    if (stats.isDirectory()) {
      throw new StatusError(500, "this api does not access directories");
    } else if (stats.isFile()) {
      if (!this.isAccessibleChild(stats) || !stats.isFile()) {
        throw new StatusError(403, "inaccessible path");
      }

      const fileEntry: FileEntry = {
        key,
        name: path.basename(key),
        isSymLink: stats.isSymbolicLink(),
        isDir: stats.isDirectory(),
        size: stats.size,
      };

      return fileEntry;
    } else {
      throw new StatusError(500, "not a directory");
    }
  }

  async getObject(
    key: string,
    options?: GetObjectOptions
  ): Promise<GetObjectResult> {
    const normalized = this.normalize(key);
    const resolvedStats = await this.stats(normalized);
    const size = resolvedStats.size;
    if (
      this.isAccessibleChild(resolvedStats) &&
      resolvedStats.isFile() &&
      resolvedStats.mode & 0o400
    ) {
      const readStream = fs.createReadStream(normalized, {
        start: options?.start,
      });
      return {
        readStream,
        size,
      };
    } else {
      throw new StatusError(404, "file not found");
    }
  }

  private async stats(key: string): Promise<fs.Stats> {
    let resolvedStats: fs.Stats | undefined;
    try {
      resolvedStats = await fs.promises.lstat(key);
    } catch (err) {
      console.error({ err });
    }
    if (!resolvedStats) {
      throw new StatusError(404, "cannot find file");
    } else if (resolvedStats.isSymbolicLink()) {
      throw new StatusError(500, "cannot access symbolic links");
    }
    return resolvedStats;
  }

  private normalize(key: string): string {
    const removeFirstSlash = key.replace(/^\/?/, "");
    const resolved = path.normalize(path.resolve(this.root, removeFirstSlash));
    if (!path.isAbsolute(resolved)) {
      throw new StatusError(400, "failure to create absolute path");
    }

    if (!resolved.startsWith(this.root)) {
      throw new StatusError(
        400,
        "trying to access a folder outside your file browser folder?"
      );
    }

    const relativePath = path.relative(this.root, resolved);
    const isRelative =
      !relativePath.startsWith("..") && !path.isAbsolute(relativePath);

    if (!isRelative) {
      throw new StatusError(400, "outside of relative path");
    }

    return resolved;
  }

  private isAccessibleChild(fileStat: fs.Stats) {
    const isAlwaysDenied =
      fileStat.isFIFO() || fileStat.isSocket() || fileStat.isCharacterDevice();
    if (this.options.allowSymbolicLinks) {
      return !isAlwaysDenied;
    } else {
      return !isAlwaysDenied && !fileStat.isSymbolicLink();
    }
  }
}
