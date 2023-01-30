import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { CompanyComponent } from './company.component';
import { PageHeaderModule } from 'src/app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { CompanyDetailsComponent } from './company-details/company-details.component';
import { PaymentSourceComponent } from './payment-source/payment-source.component';
import { CompanyReconParameterComponent } from './company-recon-parameter/company-recon-parameter.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UserMgmtGridComponent } from './user-mgmt/user-mgmt-grid.component';
import { UserMgmtDetailComponent } from './user-mgmt/user-mgmt-detail/user-mgmt-detail.component';
import { ConfirmationDialogService } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
import { AddPrivilagesComponent } from './add-privilages/add-privilages.component';
import { UserPrivilagesComponent } from './user-privilages/user-privilages.component';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
@NgModule({
  declarations: [CompanyComponent, CompanyDetailsComponent, PaymentSourceComponent,
    CompanyReconParameterComponent, UserMgmtGridComponent, UserMgmtDetailComponent, AddPrivilagesComponent, UserPrivilagesComponent],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule, DirectivesModule,
    GooglePlaceModule
  ],
  providers: [ConfirmationDialogService],
  entryComponents: [ConfirmationDialogComponent]
})
export class CompanyModule { }
