import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SchemaService } from '../services/data/schema.service';
import { GeneralService } from '../services/general/general.service';
// import * as TableSchemas from './tables.json'

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  table: any;
  entity: any;
  tab: string = 'attestation'
  tableSchema: any;
  apiUrl: any;
  model: any;
  Data: string[] = [];
  property: any[] = [];
  field;

  page: number = 1;
  limit: number = 10;
  identifier: any;

  name = 'Set iframe source';
  url: string = "https://sunbirdrc-sandbox.xiv.in/public/dashboards/N6Rl6lfgdvfflB3sJLLQJtqp6ZSrD23TSSj9a35U?org_slug=default";
  urlSafe: SafeResourceUrl;
  vcType: any;


  constructor(public router: Router, private route: ActivatedRoute, public generalService: GeneralService, public schemaService: SchemaService, public sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);

    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    var tab_url = this.router.url
    this.route.params.subscribe(async params => {
      this.table = (params['table']).toLowerCase()
      this.entity = (params['entity']).toLowerCase();
      this.tab = tab_url.replace(this.table, "").replace(this.entity, "").split("/").join("")
      this.schemaService.getTableJSON().subscribe(async (TableSchemas) => {
        var filtered = TableSchemas.tables.filter(obj => {
          return Object.keys(obj)[0] === this.table
        })
        this.tableSchema = filtered[0][this.table]
        this.apiUrl = this.tableSchema.api;
        this.limit = filtered[0].hasOwnProperty(this.limit) ? filtered[0].limit : this.limit;

        if (this.tableSchema.call == 'post') {
          await this.postData();
        } else {
          await this.getData();
        }

      })

    });
  }

  getData() {

    var get_url;
    if (this.entity) {
      get_url = this.apiUrl
    } else {
      console.log("Something went wrong")
    }
    this.generalService.getData(get_url).subscribe((res) => {
      if (res.hasOwnProperty('content')) {
        this.model = res['content'];
      } else {
        this.model = res;
      }
      
      this.addData()
    });
  }

  async postData() {
    if (this.tableSchema.hasOwnProperty('callMultiApi') && this.tableSchema['callMultiApi']) {
      this.tableSchema.callMultiApi['api'].forEach(elememt => {

        this.apiUrl = elememt;
        this.addDataMultiCall();

      });
    }
  }

  async addDataMultiCall() {
    var get_url;
    if (this.entity) {
      get_url = this.apiUrl
    } else {
      console.log("Something went wrong")
    }


      this.generalService.getData(get_url).subscribe((res) => {
        if (res.hasOwnProperty('content')) {
          this.model.push(res['content']);
        } else {
          this.model = res;
        }
        var temp_array;
        let temp_object
        this.model.forEach(element => {
          element['vctype'] = get_url;
          temp_array = [];
          this.tableSchema.fields.forEach((field) => {

            temp_object = field;

            if (temp_object.name) {
              temp_object['value'] = element[field.name]
              temp_object['status'] = element['status']
            }
            if (temp_object.formate) {
              temp_object['formate'] = field.formate
            }
            if (temp_object.custom) {
              if (temp_object.type == "button") {
                if (temp_object.redirectTo && temp_object.redirectTo.includes(":")) {
                  let urlParam = temp_object.redirectTo.split(":")
                  urlParam.forEach((paramVal, index) => {
                    if (paramVal in element) {
                      urlParam[index] = element[paramVal]
                    }
                  });
                  temp_object['redirectToUrl'] = urlParam.join("/").replace("//", "/");
                }
              }
              temp_object['type'] = field.type
            }
            temp_array.push(this.pushData(temp_object));
          });
          this.property.push(temp_array)

        });

        this.tableSchema.items = this.property;

    });
  }

  addData() {

    var temp_array;
    let temp_object
    this.model.forEach(element => {
      if (element.status === "OPEN" || !this.tableSchema['checkStatus']) {
        temp_array = [];
        this.tableSchema.fields.forEach((field) => {

          temp_object = field;

          if (temp_object.name) {
            temp_object['value'] = element[field.name]
            temp_object['status'] = element['status']
          }
          if (temp_object.formate) {
            temp_object['formate'] = field.formate
          }
          if (temp_object.custom) {
            if (temp_object.type == "button") {
              if (temp_object.redirectTo && temp_object.redirectTo.includes(":")) {
                let urlParam = temp_object.redirectTo.split(":")
                urlParam.forEach((paramVal, index) => {
                  if (paramVal in element) {
                    urlParam[index] = element[paramVal]
                  }
                });
                temp_object['redirectToUrl'] = urlParam.join("/").replace("//", "/");
              }
            }
            temp_object['type'] = field.type
          }
          temp_array.push(this.pushData(temp_object));
        });
        this.property.push(temp_array)
      }
    });

    this.tableSchema.items = this.property;
  }

  pushData(data) {
    var object = {};
    for (var key in data) {
      if (data.hasOwnProperty(key))
        object[key] = data[key];
    }
    return object;
  }

}
