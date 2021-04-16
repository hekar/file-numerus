import React from "react";
import { render, screen } from "../test-utils";
import FileListStatItem from "../../src/components/FileListStatItem";

describe("FileListStatItem", () => {
  it("should render the stat label", () => {
    render(<FileListStatItem label="my label" count={0} />);

    const heading = screen.getByText(/my label/i);

    expect(heading).toBeInTheDocument();
  });
});
