import { Breadcrumb as BreadcrumbModel } from "../model/breadcrumb";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  useMediaQuery,
} from "@chakra-ui/react";

export type BreadcrumbListProps = {
  breadcrumbs: Array<BreadcrumbModel>;
};
export default function BreadcrumbList({
  breadcrumbs,
}: BreadcrumbListProps): JSX.Element {
  const [isLargerThan720] = useMediaQuery("(min-width: 720px)");
  return (
    <Breadcrumb>
      {breadcrumbs.map(
        (breadcrumb): JSX.Element => {
          return (
            <BreadcrumbItem key={breadcrumb.href}>
              <BreadcrumbLink
                href={breadcrumb.href}
                overflowX="hidden"
                whiteSpace="nowrap"
                maxWidth={isLargerThan720 ? "70vw" : "45vw"}
                wordBreak="break-all"
                textOverflow="ellipsis"
              >
                {breadcrumb.name}
              </BreadcrumbLink>
              <BreadcrumbSeparator />
            </BreadcrumbItem>
          );
        }
      )}
    </Breadcrumb>
  );
}
