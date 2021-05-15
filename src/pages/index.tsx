import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import React from "react";
import IndexWithSlug from "./[...slug]";

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<any>> => {
  context.req;
  return {
    props: {},
  };
};

const Index = () => {
  return <IndexWithSlug slug="/" />;
};

export default Index;
