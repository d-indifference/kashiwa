import { FormMethods } from './enums';

/**
 * Options for `@Form` decorator
 */
export interface FormOptions {
  /** `<form action="...">` attribute */
  action: string;
  /** `<form method="...">` attribute */
  method: FormMethods;
}

/**
 * Base for form field
 */
interface FormField {
  /** `<td class="postblock">` nested value */
  displayName: string;
}

/**
 * Form field with `<input>` tag
 */
export interface FormInputOptions extends FormField {
  /** `<input type="...">` value */
  type: string;

  /** `<input size="...">` value */
  size?: number;
}

/**
 * Form field with `<input type="password">` tag.
 * This decorator skips every placed value on its rendering
 */
export interface FormPasswordOptions extends FormField {
  /** `<input size="...">` value */
  size?: number;
}

/**
 * Form field with `<textarea>` tag
 */
export interface FormTextareaOptions extends FormField {
  /** `<textarea rows="...">` value */
  rows?: number;
  /** `<input cols="...">` value */
  cols?: number;
}

/**
 * Options for `<option>` tag
 */
export interface FormSelectOptionOptions extends FormField {
  /** `<option>` nested value */
  value: any;
  /** Is checked by default if the field is empty */
  checked?: boolean;
}

/**
 * Form field with `<select>` tag
 */
export interface FormSelectOptions extends FormField {
  /** Nested `<option>` tags */
  options: FormSelectOptionOptions[];
}

/**
 * Form field for group member of `<input type="checkbox">` with the same names and different values
 */
export interface FormCheckboxListOptionOptions extends FormField {
  /** Checkbox name */
  name: string;
  /** `<input type="checkbox" value="...">` attribute */
  value: any;
  /** Is checked by default if the field is empty */
  checked?: boolean;
}

/**
 * Form field for group of `<input type="checkbox">` with the same names and different values
 */
export interface FormCheckboxListOptions extends FormField {
  /** Nested `<input type="checkbox">` tags */
  values: FormCheckboxListOptionOptions[];
}

/**
 * Form field with `<input type="checkbox">` tag with two states: `checked === true` and `non-checked === false`
 */
export interface FormCheckboxOptions extends FormField {}
