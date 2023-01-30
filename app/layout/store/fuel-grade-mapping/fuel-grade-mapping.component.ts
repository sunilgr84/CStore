import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { StoreFuelGrade } from '../../models/store-fuel-grade.model';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { FuelGrade } from '../../models/fuel-grade.model';

@Component({
  selector: 'app-fuel-grade-mapping',
  templateUrl: './fuel-grade-mapping.component.html',
  styleUrls: ['./fuel-grade-mapping.component.scss']
})
export class FuelGradeMappingComponent implements OnInit {

  @Input() storeLocationId: number;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  isCollapsed = false;

  fuelGradeList: FuelGrade[];

  selectedStoreFuelGrade: StoreFuelGrade = null;

  newFuelGradeMapping = false;

  gridApi: any;
  columnApi: any;
  gridOptions: any;
  rowData: any;

  showLocation = false;

  constructor(
    private gridService: GridService, private constants: ConstantService,
    private _fuelService: SetupService, private _setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeFuelGrid);
  }

  ngOnInit() {
    // this.fetchStoreFuelGradeMapping();
    // this.fetchFuelGradeList();
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }
  addFuelGradeMapping(show: boolean) {
    this.isCollapsed = !this.isCollapsed;
    this.selectedStoreFuelGrade = null;
    // this.newFuelGradeMapping = show;
  }

  fetchStoreFuelGradeMapping() {
    this._fuelService.getData(`StoreFuelGrade/list/${this.storeLocationId}`).subscribe((data: StoreFuelGrade[]) => {
      this.rowData = data;
    });
  }

  fetchFuelGradeList() {
    this._setupService.getData(`FuelGrade/list`)
      .subscribe(res => {
        this.fuelGradeList = res;
        this.rowData = res;
        console.log(res);
      }, err => {
        console.error(err);
      });
  }
  backToMainList() {
    this.backToStoreList.emit(false);
  }
  onNavigateStoreFees() {
    const data = { tabId: 'tab-store-fees' };
    this.changeTabs.emit(data);
  }
}
