import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StockTransactionsComponent } from './stock-transactions.component';

const routes: Routes = [
  { path: '', component: StockTransactionsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StockTransactionsRoutingModule { }
