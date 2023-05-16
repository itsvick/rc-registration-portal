import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyJsonschema } from '@ngx-formly/core/json-schema';
import { JSONSchema7 } from "json-schema";
import { GeneralService } from 'src/app/services/general/general.service';
import { ToastMessageService } from 'src/app/services/toast-message/toast-message.service';
import { SchemaService } from '../../services/data/schema.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { of as observableOf, of } from 'rxjs';

@Component({
  selector: 'app-add-records',
  templateUrl: './add-records.component.html',
  styleUrls: ['./add-records.component.scss']
})
export class AddRecordsComponent implements OnInit {
  form2: FormGroup;
  model = {};
  schemaloaded = false;
  headerName: string = 'plain'

  options: FormlyFormOptions;
  fields: FormlyFieldConfig[];
  schema: JSONSchema7 = {
    "type": "object",
    "title": "",
    "definitions": {},
    "properties": {},
    "required": []
  };
  form: string;
  formSchema: any;
  responseData: any;
  definations: any;
  property: any = {};
  schemaName: any;
  item: any;
  osid1:any
  fieldKey: any;
  fieldName;
  sitems: any;
   states = ['Alabama', 'Alaska', 'American Samoa', 'Arizona', 'Arkansas', 'California', 'Colorado']
   searchResult: any[];
  priviousName: any;
  osid: void;
  records: any=[];
  constructor(public schemaService: SchemaService,
    public toastMsg: ToastMessageService,
    public router: Router,
    private route: ActivatedRoute,
    private formlyJsonschema: FormlyJsonschema,
    public generalService: GeneralService,
    public http: HttpClient) {
    this.schemaName = this.route.snapshot.paramMap.get('document');
    this.osid1 = this.route.snapshot.paramMap.get('osid');

  }

  ngOnInit(): void {

   

   /* this.schemaService.getSchemas().subscribe((res) => {
      this.responseData = res;

      this.definations = this.responseData.definitions;
      this.property = this.definations[this.schemaName].properties;


      this.schema["type"] = "object";
      //  this.schema["title"] = this.formSchema.title;
      this.schema["definitions"] = this.definations;
      this.schema["properties"] = this.property;
      this.schema["required"] = this.definations[this.schemaName].required;

      this.loadSchema();

    });*/

    this.generalService.getData('Schema').subscribe((res) => {

      for(let i = 0; i < res.length; i ++)
      {
        if(res[i].name == this.schemaName)
        {
          console.log(JSON.parse(res[i].schema));
          this.responseData = JSON.parse(res[i].schema);
          this.definations = this.responseData.definitions;

        }

      }
     
    //  this.property = this.definations[this.schemaName].properties;


// this.property['board'] = {
 
//     "type": "string",
//     "placeholder" : "Select Board",
//     "enum": [
//       "CBSE Board",
//       "UP Board "
//     ],
//     "title": "Board"
  
// }

//this.property.concat(this.definations[this.schemaName].properties);
delete  this.definations[this.schemaName].properties['board'];

Object.assign(this.property,this.definations[this.schemaName].properties);
//delete  this.property['studentReference'];


      this.schema["type"] = "object";
      //  this.schema["title"] = this.formSchema.title;
      this.schema["definitions"] = this.definations;
      this.schema["properties"] = this.property;
      this.schema["required"] = this.definations[this.schemaName].required;

      this.loadSchema();
      
    });


  }

  loadSchema() {
    this.form2 = new FormGroup({});
    this.options = {};
    this.fields = [this.formlyJsonschema.toFieldConfig(this.schema)];
    let tempFields = [];

    this.fields[0].fieldGroup.forEach((fieldObj, index) => {
      console.log({ fieldObj });
      this.fieldName = fieldObj.key;
      tempFields[index] = this.formBuildingSingleField(fieldObj, this.fields[0].fieldGroup[index], this.schema);

      if (fieldObj.type == 'object') {

        tempFields[index]['templateOptions']['label'] = fieldObj.hasOwnProperty('label') ? fieldObj['label'] : undefined;
        tempFields[index]['templateOptions']['description'] = fieldObj.hasOwnProperty('description') ? fieldObj['description'] : undefined;

        if (fieldObj.hasOwnProperty('label')) {
          tempFields[index]['wrappers'] = ['panel'];
        }

        fieldObj.fieldGroup.forEach((sfieldObj, sIndex) => {
          fieldObj.fieldGroup[sIndex] = this.formBuildingSingleField(sfieldObj, fieldObj.fieldGroup[sIndex], this.schema['properties'][this.fieldName]);
        });
        tempFields[index]['type'] = '';
        tempFields[index]['fieldGroup'] = fieldObj.fieldGroup
        // this.schema.properties[this.fieldKey]['required'].includes();



        

      }
      else if (fieldObj.type == 'array') {
      }
    });


    this.fields[0].fieldGroup = tempFields;

    console.log(tempFields);

    this.schemaloaded = true;
  }

  formBuildingSingleField(fieldObj, fieldSchena, requiredF) {

    this.fieldKey = fieldObj.key;
    let tempObj = fieldSchena;

    if (fieldObj.hasOwnProperty('enum') || fieldObj.templateOptions.hasOwnProperty('options')) {
      tempObj['type'] = 'select';
      tempObj['templateOptions']['options'] = fieldObj.templateOptions.options;
    }

   if(fieldObj.key == 'studentReference'){
    tempObj['templateOptions']['readonly'] = true;
    tempObj['hideExpression'] = true;
        
          tempObj['expressionProperties'] = {
            'model.studentReference':  (m) => {
             
              if(m.studentName )
              {  
               // return '1-6a691b00-bd48-4bc6-9855-c0ed3a6b745f';

                if(this.priviousName != m.studentName){
                  this.priviousName = m.studentName; 
                   this.searchStudent(m['studentName']);
                }
                return this.osid;
             
              }else{
                return '';
              }

          
          }
       }

      
    }

    /*if(fieldObj.key == 'studentName' || fieldObj.key == 'name')
        {

          tempObj['type'] = "autocomplete";
        //  tempObj['templateOptions']['label'] = 'Student name';
          tempObj['templateOptions']['label'] = 'identityDetails.fullName';
          tempObj['templateOptions']['placeholder'] = 'Enter Student Name';

        
              var formData = {
            "filters": {
              "identityDetails.fullName": {
                "contains":"{{value}}"
            }
             
            },
            "limit": 20,
            "offset": 0
          }

           var dataval = "{{value}}";

         tempObj['templateOptions']['search$'] = (term) => {
            if (term || term != '') {
              var datapath = this.findPath(formData, dataval, '')
              this.setPathValue(formData, datapath, term)
  
              dataval = term;
              this.generalService.postData('/Student/search', formData).subscribe(async (res) => {
                let items = res;
               
                //  items = items.filter(x => {  (x['identityDetails']['fullName']).toLocaleLowerCase().indexOf(term.toLocaleLowerCase()) > -1
                //  }
              //  );
                
              
                if (items) {
                  console.log(items)
                  this.searchResult = items;
                  return observableOf(this.searchResult);
                }
              });
            }
            return observableOf(this.searchResult);
          }
         
        } */

    if (!fieldObj['templateOptions'].hasOwnProperty('label') || fieldObj.templateOptions.label == undefined) {


      //   let str: any = fieldObj.key;
      tempObj['templateOptions']['label'] = this.fieldKey.charAt(0).toUpperCase() + this.fieldKey.slice(1);

      if (requiredF.hasOwnProperty('required')) {
        if (requiredF.required.includes(this.fieldKey)) {
          tempObj['templateOptions']['required'] = true;
        }
      }

    } else {

      if (fieldObj.templateOptions.label == undefined) {
        // let str: any = fieldObj.key;
        tempObj['templateOptions']['label'] = this.fieldKey.charAt(0).toUpperCase() + this.fieldKey.slice(1);
      }
    }

    if (fieldObj.templateOptions['type'] == 'enum' || fieldObj.templateOptions.hasOwnProperty('options')) {
      tempObj['type'] = 'select';
      tempObj['templateOptions']['options'] = fieldObj.templateOptions.options;
    }

   

    if (this.property.hasOwnProperty(this.fieldKey) && this.property[this.fieldKey].hasOwnProperty('format')) {
      tempObj['templateOptions']['type'] = this.property[this.fieldKey].format;
      if(this.property[this.fieldKey].format == 'email'){
        tempObj['templateOptions']['pattern'] = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        }
    }

    if (this.property.hasOwnProperty(this.fieldKey) && this.property[this.fieldKey].hasOwnProperty('placeholder')) {
      tempObj['templateOptions']['placeholder'] = this.property[this.fieldKey].placeholder;
    }

    if (fieldObj['type'] == 'string' || fieldObj['type'] == 'number') {
      tempObj['type'] = 'input';
    }

    console.log({tempObj});

    return tempObj;
  }

  submit(){
    this.model['nameofScheme'] = this.schemaName;
    this.generalService.postData('/' + this.schemaName, this.model).subscribe((res) => {
      const newRecord = res; 
      this.records.push(newRecord); 
      this.router.navigate(['records/' + this.schemaName + "/" + this.osid1]);
    })
  }



  async searchStudent(name){

    var formData = {
      "filters": {
        "identityDetails" : {
          "fullName": {
          "contains": name
          }
        }
      },
      "limit": 20,
      "offset": 0
    }

   await this.generalService.postData('/Student/search', formData).subscribe(async (res) => {
    this.osid = res[0]['osid'];
 
      return res[0]['osid'];
     
    });
  }



  findPath = (obj, value, path) => {
    if (typeof obj !== 'object') {
      return false;
    }
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var t = path;
        var v = obj[key];
        var newPath = path ? path.slice() : [];
        newPath.push(key);
        if (v === value) {
          return newPath;
        } else if (typeof v !== 'object') {
          newPath = t;
        }
        var res = this.findPath(v, value, newPath);
        if (res) {
          return res;
        }
      }
    }
    return false;
  }


  setPathValue(obj, path, value) {
    var keys;
    if (typeof path === 'string') {
      keys = path.split(".");
    }
    else {
      keys = path;
    }
    const propertyName = keys.pop();
    let propertyParent = obj;
    while (keys.length > 0) {
      const key = keys.shift();
      if (!(key in propertyParent)) {
        propertyParent[key] = {};
      }
      propertyParent = propertyParent[key];
    }
    propertyParent[propertyName] = value;
    return obj;
  }



ngAfterContentChecked1(): void {
 // console.log(this.model);
  if(this.model['studentName'])
  {
    let res = this.searchStudent(this.model['studentName']);
   // this.model['studentEmail'] = (this.model['studentEmail']) ? this.model['studentName'] : (res['contactDetails'].hasOwnProperty('emailid')) ? res['contactDetails']['email'] : '';
   // this.model['studentMob'] = (this.model['studentName']);
    this.model['studentReference'] = (res['osid']) ? res['osid'] : "";  

 }
}

}