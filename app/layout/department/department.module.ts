import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DepartmentRoutingModule } from './department-routing.module';
import { DepartmentComponent } from './department.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DepartmentDetailsContainerComponent } from './department-details-container/department-details-container.component';
import { DepartmentDetailComponent } from './department-detail/department-detail.component';
import { DepartmentLocationComponent } from './department-location/department-location.component';
import { DepartmentHistoryComponent } from './department-history/department-history.component';
import { NewDepartmentLocationComponent } from './department-location/new-department-location/new-department-location.component';
import { ChartsModule } from 'ng2-charts';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    DepartmentComponent, DepartmentDetailsContainerComponent, DepartmentDetailComponent,
    DepartmentLocationComponent, DepartmentHistoryComponent, NewDepartmentLocationComponent],
  imports: [
    CommonModule,
    DepartmentRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
    ChartsModule,
    NgSelectModule
  ]

})
export class DepartmentModule { }
