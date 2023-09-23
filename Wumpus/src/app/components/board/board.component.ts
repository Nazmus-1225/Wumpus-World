import { Component, OnInit } from '@angular/core';
import { Cell, CellType } from 'src/app/models/cell';
import { Player } from 'src/app/models/player.model';
import { GenerateGameService } from 'src/app/services/generate-game.service';
import { AIService } from 'src/app/services/ai.service';
import { EvaluateService } from 'src/app/services/evaluate.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit {
 

  constructor(
    private generateGame: GenerateGameService,
    private AI: AIService,
    private evaluate: EvaluateService,
    private helper: HelperService) { }
    
  board: Cell[][] = [];
  player: Player = new Player();
  treasure_left: number= this.generateGame.treasure_left;

// Add these properties to your component class
isHumanMode: boolean = false;
private gameInterval: any;
isGamePaused: boolean=false;
isPauseButtonVisible : boolean=false;

// Function to start as Human
startAsHuman() {
  this.isHumanMode = true;
  this.isPauseButtonVisible= false;
  console.log("h")
  // Add any other logic you need when starting as a Human
}

// Function to start as AI
startAsAI() {
  this.isHumanMode = false;
  this.isPauseButtonVisible= true;
  this.playGame();
  console.log("a")
  // Add any other logic you need when starting as an AI
}

  ngOnInit(): void {
    //  this.player = this.AI.player;
    
    this.initializeBoard();
    this.board = this.generateGame.getBoard();
    this.generateGame.placePitsWumpusTreasure();
      //get the board
   // this.playGame(); // not implemented yet
   // console.log('BoardComponent initialized');

  }
revealBoard(){
  this.evaluate.revealBoard();
}


  playGame() {
    this.gameInterval = setInterval(() => {
      if (!this.evaluate.isGameOver && !this.isGamePaused) {
        this.evaluate.gameOver();
        const { row, column } = this.AI.makeAIMove();
        this.revealCell(row, column);
      } else {
        clearInterval(this.gameInterval);
        this.evaluate.isGameOver = true;
      }
    }, 1000); // Move after every 3 seconds
  }

  ngOnDestroy(): void {
    clearInterval(this.gameInterval); // Stop the game interval
  }


  togglePause() {
    this.isGamePaused = !this.isGamePaused; 
    if (this.isGamePaused) {
      clearInterval(this.gameInterval);
    } else {
      this.playGame();
    }
  }


  initializeBoard(): void {
    this.generateGame.board = [];
    this.AI.exploredBoard = [];
    for (let row = 0; row < 10; row++) {
      const newRow: Cell[] = [];
      for (let col = 0; col < 10; col++) {
        newRow.push({
          type: CellType.Empty,
          isHidden: true,
          hasBreeze: false,
          hasSmell: false,
          hasLight: false,
         
          position: {
            row: row,
            column: col
          },
          wumpus_probability: 0.01, // 1 out of 100
          pit_probability: 0.05,  // 5 out of 100
          treasure_probability: 0.01,  // 1 out of 100
          risk_score: 0
          // + 0.01  // wumpus_probability
          // + 0.05  // pit_probability
          // - 0.01  // treasure_probability
        });
      }
      this.generateGame.board.push(newRow);
      this.AI.exploredBoard.push(newRow);
    }
    this.generateGame.board[0][9].isHidden = false;
    this.AI.exploredBoard[0][9] = this.generateGame.board[0][9];

    this.AI.availableCells = this.helper.calculateAdjacentCells(this.player.position.row, this.player.position.col);
  }

  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/wumpus.png';
      case CellType.DeadWumpus:
        return 'assets/deadWumpus.png';
      case CellType.Pit:
        return 'assets/hole.png';
      case CellType.Breeze:
        return 'assets/breeze.png';
      case CellType.Treasure:
        return 'assets/Treasure.jpg';
      case CellType.Smell:
        return 'assets/smell.png';
      case CellType.Light:
        return 'assets/light.jpg';
      case CellType.BreezeAndSmell:
        return 'assets/bs.png';
      case CellType.LightAndPit:
        return 'assets/LightAndPit.jpg';
      case CellType.BreezeAndLight:
        return 'assets/LightAndBreeze.jpg';
      case CellType.SmellAndLight:
        return 'assets/LightAndSmell.jpg';
      case CellType.Smell_Breeze_And_Light:
        return 'assets/light_smell_breeze.jpg';
      case CellType.Empty:
        return 'assets/bg.png';

      default:
        return '';
    }
  }

  revealCell(rowIndex: number, colIndex: number): void {
    // console.log(this.getCellTypeString(this.generateGame.board[rowIndex][colIndex].type));

    if (!this.evaluate.isGameOver && this.isMoveAvailable(rowIndex, colIndex)) {
      this.generateGame.board[rowIndex][colIndex].isHidden = false;


      //kon board bujhtesi na
      this.board[rowIndex][colIndex].risk_score +=0.05; //visited gets less priority
      this.generateGame.board[rowIndex][colIndex].risk_score +=0.05; //visited gets less priority
      this.AI.exploredBoard[rowIndex][colIndex].risk_score +=0.05; //visited gets less priority

      this.player.position = this.AI.player.position = { row: rowIndex, col: colIndex };

      this.AI.availableCells = this.helper.calculateAdjacentCells(this.player.position.row, this.player.position.col);
      this.AI.exploredBoard[rowIndex][colIndex] = this.generateGame.board[rowIndex][colIndex];

      console.log("Current Risk score: "+this.AI.exploredBoard[rowIndex][colIndex].risk_score);

      this.evaluate.updateScore(rowIndex, colIndex);
      this.evaluate.updateRisk(rowIndex,colIndex); 
      this.treasure_left= this.generateGame.treasure_left;

      
      this.board[rowIndex][colIndex]=this.AI.exploredBoard[rowIndex][colIndex];
      this.generateGame.board[rowIndex][colIndex].risk_score =this.AI.exploredBoard[rowIndex][colIndex].risk_score;
      this.board=this.AI.exploredBoard;
      this.player=this.AI.player;
    }
  }

  isMoveAvailable(rowIndex: number, colIndex: number): boolean {
    const adjacentCells = this.helper.calculateAdjacentCells(this.player.position.row, this.player.position.col);
    return adjacentCells.some(
      (move) => move.position.row === rowIndex && move.position.column === colIndex
    );
  }

  AIshootArrow(row: number, col: number) {
    this.AI.shootArrow(row, col);
  }

  getCellTypeString(cellType: CellType): string {
    switch (cellType) {
      case CellType.Empty:
        return "Empty";
      case CellType.Wumpus:
        return "Wumpus";
      case CellType.Pit:
        return "Pit";
      case CellType.Treasure:
        return "Treasure";
      case CellType.Breeze:
        return "Breeze";
      case CellType.Smell:
        return "Smell";
      case CellType.Light:
        return "Light";
      case CellType.BreezeAndSmell:
        return "BreezeAndSmell";
      case CellType.BreezeAndLight:
        return "BreezeAndLight";
      case CellType.SmellAndLight:
        return "SmellAndLight";
      case CellType.BreezeAndPit:
        return "BreezeAndPit";
      case CellType.SmellAndPit:
        return "SmellAndPit";
      case CellType.LightAndPit:
        return "LightAndPit";
      case CellType.Smell_Breeze_And_Light:
        return "light_smell_breeze"
      default:
        return "Unknown";
    }
  }


}
