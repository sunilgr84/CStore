import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { environment } from 'src/environments/environment';
import { LoggerService } from '../shared/services/logger/logger.service';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
  isLoginForm = true;
  user = {
    userName: null, // 'appa@test.com',
    password: null, // 'Tester12!',
    rememberMe: true,
    loginFrom: "web"
  };
  fPassword = {
    userName: null, // 'appa@test.com',
    password: null, // 'Tester12!',
    confirmPassword: null,
    emailId: null,
    otp: null
  };
  submitted: boolean;
  pwdPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  isForgetPassword: boolean;
  otpRequired = false;
  result: string;
  isUserExist: boolean;
  constructor(public router: Router, private http: HttpClient, private logger: LoggerService,
    private spinner: NgxSpinnerService, private toastr: ToastrService) { }

  ngOnInit() { }

  onLoggedin(form) {
    this.submitted = true;
    if (form.valid) {
      this.spinner.show();
      this.http.post(environment.baseUrl + 'Auth/Login', this.user)
        .subscribe((response: any) => {
          if (response.statusCode === 400) {
            this.toastr.error('Please enter valid credentials..');
            this.spinner.hide();
            return;
          }
          this.logger.log(response.data);
          this.spinner.hide();
          sessionStorage.setItem('token', response.data.token);
          response.data.roleName = (response.data.roles[0]).toLowerCase();          // 'Superadmin';
          response.data.storeLocation = {
            zipCode: 12345,
            city: 'New York'
          };
          sessionStorage.setItem('isGasStationUserLogin', 'true');
          sessionStorage.setItem('userInfo', JSON.stringify(response.data));
          if (response.data) {
            window["dataLayer"].push({
              'event': 'login',
              'userId': response.data.userId,
            });
          }
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 250);
        },
          (error) => {
            this.spinner.hide();
            this.toastr.error(error.error);
          });
    }
  }
  validdToResetPassword(form) {
    this.http.post(environment.baseUrl + 'Users/IsValidToResetPassword?Username=' + this.user.userName, this.user)
      .subscribe((response: any) => {
        const resp = response;
        switch (resp.data || resp.message) {
          case 'true':
            this.fPassword.userName = this.user.userName;
            this.isLoginForm = false;
            break;
          case 'false':
            this.onLoggedin(form);
            break;
          case 'User does not Exist':
            this.toastr.error('User does not exist');
            break;
          default:
            this.onLoggedin(form);
            break;
        }
      }, (error) => {
        console.log(error);
        this.toastr.error('Something went wrong.......');
      });
  }

  forgotPassword(form) {
    this.isForgetPassword = true;
    if (form.invalid) { return; }
    if (!this.isUserExist) {
      this.validateUser();
      return;
    }
    if (form.valid && !this.otpRequired) {
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.http.post(environment.baseUrl + 'Users/GenerateOTP?EmailID=' + this.fPassword.emailId + '&Username=' + this.fPassword.userName, this.fPassword)
        .subscribe((response: any) => {
          this.spinner.hide();
          const resp = response;
          if (resp.data && resp.data.succeeded) {
            this.otpRequired = true;
            this.isForgetPassword = false;
            this.user.password = null;
            this.toastr.success('Please check your email for new OTP');
            this.result = 'Please check your email for new OTP';
          } else {
            this.toastr.error(resp.message, 'Failed to generate OTP');
          }
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error('Contact to administrator');
        });
    } else if (form.valid && this.otpRequired) {
      this.result = '';
      if (this.fPassword.password !== this.fPassword.confirmPassword) {
        return false;
      }
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.http.post(environment.baseUrl + 'Auth/VerifyOTPNResetPassword?newpassword=' + this.fPassword.password
        + '&OTP=' + this.fPassword.otp + '&Username=' + this.fPassword.userName, '')
        .subscribe((response: any) => {
          this.spinner.hide();
          const resp = response;
          if (resp && resp['statusCode'] === 500) {
            this.toastr.error('Contact to administrator');
            return;
          }
          if (resp.message.trim() === 'Password Reset Done Successfully') {
            this.otpRequired = false;
            this.isLoginForm = true;
            this.isForgetPassword = false;
            this.user.password = null;
            this.isUserExist = false;
            this.fPassword = {
              userName: null,
              password: null,
              confirmPassword: null,
              emailId: null,
              otp: null
            };
            const msg = resp.data ? resp.data.message : resp.message;
            this.toastr.success(msg);
          } else {
            this.toastr.error(resp.message);
          }
        }, (error) => {
          this.spinner.hide();
          // if (error.error) {
          //   this.toastr.error(error.error.text);
          // }
          if (error && error['status'] === 200) {
            this.otpRequired = false;
            this.isLoginForm = true;
            this.isForgetPassword = false;
            this.user.password = null;
            this.isUserExist = false;
            this.fPassword = {
              userName: null,
              password: null,
              confirmPassword: null,
              emailId: null,
              otp: null
            };
            this.toastr.success(error.error['text']);
          } else {
            this.toastr.error(error.error);
          }
        });
    }
  }
  validateUser() {
    this.spinner.show();
    this.http.post(environment.baseUrl + 'Users/IsValidToResetPassword?Username=' + this.fPassword.userName, this.user)
      .subscribe((response: any) => {
        this.spinner.hide();
        const resp = response;
        switch (resp.data || resp.message) {
          case 'true':
            this.isUserExist = false;
            break;
          case 'false':
            this.isUserExist = true;
            break;
          case 'User does not Exist':
            this.toastr.error('User does not exist');
            this.isUserExist = false;
            break;
          default:
            this.isUserExist = true;
            break;
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong.......');
      });
  }
  backToLogin() {
    this.isLoginForm = true;
    this.otpRequired = this.isUserExist = false;
    this.result = '';
    this.fPassword = {
      userName: null,
      password: null,
      confirmPassword: null,
      emailId: null,
      otp: null
    };
  }
}
