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
  sliderPit = 5;
  sliderWumpus = 1;
  sliderGold = 1;

  gridSelected = false;
  pitSelected =false;
  wumpusSelected = false;
  goldSelected = false;

  file: any;
   parsedBoard: string[][] = [];
  board: string[][] = [];
treasureCount: number=0;
  customInput = false;

  ngOnInit(): void {
  }
 

  onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    this.file = (target.files as FileList)[0];
  
    let fileReader: FileReader = new FileReader();
  
    fileReader.onloadend = (e) => {
      if (fileReader.result) {
        let fileContent = fileReader.result.toString();
    
        const rows = fileContent.split('\n');
      
        for (const row of rows) {
          const columns = row.trim().split(/\s+/);
          this.treasureCount += (row.match(/G/g) || []).length;
          this.parsedBoard.push(columns);
        }
       
        this.customInput = true;
        this.generateGame.setCustomInput(this.customInput);
      }
    };
    
  
    fileReader.readAsText(this.file);
  };
  startGame(){
    this.evaluate.isGameOver=false;
    this.evaluate.player.point=100;
    
    if(!this.customInput){
      this.generateGame.treasure_left=this.sliderGold;
    this.generateGame.setCustomInput(this.customInput);
       this.generateGame.setgoldCount(this.sliderGold);
       this.generateGame.setpitCount(this.sliderPit);
       this.generateGame.setwumpusCount(this.sliderWumpus);
       localStorage.setItem('wumpus_count', this.sliderWumpus.toString());
       localStorage.setItem('pit_count', this.sliderPit.toString());
       localStorage.setItem('treasure_count', this.sliderGold.toString()); 
    }
    else{
      this.generateGame.treasure_left=this.treasureCount;
      this.generateGame.setParsedBoardData(this.parsedBoard);
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
