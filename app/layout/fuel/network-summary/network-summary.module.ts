import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NetworkSummaryRoutingModule } from './network-summary-routing.module';
import { NetworkSummaryComponent } from './network-summary.component';
import { PageHeaderModule } from 'src/app/shared/';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [NetworkSummaryComponent],
  imports: [
    CommonModule,
    NetworkSummaryRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class NetworkSummaryModule { }
