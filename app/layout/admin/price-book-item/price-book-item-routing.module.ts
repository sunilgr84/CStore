import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceBookItemComponent } from './price-book-item.component';

const routes: Routes = [
  { path: '', component: PriceBookItemComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceBookItemRoutingModule { }
