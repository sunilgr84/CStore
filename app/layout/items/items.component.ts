import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
  animations: [routerTransition()],
})
export class ItemsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
