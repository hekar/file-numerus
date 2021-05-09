export type FileEntry = {
  key: string;
  name: string;
  isDir: boolean;
  isSymLink: boolean;
}

export type FileList = {
  children: Array<FileEntry>
} & FileEntry
