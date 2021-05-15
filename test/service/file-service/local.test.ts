import fs from "fs";
import { LocalFileService } from "src/service/file-service";
import { TmpFileBench } from "test/bench/tmp";

const tmpFileBench = new TmpFileBench();

describe("LocalFileService", () => {
  beforeEach(() => {});
  describe("#ls", () => {
    it("should list files", async () => {
      const { dir, files } = await tmpFileBench.tmpFolder({ fileCount: 10 });
      const fileService = new LocalFileService(dir);

      const found = fileService.ls(dir);

      expect(found).toEqual(files);
    });

    it("should handle inaccessible folders", async () => {
      const { dir, files } = await tmpFileBench.tmpFolder({ fileCount: 10 });
      await fs.promises.chmod(files[0], 0o000);

      const fileService = new LocalFileService(dir);

      const found = await fileService.ls(dir);

      expect(found).toEqual(files.slice(1));
      expect(found.totalCount).toEqual(9);
    });
  });
});
