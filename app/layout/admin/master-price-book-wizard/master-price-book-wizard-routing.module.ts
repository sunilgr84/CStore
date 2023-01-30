import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterPriceBookWizardComponent } from './master-price-book-wizard.component';

const routes: Routes = [
  { path: '', component: MasterPriceBookWizardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterPriceBookWizardRoutingModule { }
