import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-delete-positems',
  templateUrl: './delete-positems.component.html',
  styleUrls: ['./delete-positems.component.scss']
})
export class DeletePOSItemsComponent implements OnInit {
  gridOptions: any;
  rowData: any;
  gridColumnApi: any;
  gridApi: any;
  isShowCols = true;
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.deletePOSItemGrid);

  }


  ngOnInit() {
    this.rowData = [{}];
  }

  showHideCols(isShow) {
    this.gridColumnApi.setColumnsVisible(['upcCode', 'description'], isShow);
    this.gridApi.sizeColumnsToFit();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
}
