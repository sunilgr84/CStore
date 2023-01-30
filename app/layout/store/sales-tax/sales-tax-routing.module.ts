import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesRestrictionComponent } from '../sales-restriction/sales-restriction.component';

const routes: Routes = [
  { path: '', component: SalesRestrictionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesTaxRoutingModule { }
