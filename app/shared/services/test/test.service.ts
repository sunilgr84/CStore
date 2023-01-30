import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, tap, map } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ConstantService } from '../constant/constant.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  userInfo: any;
  constructor(private http: HttpClient, private logger: LoggerService, private constantService: ConstantService) {
    this.userInfo = this.constantService.getUserInfo();
  }

  getHeaders(isMultipart) {
    if (isMultipart) {
      return {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data'
        })
      };
    } else {
      return {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        })
      };
    }
  }
  /** GET: get data from the server */
  getData(apiName: string, requestParams?: string, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    if (requestParams) {
      apiName = apiName + '?' + requestParams;
    }
    return this.http.get(apiName, httpOptions)
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  /** PUT: update data on the server */
  updateData(apiName: string, reqestObj: any, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http.put(apiName, reqestObj, httpOptions)
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  /** POST: send data to the server */
  postData(apiName: string, requestObject: any, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http.post<any>(apiName, requestObject, httpOptions)
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  postDataM(apiName: string, requestObject: any, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http.post(apiName, requestObject, {
      reportProgress: true,
      observe: 'events',
    })
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }
  /** DELETE: send data to the server */
  deleteData(apiName: string, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http.delete<any>(apiName, httpOptions)
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }
}
