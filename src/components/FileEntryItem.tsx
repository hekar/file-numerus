import React from "react";
import Link from "next/link";
import { ListItem, Link as ChakraLink, Stack } from "@chakra-ui/react";
import { FileEntry } from "../model/file-entry";
import FileEntryActions from "./FileEntryActions";

export type FileEntryProps = {
  entry: FileEntry;
};

export default function FileEntryItem({ entry }: FileEntryProps): JSX.Element {
  return (
    <ListItem key={entry.href}>
      <Stack direction="row">
        {<FileEntryActions entry={entry} />}
        <Link href={entry.href} passHref>
          <ChakraLink display="block" marginTop="12px" width="100%">
            {entry.name}
          </ChakraLink>
        </Link>
      </Stack>
    </ListItem>
  );
}
