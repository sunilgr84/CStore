import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules, NoPreloading } from '@angular/router';
import { AuthGuard } from './shared';
import { UploadFilesComponent } from './upload-files/upload-files.component';

const routes: Routes = [
    { path: '', loadChildren: './layout/layout.module#LayoutModule', canActivate: [AuthGuard] },
    { path: 'upload-files/:storelocId/:compId/:dateSelected/:shiftVal/:userId', component: UploadFilesComponent },
    { path: 'login', loadChildren: './login/login.module#LoginModule' },
    { path: 'error', loadChildren: './server-error/server-error.module#ServerErrorModule' },
    { path: 'access-denied', loadChildren: './access-denied/access-denied.module#AccessDeniedModule' },
    { path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
    { path: 'maintainance', loadChildren: './maintainance/maintainance.module#MaintainanceModule' },
    { path: 'print-check/:paymentSourceID/:paymentID/:printedBy/:storeBankID', loadChildren: './shared/component/check-print/check-print.module#CheckPrintModule' },
    { path: '**', loadChildren: './not-found/not-found.module#NotFoundModule' }
];
@NgModule({
    imports: [RouterModule.forRoot(routes, { preloadingStrategy: NoPreloading })],
    exports: [RouterModule]
})
export class AppRoutingModule { }