import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ItemReferencesComponent } from './item-references.component';

const routes: Routes = [
  { path: '', component: ItemReferencesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemReferencesRoutingModule { }
