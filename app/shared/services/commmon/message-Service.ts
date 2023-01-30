import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class MessageService {
    private subject = new Subject<any>();
    private logoSubject =new Subject<any>();
    private notificationSubject = new Subject<any>();

    sendMessage(message: string) {
        this.subject.next({ text: message });
    }
    clearMessages() {
        this.subject.next();
    }
    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }
    setLogo(logo: string) {
        this.logoSubject.next({ logo: logo });
    }
    clearLogo() {
        this.logoSubject.next();
    }
    getLogo(): Observable<any> {
        return this.logoSubject.asObservable();
    }
    sendNotification(storeId : number){
        this.notificationSubject.next({ storeId: storeId });
    }
    getNotification(): Observable<any> {
        return this.notificationSubject.asObservable();
    }
    clearNotification() {
        this.notificationSubject.next();
    }
}
