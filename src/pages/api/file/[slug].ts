import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { FileService, LocalFileService } from "src/service/file-service";
import { QueryParam } from "src/model/query-param";
import { HttpRange } from "src/model/http-range";
import { handleStatusError } from "src/error/status-error";

const { serverRuntimeConfig } = getConfig();
const { directory } = serverRuntimeConfig;

const fileService: FileService = new LocalFileService(directory);

export default async function file(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method !== "GET") {
      res.status(405).json({ message: "unsupported method" });
      return;
    }

    const slug = new QueryParam(req.query.slug).first();
    const filename = path.basename(slug);
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const ranges = new HttpRange(rangeHeader).ranges();
      for (const { start, end } of ranges) {
        const { size, readStream } = await fileService.getObject(slug, {
          start,
        });
        const length = size;
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
      const { size, readStream } = await fileService.getObject(slug);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Length", size);
      res.setHeader("Content-Disposition", `inline;filename=${filename}`);
      res.status(200);
      readStream.pipe(res, {
        end: true,
      });
    }
  } catch (err) {
    handleStatusError(res, err);
  }
}
