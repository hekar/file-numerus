import React from "react";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import Link from "next/link";
import Head from "next/head";
import axios, { AxiosResponse } from "axios";
import useSWR from "swr";
import {
  Box,
  Container,
  Grid,
  List,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { DirApiResponse } from "../model/dir-api-response";
import { FileEntry } from "../model/file-entry";
import FileEntryItem from "../components/FileEntryItem";
import BreadcrumbList from "../components/BreadcrumbList";
import FileListStats from "../components/FileListStats";

export type IndexWithSlugProps = {
  slug: string;
  initialData?: DirApiResponse | undefined;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<IndexWithSlugProps>> => {
  const slug: string =
    (Array.isArray(context.params?.slug)
      ? context.params?.slug.join("/")
      : context.params?.slug) ?? "/";
  try {
    const socket = context.req.socket;
    const address = `http://${socket.localAddress}:${socket.localPort}`;
    const response: AxiosResponse<DirApiResponse> = await axios.get(
      `${address}/api/dir/${encodeURIComponent(slug)}`
    );
    return {
      props: {
        slug,
        initialData: response.data,
      },
    };
  } catch (err) {
    return {
      props: {
        slug,
      },
    };
  }
};

const IndexWithSlug = ({ slug, initialData }: IndexWithSlugProps) => {
  const { data } = useSWR(
    slug,
    async () => {
      const response: AxiosResponse<DirApiResponse> = await axios.get(
        `/api/dir/${encodeURIComponent(slug)}`
      );
      return response.data;
    },
    {
      initialData,
    }
  );

  const fileEntries = data?.entries.map((entry: FileEntry) => (
    <FileEntryItem entry={entry} />
  ));

  return (
    <>
      <Head>
        <title>- {slug}</title>
      </Head>
      <Container height="100vh" maxW="container.xl" padding="40px">
        <Grid
          templateColumns="repeat(1, 2fr)"
          templateRows="max-content 1fr"
          gap={6}
        >
          <Box>
            <Stack
              direction="row"
              alignContent="center"
              alignItems="center"
              wrap="wrap"
            >
              {data ? (
                <Link href={data.parentPath ?? ""} passHref>
                  <IconButton
                    display="inline-block"
                    marginRight="16px"
                    aria-label="Back"
                    icon={<ArrowBackIcon />}
                  />
                </Link>
              ) : undefined}
              {data ? (
                <BreadcrumbList breadcrumbs={data.breadcrumbs} />
              ) : undefined}
            </Stack>
            {data ? <FileListStats stats={data.stats} /> : undefined}
          </Box>
          <Box>
            <List>{fileEntries}</List>
          </Box>
          <DarkModeSwitch />
        </Grid>
      </Container>
    </>
  );
};

export default IndexWithSlug;
