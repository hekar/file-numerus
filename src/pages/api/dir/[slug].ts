import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { DirApiResponse } from "src/model/dir-api-response";
import { Breadcrumbs } from "src/model/breadcrumbs";
import { QueryParam } from "src/model/query-param";
import { FileService, LocalFileService } from "src/service/file-service";
import { FileEntry } from "src/model/file-entry";
import { handleStatusError } from "src/error/status-error";

const { serverRuntimeConfig } = getConfig();
const { directory } = serverRuntimeConfig;
const root = directory;

const fileService: FileService = new LocalFileService(root, {
  allowSymbolicLinks: false,
});

export default async function slug(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ message: "unsupported method" });
    return;
  }

  try {
    const slug: string = new QueryParam(req.query.slug).first();
    const fileList = await fileService.ls(slug);
    const breadcrumbs = new Breadcrumbs(root, slug);
    const currentPath = breadcrumbs.normalizedPath();
    const entries = fileList.children.map((e) => {
      const relativePath = path
        .join(currentPath, e.name)
        .replace(path.sep, "/");
      const entry: FileEntry = {
        parent: currentPath,
        relativePath,
        href: createUrl(e.isDir, relativePath),
        name: e.name,
        isSymLink: e.isSymLink,
        isDir: e.isDir,
      };
      return entry;
    });

    const responseBody: DirApiResponse = {
      breadcrumbs: breadcrumbs.toArray(),
      parentPath: breadcrumbs.parent(),
      path: currentPath,
      entries,
      stats: {
        totalCount: fileList.totalCount,
        fileCount: fileList.fileCount,
        folderCount: fileList.folderCount,
      },
    };
    res.json(responseBody);
    // orderedEntries.unshift({
    //   parent: path.dirname(path.dirname(parent)),
    //   relativePath: path.dirname("parent"),
    //   href: path.dirname("parent"),
    //   name: "..",
    //   isDir: true,
    //   isSymLink: false,
    // });
    // orderedEntries.unshift({
    //   parent: path.dirname(parent),
    //   relativePath: parent,
    //   href: parent,
    //   name: ".",
    //   isDir: true,
    //   isSymLink: false,
    // });
  } catch (err) {
    handleStatusError(res, err);
  }
}

function createUrl(isDir: boolean, relativePath: string): string {
  return isDir
    ? `/${encodeURIComponent(relativePath)}`
    : `/api/file/${encodeURIComponent(relativePath)}`;
}
