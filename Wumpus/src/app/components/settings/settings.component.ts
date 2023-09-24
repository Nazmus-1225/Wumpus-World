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
    
        // Split the file content into rows based on newline characters
        const rows = fileContent.split('\n');
        
        // Initialize a 2D array to store the parsed board data
        
    
        // Iterate through the rows and split each row into columns
        for (const row of rows) {
          // Remove spaces and split the row into columns based on whitespace
          const columns = row.trim().split(/\s+/);
          this.treasureCount += (row.match(/T/g) || []).length;
          // Add the columns to the parsed board
          this.parsedBoard.push(columns);
        }
    
        // Set the parsed board data
       
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
      console.log("HI");
    this.generateGame.setCustomInput(this.customInput);
       this.generateGame.setgoldCount(this.sliderGold);
       this.generateGame.setpitCount(this.sliderPit);
       this.generateGame.setwumpusCount(this.sliderWumpus);
       localStorage.setItem('wumpus_count', this.sliderWumpus.toString());
       localStorage.setItem('pit_count', this.sliderPit.toString());
       localStorage.setItem('treasure_count', this.sliderGold.toString()); 
    }
    else{
      console.log("bye");
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

  // Helper method to parse the board data from the 2D array of characters
  // parseBoard(boardData: string[][]): Cell[][] {
  //   const parsedBoard: Cell[][] = [];

  //   for (let row = 0; row < boardData.length; row++) {
  //     const rowData = boardData[row];
  //     const parsedRow: Cell[] = [];

  //     for (let col = 0; col < rowData.length; col++) {
  //       const cellType = this.mapCharacterToCellType(rowData[col]);
  //       parsedRow.push({
  //         type: cellType,
  //         // Initialize other properties as needed
  //         position: {
  //           row: row, // Initialize with the appropriate row value
  //           column: col, // Initialize with the appropriate column value
  //         },
  //         isHidden: false, // Set to the appropriate value
  //         hasBreeze: false, // Set to the appropriate value
  //         hasSmell: false, // Set to the appropriate value
  //         hasLight: false, // Set to the appropriate value
  //         wumpus_probability: 0.01, // Initialize with the appropriate value
  //         pit_probability: 0.05, // Initialize with the appropriate value
  //         treasure_probability: 0.01, // Initialize with the appropriate value
  //         risk_score: 0, // Initialize with the appropriate value
  //       });
  //     }
      
  //     parsedBoard.push(parsedRow);
  //   }

  //   return parsedBoard;
  // }
  // mapCharacterToCellType(char: string): CellType {
  //   switch (char) {
  //     case 'P':
  //       return CellType.Pit;
  //     case 'W':
  //       return CellType.Wumpus;
  //     case 'T':
  //       return CellType.Treasure;
  //     case 'S':
  //       return CellType.Smell;
  //     case 'B':
  //       return CellType.Breeze;
  //     case 'L':
  //       return CellType.Light;
  //     case 'BS':
  //       return CellType.BreezeAndSmell;
  //     case 'BL':
  //       return CellType.BreezeAndLight;
  //     case 'SL':
  //         return CellType.SmellAndLight;
  //     case 'BP':
  //         return CellType.BreezeAndPit;
  //      case 'SP':
  //         return CellType.SmellAndPit;
  //     case 'LP':
  //         return CellType.LightAndPit;
  //     case 'SBL':
  //         return CellType.Smell_Breeze_And_Light;  
  //     default:
  //       return CellType.Empty; // Default to Empty for unknown characters
  //   }
  // }
  // Helper method to map characters to CellType enum values
 


}
