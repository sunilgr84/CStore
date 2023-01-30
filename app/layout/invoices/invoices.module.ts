import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesComponent } from './invoices.component';
import { ConfirmationDialogService } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConfirmationDialogComponent } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.component';
import { CommonComponentModule } from '@shared/component/common-component.module';


@NgModule({
  declarations: [InvoicesComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    InvoicesRoutingModule
  ],
  providers: [ConfirmationDialogService],
  entryComponents: [ConfirmationDialogComponent]
})
export class InvoicesModule { }
