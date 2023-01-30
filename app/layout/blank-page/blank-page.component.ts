import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { EditableGridService } from 'src/app/shared/services/editableGrid/editable-grid.service';
import { Company } from '../models/company.model';
import { HttpClient } from 'selenium-webdriver/http';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-blank-page',
    templateUrl: './blank-page.component.html',
    styleUrls: ['./blank-page.component.scss'],
    animations: [routerTransition()]
})
export class BlankPageComponent implements OnInit {
    columnDefs: any;
    gridOptions: any;
    editGridOptions: any;
    rowData: any;
    frameworkComponents: any;
    context: any;

    // form validation
    submitted = false;
    company: Company;

    // for expandable grid
    expandableGridRowData: any;
    expandableGridOptions: any;
    expandableCols: any;
    constructor(private gridService: GridService, private constants: ConstantService,
        private editableGrid: EditableGridService, private toastr: ToastrService) {
        this.editGridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.demoGrid);
        this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.demoGrid);
        this.expandableGridOptions = this.gridService.getGridOption(this.constants.gridTypes.demoExpandableGrid);
    }

    ngOnInit() {
        this.company = new Company();
        this.columnDefs = this.editGridOptions.columnDefs;
        this.rowData = [
            { upcCode: 'UPC5678WER', description: 'Addfjh da kjsdk', activeDept: 3434, sellingUnits: 'Demo', unitCase: '3235 High Forest' },
            { upcCode: 'UPC5678WER', description: 'Demo Text', activeDept: 3000, sellingUnits: 'Demo', unitCase: '2234 Sleepy Pony Mall' },
            { upcCode: 'UPC5678WER', description: 'Demo demo demo text', activeDept: 5000, sellingUnits: 'Demo', unitCase: '3685 Rocky Glade' }
        ];
        // expandable 
        this.expandableGridOptions.detailGridOptions = {
            columnDefs: [
                { field: 'callId' },
                { field: 'direction' },
                { field: 'number' },
                {
                    field: 'duration',
                    valueFormatter: 'x.toLocaleString() ' + 's'
                },
                { field: 'switchCode' }
            ]
        };
        this.expandableCols = this.expandableGridOptions.columnDefs;
        // this.expandableGridRowData = this.getExpandableData();
    }
    editAction(param) {
        this.toastr.warning('edit action perform');
        // alert('edit action perform');
    }
    // delAction() {
    //     alert('delete action perform');
    // }

    // form validation start
    onSubmit(form) {
        this.submitted = true;
        if (form.valid) {
            this.toastr.success('Form Submitted!');
        }
    }
    newCompany() {
        this.company = new Company();
    }
    onGridReady(params) {

        this.expandableGridRowData = [{
            'name': 'Nora Thomas',
            'account': 177000,
            'calls': 24,
            'minutes': 25.65,
            'callRecords': [{
                'name': 'susan',
                'callId': 555,
                'duration': 72,
                'switchCode': 'SW3',
                'direction': 'Out',
                'number': '(00) 88542069'
            }, {
                'name': 'susan',
                'callId': 556,
                'duration': 61,
                'switchCode': 'SW3',
                'direction': 'In',
                'number': '(01) 7432576'
            }, {
                'name': 'susan',
                'callId': 557,
                'duration': 90,
                'switchCode': 'SW5',
                'direction': 'In',
                'number': '(09) 76105491'
            }]
        },
        {
            'name': 'Mila Smith',
            'account': 177001,
            'calls': 24,
            'minutes': 26.216666666666665,
            'callRecords': [{
                'name': 'susan',
                'callId': 579,
                'duration': 23,
                'switchCode': 'SW5',
                'direction': 'Out',
                'number': '(02) 47485405'
            }]
        }
        ];
    }

}
