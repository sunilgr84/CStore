import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectivesModule } from '@shared/directive/directives.module';
import { TimeOffComponent } from './time-off.component';
import {TimeOffRoutingModule} from './time-off-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [TimeOffComponent],
  imports: [CommonModule, TimeOffRoutingModule, PageHeaderModule, CommonComponentModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, DirectivesModule, NgSelectModule
  ]
})
export class TimeOffModule { }
