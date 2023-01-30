import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountingComponent } from './accounting.component';
import { AccountingRoutingModule } from './accounting-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { AccountsReportComponent } from './accounts-report/accounts-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';
@NgModule({
  declarations: [AccountingComponent, AccountsReportComponent],
  imports: [
    CommonModule,
    AccountingRoutingModule,
    PageHeaderModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    CommonComponentModule
  ]
})
export class AccountingModule { }
