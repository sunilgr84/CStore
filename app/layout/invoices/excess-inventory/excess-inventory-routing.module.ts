import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExcessInventoryComponent } from './excess-inventory.component';

const routes: Routes = [
  { path: '', component: ExcessInventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExcessInventoryRoutingModule { }
