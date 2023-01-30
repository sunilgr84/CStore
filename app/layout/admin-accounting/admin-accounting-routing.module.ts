import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAccountingComponent } from './admin-accounting.component';

const routes: Routes = [
  {
    path: '', component: AdminAccountingComponent,
    children: [
      { path: 'day-recon', loadChildren: './day-recon/day-recon.module#DayReconModule' },
      { path: 'day-recon-new', loadChildren: './day-recon-new/day-recon-new.module#DayReconNewModule' },
      { path: 'reconcile-house', loadChildren: './reconcile-house/reconcile-house.module#ReconcileHouseModule' },
      { path: 'sales-total-mgmt', loadChildren: './sales-total-mgmt/sales-total-mgmt.module#SalesTotalMgmtModule' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminAccountingRoutingModule { }
