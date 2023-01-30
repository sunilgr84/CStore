import { Component, OnInit, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-fuel-tank',
  templateUrl: './fuel-tank.component.html',
  styleUrls: ['./fuel-tank.component.scss']
})
export class FuelTankComponent implements OnInit {
  @Input('tankData') tankData: any;
  filler: any
  filledPercentage: any;
  tankDetails: any;
  tankColor: any;
  @ViewChild('fillerDiv') fillerDiv: any;
  @ViewChild('progDiv') progDiv: any;
  constructor() {
  }

  ngOnInit() {
    let fuelPercentage = (this.tankData.lastTankReadingVolume / this.tankData.tankVolume) * 100;
    fuelPercentage = Math.round(fuelPercentage);
    this.fillerDiv.nativeElement.style.height = 100 - fuelPercentage + "%";
    this.filledPercentage = fuelPercentage + "%";
    this.tankDetails = this.tankData.tankName + "(" + this.tankData.fuelGradeName + ")";
    if (this.tankData.colour) {
      this.progDiv.nativeElement.style.background = "#" + this.tankData.colour;
    }
    if (this.tankData.storeLocationID === 45 || this.tankData.storeLocationID === 813) {
      if (this.tankData.fuelGradeName === 'PLUS') {
        this.tankColor = 'tank-Plus';
      } else if (this.tankData.fuelGradeName === 'PREM') {
        this.tankColor = 'tank-Prem';
      } else if (this.tankData.fuelGradeName === 'DIESEL') {
        this.tankColor = 'tank-Diesel';
      } else {
        this.tankColor = 'tank-all';
      }
    } else {
      this.tankColor = 'tank-all';
    }
  }

}
