import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs/';

var SERVER = ''
if (window.location.hostname === 'localhost') {
  // SERVER = 'https://dev-unotv.tmx-internacional.net'
  SERVER = 'https://unotv-admin-bo.tmx-internacional.net'
}

@Injectable()
export class ApiService {

  static END_POINTS = {
    insert: '/YOG_WSB_BackOffice/rest/eventoController/insert/',
    update: '/YOG_WSB_BackOffice/rest/eventoController/update/',
    delete: '/YOG_WSB_BackOffice/rest/eventoController/delete/',
    findById: '/YOG_WSB_BackOffice/rest/eventoController/findById/',
    findByNombre: '/YOG_WSB_BackOffice/rest/eventoController/findByNombre/',
    findByFecha: '/YOG_WSB_BackOffice/rest/eventoController/findByFecha/',
    findByRange: '/YOG_WSB_BackOffice/rest/eventoController/findByFechas/',
    catDeportes: '/YOG_WSB_BackOffice/rest/catalogos/deportes/'
  }

  constructor(
    private http: HttpClient) {
  }

  private makeQueryParams (params) {
    var pares = [];
    for (let key in params) {
      if (params[key] != undefined) {
        pares.push(key + '=' + params[key]);
      }
    }
    if (pares.length > 0) {
      return pares.join('&');
    } else {
      return '';
    }
  }

  private makeUrl (endPoint, params): string {
    let url = SERVER + endPoint;
    url += params.params ? params.params + '/' : '';
    url += params.query ? '?' + this.makeQueryParams(params.query) + '/' : '';
    return url;
  }

  public get(endPoint, params) {
    let url = this.makeUrl(endPoint, params);
    return this.http.get<any>(url)
    .pipe(catchError(this.handleError(endPoint)));
  }

  public post(endPoint, params) {
    let url = this.makeUrl(endPoint, params);
    console.log(url)
    console.log(JSON.stringify(params.body))
    return this.http.post<any>(url, params.body)
    .pipe(catchError(this.handleError(endPoint)));
  }

  public put(endPoint, params) {
    let url = this.makeUrl(endPoint, params);
    return this.http.put<any>(url, params.body)
    .pipe(catchError(this.handleError(endPoint)));
  }

  public delete(endPoint, params) {
    let url = this.makeUrl(endPoint, params);
    return this.http.delete<any>(url)
    .pipe(catchError(this.handleError(endPoint)));
  }

  //- ==================
  //- HANDLE ERROR
  //- ==================
  handleError <T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`[api.services] ${operation}: `);
      console.error(error);
      if (error.status == 0) {
        console.log("Occurrio un error, intente mas tarde porfavor");
        throw error;
      }
      return of(error as T);
    }
  }
}
