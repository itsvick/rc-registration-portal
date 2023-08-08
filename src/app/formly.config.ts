import { FormlyFieldConfig } from "@ngx-formly/core";
import { PanelWrapperComponent } from "./forms/types/group.type";
import { FormlyHorizontalWrapper } from "./forms/types/horizontal.wrapper";
import { NullTypeComponent } from "./forms/types/null.type";
import { ArrayTypeComponent } from "./forms/types/array.type";
import { ObjectTypeComponent } from "./forms/types/object.type";
import { MultiSchemaTypeComponent } from "./forms/types/multischema.type";
import { AutocompleteTypeComponent } from "./forms/types/autocomplete.type";
import { FormlyFieldFile } from "./forms/types/file.type";
import { VerifyIndentityCode } from "./forms/types/verify-identity-no.type";
import { FormlyFieldNgSelect } from "./forms/types/multiselect.type";
import { DatepickerTypeComponent } from "./forms/types/datepicker-type.component";
import { FormlyColorInput } from "./forms/types/color.type";


//form validations
export function minItemsValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT have fewer than ${field.templateOptions.minItems} items`;
}

export function maxItemsValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT have more than ${field.templateOptions.maxItems} items`;
}

export function minlengthValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT be shorter than ${field.templateOptions.minLength} characters`;
}

export function maxlengthValidationMessage(err, field: FormlyFieldConfig) {
  return `should NOT be longer than ${field.templateOptions.maxLength} characters`;
}

export function minValidationMessage(err, field: FormlyFieldConfig) {
  return `should be >= ${field.templateOptions.min}`;
}

export function maxValidationMessage(err, field: FormlyFieldConfig) {
  return `should be <= ${field.templateOptions.max}`;
}

export function multipleOfValidationMessage(err, field: FormlyFieldConfig) {
  return `should be multiple of ${field.templateOptions.step}`;
}

export function exclusiveMinimumValidationMessage(err, field: FormlyFieldConfig) {
  return `should be > ${field.templateOptions.step}`;
}

export function exclusiveMaximumValidationMessage(err, field: FormlyFieldConfig) {
  return `should be < ${field.templateOptions.step}`;
}

export function constValidationMessage(err, field: FormlyFieldConfig) {
  return `should be equal to constant "${field.templateOptions.const}"`;
}

export function errValidatorMessage(error: any, field: FormlyFieldConfig) {
  return `Please Enter ${field.templateOptions.label}`;
}

export function patternValidatorMessage(error: any, field: FormlyFieldConfig) {
  return `Please enter a valid ${field.templateOptions.label}`;
}


export const formlyTypeConfig = {
  extras: { resetFieldOnHide: true },
  wrappers: [{ name: 'form-field-horizontal', component: FormlyHorizontalWrapper },
  { name: 'panel', component: PanelWrapperComponent }],
  validationMessages: [
    { name: 'required', message: errValidatorMessage },
    { name: 'pattern', message: patternValidatorMessage },

  ],
  types: [
    { name: 'string', extends: 'input' },
    {
      name: 'password',
      extends: 'input',
      defaultOptions: {
        templateOptions: {
          type: 'password'
        },
      }
    },
    {
      name: 'number',
      extends: 'input',
      defaultOptions: {
        templateOptions: {
          type: 'number',
        },
      },
    },
    {
      name: 'integer',
      extends: 'input',
      defaultOptions: {
        templateOptions: {
          type: 'number',
        },
      },
    },
    { name: 'boolean', extends: 'checkbox' },
    { name: 'enum', extends: 'select' },
    { name: 'null', component: NullTypeComponent, wrappers: ['form-field'] },
    { name: 'array', component: ArrayTypeComponent },
    { name: 'object', component: ObjectTypeComponent },
    { name: 'multischema', component: MultiSchemaTypeComponent },
    {
      name: 'autocomplete',
      component: AutocompleteTypeComponent
    },
    { name: 'file', component: FormlyFieldFile, wrappers: ['form-field'] },
    { name: 'verify-code', component: VerifyIndentityCode },
    { name: 'multiselect', component: FormlyFieldNgSelect },
    {
      name: 'datepicker',
      component: DatepickerTypeComponent
    },
    { name: 'color', component: FormlyColorInput },
  ],
};