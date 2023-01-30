import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyPriceGroupRoutingModule } from './company-price-group-routing.module';
import { CompanyPriceGroupComponent } from './company-price-group.component';

import { CommonComponentModule } from '@shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PageHeaderModule } from '@shared/modules';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddCompanyGroupComponent } from './add-company-group/add-company-group.component';
import { ImportGroupComponent } from './import-group/import-group.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PriceGroupDetailsComponent } from './price-group-details/price-group-details.component';

@NgModule({
  declarations: [CompanyPriceGroupComponent, AddCompanyGroupComponent, ImportGroupComponent, PriceGroupDetailsComponent],
  imports: [
    CommonModule,
    CompanyPriceGroupRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    NgbModule.forRoot()
  ]
})
export class CompanyPriceGroupModule { }
