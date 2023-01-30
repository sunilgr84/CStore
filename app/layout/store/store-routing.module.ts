import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreComponent } from './store.component';

const routes: Routes = [
  {
    path: '', component: StoreComponent,
    // children: [
    //   { path: 'fuel-grade', loadChildren: './fuel-grade-mapping/fuel-grade-mapping.module#FuelGradeMappingModule' },
    //   { path: 'payment-categories', loadChildren: './payment-categories/payment-categories.module#PaymentCategoriesModule' },
    //   { path: 'payment-method', loadChildren: './payment-method/payment-method.module#PaymentMethodModule' },
    //   { path: 'sales-restriction', loadChildren: './sales-restriction/sales-restriction.module#SalesRestrictionModule' },
    //   { path: 'sales-tax', loadChildren: './sales-tax/sales-tax.module#SalesTaxModule' },
    //   { path: 'setup-crcardfees', loadChildren: './setup-credit-card-fees/setup-credit-card-fees.module#SetupCreditCardFeesModule' },
    //   { path: 'store-guidlines', loadChildren: './store-guidlines/store-guidlines.module#StoreGuidlinesRoutingModule' },
    //   { path: 'store-informtion', loadChildren: './store-informtion/store-informtion.module#StoreInformtionModule' }
    // ]

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreRoutingModule { }
