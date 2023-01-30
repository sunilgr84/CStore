import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentTypeRoutingModule } from './department-type-routing.module';
import { DepartmentTypeComponent } from './department-type.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [DepartmentTypeComponent],
  imports: [
    CommonModule,
    DepartmentTypeRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    FormsModule
  ]
})
export class DepartmentTypeModule { }
