import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatCalendarCellCssClasses, MatDatepicker, MatDatepickerInputEvent } from '@angular/material';
import { MessageService } from '@shared/services/commmon/message-Service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-day-recon-new',
  templateUrl: 'day-recon-new.component.html',
  styleUrls: ['./day-recon-new.component.scss'],
})
export class DayReconNewComponent implements OnInit {
  selectItems: any[] = [{ label: 'Option', value: 'option' }];
  selectedItem: any = 'option';
  uploadFileUrl: string;
  showShift: boolean = true;

  isBankDepositOpen: boolean = false;
  calendarSelectionData: any = [];

  @ViewChild('picker') datePicker: MatDatepicker<Date>;
  @ViewChild('qrModal') qrModal: TemplateRef<any>;

  constructor(
    private messageService: MessageService,
    private storeService: StoreService,
    private constantService: ConstantService,
    private spinner: NgxSpinnerService,
    private setupService: SetupService,
    private toastr: ToastrService,
    private modalService: NgbModal) { }

  ngOnInit() {
    this.userInfo = this.constantService.getUserInfo();
    this.selectedDate = moment().format('ll');
    setTimeout(() => {
      this.messageService.sendMessage("expanded_collaps");
    });
    this.getStoreLocationDetails();
  }

  addBreadCrumb() {
    setTimeout(() => {
      const h2 = document.getElementsByTagName("mat-calendar")
      h2[0].insertAdjacentHTML("afterend", '<div class="m-2"><i class="fa fa-circle text-nodata"></i> No Data <i class="fa fa-circle ml-2 text-reconciled"></i> Reconciled <i class="fa fa-circle ml-2 text-unreconciled"></i> Unreconciled</div>');
    }, 100);
  }

  userInfo: any;
  storeLocationId: any;
  selectedStoreDetails: any;
  shiftWiseValue: any;
  storeLocationList: any;
  shiftList = [
    { name: 'Day Close', value: 0 },
    { name: 'Shift 1', value: 1 },
    { name: 'Shift 2', value: 2 },
    { name: 'Shift 3', value: 3 },
  ];
  selectedDate: any;
  dayReconData: any[];

  getStoreLocationDetails() {
    this.spinner.show();
    this.storeService.getStoresByCompanyId(this.userInfo.companyId).subscribe((response) => {
      this.spinner.hide();
      this.storeLocationList = response;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.storeLocationId = this.storeLocationList[0].storeLocationID;
      }
    }, (error) => {
      console.log(error);
    });
  }

  dateChangeEvent(event: MatDatepickerInputEvent<Date>) {
    const inputDate = event.value && event.value['_d'];
    this.selectedDate = moment(inputDate).format('ll');
    this.fetchDayReconData();
  }

  deductDay() {
    this.selectedDate = moment(this.selectedDate).subtract(1, 'days').format('ll');
    this.fetchDayReconData();
  }

  nextDay() {
    this.selectedDate = moment(this.selectedDate).add(1, 'days').format('ll');
    this.fetchDayReconData();
  }

  selectStoreForDayRecon() {
    this.dayReconData = [];
    if (this.storeLocationId === null) {
      this.shiftWiseValue = null;
      this.showShift = false;
      return;
    }
    this.selectedStoreDetails = this.storeLocationList.filter(data => {
      return data.storeLocationID === this.storeLocationId;
    })[0];
    if (this.selectedStoreDetails.isDayCloseLocation) {
      this.shiftWiseValue = {
        "value": 0
      };
      this.showShift = false;
      this.getReconsiledReportForCalendar();
      setTimeout(() => {
        this.datePicker.open();
      }, 1000);
    } else {
      this.shiftWiseValue = null;
      this.showShift = true;
      return;
    }
  }

  getDayReconDataByShift() {
    if (this.shiftWiseValue === null) {
      return;
    }
    this.datePicker.open();
  }

  getReconsiledReportForCalendar() {
    if (this.calendarSelectionData.length === 0) {
      this.setupService.getData('MovementHeader/getIsDayReconsciledReport?businessDate=' +
        moment().format('MM-DD-YYYY') + '&StoreLocationID=' + this.storeLocationId).subscribe((response) => {
          if (response && response.length > 0) {
            this.calendarSelectionData = response;
          } else {
            this.calendarSelectionData = [];
          }
        });
    }
  }

  fetchDayReconData() {
    this.spinner.show();
    this.setupService.getData('MovementHeader/getDayReconDataObject?businessDate=' +
      moment(this.selectedDate).format('MM-DD-YYYY') + '&StoreLocationID=' + this.storeLocationId + '&shiftWiseValue='
      + this.shiftWiseValue.value).subscribe((response) => {
        this.spinner.hide();
        if (response && response.length > 0) {
          this.dayReconData = response;
          this.dayReconData.forEach(x => {
            let criticalStats = x.criticalStats;
            let departmentSalesTypeobject = x.departmentSalesTypeobject;
            let totalPosSales = departmentSalesTypeobject.reduce((acc, obj) => acc + obj.totalAmount, 0);
            let saleTaxObj = _.find(departmentSalesTypeobject, ['departmentTypeName', 'Sales Tax']);
            if (saleTaxObj === undefined || saleTaxObj === null) {
              saleTaxObj = {
                "departmentTypeID": 0,
                "departmentTypeName": "Default Values",
                "nonTaxableInsideSales": 0,
                "taxableInsideSales": 0,
                "totalAmount": 0
              }
            }
            x['storeName'] = this.selectedStoreDetails.storeName;
            x['selectedDate'] = this.selectedDate;
            x['selectedInfo'] = this.selectedStoreDetails;
            x['totalPosSales'] = totalPosSales;
            x['saleTaxObj'] = saleTaxObj;
            x['criticalStats'] = criticalStats;
            x['departmentSalesTypeobject'] = departmentSalesTypeobject;
          });
        } else {
          this.dayReconData = [];
        }
      }, (error) => {
        this.spinner.hide();
        this.dayReconData = [];
      });
  }

  dateClass() {
    const lastDays = moment().subtract(this.calendarSelectionData.length, 'days');
    return (inputDate: Date): MatCalendarCellCssClasses => {
      var input = moment(inputDate);
      if (input.isBetween(lastDays, moment()) && this.calendarSelectionData.length > 0) {
        var filteredData = this.calendarSelectionData.filter(d => {
          return moment(d.BusinessDate).format("YYYY-MM-DD") === moment(input).format("YYYY-MM-DD");
        });
        if (filteredData.length > 0) {
          if (filteredData[0].IsReconsciled)
            return filteredData[0].IsReconsciled ? 'cal-info' : 'cal-warning';
          else
            return 'cal-no-data';
        } else
          return '';
      } else
        return '';
    };
  }

  openQrModal() {
    this.modalService.open(this.qrModal, { windowClass: 'my-class' });
    const userId = this.userInfo.userId;
    const companyId = this.userInfo.companyId;
    const dateSelected = moment(this.selectedDate).format('MM-DD-YYYY');
    const shiftValue = this.shiftWiseValue.value;
    this.uploadFileUrl = `${location.origin}/#/upload-files/${this.selectedStoreDetails.storeLocationID}/${companyId}/${dateSelected}/${shiftValue}/${userId}`;
  }

  uploadFile(event, movementHeaderID) {
    let dayReconFiles = [];
    for (var i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      let newDayReconFile = {
        file: "",
        fileName: file.name,
        fileType: file.type
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        newDayReconFile.file = reader.result as string;
        dayReconFiles.push(newDayReconFile);
      };
    }
    this.spinner.show();
    setTimeout(() => {
      const postData = {
        movementHeaderID: movementHeaderID,
        companyID: this.userInfo.companyId,
        storeLocationID: this.storeLocationId,
        businessDate: moment(this.selectedDate).format('MM-DD-YYYY'),
        files: dayReconFiles
      }
      this.setupService.postData('MovementHeader/UploadSalesFiles', postData).subscribe(result => {
        this.spinner.hide();
        if (result == 1) {
          this.toastr.success("Files Uploaded Successfully", this.constantService.infoMessages.success);
        } else
          this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
      }, error => {
        this.toastr.error("Files Upload Failed", this.constantService.infoMessages.success);
        this.spinner.hide();
        console.log(error);
      });
    }, 100);

  }
}