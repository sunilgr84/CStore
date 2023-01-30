import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GridService } from '@shared/services/grid/grid.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-item-group',
  templateUrl: './item-group.component.html',
  styleUrls: ['./item-group.component.scss']
})
export class ItemGroupComponent implements OnInit {


  isMasterPriceGroupCollapsed = true;
  isCustomPriceGroupCollapsed = true;
  isAddNewCollapsed = true;
  isHide = true;
  masterPriceGroupRowData: any[];
  customPriceGroupRowData: any[];
  masterPriceGroupGridOptions: any;
  customPriceGroupGridOptions: any;
  masterPriceGroupApi: any;
  closeResult: string;
  updateRelatedCrtnOrPack = false;
  customInitialFormValues: any;
  addCustomPriceGroupForm = this._fb.group({
    groupCode: ['', Validators.required],
    groupDescription: ['', Validators.required],
    isActive: [true],
  });
  constructor(private gridService: GridService, private constants: ConstantService,
    private _itemsService: SetupService, private _tstr: ToastrService, private _toastr: ToastrService,
    private _spinner: NgxSpinnerService, private _fb: FormBuilder, private modalService: NgbModal,
    private editableGrid: EditableGridService) {
    this.customPriceGroupGridOptions = this.editableGrid.getGridOption(
      this.constants.editableGridConfig.gridTypes.itemCustomPriceGroupGrid);
    this.masterPriceGroupGridOptions = this.gridService.getGridOption(this.constants.gridTypes.masterPriceGroupGrid);
    this.customInitialFormValues = this.addCustomPriceGroupForm.value;

  }

  ngOnInit() {
    this.getAllGroupList();
  }
  getGridReady(params) {
    this.masterPriceGroupApi = params.api;
    this.masterPriceGroupApi.sizeColumnsToFit();
    this.masterPriceGroupRowData = [
      { groupName: 'abc', updatePrice: 'pqr' },
    ];
  }
  onReady(params) {
    console.log('not working');
  }
  editAction(params, content) {
    console.log(params);
    this.open(content);
  }
  customPriceEditAction(params, content) {
    console.log(params);
    this.open(content);
  }
  resetCustomForm() {
    this.addCustomPriceGroupForm.patchValue(this.customInitialFormValues);
  }
  open(content: any) {
    this.modalService.open(content, { size: 'sm' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  getAllGroupList() {
    this._itemsService.getData(`Group/getData`).subscribe(result => {
      console.log(result);
      this.customPriceGroupRowData = result;
    });
  }
  saveAndClose() {
    this.save(() => { this.isHide = true; });
  }
  save(callBack = () => { }) {
    callBack();
    console.log(this.addCustomPriceGroupForm.value);
    const postData = {
      ...this.addCustomPriceGroupForm.value,
      groupID: 0,
      companyID: 0,
    };
    this._itemsService.postData(`Group/addNew`, postData).subscribe(result => {
      console.log(result);
      this.resetCustomForm();
      this._toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
    }, error => {
      console.log(error);
      this._toastr.success(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
    });
  }
}
