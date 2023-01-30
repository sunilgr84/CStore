import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss']
})
export class UploadFilesComponent implements OnInit {
  storeLocationId: number;
  userId: string;
  storeLocationList: any = [];
  selectedStoreDetails: any;
  companyId: number;
  dateSelected: string;
  shiftValue: number;
  dayReconData: any;
  fileArr: any = [];

  constructor(
    private route: ActivatedRoute,
    private setupService: SetupService,
    private storeService: StoreService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.storeLocationId = parseInt(params.get('storelocId'));
      this.userId = params.get('userId');
      this.companyId = parseInt(params.get('compId'));
      this.dateSelected = params.get('dateSelected');
      this.shiftValue = parseInt(params.get('shiftVal'));
    });
    
    const isUploadComp = true;
    const payload = {
      storeLocationId: this.storeLocationId,
      userId: this.userId
    }

    this.setupService.postData(`Auth/LoginByUserID`, payload, isUploadComp ).subscribe((response) => {
      sessionStorage.setItem('userInfo', `{"token":"${response.token}"}`);
      this.getStoreLocationDetails();
      this.getDayReconData();
    });
  }

  getStoreLocationDetails() {
    this.spinner.show();
    this.storeService.getStoresByCompanyId(this.companyId).subscribe((response) => {
      this.spinner.hide();
      this.storeLocationList = response;
      this.selectedStoreDetails = this.storeLocationList.find(data => {
        return data.storeLocationID === this.storeLocationId;
      });
    });
  }

  getDayReconData() {
    this.setupService.getData(`MovementHeader/getDayReconDataObject?businessDate=${this.dateSelected}&StoreLocationID=${this.storeLocationId}&shiftWiseValue=${this.shiftValue}`).subscribe((response) => {
      this.dayReconData = response[0];
    });
  }
  
  handleFileInput(files: any) {
    this.spinner.show();
    for ( let i = 0; i < files.length; i++ ) {
      let fileObj = {
        file: null,
        fileName: files[i].name,
        fileType: files[i].type
      }

      const reader = new FileReader();
      reader.readAsDataURL(files[i]);
      reader.onload = () => {
        fileObj.file = reader && reader.result as string;
        this.fileArr.push(fileObj)
      }
    }

    setTimeout(() => {
      const payload = {
        movementHeaderID: this.dayReconData.movementHeaderData.movementHeaderID,
        companyID: this.companyId,
        storeLocationID: this.storeLocationId,
        businessDate: this.dateSelected,
        files: this.fileArr
      }
      
      this.setupService.postData(`MovementHeader/UploadSalesFiles`, payload).subscribe((response) => {
        console.log('payload length: ', payload.files);
        console.log('response: ', response);
        this.spinner.hide();
        this.toastr.success('Files uploaded successfully')
      });
    }, 5000);
  }
}
