import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AccessAuthGuard } from '@shared/guard';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
            { path: 'dashboard', loadChildren: './sales-dashboard/sales-dashboard.module#SalesDashboardModule' },
            // authgaurd if it is super admin then and then admin module will load
            { path: 'admin', loadChildren: './admin/admin.module#AdminModule', canActivate: [AccessAuthGuard] },
            { path: 'admin-accounting', loadChildren: './admin-accounting/admin-accounting.module#AdminAccountingModule' },
            { path: 'company/:id', loadChildren: './admin/company/company.module#CompanyModule' },
            { path: 'stores', loadChildren: './store/store.module#StoreModule' },
            { path: 'departments', loadChildren: './department/department.module#DepartmentModule' },
            { path: 'wiki/charts', loadChildren: './charts/charts.module#ChartsModule' },
            { path: 'wiki/blank-page', loadChildren: './blank-page/blank-page.module#BlankPageModule' },
            { path: 'fuel', loadChildren: './fuel/fuel.module#FuelModule' },
            { path: 'items', loadChildren: './items/items.module#ItemsModule' },
            { path: 'invoice', loadChildren: './invoices/invoices.module#InvoicesModule' },
            { path: 'lottery', loadChildren: './lottery/lottery.module#LotteryModule' },
            // { path: 'master', loadChildren: './master-forms/master-forms.module#MasterFormsModule' },
            { path: 'houseaccount', loadChildren: './house-account/house-account.module#HouseAccountModule' },
            { path: 'store-group', loadChildren: './store-group/store-group.module#StoreGroupModule' },
            { path: 'report', loadChildren: './reports/reports.module#ReportsModule' },
            { path: 'reports', loadChildren: './report/report.module#ReportModule' },
            { path: 'pjrsearch', loadChildren: './pjr-search/pjr-search.module#PjrSearchModule' },
            { path: 'scan-data', loadChildren: './scan-data/scan-data.module#ScanDataModule' },
            { path: 'scan-data1', loadChildren: './scan-data1/scan-data1.module#ScanData1Module' },
            { path: 'user-management', loadChildren: './admin/user-management/user-management.module#UserManagementModule' },
            { path: 'data-import', loadChildren: './admin/data-import/data-import.module#DataImportModule' },
            { path: 'setting', loadChildren: './setting/setting.module#SettingModule' },
            { path: 'time-off', loadChildren: './time-off/time-off.module#TimeOffModule' },
            { path: 'scheduling', loadChildren: './scheduling/scheduling.module#SchedulingModule' },
            { path: 'employee-timesheet-detail', loadChildren: './employee-timesheet-detail/employee-timesheet-detail.module#EmployeeTimesheetDetailModule' },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
