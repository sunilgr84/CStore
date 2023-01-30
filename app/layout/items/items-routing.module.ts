import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'item' },
  { path: 'item', loadChildren: './item/item.module#ItemModule' },
  { path: 'add-item', loadChildren: './item/add-item/add-item.module#AddItemModule' },
  { path: 'group', loadChildren: './item-group/item-group.module#ItemGroupModule' },
  { path: 'mix-matches', loadChildren: './mix-matches/mix-matches.module#MixMatchesModule' },
  { path: 'delete-pos-item', loadChildren: './delete-positems/delete-positems.module#DeletePOSItemsModule' },
  { path: 'stock-transaction', loadChildren: './stock-transactions/stock-transactions.module#StockTransactionsModule' },
  { path: 'promotions', loadChildren: './promotions/promotions.module#PromotionsModule' },
  { path: 'promotions-new', loadChildren: './promotions-new/promotions-new.module#PromotionsNewModule' },
  { path: 'physical-inventory', loadChildren: './physical-inventory/physical-inventory.module#PhysicalInventoryModule' },
  { path: 'buy-down-manager', loadChildren: './buy-down-manager/buy-down-manager.module#BuyDownManagerModule' },
  { path: 'price-schedule', loadChildren: './price-schedule/price-schedule.module#PriceScheduleModule' },
  { path: 'super-items', loadChildren: './super-items/super-items.module#SuperItemsModule' },
  { path: 'inventory-buy-tag', loadChildren: './inventory-buy-tag/inventory-buy-tag.module#InventoryBuyTagModule' },
  // { path: 'scan-data', loadChildren: './scan-data/scan-data.module#ScanDataModule' },
  { path: 'files', loadChildren: './files/files.module#FilesModule' },
  { path: 'company-price-group', loadChildren: './company-price-group/company-price-group.module#CompanyPriceGroupModule' },
  { path: 'price-group-new', loadChildren: './price-group1/price-group1.module#PriceGroup1Module' },
  { path: 'manage-items', loadChildren: './manage-items/manage-items.module#ManageItemsModule' }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ItemsRoutingModule { }
