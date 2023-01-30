import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminAccountingRoutingModule } from './admin-accounting-routing.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { AdminAccountingComponent } from './admin-accounting.component';

@NgModule({
  declarations: [AdminAccountingComponent],
  imports: [
    CommonModule,
    AdminAccountingRoutingModule,
    CommonComponentModule
  ]
})
export class AdminAccountingModule { }
