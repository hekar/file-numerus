import React from "react";
import { Box, IconButton } from "@chakra-ui/react";
import { CopyIcon, MinusIcon } from "@chakra-ui/icons";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FileEntry } from "../model/file-entry";

export type FileEntryActionsProps = {
  entry: FileEntry;
};

export default function FileEntryActions({
  entry,
}: FileEntryActionsProps): JSX.Element {
  if (entry.name === "." || entry.name === "..") {
    return <Box width="2.5rem"></Box>;
  } else if (entry.isDir) {
    return <MinusIcon width="2.5rem" />;
  } else {
    return (
      <CopyToClipboard text={entry.href}>
        <IconButton
          padding="0.5rem"
          height="0.5rem"
          background="none"
          aria-label="copy url to file"
          icon={<CopyIcon />}
        />
      </CopyToClipboard>
    );
  }
}