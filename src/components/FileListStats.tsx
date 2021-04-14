import { Box, Stack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import React from "react";
import { FileEntryListStats } from "../model/file-entry-list-stats";
import FileListStatItem from "./FileListStatItem";

export type FileListStatsProps = {
  stats: FileEntryListStats;
};

export default function FileListStats({
  stats,
}: FileListStatsProps): JSX.Element {
  return (
    <Stack direction="row" marginTop="16px">
      <FileListStatItem label="Total" count={stats.totalCount} />
      <FileListStatItem label="Files" count={stats.fileCount} />
      <FileListStatItem label="Folders" count={stats.folderCount} />
    </Stack>
  );
}
