import path from "path";
import { Breadcrumb } from "./breadcrumb";

export class Breadcrumbs {
  private readonly key: string;
  constructor(private readonly root: string, key: string) {
    // Always remove the first slash
    this.key = this.replaceSep(path.normalize(key)).replace(/^\/?/, "");
  }

  get normalizedKey(): string {
    return this.replaceSep(this.key);
  }

  name(): string {
    return path.basename(path.normalize(this.key));
  }

  parent(): string {
    if (!this.key) {
      return "";
    } else {
      return this.replaceSep(path.dirname(path.normalize(this.key)));
    }
  }

  toArray(): Array<Breadcrumb> {
    const breadcrumbs = path
      .normalize(this.key)
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

    return [{ href: "/", name: "-" }].concat(breadcrumbs);
  }

  private replaceSep(key: string): string {
    return key.replace(/\\/g, "/");
  }
}
