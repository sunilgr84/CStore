import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LotteryComponent } from './lottery.component';

const routes: Routes = [
  {
    path: '', component: LotteryComponent,
    children: [
      { path: 'lottery-inventory', loadChildren: './lottery-inventory/lottery-inventory.module#LotteryInventoryModule' },
      { path: 'lottery-import', loadChildren: './lottery-import/lottery-import.module#LotteryImportModule' },
      { path: 'lottery-details', loadChildren: './lottery-details/lottery-details.module#LotteryDetailsModule' },
      { path: 'add-game', loadChildren: './add-game/add-game.module#AddGameModule' },
      { path: 'confirm-pack', loadChildren: './confirm-pack/confirm-pack.module#ConfirmPackModule' },
      { path: 'activate-pack', loadChildren: './activate-pack/activate-pack.module#ActivatePackModule' },
      { path: 'move-pack', loadChildren: './move-pack/move-pack.module#MovePackModule' },
      { path: 'return-pack', loadChildren: './return-pack/return-pack.module#ReturnPackModule' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LotteryRoutingModule { }
