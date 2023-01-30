import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-admin-accounting',
  templateUrl: './admin-accounting.component.html',
  styleUrls: ['./admin-accounting.component.scss'],
  animations: [routerTransition()]
})
export class AdminAccountingComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
