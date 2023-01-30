import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectivesModule } from '@shared/directive/directives.module';
import { EmployeeTimesheetDetailRoutingModule } from './employee-timesheet-detail-routing.module';
import { EmployeeTimesheetDetailComponent } from './employee-timesheet-detail.component';
import { CheckTimelogComponent } from './check-timelog/check-timelog.component';
import { AdjustTimelogComponent } from './adjust-timelog/adjust-timelog.component';
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [EmployeeTimesheetDetailComponent, CheckTimelogComponent, AdjustTimelogComponent],
  imports: [CommonModule, EmployeeTimesheetDetailRoutingModule, PageHeaderModule, CommonComponentModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, DirectivesModule,AmazingTimePickerModule,NgSelectModule
  ],
  exports: [EmployeeTimesheetDetailComponent],
  entryComponents: [CheckTimelogComponent, AdjustTimelogComponent ]
})
export class EmployeeTimesheetDetailModule { }
