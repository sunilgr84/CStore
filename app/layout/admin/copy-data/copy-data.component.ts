import { Component, OnInit } from '@angular/core';
import { TestService } from '@shared/services/test/test.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import { Department } from '@models/department.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-copy-data',
  templateUrl: './copy-data.component.html',
  styleUrls: ['./copy-data.component.scss']
})
export class CopyDataComponent implements OnInit {
  copyDataList = [
    { id: 1, name: 'Copy Items', copyId: 0 },
    { id: 2, name: 'Update Item Description', copyId: 7 },
    { id: 3, name: 'Copy Vendor Items', copyId: 2 },
    { id: 4, name: 'Copy Multiplier', copyId: 3 },
    { id: 5, name: 'Update Item Description From Item Reference', copyId: 1 }
  ];
  // Source
  srCompanyList = [];
  srStoreList = [];
  srDepartmentList = [];
  srVendorList = [];

  ///  Destination
  desCompanyList = [];
  desStoreList = [];
  desDepartmentList = [];
  desVendorList = [];
  postData = {
    copyOption: null,
    srCompany: null,
    dstCompany: null,
    srStore: null,
    dstStore: null,
    srDepartment: null,
    dstDepartment: null,
    srVendor: null,
    dstVendor: null,
    isPrice: false,
    isPriceGroup: false,
    isCopyMultiplier: false,
    isCopyMultiPacks: false,
  };
  isCopyItem = false;
  isUpdateItemDescription = false;
  isCopyItemsGroup = false;
  isCopyVendorItems = false;
  isCopyMultiplier = false;
  userInfo: any;
  constructor(private dataService: SetupService, private consantService: ConstantService
    , private spinner: NgxSpinnerService, private storeService: StoreService, private toastr: ToastrService) {
    this.userInfo = this.consantService.getUserInfo();
  }

  ngOnInit() {
    this.getCompanyList();
  }
  getCompanyList() {
    this.spinner.show();
    this.dataService.getData('Company/list')
      .subscribe((response) => {
        this.spinner.hide();
        this.desCompanyList = this.srCompanyList = response;
      });
  }
  changeCopyData() {
    this.postData = {
      copyOption: this.postData.copyOption,
      srCompany: null,
      dstCompany: null,
      srStore: null,
      dstStore: null,
      srDepartment: null,
      dstDepartment: null,
      srVendor: null,
      dstVendor: null,
      isPrice: false,
      isPriceGroup: false,
      isCopyMultiplier: false,
      isCopyMultiPacks: false,
    };
  }
  selectCompanySr(id, isSoruce) {
    if (isSoruce) {
      this.postData.srStore = null;
      this.postData.srDepartment = null;
      this.postData.srVendor = null;
    }
    if (!isSoruce) {
      this.postData.dstStore = null;
      this.postData.dstDepartment = null;
      this.postData.dstVendor = null;
      this.postData.isPrice = false;
      this.postData.isPriceGroup = false;
      this.postData.isCopyMultiplier = false;
      this.postData.isCopyMultiPacks = false;
    }

    if (!id || this.postData.copyOption === null) {
      if (isSoruce) {
        this.srDepartmentList = this.srStoreList = this.srVendorList = [];
      }
      if (!isSoruce) {
        this.desStoreList = [];
        this.desDepartmentList = [];
        this.desVendorList = [];
      }
      return;
    }
    if (this.postData.copyOption === 1) {
      this.getStoreListById(id, isSoruce);
    }
    if (this.postData.copyOption === 3) {
      this.getVendorListById(id, isSoruce);
    }
    if (this.postData.copyOption === 3 || this.postData.copyOption === 1
      || this.postData.copyOption === 5 || this.postData.copyOption === 2) {
      this.fetchDepartmentData(id, isSoruce);
    }
  }
  getStoreListById(id, isSoruce) {
    this.storeService.getByCompanyId(id, this.userInfo.userName).subscribe(
      (res) => {
        if (isSoruce) {
          this.srStoreList = res;
        } else {
          this.desStoreList = res;
        }

      }, (err) => {
        console.log(err);
      }
    );
  }
  getVendorListById(id, isSoruce) {
    this.storeService.getVendorByCompanyId(id).subscribe(
      (res) => {
        if (isSoruce) {
          this.srVendorList = res;
        } else {
          this.desVendorList = res;
        }

      }, (err) => {
        console.log(err);
      }
    );
  }
  fetchDepartmentData(id, isSoruce): void {
    this.spinner.show();
    this.dataService.getData(`Department/getAll/${this.userInfo.userName}/${id}`).
      subscribe((data: Department[]) => {
        this.spinner.hide();
        if (isSoruce) {
          this.srDepartmentList = data;
        }
        if (!isSoruce) {
          this.desDepartmentList = data;
        }

      }, (err) => {
        this.spinner.hide();
        // this._tstr.error('Unable to fetch Deprtment data!');
      });
  }

  onCopyData() {
    const copyType = this.postData.copyOption;
    switch (copyType) {
      case 1:
        this.onCopyItem();
        return;
      case 2:
        this.onUpdateItemDescription();
        return;
      case 3:
        this.onCopyVendorItems();
        return;
      case 4:
        this.onCopyMultiplier();
        return;
      case 5:
        this.onCopyItemsGroup();
        return;

    }
  }
  onCopyItem() {
    if (!this.postData.srCompany || !this.postData.dstCompany || !this.postData.srStore || !this.postData.dstStore || !this.postData.srDepartment || !this.postData.dstDepartment) {
      this.toastr.error("Please Fill Required Fields", 'Error');
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.postData(`Admin/CopyItem?copyOption=0&srCompany=${this.postData.srCompany}&dstCompany=${this.postData.dstCompany}&srStore=${this.postData.srStore}&dstStore=${this.postData.dstStore}&srDepartment=${this.postData.srDepartment}&dstDepartment=${this.postData.dstDepartment}&srVendor=${this.postData.srVendor}&dstVendor=${this.postData.dstVendor}&isPrice=${this.postData.isPrice}&isPriceGroup=${this.postData.isPriceGroup}&isCopyMultiplier=${this.postData.isCopyMultiplier}&isCopyMultiPacks=${this.postData.isCopyMultiPacks}`, '')
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.statusCode === 1) {
            this.toastr.success('Copy data sccess.!', 'success');
            return;
          } else {
            this.toastr.error(res.message, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
  onUpdateItemDescription() {
    if (!this.postData.srCompany || !this.postData.dstCompany || !this.postData.srDepartment || !this.postData.dstDepartment) {
      this.toastr.error("Please Fill Required Fields", 'Error');
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.postData(`Admin/UpdateItemDescription?copyOption=1&srCompany=${this.postData.srCompany}&dstCompany=${this.postData.dstCompany}&srDepartment=${this.postData.srDepartment}&dstDepartment=${this.postData.dstDepartment}`, '')
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.statusCode === 1) {
            this.toastr.success('Copy data sccess.!', 'success');
            return;
          } else {
            this.toastr.error(res.message, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
  onCopyItemsGroup() {
    if (!this.postData.srCompany || !this.postData.dstCompany || !this.postData.srDepartment || !this.postData.dstDepartment) {
      this.toastr.error("Please Fill Required Fields", 'Error');
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.postData(`Admin/CopyItemsGroup?copyOption=1&srCompany=${this.postData.srCompany}&dstCompany=${this.postData.dstCompany}&srDepartment=${this.postData.srDepartment}&dstDepartment=${this.postData.dstDepartment}`, '')
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.statusCode === 1) {
            this.toastr.success('Copy data sccess.!', 'success');
            return;
          } else {
            this.toastr.error(res.message, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
  onCopyVendorItems() {
    if (!this.postData.srCompany || !this.postData.dstCompany || !this.postData.srDepartment || !this.postData.dstDepartment || !this.postData.srVendor || !this.postData.dstVendor) {
      this.toastr.error("Please Fill Required Fields", 'Error');
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.postData(`Admin/CopyVendorItems?copyOption=2&srCompany=${this.postData.srCompany}&dstCompany=${this.postData.dstCompany}&srDepartment=${this.postData.srDepartment}&dstDepartment=${this.postData.dstDepartment}&srVendor=${this.postData.srVendor}&dstVendor=${this.postData.dstVendor}`, '')
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.statusCode === 1) {
            this.toastr.success('Copy data sccess.!', 'success');
            return;
          } else {
            this.toastr.error(res.message, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
  onCopyMultiplier() {
    if (!this.postData.srCompany || !this.postData.dstCompany) {
      this.toastr.error("Please Fill Required Fields", 'Error');
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.dataService.postData(`Admin/CopyMultiplier?copyOption=3&srCompany=${this.postData.srCompany}&dstCompany=${this.postData.dstCompany}`, '')
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res.statusCode === 1) {
            this.toastr.success('Copy data sccess.!', 'success');
            return;
          } else {
            this.toastr.error(res.message, 'error');

          }
        }, (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }
}
