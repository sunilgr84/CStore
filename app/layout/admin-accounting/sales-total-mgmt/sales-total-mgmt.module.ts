import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesTotalMgmtComponent } from './sales-total-mgmt.component';
import {SalesTotalMgmtRoutingModule } from './sales-total-mgmt-routing.module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
@NgModule({
  declarations: [SalesTotalMgmtComponent],
  imports: [
    CommonModule,SalesTotalMgmtRoutingModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    })
  ],
 
})
export class SalesTotalMgmtModule { }
