export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  disabled?: boolean;
  type?: 'button' | 'submit';
};

export function buttonClassName(variant: ButtonVariant = 'primary'): string {
  return `sp-button sp-button-${variant}`;
}
