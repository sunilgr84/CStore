import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MasterDepartmentRoutingModule } from './master-department-routing.module';
import { MasterDepartmentComponent } from './master-department.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [MasterDepartmentComponent],
  imports: [
    CommonModule,
    MasterDepartmentRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class MasterDepartmentModule { }
