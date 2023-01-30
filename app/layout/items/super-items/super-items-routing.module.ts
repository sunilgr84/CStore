import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperItemsComponent } from './super-items.component';

const routes: Routes = [
  { path: '', component: SuperItemsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SuperItemsRoutingModule { }
