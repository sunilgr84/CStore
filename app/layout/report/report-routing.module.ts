import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'purchases' },
  { path: 'purchases', loadChildren: './purchases/purchases.module#PurchasesModule' },
  { path: 'sales', loadChildren: './sales/sales.module#SalesModule' },
  { path: 'inventory', loadChildren: './inventory/inventory.module#InventoryModule' },
  { path: 'fuel', loadChildren: './fuel/fuel.report.module#FuelReportModule' },
  { path: 'accounting', loadChildren: './accounting/accounting.module#AccountingModule' },
  { path: 'lottery', loadChildren: 'src/app/layout/report/lottery/lottery.module#LotteryModule' },
  { path: 'misc', loadChildren: './misc/misc.module#MiscModule' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
