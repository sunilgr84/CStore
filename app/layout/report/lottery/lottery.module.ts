import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LotteryComponent } from './lottery.component';
import { PageHeaderModule } from 'src/app/shared';
import { LotteryRoutingModule } from './lottery-routing.module';
import { LotteryInventoryReportComponent } from './lottery-inventory-report/lottery-inventory-report.component';
import { LotterySalesReportComponent } from './lottery-sales-report/lottery-sales-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [LotteryComponent, LotteryInventoryReportComponent, LotterySalesReportComponent],
  imports: [
    CommonModule,
    LotteryRoutingModule,
    PageHeaderModule,
    NgSelectModule,ReactiveFormsModule, FormsModule,CommonComponentModule,
    NgbModule.forRoot(),
  ]
})
export class LotteryModule { }