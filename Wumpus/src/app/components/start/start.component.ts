import { Component } from '@angular/core';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css']
})
export class StartComponent {
  constructor(public router: Router) { }

  ngOnInit(): void {
  }


  goNextPage(){
    console.log("Settings");
    
    this.router.navigate(['settings']);
  }

}
