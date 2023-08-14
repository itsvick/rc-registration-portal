import { Injectable } from '@angular/core';
import { DataService } from '../data/data-request.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  baseUrl = this.config.getEnv('baseUrl');
  bffUrl = this.config.getEnv('bffBaseUrl');
  translatedString: string;
  constructor(
    public dataService: DataService,
    private http: HttpClient,
    private config: AppConfig,
    public translate: TranslateService,
  ) {
  }

  postData(apiUrl, data, isBFF = false) {
    var url;
    if (apiUrl.indexOf('http') > -1) {
      url = apiUrl
    } else {
      url = isBFF ? `${this.bffUrl}${apiUrl}` : apiUrl.charAt(0) === '/' ? `${this.baseUrl}${apiUrl}` : `${this.baseUrl}/${apiUrl}`
    }

    const req = {
      url: url,
      data: data
    };

    return this.dataService.post(req);
  }

  getDocument(url: string): Observable<any> {
    return this.dataService.getDocument(url);
  }


  getData(apiUrl, outside: boolean = false) {
    var url;
    if (outside) {
      url = apiUrl;
    }
    else {
      url = `${this.baseUrl}/${apiUrl}`;
    }
    url.replace('//', '/');
    const req = {
      url: url
    };
    return this.dataService.get(req);
  }

  getPrefillData(apiUrl) {
    var url = apiUrl;
    let headers = new HttpHeaders();
    url.replace('//', '/');
    const req = {
      url: url,
      headers: headers
    };

    return this.dataService.get(req);
  }

  postPrefillData(apiUrl, data) {
    apiUrl.replace('//', '/');
    const req = {
      url: apiUrl,
      data: data
    };

    return this.dataService.post(req);
  }

  putData(apiUrl, id, data) {
    var url;
    if (apiUrl.charAt(0) == '/') {
      url = `${this.baseUrl}${apiUrl}/${id}`
    }
    else {
      url = `${this.baseUrl}/${apiUrl}/${id}`;
    }
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  // Configurations
  getConfigs() {
    let url = "./assets/config/config.json";
    const req = {
      url: url
    };

    return this.dataService.get(req);
  }

  updateclaims(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }

  translateString(constantStr) {
    this.translate.get(constantStr).subscribe((val) => {
      this.translatedString = val;
    });
    return this.translatedString;
  }

  attestationReq(apiUrl, data) {
    let url = `${this.baseUrl}${apiUrl}`;
    const req = {
      url: url,
      data: data
    };
    return this.dataService.put(req);
  }


  openPDF(url) {
    url = `${this.baseUrl}` + '/' + `${url}`;

    let requestOptions = { responseType: 'blob' as 'blob' };
    // post or get depending on your requirement
    this.http.get(url, requestOptions).pipe(map((data: any) => {

      let blob = new Blob([data], {
        type: 'application/pdf' // must match the Accept type
        // type: 'application/octet-stream' // for excel 
      });
      var link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);

      window.open(link.href, '_blank')
      // link.download =  'temp.pdf';
      // link.click();
      // window.URL.revokeObjectURL(link.href);

    })).subscribe((result: any) => {
    });
  }

  clearEmptyObjects(o) {
    for (let k in o) {
      if (!o[k] || typeof o[k] !== "object") {
        continue // If null or not an object, skip to the next iteration
      }

      // The property is an object
      if (Object.keys(o[k]).length === 0) {
        delete o[k]; // The object had no properties, so delete that property
      }
    }
    return o;
  }

  createPath(obj, path, value = null) {
    path = typeof path === 'string' ? path.split('.') : path;
    let current = obj;
    while (path.length > 1) {
      const [head, ...tail] = path;
      path = tail;
      if (current[head] === undefined) {
        current[head] = {};
      }
      current = current[head];
    }
    current[path[0]] = value;
    return obj;
  };

  setPathValue(obj, path, value) {
    let keys;
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

  findPath(obj, value, path) {
    if (typeof obj !== 'object') {
      return false;
    }
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let t = path;
        let v = obj[key];
        let newPath = path ? path.slice() : [];
        newPath.push(key);
        if (v === value) {
          return newPath;
        } else if (typeof v !== 'object') {
          newPath = t;
        }
        let res = this.findPath(v, value, newPath);
        if (res) {
          return res;
        }
      }
    }
    return false;
  }


  ObjectbyString(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    let a = s.split('.');
    for (let i = 0, n = a.length; i < n; ++i) {
      let k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };



}

