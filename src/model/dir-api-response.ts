import { Breadcrumb } from "./breadcrumb";
import { FileEntry } from "./file-entry";
import { FileEntryListStats } from "./file-entry-list-stats";

export type DirApiResponse = {
  breadcrumbs: Array<Breadcrumb>;
  parentPath: string | undefined;
  path: string;
  entries: Array<FileEntry>;
  stats: FileEntryListStats;
};
