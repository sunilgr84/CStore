import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  manufacturerList: any;
  constructor(private _setupService: SetupService) { }

  ngOnInit() {
    this.getManufacturerList();
  }
  getManufacturerList() {
    this._setupService.getData(`Manufacturer/getAll`).subscribe(result => {
      console.log(result);
      this.manufacturerList = result;
    });
  }
}
