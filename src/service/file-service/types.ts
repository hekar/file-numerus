import { ReadStream } from "node:fs";

export type FileEntry = {
  key: string;
  name: string;
  size: number;
  isDir: boolean;
  isSymLink: boolean;
};

export type FileList = {
  fileCount: number;
  folderCount: number;
  totalCount: number;
  children: Array<FileEntry>;
} & FileEntry;

export type GetObjectOptions = {
  start: number | undefined;
};

export type GetObjectResult = {
  size: number;
  readStream: ReadStream;
};
