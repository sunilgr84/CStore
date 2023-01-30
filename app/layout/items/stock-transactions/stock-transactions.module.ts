import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { StockTransactionsRoutingModule } from './stock-transactions-routing.module';
import { StockTransactionsComponent } from './stock-transactions.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';

@NgModule({
  declarations: [StockTransactionsComponent],
  imports: [
    CommonModule,
    StockTransactionsRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot(),
    DirectivesModule
  ],
  providers: [DatePipe]
})
export class StockTransactionsModule { }
