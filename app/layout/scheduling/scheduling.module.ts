import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectivesModule } from '@shared/directive/directives.module';
import { SchedulingComponent } from './scheduling.component';
import {SchedulingRoutingModule} from './scheduling.routing.module'
import { AddEditSchedulingComponent } from './add-edit-scheduling/add-edit-scheduling.component';
import { MatDatepickerModule, MatNativeDateModule } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [SchedulingComponent , AddEditSchedulingComponent],
  imports: [CommonModule, SchedulingRoutingModule, PageHeaderModule, CommonComponentModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, DirectivesModule, NgSelectModule
  ],
  entryComponents: [AddEditSchedulingComponent]
})
export class SchedulingModule { }
