import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { FileEntry } from "../../../model/file-entry";
import { Breadcrumb } from "../../../model/breadcrumb";
import { DirApiResponse } from "../../../model/dir-api-response";

const { serverRuntimeConfig } = getConfig();
const { directory } = serverRuntimeConfig;
const root = directory;

export default async function slug(
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


}
