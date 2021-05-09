import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { FileService, LocalFileService } from "src/service/file-service";

const { serverRuntimeConfig } = getConfig();
const { directory } = serverRuntimeConfig;

const fileService: FileService = new LocalFileService(directory)

export default async function file(
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

  if (resolvedStats.isFile()) {
    const filename = path.basename(resolved);
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const [units, rest] = rangeHeader.split("=");
      if (units !== "bytes") {
        res.status(400).json({
          message: "this API does not support anything other than bytes",
        });
        return;
      }
      const ranges = rest
        .split(",")
        .map((s) => s.trim())
        .map((s) => s.split("-", 2))
        .map(([start, end]) => [Number(start), end ? Number(end) : undefined])
        .map(([start, end]) => ({ start, end }));
      for (const { start, end } of ranges) {
        const readStream = fs.createReadStream(resolved, {
          start,
        });
        const length = resolvedStats.size;
        const contentRangeEnd = end ?? length;
        const contentRange = `bytes ${start}-${contentRangeEnd}/${length}`;
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Type", "application/octet");
        res.setHeader("Content-Range", contentRange);
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `inline;filename=${filename}`);
        res.status(206);
        readStream.pipe(res, {
          end: true,
        });
      }
    } else {
      const readStream = fs.createReadStream(resolved);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", resolvedStats.size);
      res.setHeader("Content-Disposition", `inline;filename=${filename}`);
      res.status(200);
      readStream.pipe(res, {
        end: true,
      });
    }
    return;
  } else if (resolvedStats.isDirectory()) {
    res.status(400).json({
      message: "cannot download a folder",
    });
    return;
  } else {
    res.status(500).json({
      message: "it appears this file does not exist",
    });
    return;
  }
}
