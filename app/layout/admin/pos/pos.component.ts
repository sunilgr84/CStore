import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  animations: [routerTransition()]
})
export class PosComponent implements OnInit {

  activeId: string;
 subscription : any;
  @ViewChild('tabs') public tabs: NgbTabset;
  constructor( private route: ActivatedRoute, private router: Router ) {
    this.subscription =  this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
       this.activeId =  event.url.split('/')[event.url.split('/').length -1];
      }
    });
   }

  ngOnInit() {
  }
  ngOnDestroy()
  {
    this.subscription.unsubscribe();
  }
  tabChange(params) {
    const activeTab = params && params.nextId;
    this.router.navigate(['admin/'+activeTab]);
  }
 

}
