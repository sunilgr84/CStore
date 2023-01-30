import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AmazingTimePickerService } from 'amazing-time-picker';

@Component({
    selector: 'app-add-edit-scheduling',
    templateUrl: './add-edit-scheduling.component.html',
    styleUrls: ['./add-edit-scheduling.component.scss']
})
export class AddEditSchedulingComponent implements OnInit {
    submitted = false;
    structure = 0;
    schedulingId = 0;
    roleId = 0;
    currentDay = null;
    userInfo: any;
    listTiming: any;
    employeeId: 0;
    employeeIdValue: 0;
    startDate = null;
    endDate = null;
    empNameList: any;
    storeLocationId = 0;
    firstShiftStartTime = null;
    firstShiftEndTime = null;
    secondShiftStartTime = null;
    secondShiftEndTime = null;
    thirdShiftStartTime = null;
    thirdShiftEndTime = null;
    addEditScheduling = this._fb.group({
        shiftNumber: ['', Validators.required],
        startTime: [''],
        endTime: [''],
        note: [''],
        scheduledStartDate: [''],
        scheduledEndDate: [''],
        startDate: [''],
        endDate: [''],
        addEmployeeId: ['']
    });

    constructor(public dialogRef: MatDialogRef<AddEditSchedulingComponent>, @Inject(MAT_DIALOG_DATA) public data, private _fb: FormBuilder,
        private constants: ConstantService, private spinner: NgxSpinnerService, private dataService: SetupService,
        private toastr: ToastrService, private atp: AmazingTimePickerService) {
    }
    ngOnInit() {
        this.userInfo = this.constants.getUserInfo();
        this.schedulingId = (this.data.schedulingId == 0 || this.data.schedulingId == null || this.data.schedulingId == undefined) ? 0 : this.data.schedulingId;
        this.roleId = (this.data.roleIdValue == 0 || this.data.roleIdValue == null || this.data.roleIdValue == undefined) ? 0 : this.data.roleIdValue;
        this.structure = (this.data.structureValue == 0 || this.data.structureValue == null || this.data.structureValue == undefined) ? 0 : Number(this.data.structureValue);
        this.employeeId = (this.data.employeeId == 0 || this.data.employeeId == null || this.data.employeeId == undefined) ? 0 : this.data.employeeId;
        this.employeeIdValue = (this.data.employeeId == 0 || this.data.employeeId == null || this.data.employeeId == undefined) ? 0 : this.data.employeeId;
        this.startDate = (this.data.startDate == 0 || this.data.startDate == null || this.data.startDate == undefined) ? null : this.data.startDate;
        this.endDate = (this.data.endDate == 0 || this.data.endDate == null || this.data.endDate == undefined) ? null : this.data.endDate;
        this.storeLocationId = this.data ? this.data.storeLocationIDValue : 0;
        this.addEditScheduling.controls.startDate.setValue(this.startDate);
        this.addEditScheduling.controls.endDate.setValue(this.endDate);
        this.getEmployeeNameList();
    }


    closeModal() {
        this.dialogRef.close(this.storeLocationId);
    }

    onSchedulingChange() {
        this.findTodayDay();
        var storeLocationId = this.storeLocationId;
        // if (storeLocationId === null || storeLocationId === undefined) {
        //     storeLocationId = '45';
        // }
        this.spinner.show();
        this.dataService.getData('SchedulingSetting/GetShiftTime/' + this.currentDay + '/' +
            storeLocationId + '/' + this.roleId + '/' + this.userInfo.companyId, null, true).subscribe((response) => {
                this.listTiming = response;
                this.spinner.hide();
                console.log(response);
                if (this.addEditScheduling.controls.shiftNumber.value === '1') {
                    if (this.listTiming.find(x => x.firstShiftStartTime) === undefined) {
                        this.addEditScheduling.controls.startTime.reset();
                        this.addEditScheduling.controls.endTime.reset();
                    } else {
                        this.addEditScheduling.controls.startTime.setValue(this.listTiming.find(x => x.firstShiftStartTime).firstShiftStartTime);
                        this.addEditScheduling.controls.endTime.setValue(this.listTiming.find(x => x.firstShiftEndTime).firstShiftEndTime);
                    }
                }
                if (this.addEditScheduling.controls.shiftNumber.value === '2') {
                    if (this.listTiming.find(x => x.secondShiftStartTime) === undefined) {
                        this.addEditScheduling.controls.startTime.reset();
                        this.addEditScheduling.controls.endTime.reset();
                    } else {
                        this.addEditScheduling.controls.startTime.setValue(this.listTiming.find(x => x.secondShiftStartTime).secondShiftStartTime);
                        this.addEditScheduling.controls.endTime.setValue(this.listTiming.find(x => x.secondShiftEndTime).secondShiftEndTime);
                    }
                }
                if (this.addEditScheduling.controls.shiftNumber.value === '3') {
                    if (this.listTiming.find(x => x.thirdShiftStartTime) === undefined) {
                        this.addEditScheduling.controls.startTime.reset();
                        this.addEditScheduling.controls.endTime.reset();
                    } else {
                        this.addEditScheduling.controls.startTime.setValue(this.listTiming.find(x => x.thirdShiftStartTime).thirdShiftStartTime);
                        this.addEditScheduling.controls.endTime.setValue(this.listTiming.find(x => x.thirdShiftEndTime).thirdShiftEndTime);
                    }
                }
                if (this.addEditScheduling.controls.shiftNumber.value === '1') {
                    if (this.listTiming[0].firstShiftStartTime == null) {
                        this.addEditScheduling.controls.startTime.disable();
                        this.addEditScheduling.controls.endTime.disable();
                    } else {
                        this.firstShiftStartTime = this.listTiming[0].firstShiftStartTime;
                        this.firstShiftEndTime = this.listTiming[0].firstShiftEndTime;
                    }
                }
                if (this.addEditScheduling.controls.shiftNumber.value === '2') {
                    if (this.listTiming[0].secondShiftStartTime == null) {
                        this.addEditScheduling.controls.startTime.disable();
                        this.addEditScheduling.controls.endTime.disable();
                    } else {
                        this.secondShiftStartTime = this.listTiming[0].secondShiftStartTime;
                        this.secondShiftEndTime = this.listTiming[0].secondShiftEndTime;
                    }
                }
                if (this.addEditScheduling.controls.shiftNumber.value === '3') {
                    if (this.listTiming[0].thirdShiftStartTime == null) {
                        this.addEditScheduling.controls.startTime.disable();
                        this.addEditScheduling.controls.endTime.disable();
                    } else {
                        this.thirdShiftStartTime = this.listTiming[0].thirdShiftStartTime;
                        this.thirdShiftEndTime = this.listTiming[0].thirdShiftEndTime;
                    }
                }
            }, (error) => {
                this.spinner.hide();
            });
    }

    findTodayDay() {
        var day = '';
        switch (new Date().getDay()) {
            case 0:
                day = "Sunday";
                break;
            case 1:
                day = "Monday";
                break;
            case 2:
                day = "Tuesday";
                break;
            case 3:
                day = "Wednesday";
                break;
            case 4:
                day = "Thursday";
                break;
            case 5:
                day = "Friday";
                break;
            case 6:
                day = "Saturday";
        }
        this.currentDay = day;
        return day;
    }

    resetAddEditScheduling() {
        this.submitted = false;
        this.addEditScheduling.controls.startTime.reset();
        this.addEditScheduling.controls.endTime.reset();
        this.addEditScheduling.controls.note.reset();
        this.addEditScheduling.controls.shiftNumber.reset();
        this.addEditScheduling.controls.startDate.reset();
        this.addEditScheduling.controls.endDate.reset();
        this.startDate = null;
        this.endDate = null;
    }

    saveScheduling() {
        var storeLocationId = this.storeLocationId;
        if (this.data.employeeId == 0) {
            this.employeeId = this.addEditScheduling.controls.addEmployeeId.value;
        }
        const postData = {
            ...this.addEditScheduling.value,
            shiftNumber: this.addEditScheduling.controls.shiftNumber.value,
            storeLocationID: storeLocationId,
            userName: this.userInfo.userName,
            createdBy: this.userInfo.userName,
            CreatedDateTime: new Date(),
            startHour: this.addEditScheduling.controls.startTime.value,
            endHour: this.addEditScheduling.controls.endTime.value,
            LastModifiedDateTime: this.schedulingId > 0 ? new Date() : null,
            LastModifiedBy: this.schedulingId > 0 ? this.userInfo.userName : null,
            employeeId: this.employeeId,
            scheduledStartDate: new Date(moment(this.addEditScheduling.value.startDate).format('YYYY-MM-DD 12:00:000')),
            scheduledEndDate: new Date(moment(this.addEditScheduling.value.endDate).format('YYYY-MM-DD 12:00:000')),
        };

        if (this.structure === 0) {
            if (this.addEditScheduling.controls.endTime.value === null && this.addEditScheduling.controls.endTime.value == '' && this.addEditScheduling.controls.startTime.value == '' && this.addEditScheduling.controls.startTime.value == null) {
                this.toastr.error(this.constants.infoMessages.StartEndTimeRequired);
                return;
            }
        }
        if (this.structure === 1) {
            if (this.addEditScheduling.controls.scheduledStartDate.value === null && this.addEditScheduling.controls.scheduledStartDate.value == '' && this.addEditScheduling.controls.scheduledEndDate.value == '' && this.addEditScheduling.controls.scheduledEndDate.value == null) {
                this.toastr.error(this.constants.infoMessages.StartEndTimeRequired);
                return;
            }
            if (new Date(this.addEditScheduling.controls.startDate.value).setHours(0, 0, 0, 0) < new Date(this.startDate).setHours(0, 0, 0, 0)) {
                this.toastr.error(this.constants.infoMessages.DateRangeStart);
                return;
            }
            if (new Date(this.addEditScheduling.controls.startDate.value).setHours(0, 0, 0, 0) > new Date(this.addEditScheduling.controls.endDate.value).setHours(0, 0, 0, 0)) {
                this.toastr.error(this.constants.infoMessages.DateRangeEnd);
                return;
            }
            // if (new Date(this.addEditScheduling.controls.endDate.value) > new Date(this.endDate)) {
            //     this.toastr.error(this.constants.infoMessages.DateRange);
            //     return;
            // }
            if (new Date(this.addEditScheduling.controls.endDate.value).setHours(0, 0, 0, 0) < new Date(this.addEditScheduling.controls.startDate.value).setHours(0, 0, 0, 0)) {
                this.toastr.error(this.constants.infoMessages.DateRangeEnd);
                return;
            }
        }
        if (this.addEditScheduling.valid) {
            if (this.addEditScheduling.controls.shiftNumber.value === '0') {
                if (this.addEditScheduling.controls.startTime.value >= this.firstShiftStartTime) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value) >= new Date("01/01/2000 " + this.firstShiftEndTime)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.startTime.value) >= new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
            }
            if (this.addEditScheduling.controls.shiftNumber.value === '1') {
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.startTime.value) >= new Date("01/01/2000 " + this.secondShiftStartTime)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value) >= new Date("01/01/2000 " + this.secondShiftEndTime)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.startTime.value) >= new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
            }
            if (this.addEditScheduling.controls.shiftNumber.value === '2') {
                if (this.addEditScheduling.controls.startTime.value >= this.thirdShiftStartTime) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value) >= new Date("01/01/2000 " + this.thirdShiftEndTime)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
                if (new Date("01/01/2000 " + this.addEditScheduling.controls.startTime.value) >= new Date("01/01/2000 " + this.addEditScheduling.controls.endTime.value)) {
                    this.toastr.error(this.constants.infoMessages.startEndTime);
                    return;
                }
            }
            this.submitted = true;
            this.spinner.show();
            this.dataService.postData('Scheduling', postData, false, true).subscribe(response => {
                this.spinner.hide();
                if (response && response.statusCode === 500) {
                    let errorMessage = response.message;
                    this.toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
                    this.spinner.hide();
                    return;
                } else {
                    this.toastr.success(this.constants.infoMessages.success, 'Success');
                    this.spinner.hide();
                    this.ngOnInit();
                    this.closeModal();
                    return;
                }
            }, (error) => {
                this.toastr.error(this.constants.infoMessages.updateRecordFailed, 'Error');
                this.spinner.hide();
            });
        }
    }

    dateChangeStartDate(event) {
        this.addEditScheduling.get('startDate').setValue(event.formatedDate);
    }

    dateChangeEndDate(event) {
        this.addEditScheduling.get('endDate').setValue(event.formatedDate);
    }

    getEmployeeNameList() {
        var storeLocationId = this.storeLocationId;
        this.spinner.show();
        this.dataService.getData('Employee/GetEmployeeByRoleAndCompnay/' +
            this.roleId + '/' + this.userInfo.companyId + '/' + storeLocationId, null, true).subscribe((response) => {
                this.spinner.hide();
                this.empNameList = response;
                console.log(response);
            }, (error) => {
                this.spinner.hide();
            });
    }
}