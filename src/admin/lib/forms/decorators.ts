import {
  FormCheckboxListOptions,
  FormCheckboxOptions,
  FormInputOptions,
  FormOptions,
  FormPasswordOptions,
  FormSelectOptions,
  FormTextareaOptions
} from '@admin/lib';

/**
 * Decorator for mapping an object as HTML form
 */
export const Form = (options: FormOptions) => (constructor: CallableFunction) => {
  constructor.prototype.formOptions = options;
};

/**
 * Decorator for mapping a field as `<input>` tag
 */
export const FormInput = (options: FormInputOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'input');
};

/**
 * Decorator for mapping a field as `<input type="password">` tag.
 * The decorator passes any value written to this field from the render.
 */
export const FormPassword = (options: FormPasswordOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'password');
};

/**
 * Decorator for mapping a field as `<input type="hidden">` tag
 */
export const FormHidden = () => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, {}, 'hidden');
};

/**
 * Decorator for mapping a field as `<textarea>` tag
 */
export const FormTextarea = (options: FormTextareaOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'textarea');
};

/**
 * Decorator for mapping a field as `<select>` tag
 */
export const FormSelect = (options: FormSelectOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'select');
};

/**
 * Decorator for mapping a field as a list of checkboxes with the ability to select multiple values
 */
export const FormCheckboxList = (options: FormCheckboxListOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'checkbox_list');
};

/**
 * Decorator for mapping a field as `<input type="checkbox">` with two states (boolean) - `checked = true`, `unchecked = false`
 */
export const FormCheckbox = (options: FormCheckboxOptions) => (target: any, propertyKey: string) => {
  makeDecorator(target, propertyKey, options, 'checkbox');
};

/**
 * Template for making a decorator
 */
const makeDecorator = (target: any, propertyKey: any, options: any, type: string) => {
  if (!target.constructor._formInputs) {
    target.constructor._formInputs = [];
  }
  target.constructor._formInputs.push({ propertyKey, options, type });
};
