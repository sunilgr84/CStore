import { Component, OnInit } from '@angular/core';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { EditableGridService } from 'src/app/shared/services/editableGrid/editable-grid.service';
import { ItemReference } from '../../models/item-reference.model';
@Component({
  selector: 'app-item-references',
  templateUrl: './item-references.component.html',
  styleUrls: ['./item-references.component.scss']
})
export class ItemReferencesComponent implements OnInit {
  gridOptions: any;
  rowData: any;
  sellingPriceGridRowData: any;
  gridApi: any;
  gridColumnApi: any;
  sellingPriceApi: any;
  isShowHide = false;
  editGridOptions: any;
  itemReference: any;
  constructor(private gridService: GridService, private editableGrid: EditableGridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemRefenceGrid);
    this.editGridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.sellingPriceGrid);
    this.itemReference = new ItemReference();
  }
  ngOnInit() {
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
  onSellingPriceReady(params) {
    this.sellingPriceApi = params.api;
  }
  addRows() {
    const id = this.sellingPriceApi.getDisplayedRowCount() + 1;
    this.sellingPriceApi.updateRowData({
      add: [{
        srNo: id, SellingUnit: 0, Amount: 0
      }]
    });
    this.getRowData();
  }
  getRowData() {
    const sellingPriceRowData = [];
    this.sellingPriceApi.forEachNode(function (node) {
      sellingPriceRowData.push(node.data);
    });
    this.sellingPriceGridRowData = sellingPriceRowData;
  }
  deleteSellingPriceGridRow(params) {
    const selectedData = [];
    selectedData.push(params.data);
    this.sellingPriceApi.updateRowData({ remove: selectedData });
    // TODO: Call Service and Delete data
  }
  addNew() {
    this.isShowHide = true;
  }
  editAction(params) {
    this.isShowHide = true;
    console.log('****oneditAction*****');
    console.log(params.data);
    // TODO: Call Service and Update data
  }
  backToList() {
    this.isShowHide = false;
  }
}
