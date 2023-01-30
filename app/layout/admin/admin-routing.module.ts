import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { ScanDataManufacturerComponent } from '../scan-data1/scan-data-manufacturer/scan-data-manufacturer.component';
import { ScanData1Module } from '../scan-data1/scan-data1.module';
import { ScanDataConfigComponent } from '../scan-data1/scan-data-config/scan-data-config.component';
import { ISMUpdateComponent } from './ismupdate/ismupdate.component';
import { ScanDataAcknowledgmentComponent } from '../scan-data1/scan-data-acknowledgment/scan-data-acknowledgment.component';
import { InvoiceAdminDashboardComponent } from './invoice-admin-dashboard/invoice-admin-dashboard.component';

const routes: Routes = [
  {
    path: '', component: AdminComponent,
    children: [
      { path: 'companies', loadChildren: './company/company.module#CompanyModule' },
      // { path: 'company/:id', loadChildren: './company/company.module#CompanyModule' },
      { path: 'live-summary', loadChildren: './live-summary/live-summary.module#LiveSummaryModule' },
      { path: 'data-import', loadChildren: './data-import/data-import.module#DataImportModule' },
      { path: 'employe-timecard', loadChildren: './emp-time-card/emp-time-card.module#EmpTimeCardModule' },
      // { path: 'item-references', loadChildren: './item-references/item-references.module#ItemReferencesModule' },
      // { path: 'site-message', loadChildren: './site-message/site-message.module#SiteMessageModule' },
      { path: 'employee-setup', loadChildren: './employee-setup/employee-setup.module#EmployeeSetupModule' },
      // { path: 'user-management', loadChildren: './user-management/user-management.module#UserManagementModule' },
      { path: 'price-group', loadChildren: './price-group/price-group.module#PriceGroupModule' },
      { path: 'department', loadChildren: './master-department/master-department.module#MasterDepartmentModule' },
      { path: 'department-type', loadChildren: './department-type/department-type.module#DepartmentTypeModule' },
      { path: 'manufacturer', loadChildren: './manufacturer/manufacturer.module#ManufacturerModule' },
      { path: 'price-book-item', loadChildren: './price-book-item/price-book-item.module#PriceBookItemModule' },
      { path: 'brand', loadChildren: './brand/brand.module#BrandModule' },
      { path: 'privileges', loadChildren: './privileges/privileges.module#PrivilegesModule' },
      { path: 'copy-data', loadChildren: './copy-data/copy-data.module#CopyDataModule' },
      { path: 'from-pos', loadChildren: './pos/pos.module#PosModule' },
      { path: 'to-pos', loadChildren: './pos/pos.module#PosModule' },
      { path: 'store-health', loadChildren: './store-health/store-health.module#StoreHealthModule' },
      { path: 'setup-manufacturer', component: ScanDataManufacturerComponent },
      { path: 'scan-data-config', component: ScanDataConfigComponent },
      { path: 'scan-data-acknowledgment', component: ScanDataAcknowledgmentComponent },
      { path: 'ism-update', loadChildren: './ismupdate/ismupdate.module#ISMUpdateModule' },
      { path: 'master-price-book-wizard',loadChildren: './master-price-book-wizard/master-price-book-wizard.module#MasterPriceBookWizardModule' },
      { path: 'inv-admin-dash', loadChildren: './invoice-admin-dashboard/invoice-admin-dashboard.module#InvoiceAdminDashboardModule' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ScanData1Module],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
