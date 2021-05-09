import { FileEntry, FileList } from "./types";

export interface FileService {
  ls(key: string): Promise<FileList>
  getEntry(key: string): Promise<FileEntry>
  getObject(key: string): Promise<ReadableStream>
}
