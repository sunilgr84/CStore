import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import { PageHeaderModule } from 'src/app/shared';
import { MasterPriceBookWizardComponent } from './master-price-book-wizard/master-price-book-wizard.component';

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule
  ]
})
export class AdminModule { }
