import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-fuel',
  templateUrl: './fuel.component.html',
  styleUrls: ['./fuel.component.scss'],
  animations: [routerTransition()]
})
export class FuelComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
