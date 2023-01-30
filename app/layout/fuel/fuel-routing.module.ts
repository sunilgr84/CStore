import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelComponent } from './fuel.component';

const routes: Routes = [
  {
    path: '', component: FuelComponent,
    children : [
      { path: 'store-competitor', loadChildren: './store-competitor/store-competitor.module#StoreCompetitorModule' },
      { path: 'tank-management', loadChildren: './tank-management/tank-management.module#TankManagementModule' },
      { path: 'competitor-pricing', loadChildren: './competitor-pricing/competitor-pricing.module#CompetitorPricingModule' },
      { path: 'fuel-pricing', loadChildren: './fuel-pricing/fuel-pricing.module#FuelPricingModule' },
      { path: 'network-summary', loadChildren: './network-summary/network-summary.module#NetworkSummaryModule' },
      { path: 'fuel-reconciliation', loadChildren: './fuel-reconciliation/fuel-reconciliation.module#FuelReconciliationModule' },
      { path: 'fuel-management', loadChildren: './fuel-management/fuel-management.module#FuelManagementModule' },
      { path: 'fuel-inventory', loadChildren: './fuel-inventory/fuel-inventory.module#FuelInventoryModule' },
      { path: 'fuel-price-change-history', loadChildren: './price-change-history/price-change-history.module#PriceChangeHistoryModule' },
      { path: 'fuel-profit', loadChildren: './fuel-profit/fuel-profit.module#FuelProfitModule' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelRoutingModule { }
