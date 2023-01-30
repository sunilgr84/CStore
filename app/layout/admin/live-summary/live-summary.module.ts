import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LiveSummaryRoutingModule } from './live-summary-routing.module';
import { LiveSummaryComponent } from './live-summary.component';
import { PageHeaderModule } from 'src/app/shared';

@NgModule({
  declarations: [LiveSummaryComponent],
  imports: [
    CommonModule,
    LiveSummaryRoutingModule,
    PageHeaderModule,
  ]
})
export class LiveSummaryModule { }
