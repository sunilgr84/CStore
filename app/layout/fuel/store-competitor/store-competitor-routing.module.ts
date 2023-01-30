import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreCompetitorComponent } from './store-competitor.component';

const routes: Routes = [
  { path: '', component: StoreCompetitorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreCompetitorRoutingModule { }
