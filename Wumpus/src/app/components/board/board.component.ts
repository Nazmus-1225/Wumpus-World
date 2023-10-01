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
  treasure_left: number = this.generateGame.treasure_left;
  buttonsPressed: boolean = false;
  isBoardInteractive: boolean = true;
  isHumanMode: boolean = false;
  gameInterval: any;
  isGamePaused: boolean = false;
  isPauseButtonVisible: boolean = false;

  startAsHuman() {
    this.isHumanMode = true;
    this.isPauseButtonVisible = false;
    this.buttonsPressed = true;
  }

  startAsAI() {
    this.isHumanMode = false;
    this.isPauseButtonVisible = true;
    this.playGame();
    this.isBoardInteractive = false;
    this.buttonsPressed = true;
  }

  ngOnInit(): void {
    this.AI.player.point = 100;
    this.treasure_left = this.generateGame.treasure_left;
    this.initializeBoard();
    this.board = this.generateGame.getBoard();
    this.generateGame.placePitsWumpusTreasure();
  
  }
  // revealBoard() {
  //   this.evaluate.revealBoard();
  // }


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
    }, 300);
  }

  revealCell(rowIndex: number, colIndex: number): void {

    if (!this.evaluate.isGameOver && this.isMoveAvailable(rowIndex, colIndex)) {

      this.player.position = this.AI.player.position = { row: rowIndex, col: colIndex };
      this.AI.availableCells = this.helper.calculateAdjacentCells(this.player.position.row, this.player.position.col);


      this.evaluate.updateScore(rowIndex, colIndex);
      this.evaluate.updateRisk(rowIndex, colIndex);

      this.treasure_left = this.generateGame.treasure_left;

      this.generateGame.board[rowIndex][colIndex].isHidden = false;

      //Updating current visit risk
      this.generateGame.board[rowIndex][colIndex].visit_risk += 0.02;
      this.generateGame.board[rowIndex][colIndex].total_risk = this.generateGame.board[rowIndex][colIndex].risk_score + this.generateGame.board[rowIndex][colIndex].visit_risk;

      this.AI.exploredBoard[rowIndex][colIndex] = this.generateGame.board[rowIndex][colIndex];
      this.board[rowIndex][colIndex] = this.AI.exploredBoard[rowIndex][colIndex];
      this.board = this.AI.exploredBoard;
      this.player = this.AI.player;
    }
  }


  ngOnDestroy(): void {
    clearInterval(this.gameInterval);
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
          wumpus_probability: 0.01,
          pit_probability: 0.05,
          treasure_probability: 0.01,
          risk_score: 0
          // + 0.01  // wumpus_probability
          // + 0.05  // pit_probability
          // - 0.01  // treasure_probability
          ,
          visit_risk: 0,
          total_risk: 0,
          adjacentCells: this.helper.calculateAdjacentCells(row, col),
          path_risk: 0,
          g_score: 0,
          f_score: 0,
        });
      }

      this.generateGame.board.push(newRow);
      this.AI.exploredBoard.push(newRow);
    }

    //for the first move
    this.generateGame.board[0][9].isHidden = false;
    this.AI.exploredBoard[0][9] = this.generateGame.board[0][9];

    this.AI.availableCells = this.helper.calculateAdjacentCells(this.player.position.row, this.player.position.col);
    this.evaluate.updateScore(this.player.position.row, this.player.position.col);
    this.evaluate.updateRisk(this.player.position.row, this.player.position.col);
  }

  getCellImage(cellType: CellType): string {
    switch (cellType) {
      case CellType.Wumpus:
        return 'assets/images/wumpus.png';
      case CellType.DeadWumpus:
        return 'assets/images/deadWumpus.png';
      case CellType.Pit:
        return 'assets/images/hole.png';
      case CellType.Breeze:
        return 'assets/images/breeze.png';
      case CellType.Treasure:
        return 'assets/images/Treasure.jpg';
      case CellType.Smell:
        return 'assets/images/smell.png';
      case CellType.Light:
        return 'assets/images/light.jpg';
      case CellType.BreezeAndSmell:
        return 'assets/images/bs.png';
      case CellType.LightAndPit:
        return 'assets/images/LightAndPit.jpg';
      case CellType.BreezeAndLight:
        return 'assets/images/LightAndBreeze.jpg';
      case CellType.SmellAndLight:
        return 'assets/images/LightAndSmell.jpg';
      case CellType.Smell_Breeze_And_Light:
        return 'assets/images/light_smell_breeze.jpg';
      case CellType.Empty:
        return 'assets/images/bg.png';

      default:
        return '';
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
