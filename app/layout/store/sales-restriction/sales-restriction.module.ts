import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SalesRestrictionRoutingModule } from './sales-restriction-routing.module';
import { SalesRestrictionComponent } from './sales-restriction.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ConfirmationDialogService } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.component';

@NgModule({
  declarations: [SalesRestrictionComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    SalesRestrictionRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [SalesRestrictionComponent],
  providers: [ConfirmationDialogService],
  entryComponents: [ConfirmationDialogComponent]
})
export class SalesRestrictionModule { }
