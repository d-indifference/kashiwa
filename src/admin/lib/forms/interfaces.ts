import { FormMethods } from './enums';

export interface FormOptions {
  action: string;
  method: FormMethods;
}

interface FormField {
  displayName: string;
}

export interface FormInputOptions extends FormField {
  type: string;
  size?: number;
}

export interface FormPasswordOptions extends FormField {
  size?: number;
}

export interface FormTextareaOptions extends FormField {
  rows?: number;
  cols?: number;
}

export interface FormSelectOptionOptions extends FormField {
  value: any;
  checked?: boolean;
}

export interface FormSelectOptions extends FormField {
  options: FormSelectOptionOptions[];
}

export interface FormCheckboxListOptionOptions extends FormField {
  name: string;
  value: any;
  checked?: boolean;
}

export interface FormCheckboxListOptions extends FormField {
  values: FormCheckboxListOptionOptions[];
}

export interface FormCheckboxOptions extends FormField {}
