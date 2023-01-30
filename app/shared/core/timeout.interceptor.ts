import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { CommonService } from '@shared/services/commmon/common.service';

export const DEFAULT_TIMEOUT = new InjectionToken<number>('defaultTimeout');

@Injectable()
export class TimeoutInterceptor implements HttpInterceptor {
    constructor(@Inject(DEFAULT_TIMEOUT) protected defaultTimeout: number, public commonService: CommonService) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const timeoutValue = req.headers.get('timeout') || this.defaultTimeout;
        const timeoutValueNumeric = Number(timeoutValue);
        return next.handle(req).pipe(timeout(timeoutValueNumeric), catchError(error => {
            if (error instanceof TimeoutError) {
                this.commonService.addErrors(Array.isArray(error.message) ? error.message : ['Timeout has occurred']);
            }
            return throwError(error);
        }));
    }
}