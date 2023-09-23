import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EvaluateService } from 'src/app/services/evaluate.service';
import { GenerateGameService } from 'src/app/services/generate-game.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public fileInput: any;

  constructor(public router: Router,private generateGame: GenerateGameService,private evaluate:EvaluateService) { }
  fileContent: string = "";
  sliderGrid= "10x10";
  sliderPit = 2;
  sliderWumpus = 1;
  sliderGold = 1;

  gridSelected = false;
  pitSelected =false;
  wumpusSelected = false;
  goldSelected = false;

  file: any;

  board: string[][] = [];

  customInput = false;

  ngOnInit(): void {
    this.reload();
  }
  reload(){
    
    //window.location.reload()
  }

  onChange = (event: Event) => {
    const target= event.target as HTMLInputElement;
    this.file = (target.files as FileList)[0];

    let fileReader: FileReader = new FileReader();
    
    fileReader.onloadend = (e)=> {
    //  self.fileContent = fileReader.result;
   //  console.log(fileReader.result) ;
   if(fileReader.result){
    const fileContent=fileReader.result.toString();
    console.log(JSON.parse(JSON.stringify(fileContent)));

    this.fileInput = JSON.parse(JSON.stringify(fileContent))
   }
    }
    fileReader.readAsText(this.file);
    this.customInput = true;
  };

  startGame(){
    this.evaluate.isGameOver=false;
    this.evaluate.player.point=100;
    this.generateGame.treasure_left=this.sliderGold;
    if(!this.customInput){
      console.log("Custom " + this.customInput);
       this.generateGame.setgoldCount(this.sliderGold);
       this.generateGame.setpitCount(this.sliderPit);
       this.generateGame.setwumpusCount(this.sliderWumpus);
       localStorage.setItem('wumpus_count', this.sliderWumpus.toString());
       localStorage.setItem('pit_count', this.sliderPit.toString());
       localStorage.setItem('treasure_count', this.sliderGold.toString());
    }
    else{
      this.board = JSON.parse(JSON.stringify(this.fileInput));
      // this.settings.setBoard(this.fileInput);
      // this.settings.setCustomBoardOn();
    }
   // console.log(this.board[0][1]);
    this.router.navigate(['board']);
  }

  gridSize(e: any){
    if(this.gridSelected==false){
      this.gridSelected = true;
    }
    this.sliderGrid = e.target.value + "x" + e.target.value;
    console.log(this.sliderGrid);
  }

  pits(e: any){
    this.sliderPit = e.target.value;
    console.log(this.sliderPit);
  }

  gold(e: any){
    this.sliderGold = e.target.value;
    console.log(this.sliderGold);
  }

  wumpus(e: any){
    this.sliderWumpus = e.target.value;
    console.log(this.sliderWumpus);
  }



}
