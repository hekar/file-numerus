import fs from "fs";
import path from "path";
import { dir, tmpName } from "tmp-promise";

const tmpdir = path.resolve(__dirname, "..", "..", "temp");

type CleanUpFunc = () => void;
type TmpFolder = {
  dir: string;
  files: Array<string>;
};

export class TmpFileBench {
  private readonly tmpResourceCleanup: CleanUpFunc[];
  constructor() {
    this.tmpResourceCleanup = [];
  }

  async tmpFolder({ fileCount }: { fileCount: number }): Promise<TmpFolder> {
    const tmpDirStats = await fs.promises.lstat(tmpdir);
    if (!tmpDirStats.isDirectory()) {
      await fs.promises.mkdir(tmpdir);
    }

    const files: Array<string> = [];
    const createdDir = await dir({
      mode: 0o750,
      prefix: "file-numerus-test",
      tmpdir,
    });

    for (let i = 0; i < fileCount; i++) {
      const name = await tmpName({
        dir: createdDir.path,
        prefix: "file-numerus",
        tmpdir,
      });
      files.push(name);
    }

    const cleanup = () => Promise.all(files.map((s) => fs.promises.unlink(s)));
    this.tmpResourceCleanup.push(cleanup);
    this.tmpResourceCleanup.push(() => createdDir.cleanup());

    return {
      dir: createdDir.path,
      files,
    };
  }

  async cleanup(): Promise<void> {
    while (this.tmpResourceCleanup.length > 0) {
      const c = this.tmpResourceCleanup.shift();
      if (c) {
        await c();
      }
    }
  }
}
