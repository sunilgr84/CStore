import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelGradeMappingRoutingModule } from './fuel-grade-mapping-routing.module';
import { FuelGradeMappingComponent } from './fuel-grade-mapping.component';
import { StoreFuelGradeDetailComponent } from './store-fuel-grade-detail/store-fuel-grade-detail.component';
import { StoreFuelGradeTaxComponent } from './store-fuel-grade-tax/store-fuel-grade-tax.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FuelGradeComponent } from '../../admin/company/fuel-grade/fuel-grade.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
import { StoreFuelFormComponent } from './store-fuel-form/store-fuel-form.component';
import { TwoDecimalInputValidatorDirective } from './two-decimal-input-validator.directive';

@NgModule({
  declarations: [FuelGradeMappingComponent, StoreFuelGradeDetailComponent, StoreFuelGradeTaxComponent, FuelGradeComponent, StoreFuelFormComponent, TwoDecimalInputValidatorDirective],
  imports: [
    CommonModule,
    FuelGradeMappingRoutingModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    DirectivesModule,
  ],
  exports: [FuelGradeMappingComponent],
  entryComponents: [FuelGradeComponent]
})
export class FuelGradeMappingModule { }
