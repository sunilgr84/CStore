import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectivesModule } from '@shared/directive/directives.module';
import { TimesheetTimeoffComponent } from './timesheet-timeoff.component';
import { TimesheetTimeoffRoutingModule } from './timesheet-timeoff-routing.module';

@NgModule({
  declarations: [TimesheetTimeoffComponent],
  imports: [CommonModule, TimesheetTimeoffRoutingModule, PageHeaderModule, CommonComponentModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, DirectivesModule
  ],
  exports: [TimesheetTimeoffComponent]
})
export class TimesheetTimeOffModule { }
