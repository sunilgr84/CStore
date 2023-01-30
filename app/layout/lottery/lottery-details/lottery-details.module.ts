import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LotteryDetailsRoutingModule } from './lottery-details-routing.module';
import { LotteryDetailsComponent } from './lottery-details.component';
import { PageHeaderModule } from '@shared/modules';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SoldInventoryComponent } from './lottery-inventory/sold-inventory/sold-inventory.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
import { ConfirmationDialogComponent } from '@shared/component/confirmation-dialog/confirmation-dialog.component';
import { LotteryInventoryComponent } from './lottery-inventory/lottery-inventory.component';


@NgModule({
  declarations: [LotteryDetailsComponent,
    SoldInventoryComponent, LotteryInventoryComponent],
  imports: [
    CommonModule,
    LotteryDetailsRoutingModule,
    PageHeaderModule,
    NgbModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DirectivesModule
  ],
  providers: [DatePipe],
  entryComponents: [SoldInventoryComponent, ConfirmationDialogComponent]

})
export class LotteryDetailsModule { }
