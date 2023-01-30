import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-maintainance',
  templateUrl: './maintainance.component.html',
  styleUrls: ['./maintainance.component.scss']
})
export class MaintainanceComponent implements OnInit {

  constructor(public location: Location) { }

  ngOnInit() {
  }

}
