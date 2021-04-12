export type FileEntry = {
  parent: string;
  relativePath: string;
  href: string;
  name: string;
  isDir: boolean;
  isSymLink: boolean;
};
