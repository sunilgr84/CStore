import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss'],
  animations: [routerTransition()]
})
export class InvoicesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
