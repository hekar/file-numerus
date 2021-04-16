import React, { FC, Fragment } from "react";
import { render } from "@testing-library/react";

const Providers: FC = ({ children }) => {
  return <Fragment>{children}</Fragment>;
};

const customRender = (ui: JSX.Element, options = {}) =>
  render(ui, { wrapper: Providers, ...options });

export * from "@testing-library/react";
export { customRender as render };
