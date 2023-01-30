import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ConstantService } from '@shared/services/constant/constant.service';

@Injectable({
  providedIn: 'root'
})
export class AccessAuthGuard implements CanActivate {

  constructor(private _authService: ConstantService, private _router: Router) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const userInfo = this._authService.getUserInfo();
    if (userInfo && userInfo.roleName === this._authService.roleName) {
      return true;
    }
    // navigate to dashboard page
    this._router.navigate(['/dashboard']);
    // you can save redirect url so after authing we can move them back to the page they requested
    return false;
  }
}
