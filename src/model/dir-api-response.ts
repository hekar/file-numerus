import { Breadcrumb } from "./breadcrumb";
import { FileEntry } from "./file-entry";

export type DirApiResponse = {
  breadcrumbs: Array<Breadcrumb>;
  path: string;
  entries: Array<FileEntry>;
};
