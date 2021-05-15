import {
  FileEntry,
  FileList,
  GetObjectOptions,
  GetObjectResult,
} from "./types";

export interface FileService {
  ls(key: string): Promise<FileList>;
  getEntry(key: string): Promise<FileEntry>;
  getObject(key: string, options?: GetObjectOptions): Promise<GetObjectResult>;
}
