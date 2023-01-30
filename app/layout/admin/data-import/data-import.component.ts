import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { HttpEventType, HttpResponse, HttpClient } from '@angular/common/http';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridService } from '@shared/services/grid/grid.service';
import { ToastrService } from 'ngx-toastr';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { DataImportService } from '@shared/services/dataImport/data-import.service';

@Component({
  selector: 'app-data-import',
  templateUrl: './data-import.component.html',
  styleUrls: ['./data-import.component.scss'],
})
export class DataImportComponent implements OnInit {
  columnOrderItems = [];
  chooseFileName = 'Choose File';
  roles = ['abc', 'abchdljas']; // TODO: service data
  percentDone = 0;
  uploadSuccess: boolean;
  isPassportVCDEvent: boolean;
  fileUpload: any;
  isFilterColRequired = false;
  isFileTypeRequired = true;
  companyList: any;
  storeLocationList: any[];
  userInfo = this.constants.getUserInfo();
  dataImportForm = this._fb.group({
    fileFormat: [''],
    company: [null],
    store: [null],
    fileType: [null],
    fileDataImport: [''],
    inventoryOptions: this._fb.group({
      upcWithCheckDigit: [''],
      calculateInventory: [''],
      priceDivisibleBy100: [''],
      inventoryDate: [''],
      vendorName: [''],
      linesIgnore: [''],
      columnsIgnore: [''],
    }),
    columnOrderInFile: [''],
  });
  fileTypes: any;
  sapphireFileTypes = [
    { name: 'SapphireCustID.config', value: 'SapphireCustID.config' },
    { name: 'SapphireDepartment.config', value: 'SapphireDepartment.config' },
    { name: 'SapphireMOP.config', value: 'SapphireMOP.config' },
    { name: 'SapphireTax.config', value: 'SapphireTax.config' },
    { name: 'SapphireItem.config', value: 'SapphireItem.config' }

  ];
  rubyFileTypes = [
    { name: 'CustID.config', value: 'CustID.config' },
    { name: 'Department.config', value: 'Department.config' },
    { name: 'Item.config', value: 'Item.config' },
    //  { name: 'ItemFromCSV.config', value: 'ItemFromCSV.config' },
    { name: 'Mop.config', value: 'Mop.config' },
    //  { name: 'RGIS.config', value: 'RGIS.config' },
    { name: 'Tax.config', value: 'Tax.config' },
    { name: 'Subash.config', value: 'Subash.config' }
  ];
  // Grid Options
  taxStrategyGridOption: any;
  salesRestrictCodeGridOption: any;
  tenderCodeGridOption: any;
  mdseCodeGridOption: any;
  // Rows
  taxStrategyRowData: any;
  salesRestrictCodeRowData: any;
  tenderCodeRowData: any;
  mdseCodeRowData: any;

  isPassportData: boolean;
  passportItemRowData: any;
  passportItemGridOption: any;

  isSapphireDataShow: boolean;
  sapphireCustIDRowData: any;
  sapphireDepartmentRowData: any;
  sapphireMOPRowData: any;
  sapphireTaxRowData: any;
  sapphireCustIDGridOption: any;
  sapphireDepartmentGridOption: any;
  sapphireMOPGridOption: any;
  sapphireTaxGridOption: any;

  isSapphireTax: boolean;
  isSapphireMOP: boolean;
  isSapphireDepartment: boolean;
  isSapphireCustID: boolean;
  isProcessData: boolean;
  passportVcdData: any;
  passportHtmlGridOption: any;
  isPassportHtml: boolean;
  passportHtmlRowDate: any;
  isSapphireItem: boolean;
  sapphireItemRowData: any;
  sapphireItemGridOption: any;
  // ruby file grid properties
  isRubyDataShow = false;
  custIDGridOption: GridOptions;
  custIDRowData: any;
  isCustIDRowDataShow = false;
  rubyDepartmentGridOption: GridOptions;
  rubyDepartmentRowData: any;
  isRubyDepartmentShow = false;
  itemFromCSVGridOption: GridOptions;
  itemFromCSVRowData: any;
  isItemFromCSVRowShow = false;
  rubyMOPGridOption: GridOptions;
  rubyMOPRowData: any;
  isrubyMOPShow = false;
  rubyTaxGridOption: GridOptions;
  rubyTaxRowData: any;
  isrubyTaxShow = false;
  rubySubashGridOption: GridOptions;
  rubySubashRowData: any;
  isRubySubashShow = false;
  rubyRGISGridOption: GridOptions;
  rubyRGISRowData: any;
  isrubyRGISShow = false;
  rubyItemGridOption: GridOptions;
  rubyItemRowData: any;
  isRubyItemShow = false;
  formatter = (result: string) => result.toUpperCase();
  constructor(private _fb: FormBuilder, private constants: ConstantService, private toastr: ToastrService,
    private http: HttpClient, private _setupService: SetupService, private gridService: GridService,
    private spinner: NgxSpinnerService, private uploadService: DataImportService) {
    this.storeLocationList = [];
    // vcd
    this.taxStrategyGridOption = this.gridService.getGridOption(this.constants.gridTypes.taxStrategyGrid);
    this.salesRestrictCodeGridOption = this.gridService.getGridOption(this.constants.gridTypes.salesRestrictCodeGrid);
    this.tenderCodeGridOption = this.gridService.getGridOption(this.constants.gridTypes.tenderCodeGrid);
    this.mdseCodeGridOption = this.gridService.getGridOption(this.constants.gridTypes.mdseCodeGrid);
    // data maintainance
    this.passportItemGridOption = this.gridService.getGridOption(this.constants.gridTypes.passportItemGrid);
    // Sapphire
    this.sapphireCustIDGridOption = this.gridService.getGridOption(this.constants.gridTypes.sapphireCustIDGrid);
    this.sapphireDepartmentGridOption = this.gridService.getGridOption(this.constants.gridTypes.sapphireDepartmentGrid);
    this.sapphireMOPGridOption = this.gridService.getGridOption(this.constants.gridTypes.sapphireMOPGrid);
    this.sapphireTaxGridOption = this.gridService.getGridOption(this.constants.gridTypes.sapphireTaxGrid);
    this.sapphireItemGridOption = this.gridService.getGridOption(this.constants.gridTypes.sapphireItemGrid);
    // html passport
    this.passportHtmlGridOption = this.gridService.getGridOption(this.constants.gridTypes.passportHtmlGrid);
    // ruby file
    this.custIDGridOption = this.gridService.getGridOption(this.constants.gridTypes.custIDGrid);
    this.rubyDepartmentGridOption = this.gridService.getGridOption(this.constants.gridTypes.rubyDepartmentGrid);
    this.itemFromCSVGridOption = this.gridService.getGridOption(this.constants.gridTypes.itemFromCSVGrid);
    this.rubyMOPGridOption = this.gridService.getGridOption(this.constants.gridTypes.rubyMOPGrid);
    this.rubyTaxGridOption = this.gridService.getGridOption(this.constants.gridTypes.rubyTaxGrid);
    this.rubySubashGridOption = this.gridService.getGridOption(this.constants.gridTypes.rubySubashGrid);
    this.rubyRGISGridOption = this.gridService.getGridOption(this.constants.gridTypes.rubyRGISGrid);
    this.rubyItemGridOption = this.gridService.getGridOption(this.constants.gridTypes.passportHtmlGrid);

    this.dataImportForm.get('fileFormat').setValue('ruby');
    this.fileTypes = this.rubyFileTypes;
  }

  ngOnInit() {
    this.getCompanyList();
    //  this.getStoreLocationList();
  }
  roleSearch = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term.length < 2
          ? []
          : this.roles
            .filter(v => v.toLowerCase().startsWith(term.toLocaleLowerCase()))
            .splice(0, 10),
      ),
    )

  getCompanyList() {
    this._setupService.getData(`Company/list/${this.userInfo.roles[0]}/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe((response) => {
        this.companyList = response;
        if (this.companyList && this.companyList.length === 1) {
          this.dataImportForm.get('company').setValue(this.companyList[0].companyID);
        }
      }, (error) => {
        console.log(error);
      });
  }
  getStoreLocationList() {
    if (!this.dataImportForm.controls.company.value) {
      this.dataImportForm.get('store').setValue(null);
      this.storeLocationList = [];
      return;
    }
    // tslint:disable-next-line:max-line-length
    this._setupService.getData(`StoreLocation/getByCompanyId/${Number(this.dataImportForm.controls.company.value)}/${this.userInfo.userName}`)
      .subscribe((response) => {
        this.storeLocationList = response;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.dataImportForm.get('store').setValue(this.storeLocationList[0].storeLocationID);
        }
      }, (error) => {
        console.log(error);
      });
  }

  // ===================================== File Upload ==================================================
  basicUpload(files: File[]) {
    if (!files) {
      this.toastr.warning('Please provide file');
      return;
    }
    if (!this.dataImportForm.controls.company.value) {
      this.toastr.warning('Please select company');
      return;
    }
    if (!this.dataImportForm.controls.store.value) {
      this.toastr.warning('Please select store');
      return;
    }
    if (this.isFileTypeRequired) {
      if (!this.dataImportForm.controls.fileType.value) {
        this.toastr.warning('Please select file type');
        return;
      }
    }
    const fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    let queryParams = '';
    switch (this.dataImportForm.controls.fileFormat.value) {
      case 'ruby':
        queryParams =
          'ImportFileData?CompanyID=' +
          Number(this.dataImportForm.controls.company.value) +
          '&StoreLocationID=' +
          Number(this.dataImportForm.controls.store.value) +
          '&fileTypes=' +
          this.dataImportForm.controls.fileType.value +
          '&fileExtension=config';
        break;
      case 'vcdFile':
        queryParams =
          'VCDFileUpload?CompanyID=' +
          Number(this.dataImportForm.controls.company.value) +
          '&StoreLocationID=' +
          Number(this.dataImportForm.controls.store.value) +
          '&fileTypes=' +
          'config' +
          '&fileExtension=xml';
        break;
      case 'passportHtml':
        queryParams =
          'PasspostHtmlFile?CompanyID=' +
          Number(this.dataImportForm.controls.company.value) +
          '&StoreLocationID=' +
          Number(this.dataImportForm.controls.store.value) +
          '&fileTypes=html.config' +
          '&fileExtension=config';
        break;
      case 'passportData':
        queryParams =
          'SapphireFileUpload?CompanyID=' +
          Number(this.dataImportForm.controls.company.value) +
          '&StoreLocationID=' +
          Number(this.dataImportForm.controls.store.value) +
          '&fileTypes=PassportItem.config' +
          '&fileExtension=xml';
        break;
      case 'sapphire':
        queryParams =
          'SapphireFileUpload?CompanyID=' +
          Number(this.dataImportForm.controls.company.value) +
          '&StoreLocationID=' +
          Number(this.dataImportForm.controls.store.value) +
          '&fileTypes=' +
          this.dataImportForm.controls.fileType.value +
          '&fileExtension=config';
        break;
    }
    if (!queryParams) {
      return;
    }

    this.uploadService.postData('DataImport/' + queryParams, formData)
      .subscribe(response => {
        if (response.type === HttpEventType.UploadProgress) {
          this.percentDone = Math.round((100 * response.loaded) / response.total);
          // tslint:disable-next-line: deprecation
        } else if (event instanceof HttpResponse) {
          this.uploadSuccess = true;
        }
        if (response['body'] && response['body'].data) {
          this.loadGridData(this.dataImportForm.controls.fileFormat.value, response['body'].data);
        }
      });
  }

  uploadFile(files) {
    this.fileUpload = files;
    this.chooseFileName = 'Choose file';
    this.percentDone = 0;
    if (files && files[0]) {
      this.chooseFileName = files[0].name;
    }
  }

  // ============================================ End ==================================================

  loadGridData(fileType, data) {
    if (!data) {
      return;
    }
    this.isProcessData = true;
    this.isSapphireDataShow = this.isSapphireDepartment = this.isSapphireCustID = this.isSapphireMOP =
      this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent =
      this.isRubyDataShow = this.isCustIDRowDataShow = this.isRubyDepartmentShow = this.isItemFromCSVRowShow =
      this.isrubyMOPShow = this.isrubyRGISShow = this.isrubyTaxShow = this.isRubySubashShow = false;
    switch (fileType) {
      case 'ruby':
        this.isRubyDataShow = true;
        const rubyFileTypeConfig = (this.dataImportForm.controls.fileType.value).trim();
        if (rubyFileTypeConfig === 'CustID.config') {
          this.custIDRowData = data;
          this.isCustIDRowDataShow = true;
        }
        if (rubyFileTypeConfig === 'Department.config') {
          this.rubyDepartmentRowData = data;
          this.isRubyDepartmentShow = true;
        }
        if (rubyFileTypeConfig === 'Item.config') {
          this.rubyItemRowData = data;
          this.isRubyItemShow = true;
        }
        if (rubyFileTypeConfig === 'ItemFromCSV.config') {
          this.itemFromCSVRowData = data;
          this.isItemFromCSVRowShow = true;
        }
        if (rubyFileTypeConfig === 'Mop.config') {
          this.rubyMOPRowData = data;
          this.isrubyMOPShow = true;
        }
        if (rubyFileTypeConfig === 'RGIS.config') {
          this.rubyRGISRowData = data;
          this.isrubyRGISShow = true;
        }
        if (rubyFileTypeConfig === 'Tax.config') {
          this.rubyTaxRowData = data;
          this.isrubyTaxShow = true;
        }
        if (rubyFileTypeConfig === 'Subash.config') {
          this.rubySubashRowData = data;
          this.isRubySubashShow = true;
        }
        break;
      case 'vcdFile':
        this.passportVcdData = data;
        this.taxStrategyRowData = data && data.taxStrategyList;
        this.salesRestrictCodeRowData = data && data.salesRestrictCodeList;
        this.tenderCodeRowData = data && data.tenderCodeList;
        this.mdseCodeRowData = data && data.mdseCodeList;
        this.isPassportVCDEvent = true;
        break;
      case 'passportHtml':
        this.isPassportHtml = true;
        this.passportHtmlRowDate = data && data.htmlTable;
        break;
      case 'passportData':
        this.passportItemRowData = data;
        this.isPassportData = true;
        break;
      case 'sapphire':
        const fileTypeConfig = (this.dataImportForm.controls.fileType.value).trim();
        // if (fileTypeConfig !== 'SapphireItem.config') {
        this.isSapphireDataShow = true;
        // }
        if (fileTypeConfig === 'SapphireCustID.config') {
          this.sapphireCustIDRowData = data;
          this.isSapphireCustID = true;
        } else if (fileTypeConfig === 'SapphireDepartment.config') {
          this.sapphireDepartmentRowData = data;
          this.isSapphireDepartment = true;
        } else if (fileTypeConfig === 'SapphireMOP.config') {
          this.sapphireMOPRowData = data;
          this.isSapphireMOP = true;
        } else if (fileTypeConfig === 'SapphireTax.config') {
          this.sapphireTaxRowData = data;
          this.isSapphireTax = true;
        } else if (fileTypeConfig === 'SapphireItem.config') {
          this.sapphireItemRowData = data;
          this.isSapphireItem = true;
        }
        break;
    }
  }

  // ============================================= Radio Button ==========================================
  viewChange() {
    this.dataImportForm.get('fileType').setValue(null);
    this.fileTypes = this.rubyFileTypes; this.isFileTypeRequired = true;
    this.isSapphireDataShow = this.isSapphireDepartment = this.isSapphireCustID = this.isSapphireMOP =
      this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent =
      this.isRubyDataShow = this.isCustIDRowDataShow = this.isRubyDepartmentShow = this.isItemFromCSVRowShow =
      this.isrubyMOPShow = this.isrubyRGISShow = this.isrubyTaxShow = this.isRubySubashShow = false;
    this.isFilterColRequired = false; this.isPassportHtml = false; this.isSapphireItem = false;
    this.isProcessData = false;
  }

  passportVCDEvent() {
    this.dataImportForm.get('fileType').setValue(null);
    this.isSapphireDataShow = this.isSapphireDepartment = this.isSapphireCustID = this.isSapphireMOP =
      this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent =
      this.isRubyDataShow = this.isCustIDRowDataShow = this.isRubyDepartmentShow = this.isItemFromCSVRowShow =
      this.isrubyMOPShow = this.isrubyRGISShow = this.isrubyTaxShow = this.isRubySubashShow = false;
    this.isFilterColRequired = false; this.isPassportHtml = false; this.isSapphireItem = false;
    this.isProcessData = false;
    this.isFileTypeRequired = false;
  }
  passportDataEvent() {
    this.dataImportForm.get('fileType').setValue(null);
    this.isSapphireDataShow = this.isSapphireDepartment = this.isSapphireCustID = this.isSapphireMOP =
      this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent =
      this.isRubyDataShow = this.isCustIDRowDataShow = this.isRubyDepartmentShow = this.isItemFromCSVRowShow =
      this.isrubyMOPShow = this.isrubyRGISShow = this.isrubyTaxShow = this.isRubySubashShow = false;
    this.isFilterColRequired = false; this.isPassportHtml = false; this.isSapphireItem = false;
    this.isProcessData = false;
    this.isFileTypeRequired = false;
  }

  // ===================================== File format data save ==============================
  processData() {
    this.spinner.show();
    let queryParams = '';
    const formData = {
      'companyID': 0,
      'storeLocationID': 0,
      'fileTypes': '',
      'fileExtension': '',
      'dataImportList': []
    };
    switch (this.dataImportForm.controls.fileFormat.value) {
      case 'ruby':
        queryParams = 'AddRubyConfigFile';
        formData.companyID = Number(this.dataImportForm.controls.company.value);
        formData.storeLocationID = Number(this.dataImportForm.controls.store.value);
        const rubyFileTypeConfig = (this.dataImportForm.controls.fileType.value).trim();
        if (rubyFileTypeConfig === 'CustID.config') {
          formData.dataImportList = this.custIDRowData;
          formData.fileTypes = 'CustID.config';
        }
        if (rubyFileTypeConfig === 'Department.config') {
          formData.dataImportList = this.rubyDepartmentRowData;
          formData.fileTypes = 'Department.config';
        }
        if (rubyFileTypeConfig === 'Item.config') {
          formData.dataImportList = this.rubyItemRowData;
          formData.fileTypes = 'Item.config';
        }
        if (rubyFileTypeConfig === 'ItemFromCSV.config') {
          formData.dataImportList = this.itemFromCSVRowData;
          formData.fileTypes = 'ItemFromCSV.config';
        }
        if (rubyFileTypeConfig === 'Mop.config') {
          formData.dataImportList = this.rubyMOPRowData;
          formData.fileTypes = 'Mop.config';
        }
        if (rubyFileTypeConfig === 'RGIS.config') {
          formData.dataImportList = this.rubyRGISRowData;
          formData.fileTypes = 'RGIS.config';
        }
        if (rubyFileTypeConfig === 'Tax.config') {
          formData.dataImportList = this.rubyTaxRowData;
          formData.fileTypes = 'Tax.config';
        }
        if (rubyFileTypeConfig === 'Subash.config') {
          formData.dataImportList = this.rubySubashRowData;
          formData.fileTypes = 'Subash.config';
        }
        break;
      case 'vcdFile':
        queryParams = 'AddPassPortVCD';
        formData.companyID = Number(this.dataImportForm.controls.company.value);  // 655 for testing
        formData.storeLocationID = Number(this.dataImportForm.controls.store.value); // 849 for testing
        formData.fileTypes = 'TaxStrategyId,SalesRestrictCode,TenderCode,MdseCode';
        formData.dataImportList = [
          this.taxStrategyRowData,
          this.salesRestrictCodeRowData,
          this.tenderCodeRowData,
          this.mdseCodeRowData
        ];
        break;
      case 'passportHtml':
        queryParams = 'AddPassPortHtmlFile';
        formData.companyID = Number(this.dataImportForm.controls.company.value);
        formData.storeLocationID = Number(this.dataImportForm.controls.store.value);
        formData.fileTypes = 'html.config';
        formData.dataImportList = this.passportHtmlRowDate;
        break;
      case 'passportData':
        queryParams = 'AddSapphireFile';
        formData.companyID = Number(this.dataImportForm.controls.company.value);
        formData.storeLocationID = Number(this.dataImportForm.controls.store.value);
        formData.fileTypes = 'PassportItem.config';
        formData.dataImportList = this.passportItemRowData;
        break;
      case 'sapphire':
        queryParams =
          queryParams = 'AddSapphireFile';
        formData.companyID = Number(this.dataImportForm.controls.company.value);
        formData.storeLocationID = Number(this.dataImportForm.controls.store.value);
        const fileTypeConfig = (this.dataImportForm.controls.fileType.value).trim();
        if (fileTypeConfig === 'SapphireCustID.config') {
          formData.fileTypes = 'SapphireCustID.config';
          formData.dataImportList = this.sapphireCustIDRowData;
        } else if (fileTypeConfig === 'SapphireDepartment.config') {
          formData.fileTypes = 'SapphireDepartment.config';
          formData.dataImportList = this.sapphireDepartmentRowData;
        } else if (fileTypeConfig === 'SapphireMOP.config') {
          formData.fileTypes = 'SapphireMOP.config';
          formData.dataImportList = this.sapphireMOPRowData;
        } else if (fileTypeConfig === 'SapphireTax.config') {
          formData.fileTypes = 'SapphireTax.config';
          formData.dataImportList = this.sapphireTaxRowData;
        } else if (fileTypeConfig === 'SapphireItem.config') {
          formData.fileTypes = 'SapphireItem.config';
          formData.dataImportList = this.sapphireItemRowData;
        }
        break;
    }
    // formData.companyID = 655;
    // formData.storeLocationID = 849;
    this._setupService.postData('DataImport/' + queryParams, formData)
      .subscribe(response => {
        this.spinner.hide();
        if (response && response['statusCode'] === 200 && response['success'] > 0) {
          this.isProcessData = false;
          this.toastr.success('Data processed successfuly...', 'Success!');
          this.isSapphireDataShow = this.isSapphireDepartment = this.isSapphireCustID = this.isSapphireMOP =
            this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent = this.isProcessData = false;
          this.isFilterColRequired = false; this.isPassportHtml = false; this.isSapphireItem = false;
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error('Something went wrong, Please contact to administrator', 'Error!!');
      });
  }
  // =========================================== Sapphire ================================================
  sapphirEvent() {
    this.dataImportForm.get('fileType').setValue(null);
    this.fileTypes = this.sapphireFileTypes;
    this.isSapphireTax = this.isPassportData = this.isPassportVCDEvent =
      this.isRubyDataShow = this.isCustIDRowDataShow = this.isRubyDepartmentShow = this.isItemFromCSVRowShow =
      this.isrubyMOPShow = this.isrubyRGISShow = this.isrubyTaxShow = this.isRubySubashShow = false;
    this.isFilterColRequired = false; this.isPassportHtml = false; this.isSapphireItem = false;
    this.isProcessData = false;
    this.isFileTypeRequired = true;
  }
  taxStrategyGridReady(params) {
    console.log(params);
  }
  salesRestrictCodeGridReady(params) {
    console.log(params);
  }
  tenderCodeGridReady(params) {
    console.log(params);
  }
  mdseCodeGridReady(params) {
    console.log(params);
  }
  passportItemGridReady(params) {
    console.log(params);
  }
  passportHtmlGridReady(params) {
    console.log(params);
  }
  // =========================================== Passport Html ============================================
}
