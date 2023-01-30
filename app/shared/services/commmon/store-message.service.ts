import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StoreMessageService {
    private subject = new Subject<any>();
    currentMessage = this.subject.asObservable();

    changeStoreLocationId(id: string) {
        this.subject.next(id);
    }
    clearMessages() {
        this.subject.next();
    }
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
}
