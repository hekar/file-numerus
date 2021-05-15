import path from "path";
import { Breadcrumb } from "./breadcrumb";

export class Breadcrumbs {
  constructor(private readonly root: string, private readonly path: string) {}

  normalizedPath(): string {
    return path.join(this.parent(), this.name());
  }

  name(): string {
    return path.basename(path.resolve(this.path));
  }

  parent(): string {
    const isRoot =
      path.normalize(this.root) === path.normalize(this.path) ||
      path.resolve(this.root, this.path).endsWith("/");
    const relativePath = path.relative(this.root, this.path);
    const isRelative =
      relativePath !== "" &&
      !relativePath.startsWith("..") &&
      !path.isAbsolute(relativePath);

    if (isRoot || !isRelative) {
      return "";
    } else {
      return path.relative(this.root, path.dirname(path.resolve(this.path)));
    }
  }

  toArray(): Array<Breadcrumb> {
    const breadcrumbs = path
      .relative(this.root, this.normalizedPath())
      .normalize()
      .split(path.sep)
      .filter(Boolean)
      .reduce((acc, val) => {
        const sofar = acc.map((s) => s.name);
        acc.push({
          href:
            "/" +
            encodeURIComponent(
              new Array<string>().concat(sofar).concat([val]).join("/")
            ),
          name: val,
        });
        return acc;
      }, new Array<Breadcrumb>());

    return [{ href: "/", name: "H" }].concat(breadcrumbs);
  }
}
