export type FormFieldType = 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea' | 'select';

export type FormFieldOption = {
  label: string;
  value: string;
};

export type FormFieldProps = {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: FormFieldOption[];
  helpText?: string;
  error?: string;
};
