import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SoldInventoryComponent } from './sold-inventory/sold-inventory.component';

@Component({
  selector: 'app-lottery-inventory',
  templateUrl: './lottery-inventory.component.html',
  styleUrls: ['./lottery-inventory.component.scss'],
  entryComponents: [SoldInventoryComponent]
})
export class LotteryInventoryComponent implements OnInit {
  editRowData?: any; // input paramter
  rowData: any = [];
  gridOptions: any;
  isPopup = false;
  constructor(private gridSerivce: GridService, private constantService: ConstantService, private modalService: NgbModal) {
    this.gridOptions = this.gridSerivce.getGridOption(this.constantService.gridTypes.lotteryInventoryGrid);
  }

  ngOnInit() {
  }
  editAction(params) {
    const modalRef = this.modalService.open(SoldInventoryComponent);
    modalRef.componentInstance.editRowData = params.data;
  }
}
