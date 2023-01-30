import { Component, OnInit } from "@angular/core";
import { routerTransition } from "src/app/router.animations";

@Component({
  selector: 'app-scan-data1',
  templateUrl: './scan-data1.component.html',
  styleUrls: ['./scan-data1.component.scss'],
  animations: [routerTransition()]
})
export class ScanData1Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
