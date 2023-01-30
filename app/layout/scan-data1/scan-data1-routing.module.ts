import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScanDataManufacturerComponent } from './scan-data-manufacturer/scan-data-manufacturer.component';
import { ScanData1Component } from './scan-data1.component';
import { ScanDataSetupComponent } from './scan-data-setup/scan-data-setup.component';
import { DataComponent } from './data/data.component';
import { FileLogComponent } from './file-log/file-log.component';

const routes: Routes = [
  { path: '', component: ScanData1Component,
    children: [
      { path: 'setup-manufacturer', component: ScanDataManufacturerComponent },
      { path: 'scan-data-setup', component: ScanDataSetupComponent },
      { path: 'data', component: DataComponent },
      { path: 'file-log', component: FileLogComponent}
    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScanData1RoutingModule { }
