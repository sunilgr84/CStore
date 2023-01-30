import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { MasterPriceBookWizardComponent } from './master-price-book-wizard.component';
import { MasterPriceBookWizardRoutingModule } from './master-price-book-wizard-routing.module';

@NgModule({
  declarations: [MasterPriceBookWizardComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    CommonComponentModule, FormsModule,
    MasterPriceBookWizardRoutingModule
  ]
})
export class MasterPriceBookWizardModule { }
