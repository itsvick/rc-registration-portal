import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { TranslateService } from '@ngx-translate/core';
import { JSONSchema7 } from "json-schema";
import { combineLatest, forkJoin, of } from 'rxjs';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';
import { ToastMessageService } from '../services/toast-message/toast-message.service';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})


export class FormsComponent implements OnInit {
  @Input() form;
  @Input() modal;
  @Input() identifier;
  res: any;
  formSchema;
  responseData;
  schemaloaded = false;
  schema: JSONSchema7 = {
    "type": "object",
    "title": "",
    "definitions": {},
    "properties": {}
  };
  definitions = {};
  property = {};
  required = [];
  entityId: string;
  form2: FormGroup;
  model: any = {};
  options: FormlyFormOptions;
  fields: FormlyFieldConfig[];
  header = null;
  exLength: number = 0
  type: string;
  apiUrl: string;
  redirectTo: any;
  add: boolean;
  dependencies: any;
  privateFields = [];
  internalFields = [];
  privacyCheck: boolean = false;
  globalPrivacy;
  searchResult: any[];
  fileFields: any[] = [];
  propertyName: string;
  notes: any;
  langKey: string;
  headingTitle: string;
  description: string;
  submitBtnText: string;
  titleVal: string;
  isSignupForm: boolean = false;
  isPrefilledDataEditable: boolean = true;
  entityUrl: any;
  propertyId: any;
  entityName: string;
  sorder: any;
  isSubmitForm: boolean = false;
  properties = {};
  queryParams: any;
  isBFF: boolean = false;
  hideFieldFromSubmit = [];
  isLoading = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly toastMsg: ToastMessageService,
    private readonly router: Router,
    private readonly schemaService: SchemaService,
    private readonly formlyJsonschema: FormlyJsonschema,
    private readonly generalService: GeneralService
  ) { }

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams])
      .subscribe(([params, queryParams]) => {
        this.add = this.router.url.includes('add');

        if (params['form'] != undefined) {
          this.form = params['form'].split('/', 1)[0];
          this.identifier = params['form'].split('/', 2)[1];
        }

        if (params['id'] != undefined) {
          this.identifier = params['id']
        }
        if (params['modal'] != undefined) {
          this.modal = params['modal']
        }

        this.queryParams = queryParams;
        console.log("QueryParams", queryParams);

      });

    this.entityName = localStorage.getItem('entity');

    this.schemaService.getFormJSON().subscribe((FormSchemas) => {
      let filtered = FormSchemas.forms.filter(obj => {
        return Object.keys(obj)[0] === this.form
      })
      this.formSchema = filtered[0][this.form];
      this.isBFF = !!this.formSchema.isBFF;

      if (this.formSchema.api) {
        this.apiUrl = this.formSchema.api;
        this.entityUrl = this.formSchema.api;
      }

      if (this.formSchema.header) {
        this.header = this.formSchema.header
      }

      if (this.formSchema.isSignupForm) {
        this.isSignupForm = this.formSchema.isSignupForm;
      }

      if (this.formSchema.isPrefilledDataEditable) {
        this.isPrefilledDataEditable = this.formSchema.isPrefilledDataEditable === "true";
      }

      if (this.formSchema.title) {
        this.headingTitle = this.translate.instant(this.formSchema.title);
      }

      if (this.formSchema.description) {
        this.description = this.translate.instant(this.formSchema.description);
      }

      if (this.formSchema.submitBtnText) {
        const btnText = this.formSchema?.submitBtnText || "SUBMIT";
        this.submitBtnText = this.translate.instant(btnText);
      }

      if (this.formSchema.redirectTo) {
        this.redirectTo = this.formSchema.redirectTo;
      }

      if (this.formSchema.type) {
        this.type = this.formSchema.type;
      }

      if (this.formSchema.langKey) {
        this.langKey = this.formSchema.langKey;
      }

      if (this.type != 'entity') {
        this.propertyName = this.type.split(":")[1];
        this.propertyId = this.identifier;
        this.getEntityData(this.apiUrl);
      }

      this.schemaService.getSchemas().subscribe((res) => {
        this.responseData = res;
        this.formSchema.fieldsets.forEach(fieldset => {
          if (fieldset.hasOwnProperty('privacyConfig')) {
            this.privacyCheck = true;
            this.privateFields = (this.responseData.definitions[fieldset.privacyConfig].hasOwnProperty('privateFields') ? this.responseData.definitions[fieldset.privacyConfig].privateFields : []);
            this.internalFields = (this.responseData.definitions[fieldset.privacyConfig].hasOwnProperty('internalFields') ? this.responseData.definitions[fieldset.privacyConfig].internalFields : []);
          }

          this.getData();
          this.definitions[fieldset.definition] = {}
          this.definitions[fieldset.definition]['type'] = "object";
          if (fieldset.title) {
            this.definitions[fieldset.definition]['title'] = this.generalService.translateString(this.langKey + '.' + fieldset.title);
          }

          if (fieldset?.required?.length) {
            this.definitions[fieldset.definition]['required'] = fieldset.required;
          }

          if (fieldset.dependencies) {
            Object.keys(fieldset.dependencies).forEach((key) => {
              let above13 = fieldset.dependencies[key];
              if (typeof (above13) === 'object') {
                Object.keys(above13).forEach((key1) => {
                  let oneOf = above13[key1];

                  if (oneOf.length) {
                    for (let i = 0; i < oneOf.length; i++) {

                      if (oneOf[i].hasOwnProperty('properties')) {
                        Object.keys(oneOf[i].properties).forEach((key2) => {
                          let pro = oneOf[i].properties[key2];

                          if (pro.hasOwnProperty('properties')) {
                            Object.keys(pro['properties']).forEach((key3) => {
                              console.log(pro.properties[key3]);
                              if (pro.properties[key3].hasOwnProperty('title')) {
                                fieldset.dependencies[key][key1][i].properties[key2].properties[key3]['title'] = this.translate.instant(pro.properties[key3].title);
                              }
                            });
                          }
                        });
                      }
                    }
                  }
                })
              }
            });
            this.dependencies = fieldset.dependencies;
          }

          this.definitions[fieldset.definition].properties = {};
          this.property[fieldset.definition] = {};
          this.property = this.definitions[fieldset.definition].properties;

          if (fieldset.formclass) {
            this.schema['widget'] = {};
            this.schema['widget']['formlyConfig'] = { fieldGroupClassName: fieldset.formclass }
          }

          if (fieldset.fields[0] === "*") {
            this.definitions = this.responseData.definitions;
            this.property = this.definitions[fieldset.definition].properties;
            fieldset.fields = this.property;
          }
          this.addFields(fieldset);
          this.properties = { ...this.properties, ...this.definitions[fieldset.definition].properties };

          if (fieldset.except) {
            this.removeFields(fieldset)
          }
        });

        this.schema["type"] = "object";
        this.schema["title"] = this.formSchema.title;
        this.schema["definitions"] = this.definitions;
        this.schema["properties"] = this.properties;
        this.schema["required"] = this.required;
        this.schema["dependencies"] = this.dependencies;
        this.loadSchema();
      }, (error) => {
        this.toastMsg.error('error', this.translate.instant('SOMETHING_WENT_WRONG_WITH_SCHEMA_URL'))
      });

    }, (error) => {
      this.toastMsg.error('error', 'forms.json not found in src/assets/config/ - You can refer to examples folder to create the file')
    })
  }

  loadSchema() {
    this.form2 = new FormGroup({});
    this.options = {};
    this.fields = [this.formlyJsonschema.toFieldConfig(this.schema)];

    if (this.privacyCheck) {
      this.visilibity(this.fields);
    }

    if (this.headingTitle) {
      this.fields[0].templateOptions.label = '';
    }

    if (this.add) {
      this.model = {};
    }

    if (this.queryParams) {
      this.model = { ...this.model, ...this.queryParams };

      if (!this.isPrefilledDataEditable) {
        const fieldsToDisable = Object.keys(this.queryParams)
        this.fields[0].fieldGroup.forEach((item: any) => {
          if (fieldsToDisable.includes(item.key)) {
            item.templateOptions.disabled = true;
          }
        })
      }
    }

    this.schemaloaded = true;
  }

  visilibity(fields) {
    if (fields?.[0]?.fieldGroup?.[0]?.type == "object") {
      fields[0].fieldGroup.forEach(fieldObj => {

        if (this.privateFields.length || this.internalFields.length) {
          let label = fieldObj.templateOptions.label;
          let key = fieldObj.key.replace(/^./, fieldObj.key[0].toUpperCase());

          if (this.schema.definitions[key] && this.schema.definitions[key].hasOwnProperty('description')) {
            let desc = this.checkString(fieldObj.key, this.schema.definitions[key]['description']);
            fieldObj.templateOptions.label = (label ? label : desc);
          }

          if (this.privateFields.indexOf('$.' + fieldObj.key) >= 0) {
            fieldObj.templateOptions['addonRight'] = {
              class: "private-access d-flex flex-column",
              text: this.translate.instant('ONLY_BY_CONSENT')
            }
            fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
          } else if (this.internalFields.indexOf('$.' + fieldObj.key) >= 0) {
            fieldObj.templateOptions['addonRight'] = {
              class: "internal-access d-flex flex-column",
              text: this.translate.instant('ONLY_BY_ME')
            }
            fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
          }
        } else {
          fieldObj.templateOptions['addonRight'] = {
            class: "public-access d-flex flex-column",
            text: this.translate.instant('ANYONE')
          }
          fieldObj.templateOptions.description = this.translate.instant('VISIBILITY_ATTRIBUTE_DEFINE');
        }
      });
    } else {
      if (this.privateFields.indexOf('$.' + fields[0].fieldGroup[0].key) >= 0) {
        this.globalPrivacy = 'private-access';

      } else if (this.internalFields.indexOf('$.' + fields[0].fieldGroup[0].key) >= 0) {
        this.globalPrivacy = 'internal-access';
      } else if (!this.privateFields.length && !this.internalFields.length) {
        this.globalPrivacy = 'public-access';
      }
    }
  }

  checkProperty(fieldset, field) {
    this.definitions[field.children.definition] = this.responseData.definitions[field.children.definition];
    let refProperties = {}
    let refRequired = []
    if (field.children.fields && field.children.fields.length > 0) {
      field.children.fields.forEach(refField => {

        this.addWidget(field.children, refField, field.name);

        if (refField.required) {
          refRequired.push(refField.name)
        }

        refProperties[refField.name] = this.responseData.definitions[field.children.definition].properties[refField.name];
      });

      if (this.responseData.definitions[fieldset.definition].properties.hasOwnProperty(field.name)) {
        this.responseData.definitions[fieldset.definition].properties[field.name].properties = refProperties;
      } else {
        this.responseData.definitions[fieldset.definition].properties = refProperties;
      }
      this.definitions[field.children.definition].properties = refProperties;
      this.definitions[field.children.definition].required = refRequired;
    }
  }

  nestedChild(fieldset, fieldName, res) {
    let tempArr = res;

    let tempArrFields = [];
    let nestedArr = [];

    for (const key in tempArr) {
      if (tempArr[key].hasOwnProperty('type') && tempArr[key].type == 'string') {
        if (tempArr[key].type == 'string') {
          tempArrFields.push({ 'name': key, 'type': tempArr[key].type });
        }
      } else {
        let res = this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key];
        if (res.hasOwnProperty('properties') || res.hasOwnProperty('$ref')) {
          this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key].properties = tempArr[key].properties;

          for (const key1 in tempArr[key].properties) {
            nestedArr.push({ 'name': key1, 'type': tempArr[key].properties[key1].type });
          };
          delete this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key]['$ref'];

          let temp2 = {
            children: {
              definition: fieldName.replace(/^./, fieldName[0].toUpperCase()) + '.properties.' + key,
              fields: nestedArr
            },
            name: key.toLowerCase()
          }

          tempArrFields.push(temp2);
          temp2.children.fields.forEach(reffield => {
            this.addChildWidget(reffield, fieldName, key);

          });
        } else {
          delete this.responseData.definitions[fieldName.replace(/^./, fieldName[0].toUpperCase())].properties[key];
        }
      }
    }
    let temp_field = {
      children: {
        definition: fieldName.replace(/^./, fieldName[0].toUpperCase()),
        fields: tempArrFields
      },
      name: fieldName
    }
    this.checkProperty(fieldset, temp_field);
  }

  addFields(fieldset) {

    if (fieldset.fields.length) {

      fieldset.fields.forEach(field => {

        if (this.responseData.definitions[fieldset.definition] && this.responseData.definitions[fieldset.definition].hasOwnProperty('properties')) {
          if (field.children) {
            this.checkProperty(fieldset, field);

            if (this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('properties')) {
              Object.keys(this.responseData.definitions[fieldset.definition].properties[field.name].properties).forEach((key) => {
                if (this.responseData.definitions[fieldset.definition].properties[field.name].properties[key].hasOwnProperty('properties')) {
                  Object.keys(this.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties).forEach((key1) => {
                    this.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties[key1].title = this.checkString(key1, this.responseData.definitions[fieldset.definition].properties[field.name].properties[key].properties[key1].title);
                  });
                }
                console.log(key);
              });
            }


          } else if (this.responseData.definitions[fieldset.definition].properties.hasOwnProperty(field.name) && this.responseData.definitions[fieldset.definition].properties[field.name].hasOwnProperty('properties')) {
            let res = this.responseData.definitions[fieldset.definition].properties[field.name].properties;
            this.nestedChild(fieldset, field.name, res);
          }
        }

        if (field?.validation?.hasOwnProperty('message')) {
          field.validation['message'] = this.translate.instant(field.validation.message);
        }

        if (field?.children?.fields) {
          for (let i = 0; i < field.children.fields.length; i++) {
            if (field.children.fields[i].hasOwnProperty('validation') && field.children.fields[i].validation.hasOwnProperty('message')) {
              field.children.fields[i].validation['message'] = this.translate.instant(field.children.fields[i].validation.message);
              this.responseData.definitions[fieldset.definition].properties[field.name].properties[field.children.fields[i].name]['widget']['formlyConfig']['validation']['messages']['pattern'] = this.translate.instant(field.children.fields[i].validation.message);
            }
          }
        }

        if (field.custom && field.element) {
          this.responseData.definitions[fieldset.definition].properties[field.name] = field.element;
          if (field.element.hasOwnProperty('title')) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['title'] = this.translate.instant(field.element.title);
            const placeholder = this.responseData.definitions[fieldset.definition].properties[field.name]?.widget?.formlyConfig?.templateOptions?.placeholder;
            if (placeholder) {
              this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant(placeholder);
            }
          }
        } else {
          this.addWidget(fieldset, field, '')
        }

        this.definitions[fieldset.definition].properties[field.name] = this.responseData.definitions[fieldset.definition].properties[field.name];

        if (field.children && !field.children.title) {
          if (this.property[field.name].title) {
            delete this.property[field.name].title;
          }
          if (this.property[field.name].description) {
            delete this.property[field.name].description;
          }
        }

        if(field.hideFieldFromSubmit) {
          this.hideFieldFromSubmit.push(field.name);
        }
      });
    } else {
      let res = this.responseData.definitions[fieldset.definition].properties;
      this.nestedChild(fieldset, fieldset.definition, res);
    }
  }

  removeFields(fieldset) {
    fieldset.except.forEach(field => {
      delete this.definitions[fieldset.definition].properties[field];
    });
  }

  addLockIcon(responseData) {
    if (responseData.access == 'private' && responseData.widget.formlyConfig.templateOptions['type'] != "hidden") {
      if (!responseData.widget.formlyConfig.templateOptions['addonRight']) {
        responseData.widget.formlyConfig.templateOptions['addonRight'] = {}
      }
      if (!responseData.widget.formlyConfig.templateOptions['attributes']) {
        responseData.widget.formlyConfig.templateOptions['attributes'] = {}
      }
      responseData.widget.formlyConfig.templateOptions['addonRight'] = {
        class: "private-access",
        text: this.translate.instant('ONLY_BY_CONSENT')

      }
      responseData.widget.formlyConfig.templateOptions['attributes'] = {
        style: "width: 100%;"
      }

    } else if (responseData.access == 'internal' && responseData.widget.formlyConfig.templateOptions['type'] != "hidden") {
      if (!responseData.widget.formlyConfig.templateOptions['addonRight']) {
        responseData.widget.formlyConfig.templateOptions['addonRight'] = {}
      }
      if (!responseData.widget.formlyConfig.templateOptions['attributes']) {
        responseData.widget.formlyConfig.templateOptions['attributes'] = {}
      }
      responseData.widget.formlyConfig.templateOptions['addonRight'] = {
        class: "internal-access",
        text: this.translate.instant('ONLY_BY_ME')

      }
      responseData.widget.formlyConfig.templateOptions['attributes'] = {
        style: "width: 100%;"
      }
    }
  }

  checkString(conStr, title) {
    this.translate.get(this.langKey + '.' + conStr).subscribe(res => {
      let constr = this.langKey + '.' + conStr;
      if (res != constr) {
        this.titleVal = res;
      } else {
        this.titleVal = title;
      }
    });
    return this.titleVal;
  }

  addWidget(fieldset, field, childrenName) {
    this.translate.get(this.langKey + '.' + field.name).subscribe(res => {
      let constr = this.langKey + '.' + field.name;
      if (res != constr) {
        this.responseData.definitions[fieldset.definition].properties[field.name].title = this.generalService.translateString(this.langKey + '.' + field.name);
      }
    })

    if (field.widget) {
      this.responseData.definitions[fieldset.definition].properties[field.name]['widget'] = field.widget;
    }
    else {
      this.res = this.responseData.definitions[fieldset.definition].properties[field.name];

      if (this.res && !this.res.hasOwnProperty('properties')) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget'] = {
          "formlyConfig": {
            "templateOptions": {
            },
            "validation": {},
            "expressionProperties": {},
            "modelOptions": {}
          }
        }

        if (field.placeholder) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.generalService.translateString(this.langKey + '.' + field.placeholder);
        }

        if (field.description) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['description'] = this.generalService.translateString(this.langKey + '.' + field.description);
        }

        if (field.classGroup) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['fieldGroupClassName'] = field.classGroup;
        }
        if (field.expressionProperties) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['expressionProperties'] = field.expressionProperties;
        }
        if (field.class) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['className'] = field.class;
        }

        if (this.responseData.definitions[fieldset.definition].properties[field.name]?.items?.hasOwnProperty('properties')) {
          Object.keys(this.responseData.definitions[fieldset.definition].properties[field.name].items.properties).forEach((key) => {
            this.responseData.definitions[fieldset.definition].properties[field.name].items.properties[key].title = this.checkString(key, this.responseData.definitions[fieldset.definition].properties[field.name].items.properties[key].title);
          });
        }

        if (field.hidden) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = "hidden";
          delete this.responseData.definitions[fieldset.definition].properties[field.name]['title'];
        }
        if (field.required || field.children) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['required'] = field.required;
        }
        if (field.children) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['required'] = true;
        }
        if (field.format && field.format === 'file') {
          if (this.type?.includes("property")) {
            localStorage.setItem('property', this.type.split(":")[1]);
          }
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.format;
          if (field.multiple) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['multiple'] = field.multiple;
          }
          this.fileFields.push(field.name);
        }

        if (this.privacyCheck && this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] != "hidden" && (this.privateFields.indexOf('$.' + childrenName) < 0) && (this.internalFields.indexOf('$.' + childrenName) < 0)) {
          if (this.privateFields.length || this.internalFields.length) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions'] = {
              addonRight: {
                class: "public-access",
                text: this.translate.instant('ANYONE'),
              },
              attributes: {
                style: "width: 90%; "
              },
            }
          }
        }

        if (field.validation) {
          if (field.validation.message) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['validation'] = {
              "messages": {
                "pattern": field.validation.message
              }
            }
            if (field.validation.pattern) {
              this.responseData.definitions[fieldset.definition].properties[field.name]['pattern'] = field.validation.pattern;
            }
          }
          if (field.validation.lessThan || field.validation.greaterThan) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
              updateOn: 'blur'
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {
              [field.name]: {
                expression: (control: FormControl) => {
                  if (control.value != null) {
                    if (field.type === 'date') {
                      if (this.model[field.validation.lessThan]) {
                        if ((new Date(this.model[field.validation.lessThan])).valueOf() > (new Date(control.value)).valueOf()) {
                          return of(control.value);
                        }
                        return of(false);
                      } else if (this.model[field.validation.greaterThan]) {
                        if ((new Date(this.model[field.validation.greaterThan])).valueOf() < (new Date(control.value)).valueOf()) {
                          return of(control.value);
                        }
                        return of(false);
                      }
                    }
                    else {
                      if (this.model[field.validation.lessThan]) {
                        if (this.model[field.validation.lessThan] > control.value) {
                          return of(control.value);
                        }
                        return of(false);
                      }
                      else if (this.model[field.validation.greaterThan]) {
                        if (this.model[field.validation.greaterThan] < control.value) {
                          return of(control.value);
                        }
                        return of(false);
                      }
                      return of(false);
                    }
                  }
                  return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve(true);
                    }, 1000);
                  });
                }
              }
            }
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['message'] = field.validation.message;
          }
        }
      }
      if (field.autofill) {
        if (field.autofill.apiURL) {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
            updateOn: 'blur'
          };
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {
            [field.name]: {
              expression: (control: FormControl) => {
                if (control.value != null) {
                  if (field.autofill.method === 'GET') {
                    let apiurl = field.autofill.apiURL.replace("{{value}}", control.value)
                    this.generalService.getPrefillData(apiurl).subscribe((res) => {
                      if (field.autofill.fields) {
                        field.autofill.fields.forEach(element => {
                          for (let [key1, value1] of Object.entries(element)) {
                            this.generalService.createPath(this.model, key1, this.generalService.ObjectbyString(res, value1))
                            this.form2.get(key1).setValue(this.generalService.ObjectbyString(res, value1))
                          }
                        });
                      }
                      if (field.autofill.dropdowns) {
                        field.autofill.dropdowns.forEach(element => {
                          for (let [key1, value1] of Object.entries(element)) {
                            if (Array.isArray(res)) {
                              res = res[0]
                            }
                            this.schema["properties"][key1]['items']['enum'] = this.generalService.ObjectbyString(res, value1)
                          }
                        });
                      }
                    });
                  }
                  else if (field.autofill.method === 'POST') {
                    let datapath = this.generalService.findPath(field.autofill.body, "{{value}}", '')
                    if (datapath) {
                      let dataobject = this.generalService.setPathValue(field.autofill.body, datapath, control.value)
                      this.generalService.postPrefillData(field.autofill.apiURL, dataobject).subscribe((res) => {
                        if (Array.isArray(res)) {
                          res = res[0]
                        }
                        if (field.autofill.fields) {
                          field.autofill.fields.forEach(element => {

                            for (let [key1, value1] of Object.entries(element)) {
                              this.generalService.createPath(this.model, key1, this.generalService.ObjectbyString(res, value1))
                              this.form2.get(key1).setValue(this.generalService.ObjectbyString(res, value1))
                            }
                          });
                        }
                        if (field.autofill.dropdowns) {
                          field.autofill.dropdowns.forEach(element => {
                            for (let [key1, value1] of Object.entries(element)) {
                              this.schema["properties"][key1]['items']['enum'] = this.generalService.ObjectbyString(res, value1)
                            }
                          });
                        }
                      });
                    }
                  }
                }
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    resolve(true);
                  }, 1000);
                });
              }
            }
          }
        }
      }
      if (field.autocomplete) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = "autocomplete";
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.generalService.translateString(this.responseData.definitions[fieldset.definition].properties[field.name]['title']);
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['label'] = field.autocomplete.responseKey;
        let dataval = "{{value}}"
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['search$'] = (term) => {
          if (term || term != '') {
            let datapath = this.generalService.findPath(field.autocomplete.body, dataval, '');
            this.generalService.setPathValue(field.autocomplete.body, datapath, term);
            dataval = term;
            this.generalService.postData(field.autocomplete.apiURL, field.autocomplete.body).subscribe((res) => {
              let items = res;
              items = items.filter(x => x[field.autocomplete.responseKey].toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1);
              if (items) {
                this.searchResult = items;
                return of(this.searchResult);
              }
            });
          }
          return of(this.searchResult);
        }
      }
      if (field.type) {

        if (field.type === 'verify-code') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
        }

        if (field.type === 'multiselect') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['type'] = field.type;
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['multiple'] = true;
          if (field.required) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name) + "*";
          } else {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['placeholder'] = this.translate.instant("SELECT") + ' ' + this.generalService.translateString(this.langKey + '.' + field.name);
          }

          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'] = [];
          this.responseData.definitions[fieldset.definition].properties[field.name]['items']['enum'].forEach(enumVal => {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['options'].push({ label: enumVal, value: enumVal })
          });
        }
        else if (field.type === 'date') {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = 'date';
          if (field?.validation?.future == false) {
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['modelOptions'] = {
              updateOn: 'blur'
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'] = {
              [field.name]: {
                expression: (control: FormControl) => {
                  if (control.value != null) {
                    if ((new Date(control.value)).valueOf() < Date.now()) {
                      return of(control.value);
                    } else {
                      return of(false);
                    }
                  }
                  return new Promise((resolve, reject) => {
                    setTimeout(() => {
                      resolve(true);
                    }, 1000);
                  });
                }
              }
            };
            this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['asyncValidators'][field.name]['message'] = this.translate.instant('DATE_MUST_BIGGER_TO_TODAY_DATE');
          }
        }
        else {
          this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['type'] = field.type;
        }
      }
      if (field.disabled || field.disable) {
        this.responseData.definitions[fieldset.definition].properties[field.name]['widget']['formlyConfig']['templateOptions']['disabled'] = field.disabled
      };


      if ((this.privateFields.indexOf('$.' + childrenName) < 0) || (this.internalFields.indexOf('$.' + childrenName) < 0)) {

        let temp_access_field = '$.' + childrenName + '.' + field.name;

        if (this.privateFields.includes(temp_access_field) && (this.privateFields.indexOf('$.' + childrenName) < 0)) {
          this.responseData.definitions[fieldset.definition].properties[field.name].access = 'private';
          this.addLockIcon(this.responseData.definitions[fieldset.definition].properties[field.name]);


        } else if (this.internalFields.includes(temp_access_field) && (this.internalFields.indexOf('$.' + childrenName) < 0)) {
          this.responseData.definitions[fieldset.definition].properties[field.name].access = 'internal';
          this.addLockIcon(this.responseData.definitions[fieldset.definition].properties[field.name]);
        }
      }
    }
  }

  addChildWidget(field, ParentName, childrenName) {
    this.res = this.responseData.definitions[ParentName.replace(/^./, ParentName[0].toUpperCase())].properties[childrenName];
    this.res.properties[field.name].title = this.checkString(field.name, this.res.properties[field.name].title);
    if (field.widget) {
      this.res.properties[field.name]['widget'] = field.widget;
    }
    else {

      this.res.properties[field.name]['widget'] = {
        "formlyConfig": {
          "templateOptions": {},
          "validation": {},
          "expressionProperties": {}
        }
      }

      if (this.privacyCheck && (this.privateFields.indexOf('$.' + ParentName) < 0) && (this.internalFields.indexOf('$.' + ParentName) < 0)) {
        if (!this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight']) {
          this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight'] = {}
        }
        if (!this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes']) {
          this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes'] = {}
        }
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['addonRight'] = {
          class: "public-access",
          text: this.translate.instant('ANYONE')
        }
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['attributes'] = {
          style: "width: 90%;"
        }
      }

      if (field.disabled || field.disable) {
        this.res.properties[field.name]['widget']['formlyConfig']['templateOptions']['disabled'] = field.disabled;
      };

      let temp_access_field = '$.' + ParentName + '.' + childrenName + '.' + field.name;

      if ((this.privateFields.indexOf('$.' + ParentName) < 0) || (this.privateFields.indexOf('$.' + ParentName) < 0)) {

        if (this.privateFields.includes(temp_access_field)) {
          this.res.properties[field.name].access = 'private';
          this.addLockIcon(this.res.properties[field.name]);

        } else if (this.internalFields.includes(temp_access_field)) {
          this.res.properties[field.name].access = 'internal';
          this.addLockIcon(this.res.properties[field.name]);
        }
      }

      this.responseData.definitions[ParentName.replace(/^./, ParentName[0].toUpperCase())].properties[childrenName] = this.res;
    }
  };

  submit() {
    this.isSubmitForm = true;
    this.isLoading = true;
    console.log("model", this.model);

    if (this.hideFieldFromSubmit.length) {
      this.hideFieldFromSubmit.forEach(item => {
        if(this.model.hasOwnProperty(item)) {
          delete this.model[item];
        }
      });
    }

    console.log("model", this.model);
    if (this.fileFields.length > 0) {
      this.fileFields.forEach(fileField => {
        if (this.model[fileField]) {
          let formData = new FormData();
          for (let i = 0; i < this.model[fileField].length; i++) {
            const file = this.model[fileField][i]
            formData.append("files", file);
          }

          let property;
          if (this.type && this.type.includes("property")) {
            property = this.type.split(":")[1];
          }

          let id = (this.entityId) ? this.entityId : this.identifier;
          let url = [this.apiUrl, id, property, 'documents']
          this.generalService.postData(url.join('/'), formData).subscribe((res) => {
            let documents_list: any[] = [];
            let documents_obj = {
              "fileName": "",
              "format": "file"
            }
            res.documentLocations.forEach(element => {
              documents_obj.fileName = element;
              documents_list.push(documents_obj);
            });

            this.model[fileField] = documents_list;
            if (this.type && this.type === 'entity') {
              if (this.identifier != null) {
                this.updateData()
              } else {
                this.postData()
              }
            }
            else if (this.type && this.type.includes("property")) {
              let property = this.type.split(":")[1];
              let url;
              if (this.identifier != null && this.entityId != undefined) {
                url = [this.apiUrl, this.entityId, property, this.identifier];
              } else {
                url = [this.apiUrl, this.identifier, property];
              }

              this.apiUrl = (url.join("/"));
              if (this.model[property]) {
                this.model = this.model[property];
              }

              this.postData();

              if (this.model.hasOwnProperty('attest') && this.model['attest']) {
                this.raiseClaim(property);
              }
            }
          }, (err) => {
            console.log(err);
            this.toastMsg.error('error', this.translate.instant('SOMETHING_WENT_WRONG'))
          });
        }
        else {
          if (this.type && this.type === 'entity') {

            if (this.identifier != null) {
              this.updateData()
            } else {
              this.postData()
            }
          }
          else if (this.type && this.type.includes("property")) {
            let property = this.type.split(":")[1];

            let url;
            if (this.identifier != null && this.entityId != undefined) {
              url = [this.apiUrl, this.entityId, property, this.identifier];
            } else {
              url = [this.apiUrl, this.identifier, property];
            }

            this.apiUrl = (url.join("/"));
            if (this.model[property]) {
              this.model = this.model[property];
            }

            if (this.identifier != null && this.entityId != undefined) {
              this.updateClaims()
            } else {
              this.postData()
            }

            if (this.model.hasOwnProperty('attest') && this.model['attest']) {
              this.raiseClaim(property);
            }
          }
        }
      });
    }
    else {
      if (this.type && this.type === 'entity') {

        if (this.identifier != null) {
          this.updateData()
        } else {
          this.postData()
        }
      }
      else if (this.type && this.type.includes("property")) {
        let property = this.type.split(":")[1];

        let url;
        if (this.identifier != null && this.entityId != undefined) {
          url = [this.apiUrl, this.entityId, property, this.identifier];
        } else {
          url = [this.apiUrl, this.identifier, property];
        }

        this.apiUrl = (url.join("/"));
        if (this.model[property]) {
          this.model = this.model[property];
        }

        if (this.identifier != null && this.entityId != undefined) {
          this.updateClaims()
        } else {
          this.postData()
        }

        if (this.model.hasOwnProperty('attest') && this.model['attest']) {
          this.raiseClaim(property);
        }

      }
    }
  }

  async raiseClaim(property) {
    setTimeout(() => {
      this.generalService.getData(this.entityUrl).subscribe((res) => {
        res = (res[0]) ? res[0] : res;
        this.entityId = res.osid;
        if (res.hasOwnProperty(property)) {

          if (!this.propertyId && !this.sorder) {
            res[property].sort((a, b) => (b.sorder) - (a.sorder));
            this.propertyId = res[property][0]["osid"];
          }

          if (this.sorder) {
            let result = res[property].filter(obj => {
              return obj.sorder === this.sorder
            });

            this.propertyId = result[0]["osid"];
          }

          let temp = {};
          temp[property] = [this.propertyId];
          let propertyUniqueName = this.entityName.toLowerCase() + property.charAt(0).toUpperCase() + property.slice(1);
          propertyUniqueName = (this.entityName == 'student' || this.entityName == 'Student') ? 'studentInstituteAttest' : propertyUniqueName;
          let data = {
            "entityName": this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1),
            "entityId": this.entityId,
            "name": propertyUniqueName,
            "propertiesOSID": temp,
            "additionalInput": {
              "notes": this.model['notes']
            }
          }
          this.sentToAttestation(data);
        }
      });
    }, 1000);

  }

  sentToAttestation(data) {
    this.generalService.attestationReq('/send', data).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL') {
        this.router.navigate([this.redirectTo])
      }
      else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg);
        this.isSubmitForm = false;
      }
    }, (err) => {
      this.toastMsg.error('error', err.error.params.errmsg);
      this.isSubmitForm = false;
    });

  }


  getNotes() {
    let entity = this.entityName.charAt(0).toUpperCase() + this.entityName.slice(1);
    this.generalService.getData(entity).subscribe((res) => {
      res = (res[0]) ? res[0] : res;
      let propertyUniqueName = this.entityName.toLowerCase() + this.propertyName.charAt(0).toUpperCase() + this.propertyName.slice(1);
      propertyUniqueName = (this.entityName == 'student' || this.entityName == 'Student') ? 'studentInstituteAttest' : propertyUniqueName;

      if (res.hasOwnProperty(propertyUniqueName)) {
        let attestionRes = res[propertyUniqueName];
        let tempObj = [];
        for (let j = 0; j < attestionRes.length; j++) {
          if (this.propertyId == attestionRes[j].propertiesOSID[this.propertyName][0]) {
            attestionRes[j].propertiesOSID.osUpdatedAt = new Date(attestionRes[j].propertiesOSID.osUpdatedAt);
            tempObj.push(attestionRes[j])
          }
        }

        tempObj.sort((a, b) => (b.propertiesOSID.osUpdatedAt) - (a.osUpdatedAt));
        let claimId = tempObj[0]["_osClaimId"];

        if (claimId) {
          this.generalService.getData(entity + "/claims/" + claimId).subscribe((res) => {
            this.notes = res.notes;
          });
        }
      }
    });
  }

  getData() {
    let getUrl;
    if (this.identifier) {
      getUrl = this.propertyName + '/' + this.identifier;
    } else {
      getUrl = this.apiUrl
    }
    this.generalService.getData(getUrl).subscribe((res) => {
      res = (res[0]) ? res[0] : res;
      if (this.propertyName && this.entityId) {
        this.getNotes();
      }

      this.model = res;
      this.identifier = res.osid;
      this.loadSchema()
    });
  }

  async postData() {
    if (Array.isArray(this.model)) {
      this.model = this.model[0];
    }

    if (this.formSchema.isMultiSchema) {
      let myProperties = {};
      let apiCalls = [];

      this.formSchema.fieldsets.forEach(fieldSet => {
        console.log(fieldSet.definition);
        // myProperties.push({[fieldSet.definition]: this.definitions[fieldSet.definition].properties});
        let props = {};
        for (let obj in this.definitions[fieldSet.definition].properties) {
          props[obj] = this.model[obj];
        }
        // myProperties = {...myProperties, ...{[fieldSet.definition]: this.definitions[fieldSet.definition].properties}}
        myProperties = { ...myProperties, ...{ [fieldSet.definition]: props } };
      });
      console.log('myProperties', myProperties);

      for (let obj in myProperties) {
        const apiUrl = this.formSchema.fieldsets.find(fieldSet => fieldSet.definition === obj).api;
        // let props = this.clearEmptyObjects(myProperties[obj]);
        let payload = myProperties[obj];
        apiCalls.push({
          url: apiUrl,
          payload: payload
        });
      }

      console.log('apiCalls', apiCalls);
      // of(...apiCalls)
      // .pipe(concatMap((request: any) => this.generalService.postData(request.url, request.payload)))
      forkJoin(apiCalls.map((item: any) => this.generalService.postData(item.url, item.payload)))
        .subscribe((result: any) => {
          console.log("result", result);
          this.isLoading = false;

          if (result[0]?.params?.status === "SUCCESSFUL") {
            this.router.navigate(['/dashboard']);
          }

          // if (result.params.status == 'SUCCESSFUL' && !this.model['attest']) {
          //   this.router.navigate([this.redirectTo])
          //  }
          //  else if (result.params.errmsg != '' && result.params.status == 'UNSUCCESSFUL') {
          //    this.toastMsg.error('error', result.params.errmsg);
          //    this.isSubmitForm = false;

          //  }
        }, (err) => {
          this.isLoading = false;
          this.toastMsg.error('error', err?.error?.params?.errmsg || 'Something went wrong');
          this.isSubmitForm = false;
        });

    } else {
      this.model['sorder'] = this.exLength;

      this.generalService.postData(this.apiUrl, this.model, this.isBFF).subscribe((res) => {
        this.isLoading = false;
        this.toastMsg.success('', this.generalService.translateString('FORM_SUBMITTED_SUCCESSFULLY'));
        if (res.success) {
          this.router.navigate([this.redirectTo]);
        }
        if (res?.params?.status == 'SUCCESSFUL' && !this.model['attest']) {
          this.router.navigate([this.redirectTo]);
        }
        else if (res?.params?.errmsg != '' && res?.params?.status == 'UNSUCCESSFUL') {
          this.toastMsg.error('error', res.params.errmsg);
          this.isSubmitForm = false;
        }
      }, (err) => {
        this.isLoading = false;
        const msg = err.error?.params?.errmsg ? err.error.params.errmsg : (err.error?.message ? err.error.message : 'Something went wrong');
        this.toastMsg.error('', msg);
        this.isSubmitForm = false;
      });
    }

  }

  updateData() {
    this.generalService.putData(this.apiUrl, this.identifier, this.model).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
        this.router.navigate([this.redirectTo])
      }
      else if (res?.params?.errmsg != '' && res?.params?.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg);
        this.isSubmitForm = false;
      }
    }, (err) => {
      this.toastMsg.error('error', err?.error?.params?.errmsg);
      this.isSubmitForm = false;

    });
  }

  getEntityData(apiUrl) {
    if (this.identifier) {
      this.generalService.getData(apiUrl).subscribe((res) => {
        this.entityId = res[0].osid;
        this.exLength = res[0][this.propertyName].length;

      });
    } else {
      this.generalService.getData(apiUrl).subscribe((res) => {
        this.exLength = res[0][this.propertyName].length;
      });
    }

  }

  updateClaims() {
    this.sorder = this.model.hasOwnProperty('sorder') ? this.model['sorder'] : '';

    this.generalService.updateclaims(this.apiUrl, this.model).subscribe((res) => {
      if (res.params.status == 'SUCCESSFUL' && !this.model['attest']) {
        this.router.navigate([this.redirectTo])
      }
      else if (res.params.errmsg != '' && res.params.status == 'UNSUCCESSFUL') {
        this.toastMsg.error('error', res.params.errmsg)
      }
    }, (err) => {
      this.toastMsg.error('error', err.error.params.errmsg);
    });
  }
}


