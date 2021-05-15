import { FileService } from "./file-service";
import {
  FileList,
  FileEntry,
  GetObjectOptions,
  GetObjectResult,
} from "./types";

export class S3FileService implements FileService {
  ls(_key: string): Promise<FileList> {
    throw new Error("Method not implemented.");
  }
  getEntry(_key: string): Promise<FileEntry> {
    throw new Error("Method not implemented.");
  }
  getObject(
    _key: string,
    _options?: GetObjectOptions
  ): Promise<GetObjectResult> {
    throw new Error("Method not implemented.");
  }
}
