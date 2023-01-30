// modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
// import { SharedModule } from '@shared/shared.module';

// components
import { TransactionComponent } from './transaction.component';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  imports: [
    CommonModule,
    // SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule, CommonComponentModule
  ],
  exports: [TransactionComponent],
  declarations: [TransactionComponent],
  providers: [],
})
export class TransactionModule { }
