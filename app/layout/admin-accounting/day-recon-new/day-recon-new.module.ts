// modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DayReconNewRoutingModule } from './day-recon-new-routing.module';
import { TransactionModule } from './transaction/transaction.module';

// components
import { DayReconNewComponent } from './day-recon-new.component';
import { AtmDepositComponent } from './atm-deposit/atm-deposit.component';
import { SalesByDepartmentComponent } from './sales-by-department/sales-by-department.component';
import { MatDatepickerModule } from '@angular/material';
import { DayReconDetailsComponent } from './day-recon-details/day-recon-details.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { DepartmentSalesComponent } from './department-sales/department-sales.component';
import { QrCodeModule } from 'ng-qrcode';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DayReconNewRoutingModule,
    TransactionModule,
    MatDatepickerModule,
    CommonComponentModule,
    QrCodeModule],
  exports: [MatDatepickerModule],
  declarations: [
    DayReconNewComponent,
    AtmDepositComponent,
    DepartmentSalesComponent,
    SalesByDepartmentComponent, DayReconDetailsComponent
  ],
  providers: [],
})
export class DayReconNewModule { }
