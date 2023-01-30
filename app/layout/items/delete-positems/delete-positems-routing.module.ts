import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeletePOSItemsComponent } from './delete-positems.component';

const routes: Routes = [
  { path: '', component: DeletePOSItemsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeletePOSItemsRoutingModule { }
