import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-change-plan',
  templateUrl: './change-plan.component.html',
  styleUrls: ['./change-plan.component.scss']
})
export class ChangePlanComponent implements OnInit {

  tradeAssociateList: any;
  stateList: any;
  billingStateList: any;
  constructor() {
  }

  ngOnInit() {
  }

  onGridReady() {

  }
}
