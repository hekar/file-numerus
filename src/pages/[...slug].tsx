import React, { Fragment } from "react";
import Link from "next/link";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import useSWR from "swr";
import {
  Box,
  Container,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  List,
  ListItem,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { DirApiResponse } from "../model/dir-api-response";
import { FileEntry } from "../model/file-entry";

export type IndexWithSlugProps = {
  slug: string;
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<IndexWithSlugProps>> => {
  const slug: string =
    (Array.isArray(context.params?.slug)
      ? context.params?.slug.join("/")
      : context.params?.slug) ?? "/";
  return {
    props: {
      slug,
    },
  };
};

const IndexWithSlug = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const { data } = useSWR(slug, async () => {
    const response: AxiosResponse<DirApiResponse> = await axios.get(
      `/api/dir/${encodeURIComponent(slug)}`
    );
    return response;
  });

  const openFile = (entryPath: string) => {
    alert(entryPath);
  };

  const breadcrumbs = data ? (
    <Breadcrumb display="inline-block">
      {data.data.breadcrumbs.map(
        (breadcrumb): JSX.Element => {
          return (
            <BreadcrumbItem key={breadcrumb.href}>
              <BreadcrumbLink href={breadcrumb.href}>
                {breadcrumb.name}
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          );
        }
      )}
    </Breadcrumb>
  ) : undefined;

  const fileEntries = data?.data.entries.map((entry: FileEntry) => {
    return (
      <ListItem key={entry.href}>
        <Link href={entry.href} passHref>
          <ChakraLink display="block" marginTop="12px" width="100%">
            {entry.name}
          </ChakraLink>
        </Link>
      </ListItem>
    );
  });

  return (
    <Container height="100vh" maxW="container.xl" padding="40px">
      <Grid
        templateColumns="repeat(1, 2fr)"
        templateRows="160px 1fr 200px"
        gap={6}
      >
        <Box>
          <IconButton
            display="inline-block"
            marginRight="16px"
            aria-label="Back"
            icon={<ArrowBackIcon />}
          />
          {breadcrumbs}
          {data ? (
            <Stat
              marginTop="16px"
              maxWidth="160px"
              border="2px"
              borderRadius="4px"
              borderColor="gray.400"
              padding="20px"
            >
              <StatLabel>Number of Files</StatLabel>
              <StatNumber>{data?.data.entries.length}</StatNumber>
            </Stat>
          ) : undefined}
        </Box>
        <Box>
          <List>{fileEntries}</List>
        </Box>
        <DarkModeSwitch />
      </Grid>
    </Container>
  );
};

export default IndexWithSlug;
