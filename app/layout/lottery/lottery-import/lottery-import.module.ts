import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LotteryImportRoutingModule } from './lottery-import-routing.module';
import { LotteryImportComponent } from './lottery-import.component';
import { PageHeaderModule } from '@shared/modules';

@NgModule({
  declarations: [LotteryImportComponent],
  imports: [
    CommonModule,
    LotteryImportRoutingModule,
    PageHeaderModule
  ]
})
export class LotteryImportModule { }
