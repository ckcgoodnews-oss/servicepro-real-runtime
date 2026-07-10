export type StatCardProps = {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'flat';
  helperText?: string;
};
