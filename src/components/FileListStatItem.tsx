import { Stat, StatLabel, StatNumber } from "@chakra-ui/react";

export type FileListStatItemProps = {
  label: string;
  count: number;
};

export default function FileListStatItem({
  label,
  count,
}: FileListStatItemProps): JSX.Element {
  return (
    <Stat
      maxWidth="160px"
      border="2px"
      borderRadius="4px"
      borderColor="gray.400"
      padding="20px"
    >
      <StatLabel>{label}</StatLabel>
      <StatNumber>{count}</StatNumber>
    </Stat>
  );
}
