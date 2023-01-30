import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor() { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const token: string = sessionStorage.getItem('token');

    let newRequest = request.clone({ headers: request.headers.set('Accept', 'application/json') });
    const headers: HttpHeaders = request.headers;

    if (token) {
      newRequest = newRequest.clone({ headers: newRequest.headers.set('Authorization', 'Bearer ' + token) });
    }


    return next.handle(newRequest).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          console.log('event--->>>', event);
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // TODO: handle unauthoization
        } else if (error.status === 0 || error.status === 403) {
          console.error('Connectivity Lost...');
          // TODO: handle no connection error
        }
        console.error(error); // TODO: add logger service to log exceptions
        return Observable.throw(error);
      }));
  }
}
