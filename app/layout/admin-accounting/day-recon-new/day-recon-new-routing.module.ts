import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DayReconNewComponent } from './day-recon-new.component';

const routes: Routes = [{ path: '', component: DayReconNewComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DayReconNewRoutingModule { }
