import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from '@shared/validators/must-match.validator';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm = this.fb.group({
    oldPassword: [''],
    newPassword: ['', [Validators.minLength(8),
    Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    confirmPassword: [''],
  }, {
    validator: MustMatch('newPassword', 'confirmPassword')
  });
  submitted: boolean;
  userInfo = this.constantService.getUserInfo();
  initialFormValue: any;
  constructor(private fb: FormBuilder, private constantService: ConstantService,
    private toastr: ToastrService, private spinner: NgxSpinnerService, private setupService: SetupService) {
    this.initialFormValue = this.changePasswordForm.value;
  }

  ngOnInit() {
  }
  get cpFormControl() { return this.changePasswordForm.controls; }
  reset() {
    this.changePasswordForm.patchValue(this.initialFormValue);
    this.submitted = false;
  }
  changePassword() {
    this.submitted = true;
    if (this.changePasswordForm.valid) {
      this.spinner.show();
      this.setupService.postDataString('Auth/UpdatePassword?oldPassword=' +
        this.changePasswordForm.value.oldPassword + '&newPassword=' + this.changePasswordForm.value.newPassword +
        '&Username=' + this.userInfo.userName, '').subscribe((response) => {
          console.log(response);
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(response['message']);
          } else {
            this.reset();
            this.toastr.success(response);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }
  }
}
