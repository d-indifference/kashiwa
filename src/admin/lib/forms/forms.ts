import { FormCheckboxListOptions, FormInputOptions, FormSelectOptions, FormTextareaOptions } from '@admin/lib';

/**
 * Form objects renderer
 */
export class Forms {
  /**
   * Render form object as HTML string
   * @param formInstance Instance of object with `@Form()` decorator. Only decorated fields will be rendered.
   */
  public static render(formInstance: any): string {
    const formOptions = formInstance.constructor.prototype.formOptions;
    if (!formOptions) {
      throw new Error('Form decorator is required');
    }

    const formInputs = formInstance.constructor._formInputs || [];
    let formContent = '<table><tbody>';

    for (const input of formInputs) {
      const value = formInstance[input.propertyKey];
      const displayName = input.options.displayName;

      if (input.type === 'input') {
        formContent += this.processInput(input, value, displayName);
      } else if (input.type === 'select') {
        formContent += this.processSelect(input, value, displayName);
      } else if (input.type === 'password') {
        formContent += this.processPassword(input, displayName);
      } else if (input.type === 'textarea') {
        formContent += this.processTextarea(input, value, displayName);
      } else if (input.type === 'checkbox_list') {
        formContent += this.processCheckboxList(input, value, displayName);
      } else if (input.type === 'hidden') {
        formContent += this.processHidden(input, value);
      } else if (input.type === 'checkbox') {
        formContent += this.processCheckbox(input, value, displayName);
      }
    }

    formContent += '</tbody></table><div align="center"><input type="submit" value="Submit" size="28"></div>'.trim();

    return `<form method="${formOptions.method}" action="${formOptions.action}">${formContent}</form>`.trim();
  }

  /**
   * Template for attributes mapping
   */
  private static optionsToAttributes(options: object): string {
    return Object.entries(options)
      .filter(([key]) => key !== 'displayName')
      .map(([key, val]) => `${key}="${val}"`)
      .join(' ');
  }

  /**
   * Process a field with `@FormInput()` decorator
   */
  private static processInput(input: any, value: any, displayName: any): string {
    const inputOptions = input.options as FormInputOptions;
    const attrs = this.optionsToAttributes(inputOptions);

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td><input name="${input.propertyKey}" ${attrs} value="${value || ''}"></td>
    </tr>
    `.trim();
  }

  /**
   * Process a field with `@FormPassword()` decorator
   */
  private static processPassword(input: any, displayName: any): string {
    const inputOptions = input.options as FormInputOptions;
    const attrs = this.optionsToAttributes(inputOptions);

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td><input type="password" name="${input.propertyKey}" ${attrs}></td>
    </tr>
    `.trim();
  }

  /**
   * Process a field with `@FormSelect()` decorator
   */
  private static processSelect(input: any, value: any, displayName: any): string {
    const selectOptions = input.options as FormSelectOptions;
    let optionsHtml = '';

    for (const option of selectOptions.options) {
      const checkedAttr = option.checked ? ' checked="checked"' : '';
      const selectedAttr = option.value === value ? ' selected' : '';
      optionsHtml += `<option value="${option.value}"${checkedAttr}${selectedAttr}>${option.displayName}</option>`;
    }

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td>
    <select name="${input.propertyKey}">${optionsHtml}</select>
    </td>
    </tr>
    `.trim();
  }

  /**
   * Process a field with `@FormTextarea()` decorator
   */
  private static processTextarea(input: any, value: any, displayName: any): string {
    const inputOptions = input.options as FormTextareaOptions;
    const attrs = this.optionsToAttributes(inputOptions);

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td><textarea name="${input.propertyKey}" ${attrs}>${value || ''}</textarea></td>
    </tr>
    `.trim();
  }

  /**
   * Process a field with `@FormCheckboxList()` decorator
   */
  private static processCheckboxList(input: any, value: any, displayName: any): string {
    const inputOptions = input.options as FormCheckboxListOptions;
    let optionsHtml = '';
    const typedValue = value as any[];

    for (const inputValue of inputOptions.values) {
      let isChecked: boolean = false;

      if (inputValue.checked || typedValue.includes(inputValue.value)) {
        isChecked = true;
      }

      optionsHtml += `<input type="checkbox" name="${input.propertyKey}" value="${inputValue.value}" ${isChecked ? 'checked' : ''} id="${inputValue.value}">
                      <label for="${inputValue.value}">${inputValue.displayName}</label><br>`;
    }

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td>${optionsHtml}</td>
    </tr>
    `.trim();
  }

  /**
   * Process a field with `@FormHidden()` decorator
   */
  private static processHidden(input: any, value: any): string {
    return `<input type="hidden" name="${input.propertyKey}" value="${value || ''}">`;
  }

  /**
   * Process a field with `@FormCheckbox()` decorator
   */
  private static processCheckbox(input: any, value: any, displayName: any): string {
    const isChecked = value === true;

    return `
    <tr>
    <td class="postblock">${displayName}</td>
    <td><input type="checkbox" name="${input.propertyKey}" ${isChecked ? 'checked="checked"' : ''}></td>
    </tr>
    `.trim();
  }
}
