import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { Observable, Subscriber, of as observableOf, throwError as observableThrowError } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { HttpOptions } from '../../interfaces/httpOptions.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  /**
   * Contains base Url for api end points
   */
  baseUrl: string;
  token: string;
  isLoggedIn: boolean;
  constructor(
    private http: HttpClient,
    public keycloak: KeycloakService) {
    this.token = localStorage.getItem('token');
  }

  /**
   * for preparing headers
   */
  private getHeader(headers?: HttpOptions['headers']): HttpOptions['headers'] {
    this.keycloak.isLoggedIn().then((res) => {
      console.log(res);
      this.isLoggedIn = res;
    });

    let defaultHeaders: any = {
      Accept: 'application/json',
    };

    if (this.isLoggedIn) {
      defaultHeaders['Authorization'] = 'Bearer ' + this.token;
    };

    return defaultHeaders;
  }

  /**
   * for making post api calls
   * @param RequestParam param
   */
  post(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    };

    return this.http.post(requestParam.url, requestParam.data, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode && data.responseCode !== 'OK') {
          return observableThrowError(data);
        }
        return observableOf(data);
      }));
  }


  /**
   * for making get api calls
   *
   * @param requestParam param
   */
  get(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? requestParam.header : this.getHeader(),
      params: requestParam.param
    };

    return this.http.get(requestParam.url, httpOptions).pipe(
      mergeMap((data: any) => {

        return observableOf(data);
      }));

  }

  getDocument(url: string): Observable<any> {
    return new Observable((observer: Subscriber<any>) => {
      let objectUrl: string = null;

      this.http
        .get(url, {
          headers: this.getHeader(),
          responseType: 'blob'
        })
        .subscribe(m => {
          objectUrl = URL.createObjectURL(m);
          observer.next(objectUrl);
        });

      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = null;
        }
      };
    });
  }


  // /**
  // * for making post api calls
  // * @param RequestParam param
  // */
  // put(requestParam): Observable<any> {
  //   const httpOptions: HttpOptions = {
  //     headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
  //     params: requestParam.param
  //   };
  //   return this.http.put(requestParam.url, requestParam.data, httpOptions).pipe(
  //     mergeMap((data: any) => {
  //       // if (data.responseCode !== 'OK') {
  //       //   return observableThrowError(data);
  //       // }
  //       return observableOf(data);
  //     }));
  // }


  /**
  * for making post api calls
  * @param RequestParam param
  */
  put(requestParam): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    };
    return this.http.put(requestParam.url, requestParam.data, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode !== 'OK') {
          return observableThrowError(data);
        }
        return observableOf(data);
      }));
  }


  getWheader(url): Observable<any> {
    const httpOptions: HttpOptions = {
      headers: {
        Accept: '*/*',
        Authorization: 'Bearer ' + this.token
      }
    };

    return this.http.get(url, httpOptions).pipe(
      mergeMap((data: any) => {
        return observableOf(data);
      }));

  }

  delete(requestParam): Observable<any>{
    const httpOptions: HttpOptions = {
      headers: requestParam.header ? this.getHeader(requestParam.header) : this.getHeader(),
      params: requestParam.param
    };
    return this.http.delete(requestParam.url, httpOptions).pipe(
      mergeMap((data: any) => {
        if (data.responseCode !== 'OK') {
          return observableThrowError(data);
        }
        return observableOf(data);
      }));
  }

}


