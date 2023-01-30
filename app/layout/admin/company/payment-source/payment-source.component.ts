import { Component, OnInit, Input, EventEmitter, Output, OnChanges, ɵConsole } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions, RowNodeCache } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaymentSource } from '@models/payment-source.model';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ActivatedRoute } from '@angular/router';
import { WeatherService } from '@shared/services/weather/weather.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as _ from 'lodash';
import { BankDetailCellRenderer } from '@shared/component/expandable-grid/partials/bank-details-renderer.component';
import { StoreService } from '@shared/services/store/store.service';
import { CommonService } from '@shared/services/commmon/common.service';
@Component({
  selector: 'app-payment-source',
  templateUrl: './payment-source.component.html',
  styleUrls: ['./payment-source.component.scss'],
  animations: [routerTransition(),
  trigger('fadeInOut', [
    state('void', style({
      opacity: 0
    })),
    transition('void <=> *', animate('0.3s')),
  ])],

})
export class PaymentSourceComponent implements OnInit, OnChanges {
  @Input() companyData?: any;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  rowData: any;
  gridOptions: GridOptions;
  isShowHide = false;
  isBankShowHide = false;
  isEdit = false;
  isEdit1;
  isRouteNumEdit = false;
  companyID: any;
  stateCode = '';
  title = 'Add a New Payment Source';
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  // form validation
  isMethodOfPaymentLoading = true;
  paymentSourceForm = this.formBuilder.group({
    paymentSourceID: [0],
    companyID: [0],
    methodOfPaymentID: ['1', Validators.required],
    sourceName: [{ value: '', disabled: true }, Validators.required],
    lastCheckNumber: [0],
    routingNumber: ['', Validators.required],
    addressLine1: [{ value: '', disabled: true }, Validators.required],
    city: [{ value: '', disabled: true }, Validators.required],
    phoneNo: [''],
    stateCode: [{ value: '', disabled: true }, Validators.required],
    notes: [''],
    createdDateTime: new Date(),
    lastModifiedBy: [''],
    lastModifiedDateTime: new Date(),
    createdBy: [''],
    methodOfPaymentDescription: [''],
    isCash: [true],
    isCheck: [true],
    //stateName: ['', Validators.required],
    allowedPaymentStoreLocationID: [0],
    storeLocationID: [0],
    //storeName: [''],
    isDefaultSource: [true],
    //zipCode: [{ value: '', disabled: true }, Validators.required],
    signature: [''],
    bankLogo: [''],
    chartOfAccountCategoryID:['', Validators.required]
  }
  );
  submitted = false;
  stateList: any;
  private gridApi;
  selectedRow: any;
  initialFormValues: PaymentSource;
  methodOfPaymentList: any;
  userInfo: any;
  filterText: any;
  roleName: string;
  detailCellRenderer: any;
  storeList: any;
  selectedStoreIds: any[];
  stores: any;
  signURL: any | '';
  bankLogoURL: any | '';
  isCategoriesLoading:boolean;
  categoriesList: any;
  constructor(private gridService: GridService, private constants: ConstantService, private formBuilder: FormBuilder,
    private setupService: SetupService, private toastr: ToastrService, private weatherService: WeatherService,
    private storeService: StoreService, private spinner: NgxSpinnerService, private utilityService: UtilityService, 
    private route: ActivatedRoute, private toaster: ToastrService, private commonService: CommonService) {
    this.roleName = this.constants.roleName;
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.paymentSourceGrid);
    this.initialFormValues = this.paymentSourceForm.value;

    this.detailCellRenderer = BankDetailCellRenderer;
    this.isEdit1 = false;
    this.isCategoriesLoading=false;
  }
  // convenience getter for easy access to form fields
  get ps() { return this.paymentSourceForm.controls; }
  get pv() { return this.paymentSourceForm.value; }
  ngOnInit() {
    this.getAccountTypes();
    this.userInfo = this.constants.getUserInfo();
    const id = this.route.snapshot.paramMap.get('id');
    this.companyID = id;
    if (id || this.companyData) {
      this.getBindGrid();
    }
    this.getCategories()
  }
 
  
  getCategories() {
    this.isCategoriesLoading = true;
    this.setupService.getData(`ChartOfAccountCategories/GetChartOfAccountCategories`).
        subscribe((response: any) => {
          this.isCategoriesLoading = false;
            this.categoriesList=response;
        }, (error) => {
          this.isCategoriesLoading = false;
          console.log(error);
        }
        );
  }
  ngOnChanges() {
    if (this.companyData) {
      this.getBindGrid();
    }
  }
  deleteImage(urlName) {
    if (urlName == 'sign') {
      this.signURL = '';
      this.paymentSourceForm.get('signature').setValue('');
    }
    else if (urlName == 'bankLogo') {
      this.bankLogoURL = '';
      this.paymentSourceForm.get('bankLogo').setValue('');
    }
  }
  uploadLogo(evt) {
    var files = evt.target.files;
    var file = files[0];
    if (files && file) {
      var reader2 = new FileReader();
      var ext = ['image/jpeg', 'image/png', 'image/jpg'];
      if (ext.indexOf(file.type) == -1) {
        this.toastr.error('Upload only images', 'Error');
        return;
      }
      else {
        reader2.onload = this._handleLogoReaderLoaded.bind(this);
        reader2.readAsDataURL(file);
      }
    }
  }
  _handleLogoReaderLoaded(readerEvt) {
    var binaryString1 = readerEvt.target.result;
    this.paymentSourceForm.get('bankLogo').setValue(binaryString1);
    this.bankLogoURL = binaryString1;
  }
  upload(evt) {
    var files = evt.target.files;
    var file = files[0];
    if (files && file) {
      let reader = new FileReader();
      var ext = ['image/jpeg', 'image/png', 'image/jpg'];
      if (ext.indexOf(file.type) == -1) {
        this.toastr.error('Upload only images', 'Error');
        return;
      }
      else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);
      }
    }
  }
  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.paymentSourceForm.get('signature').setValue(binaryString);
    this.signURL = binaryString;
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }
  changeRouteNum($event) {
    this.paymentSourceForm.get('stateCode').setValue('');
    this.paymentSourceForm.get('city').setValue('');
    this.paymentSourceForm.get('addressLine1').setValue('');
    //this.paymentSourceForm.get('zipCode').setValue('');
    this.paymentSourceForm.get('sourceName').setValue('');
    this.paymentSourceForm.get('notes').setValue('');
  }
  onRouteNumChange($event) {
    let routenum = $event.target.value;
    if (routenum.length >= 9) {
      this.spinner.show();
      this.weatherService.getRouteNum(routenum).subscribe((result) => {
        this.spinner.hide();
        if (result && result["code"] === 404) {
          this.toaster.error("Enter a valid Routing Number");
          const formControl = this.paymentSourceForm.get('routingNumber');
          formControl.setErrors({ invalid: true });
          return;
        }
        if (result && result["code"] === 200) {
          let res = result;
          this.isRouteNumEdit = true;
          this.isEdit1 = true;
          this.paymentSourceForm.get('sourceName').disable()
          this.paymentSourceForm.get('stateCode').disable()
          this.paymentSourceForm.get('city').disable()
          this.paymentSourceForm.get('addressLine1').disable()
          //  this.paymentSourceForm.get('zipCode').disable()
          this.paymentSourceForm.get('stateCode').setValue(res["state"]);
          this.paymentSourceForm.get('city').setValue(res["city"]);
          this.paymentSourceForm.get('addressLine1').setValue(res["address"]);
          //  this.paymentSourceForm.get('zipCode').setValue(res["zip"]);
          this.paymentSourceForm.get('sourceName').setValue(res["customer_name"]);
        }

      },
        (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }

  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  getStoreLocations() {
    this.storeService.getStoresByCompanyId(this.userInfo.companyId).subscribe(
      (response) => {
        const finalArray = [''];
        if (response) {
          response.forEach((x) => {
            const contct = x.storeLocationID; // x.vendorID + ',' +
            finalArray.push(contct);
          });
        }
        return finalArray;
      });
  }
  getCompanyByID(id) {
    this.setupService.getData(`Company/GetByID?companyid=${id}`).subscribe(result => {
      this.stateCode = result.stateCode;
      this.companyID = result.companyID;
      this.getBindGrid();
    });
  }
  getCompanyStateCode() {
    this.companyID = this.companyData && this.companyData.companyID;
    this.stateCode = this.companyData && this.companyData.stateCode;
    this.getBindGrid();
  }
  getMethodOfPayment() {
    this.setupService.getData('MethodOfPayment/GetAllMOP', '').subscribe(
      (response) => {
        this.methodOfPaymentList = response;
        this.isMethodOfPaymentLoading = false;
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getBindGrid() {
    this.spinner.show();
    this.setupService.fetchBanksByCompanyAndStores().subscribe((response) => {
      this.spinner.hide();
      if (response) {
        const arr = _.sortBy(response[0].banks, [function (o) { return o.sourceName.toLowerCase(); }]);
        this.rowData = arr;
        if (this.rowData.length > 0) {
          let lastRow = this.rowData.length - 1;
          setTimeout(() => {
            this.gridApi.forEachNode(function (rowNode, i) {
              rowNode.data.storeList = response[1];
              if (i == lastRow) {
                rowNode.setExpanded(true);
              }
            });
          }, 0);
        }
      }
    },
      (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  // add more record -- showhide div
  addNew() {
    this.paymentSourceForm.patchValue(this.initialFormValues);
    this.isShowHide = true;
    this.title = 'Add a New Payment Source';
    this.isBankShowHide = false;
    this.submitted = false;
    this.selectedRow = [];
    this.isEdit = false;
  }

  reset() {
    // this.addNew();
    this.paymentSourceForm.reset();
    this.signURL = '';
    this.bankLogoURL = '';
    this.submitted = false;
    this.isRouteNumEdit = false;
    this.paymentSourceForm.patchValue(this.initialFormValues);
  }
  addBank() {
    this.reset();
    this.isShowHide = !this.isShowHide;
    this.isRouteNumEdit = false;
    this.isEdit = false;
  }
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  editAction(params: { data: PaymentSource; }) {
    this.gotoTop();
    if (params.data.methodOfPaymentID === 1) {
      this.isBankShowHide = true;
    } else { this.isBankShowHide = false; }
    this.selectedRow = params;
    this.submitted = false;
    this.paymentSourceForm.patchValue(params.data);
    this.signURL = params.data["signature"];
    this.bankLogoURL = params.data["bankLogo"];
    this.isEdit = true;
    this.paymentSourceForm.get('sourceName').enable()
    this.paymentSourceForm.get('sourceName').enable()
    this.paymentSourceForm.get('stateCode').enable()
    this.paymentSourceForm.get('city').enable()
    this.paymentSourceForm.get('addressLine1').enable()
    //this.paymentSourceForm.get('zipCode').enable()
    this.isShowHide = true;
    this.isRouteNumEdit = false;
    this.title = 'Edit Payment Source';
  }

  deleteAction(params) {

  }
  editOrSave(_event, callBack = () => { }) {
    this.submitted = true;
    if (this.paymentSourceForm.invalid) {
      this.toaster.error("Enter all required fields");
      return;
    }
    if (this.paymentSourceForm.valid) {
      this.spinner.show();
      if (this.isEdit) {
        const postData = {
          ...this.paymentSourceForm.getRawValue(),
          companyID: this.companyID,
        };
        delete postData["storeBanks"];
        delete postData["storeList"];
        this.setupService.updateData('PaymentSource/Update', postData).
          subscribe((response: any) => {
            this.spinner.hide();
            if (response && Number(response) == 1) {
              this.reset();
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
              //const data: PaymentSource[] = this.rowData;
              //data[this.selectedRow.rowIndex] = postData;
              // this.rowData = data;
              this.isShowHide = false;
              this.isRouteNumEdit = false;
              this.getBindGrid();
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
      } else {
        this.spinner.show();
        const postData = {
          ...this.paymentSourceForm.getRawValue(),
          companyID: this.companyID,
        };
        this.setupService.postData('PaymentSource/AddNew', postData).
          subscribe((response) => {
            this.spinner.hide();
            if (response && response.paymentSourceID) {
              this.isRouteNumEdit = false;
              this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
              this.paymentSourceForm.get('paymentSourceID').setValue(response.paymentSourceID);
              //  this.selectedRow = [];
              //  this.selectedRow['data'] = response;
              this.isEdit = true;
              this.isShowHide = false;
              this.isRouteNumEdit = false;
              this.getBindGrid();
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            }

          },
            (error) => {
              this.spinner.hide();
              console.log(error);
              this.toastr.error(this.constants.infoMessages.contactAdmin);
            });
      }
    }
  }
  getAccountTypes() {
    this.setupService.getData("PaymentSource/GetBankAccountTypes")
      .subscribe((response) => {
        this.commonService.accountTypes = response;
      }, (error) => {
        console.log(error);
      });
  }
}
