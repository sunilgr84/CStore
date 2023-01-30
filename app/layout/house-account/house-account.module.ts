import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HouseAccountComponent } from './house-account.component';
import { HouseAccountRoutingModule } from './house-account-routing.module';
import { PageHeaderModule } from '@shared/modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddHouseAccountComponent } from './add-house-account/add-house-account.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from '@shared/component/confirmation-dialog/confirmation-dialog.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
@NgModule({
  declarations: [HouseAccountComponent, AddHouseAccountComponent],
  imports: [
    CommonModule,
    HouseAccountRoutingModule,
    PageHeaderModule,
    FormsModule,
    ReactiveFormsModule,
    CommonComponentModule,
    DirectivesModule,
    GooglePlaceModule
  ],
  exports: [HouseAccountComponent],
  providers: [ConfirmationDialogService],
  entryComponents: [ConfirmationDialogComponent]
})
export class HouseAccountModule { }
