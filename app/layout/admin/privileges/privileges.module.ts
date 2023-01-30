import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrivilegesRoutingModule } from './privileges-routing.module';
import { PrivilegesComponent } from './privileges.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RolesPrivilegesComponent } from './roles-privileges/roles-privileges.component';


@NgModule({
  declarations: [PrivilegesComponent, RolesPrivilegesComponent],
  imports: [
    CommonModule,
    PrivilegesRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule, NgSelectModule,
    NgbModule.forRoot(),
  ]
})
export class PrivilegesModule { }
