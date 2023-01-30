import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreGuidlinesComponent } from './store-guidlines.component';

const routes: Routes = [
  { path: '', component: StoreGuidlinesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreGuidlinesRoutingModule { }
