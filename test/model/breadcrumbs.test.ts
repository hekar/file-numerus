import path from "path";
import { Breadcrumbs } from "src/model/breadcrumbs";

const exampleRootFolder = "/my-root/folder";

describe("breadcrumbs", () => {
  describe("#name", () => {
    it("should give the name of the file", () => {
      const breadcrumbs = new Breadcrumbs(
        exampleRootFolder,
        "my/.././path/to/file/./"
      );
      const actual = breadcrumbs.name();
      expect(actual).toEqual("file");
    });

    it("should handle / prefix in path", () => {
      const breadcrumbs = new Breadcrumbs(
        exampleRootFolder,
        "/my/path/to/file"
      );
      const actual = breadcrumbs.name();
      expect(actual).toEqual("file");
    });
  });

  describe("#normalizedKey", () => {
    it("should handle / prefix in path", () => {
      const breadcrumbs = new Breadcrumbs(
        exampleRootFolder,
        "/my/path/to/file"
      );
      const actual = breadcrumbs.normalizedKey;
      expect(actual).toEqual("my/path/to/file");
    });

    it("should normalize key", () => {
      const breadcrumbs = new Breadcrumbs(
        exampleRootFolder,
        "/my/path/to/../.././file"
      );
      const actual = breadcrumbs.normalizedKey;
      expect(actual).toEqual("my/file");
    });
  });

  describe("#parent", () => {
    it("should return correct parent", () => {
      const key = "my/path/to/file";
      const breadcrumbs = new Breadcrumbs(exampleRootFolder, key);
      const actual = breadcrumbs.parent();
      expect(actual).toEqual(path.dirname(key));
    });
  });

  describe("#toArray()", () => {
    it("should return correct entries", () => {
      const key = "my/path/to/file";
      const breadcrumbs = new Breadcrumbs(exampleRootFolder, key);
      const actual = breadcrumbs.toArray();
      expect(actual).toEqual([
        {
          href: "/",
          name: "-",
        },
        {
          href: "/my",
          name: "my",
        },
        {
          href: "/my%2Fpath",
          name: "path",
        },
        {
          href: "/my%2Fpath%2Fto",
          name: "to",
        },
        {
          href: "/my%2Fpath%2Fto%2Ffile",
          name: "file",
        },
      ]);
    });
  });
});
