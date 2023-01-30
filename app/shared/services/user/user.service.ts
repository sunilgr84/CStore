import { Injectable, Optional } from '@angular/core';
import { UserServiceConfig } from '../../core/user-service.config';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  _userName: string;
  constructor(@Optional() config: UserServiceConfig) {
    if (config) { this._userName = config.userName; }
  }
}
