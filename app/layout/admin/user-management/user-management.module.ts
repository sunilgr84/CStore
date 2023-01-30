import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserManagementComponent } from './user-management.component';
import { ProfileModule } from './profile/profile.module';
import { AddUserModule } from './add-user/add-user.module';
import { PageHeaderModule } from '@shared/modules';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChangePasswordModule } from './change-password/change-password.module';

@NgModule({
  declarations: [UserManagementComponent],
  imports: [
    CommonModule,
    UserManagementRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    ProfileModule,
    AddUserModule,
    ChangePasswordModule
  ]
})
export class UserManagementModule { }
