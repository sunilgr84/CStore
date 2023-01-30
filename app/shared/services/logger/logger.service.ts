import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() { }
  log(msg: string) {
    console.log(msg);
  }

  error(msg: string) {
    console.error(msg);
  }

  warn(msg: string) {
    console.warn(msg);
  }
}
