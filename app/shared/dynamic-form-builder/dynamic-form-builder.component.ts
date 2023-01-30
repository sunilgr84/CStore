import { Component, OnInit, EventEmitter, Output, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder,FormControl, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConstantService } from '@shared/services/constant/constant.service';
import { KeyValue } from '@angular/common';
@Component({
  selector: 'app-dynamic-form-builder',
  templateUrl: './dynamic-form-builder.component.html',
  styleUrls: ['./dynamic-form-builder.component.scss']
})
export class DynamicFormBuilderComponent implements OnInit, OnChanges {
  price = new FormControl('');  
    @Input() fields: any[] = [];
  // @Output() submit: EventEmitter<any> = new EventEmitter();
  @Input() field: any = {};
  @Input() userInfo: any;
  @Input() data: any[];
  form: FormGroup;
  isCreateForm: boolean;
  header: any[] = [];

  tabledata =  [];
  get isValid() { return this.form.controls[this.field.name].valid; }
  get isDirty() { return this.form.controls[this.field.name].dirty; }
  constructor(private toaster: ToastrService, private constantService: ConstantService,
    private setupService: SetupService, private spinner: NgxSpinnerService,private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.form = this.formBuilder.group({
      price: ['']
  });
    // this.createForm();
  }

  ngOnChanges() {
    this.isCreateForm = false;
    this.createForm();
  }
  onSubmit() {
   
    this.spinner.show();
    // const postArray = [];
    // const tempArray = [];
    // console.log(this.form.value);
    // // tslint:disable-next-line:forin
    // for (const prop in this.form.value) {
    //   console.log(prop)
    //   const nameOfCol = prop.split('_');
    //   const keyName = nameOfCol[0] + '_' + nameOfCol[1];
    //   if (this.form.value[prop]) { // worst code wrote in my life
    //     const matchData = _.find(tempArray, (obj) => { // if duplicate
    //       // tslint:disable-next-line:forin
    //       for (const pr in obj) {
    //         if (pr === keyName) {
    //           if (obj[pr][nameOfCol[1]]) {
    //             obj[pr][nameOfCol[1]].push({
    //               [nameOfCol[2]]: this.form.value[prop]
    //             });
    //           } else {
    //             obj[pr][nameOfCol[1]] = {
    //               [nameOfCol[2]]: this.form.value[prop]
    //             };
    //           }
    //           // obj[pr].push({
    //           //   [nameOfCol[2]]: this.form.value[prop]
    //           // });
    //           return obj;
    //         }
    //       }
    //     });
    //     if (!matchData) { // unique prop
    //       tempArray.push({
    //         'fuelGradeName': nameOfCol[0],
    //         'fuelServiceLevelName': nameOfCol[1],
    //         [keyName]: {
    //           [nameOfCol[1]]: [{
    //             [nameOfCol[2]]: this.form.value[prop]
    //           }]
    //         }
    //       });
    //     }
    //   }
      // for (const price of tempArray) {
      //   const matchData = _.find(this.fields, (obj) => {
      //     let name;
      //     for (const priceLevel of obj.fuelserviceLevel) {
      //       name = obj.fuelGradeName + '_' + priceLevel.fuelServiceLevelName;
      //       if (price[name] === obj.fuelGradeName) {
      //       }
      //     }
      //   });
      // }

      // console.log(matchData);
      // // const cashFuelPrice = this.getFuelPrice(matchData.fuelserviceLevel, nameOfCol[1], nameOfCol[2]);
      // // const creditFuelPrice = this.getFuelPrice(matchData.fuelserviceLevel, nameOfCol[1], nameOfCol[2]);
      // const createdObj = this.createFormObj(matchData, nameOfCol);
      // postArray.push(createdObj);
      // this.form.value
    // }
    // console.log('tempArray', tempArray);
    // tempArray.forEach(element => {
    //   const fuelPrice = this.getFuelPrice(element);
    //   const matchData = _.find(this.fields, (obj) => {
    //     if (obj.fuelGradeName === element.fuelGradeName) {
    //       return obj;
    //     }
    //   });
    //   const postData = this.createFormObj(matchData, fuelPrice, element.fuelServiceLevelName);
    //   postArray.push(postData);
    // });
    // this.save(postArray);
  }
  originalOrder = (a: KeyValue<number,string>, b: KeyValue<number,string>): number => {
    return 0;
  }
  // createFormObj(matchData, priceObj, fuelServiceLevelName) {
  //   console.log(matchData);
  //   let postData;
  //   console.log("update obj" + matchData);
  //   if (matchData) {
  //     postData = {
  //       storeFuelID: null,
  //       storeFuelGradeID: matchData.storeFuelGradeID,
  //       storeLocationID: matchData.storeLocationID,
  //       fuelServiceLevelID: fuelServiceLevelName === 'Self' ? 1 : 2, //  fuelServiceLevelID,
  //       posSyncStatusID: matchData.posSyncStatusID,
  //       fuelCost: 0,
  //       cashFuelPrice: priceObj.cashFuelPrice,
  //       creditFuelPrice: priceObj.creditFuelPrice,
  //       posPushDateTime: new Date(),
  //       createdBy: this.userInfo.userName,
  //       createdDateTime: new Date(),
  //       lastModifiedBy: this.userInfo.userName,
  //       lastModifiedDateTime: new Date(),
  //       checkFuelPrice: 0,
  //       cashMargin: 0, // no property available
  //       creditMargin: 0 // // no property available
  //     };
  //   }
  //   return postData;
  // }

   getFuelPrice(fuelPriceArray) {
  //   console.log(fuelPriceArray);
  //   const name = fuelPriceArray.fuelGradeName + '_' + fuelPriceArray.fuelServiceLevelName;
  //   if (fuelPriceArray.fuelServiceLevelName === 'Self') { // TODO - remove hardcoded value
  //     return {
  //       cashFuelPrice: fuelPriceArray[name]['Self'][0] ? fuelPriceArray[name]['Self'][0].Cash : null,
  //       creditFuelPrice: fuelPriceArray[name]['Self'][1] ? fuelPriceArray[name]['Self'][1].Credit : null
  //     };
  //   } else {
  //     return {
  //       cashFuelPrice: fuelPriceArray[name]['Full'][0] ? fuelPriceArray[name]['Full'][0].Cash : null,
  //       creditFuelPrice: fuelPriceArray[name]['Full'][1] ? fuelPriceArray[name]['Full'][1].Credit : null
  //     };
  //   }
  }
  createForm() {
    this.tabledata = this.data;

  
    console.log(this.tabledata);
  //  const fieldsCtrls = {};
    let isDataValid = true;
    // let formattedArr = [];
    // console.log(this.data);
    // for (let j = 0; j < this.data["storeFuelMop"].length; j++) {
    //   this.header[j] = this.data["storeFuelMop"][j]["fuelPriceMOPName"];
   
    // }
    // for (let i = 0; i < this.data["storeFuelServiceLevel"].length; i++) {
    //   formattedArr.push({
    //     "serviceLevel": this.data["storeFuelServiceLevel"][i]["fuelServiceLevelName"],
    //   })

    // }
   // this.header.unshift(' ')
    // for (let k = 0; k < this.fields.length; k++) {
    //   this.fields[k]["formatedArr"] = formattedArr;
      // this.fields[k]["fuelPricing"] = this.fields[k]["fuelPricing"].filter(x => { return x.fuelPriceTierName == "Tier One" })
      // let copy= JSON.parse(JSON.stringify(this.fields[k]));
      // for (let j = 0,h=1; j < this.fields[0]["formatedArr"].length; j++) {
      //   for (let h=1; h < this.'header.length; h++) {
      //   copy.formatedArr[j][j+ copy.formatedArr[j].serviceLevel+"_"+this.header[h]]=
      //     copy.fuelPrices.filter(x => {
      //     return x.fuelServiceLevelName == copy.formatedArr[j]["serviceLevel"] &&  x.fuelPriceMOPName==this.header[h]
      //     }).map(x=>x.price).toString(); 
      //   }
      // }
      // this.fields[k]= JSON.parse(JSON.stringify(copy));
 //  }
    // for (const formObjs of this.fields) {
    //   const fuelGradeName = formObjs['storeFuelGradeName'];
    //   if (!fuelGradeName) {
    //     this.toaster.warning('Configure store first...');
    //     isDataValid = false;
    //   }
      // for (const obj1 of formObjs['fuelPricing']) {
      //   if (!obj1['fuelServiceLevelName']) {
      //     this.toaster.warning('Configure store first...');
      //     isDataValid = false;
      //   }
      //   const levelName = obj1['fuelServiceLevelName'];//fuelGradeName + '_'
      //   const name = levelName + '_' + obj1.fuelPriceMOPName;
      //   // if(typeof(levelName)){
      //   //   this.borderflag = true;
      //   // }
      //   fieldsCtrls["xyzz"] = new FormControl(obj1.price || '');
      //   console.log('obj1', name)
      //   /*   for (const fuelObj of obj1.fuelpricelevel) {
      //      if (!fuelObj.fuelPriceTierName) {
      //        this.toaster.warning('Configure store first...');
      //        isDataValid = false;
      //      }
      //      const name = levelName + '_' + fuelObj.fuelPriceTierName;
      //      fieldsCtrls[name] = new FormControl(fuelObj.cashFuelPrice || '');
      //    }   */
      // }
  //  }
    // fieldsCtrls[name] = new FormControl(fuelObj.cashFuelPrice || '');
 //   console.log(this.fields);
  //  this.form = new FormGroup(fieldsCtrls);
    this.isCreateForm = isDataValid ? true : false;
  }

  save(params) {
    console.log(params);
    // params = {

    // }
    this.setupService.updateData(`FuelPriceTier/Update`, params).subscribe((response) => {
      console.log("update" + response);
      this.spinner.hide();
      if (response === '1') {
        this.toaster.success('Data updated successfuly...');
      } else {
        this.toaster.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }

}
