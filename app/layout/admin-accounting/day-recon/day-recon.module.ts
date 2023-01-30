import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DayReconRoutingModule } from './day-recon-routing.module';
import { DayReconsComponent } from './day-recon.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
// for new calnder (embded)
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { ExpensesDetailsComponent } from './expenses-details/expenses-details.component';
import { DayDetailsComponent } from './day-details/day-details.component';
import { NegativeNumberPipe } from '@shared/pipes/negative-number.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [DayReconsComponent, ExpensesDetailsComponent, DayDetailsComponent,
    NegativeNumberPipe],
  imports: [
    CommonModule,
    DayReconRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgbModule.forRoot(),
  ]
})
export class DayReconModule { }
