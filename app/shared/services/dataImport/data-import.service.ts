import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoggerService } from '../logger/logger.service';
import { ConstantService } from '../constant/constant.service';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DataImportService {

  userInfo: any;

  constructor(private http: HttpClient, private logger: LoggerService, private constantService: ConstantService) {
    this.userInfo = this.constantService.getUserInfo();
  }

  /** POST: send data to the server */
  postData(apiName: string, requestObject: any): Observable<any> {
    const headers_object = new HttpHeaders().set('Authorization', 'Bearer ' + this.userInfo.token);
    return this.http.post<any>(environment.baseUrl + apiName, requestObject, {
      headers: headers_object,
      reportProgress: true,
      observe: 'events'
    })
      .pipe(map(response => {
        if (response && response['statusCode'] === 200) {
          return response['data'];
        } else {
          return response;
        }
      }),
        catchError(error => {
          return throwError(error);
        })
      );
  }

}
