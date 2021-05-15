import { StatusError } from "src/error/status-error";

export type HttpStartEndRange = {
  start: number | undefined;
  end: number | undefined;
};

export class HttpRange {
  constructor(private readonly rangeHeader: string) {}

  ranges(): Array<HttpStartEndRange> {
    const [units, rest] = this.rangeHeader.split("=");
    if (units !== "bytes") {
      throw new StatusError(
        400,
        "this API does not support anything other than bytes"
      );
    } else {
      const ranges: Array<HttpStartEndRange> = rest
        .split(",")
        .map((s) => s.trim())
        .map((s) => s.split("-", 2))
        .map(([start, end]) => [Number(start), end ? Number(end) : undefined])
        .map(([start, end]) => ({ start, end }));
      return ranges;
    }
  }
}
