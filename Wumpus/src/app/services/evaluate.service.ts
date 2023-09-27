import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenerateGameService } from './generate-game.service';
import { AIService } from './ai.service';
import { Cell, CellType } from '../models/cell';
import { MessageModalComponent } from '../components/message-modal/message-modal.component';
import { Player } from 'src/app/models/player.model';
import { HelperService } from './helper.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class EvaluateService {

  constructor(private dialog: MatDialog,
    private generateGame: GenerateGameService,
    private AI: AIService,
    private helper: HelperService,
    private router: Router) { }
  player: Player = new Player();

  isGameOver: boolean = false;


  //Current cell risk
  updateRisk(row: number, col: number) {
    const cell = this.generateGame.board[row][col];
    switch (cell.type) {
      case CellType.Treasure:
        cell.treasure_probability = 1;
        cell.risk_score = -1;
        setTimeout(() => {
          this.AI.grabTreasure(row, col);
        }, 400);
        break;

      case CellType.Wumpus:
        cell.wumpus_probability = 1;
        cell.risk_score = 1;
        break;

      case CellType.Pit:
      case CellType.BreezeAndPit:
      case CellType.SmellAndPit:
      case CellType.LightAndPit:
        cell.pit_probability = 1;
        cell.risk_score = 1;
        break;

      case CellType.Light:
        cell.risk_score = -0.1;
        break;
      case CellType.Smell:
      case CellType.Breeze:
      case CellType.BreezeAndSmell:
        //  case CellType.Smell_Breeze_And_Light:
        cell.risk_score = 0.1;
        break;

      case CellType.Empty:
      case CellType.DeadWumpus:
        cell.risk_score = 0;
        break;

      // case CellType.Empty:
      //  case CellType.DeadWumpus:
      //  case CellType.SmellAndLight:
      //  case CellType.BreezeAndLight:
      //    cell.risk_score = 0.0;
      //   break;

    }

    cell.total_risk=cell.risk_score+cell.visit_risk;

    this.generateGame.board[row][col] = cell
    this.AI.exploredBoard[row][col] = cell;

    // const adjacentCells = this.helper.calculateAdjacentCells(row, col); //Cell format
    const adjacentCells = this.AI.availableCells;
    //console.log(cell);

    for (const offset of adjacentCells) {
      const adjacentRow = offset.position.row;
      const adjacentCol = offset.position.column;

      const adjacentCell = this.AI.exploredBoard[adjacentRow][adjacentCol]; //position only

      //console.log("Current Before update: " + cell.total_risk);
      //console.log("Adjacent Before update: " + adjacentCell.total_risk);
      this.updateAdjacentRisk(adjacentCell, cell);

      this.AI.exploredBoard[adjacentRow][adjacentCol]=adjacentCell;
      this.generateGame.board[adjacentRow][adjacentCol]=adjacentCell;

      this.AI.exploredBoard[row][col]=cell;
      this.generateGame.board[row][col]=cell;

      //console.log("Current After update: " + cell.total_risk);
    //  console.log("Adjacent After update: " + adjacentCell.total_risk);
    }

  }

  updateAdjacentRisk(adjacentCell: Cell, currentCell: Cell) {

    //checking hidden cell from new position 
    if (adjacentCell.isHidden && currentCell.isHidden) {
      // console.log("cell: " + adjacentCell.position.row + "," + adjacentCell.position.column)
    //  console.log("Case 1");

      if (currentCell.type === CellType.Empty) {
        adjacentCell.pit_probability = 0.0;
        adjacentCell.wumpus_probability = 0.0;
        adjacentCell.treasure_probability = 0.0;
        adjacentCell.risk_score = 0.0;
      }
      else if (currentCell.type === CellType.Breeze) {
        adjacentCell.pit_probability += 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.Smell) {
        adjacentCell.wumpus_probability += 0.3;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.Light) {
        adjacentCell.treasure_probability -= 0.3;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.BreezeAndSmell) {
        adjacentCell.pit_probability += 0.2;
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.BreezeAndLight) {
        adjacentCell.pit_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.SmellAndLight) {
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }
      else if (currentCell.type === CellType.Smell_Breeze_And_Light) {
        adjacentCell.pit_probability += 0.2;
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
      }

    }

    //checking revealed cell from new position 
    else if (!adjacentCell.isHidden && currentCell.isHidden) {
     // console.log("Case 2");
      // currentCell.risk_score += 0.075;
    }

    //checking hidden cell from visited position  //Is that possible? 
    else if (adjacentCell.isHidden && !currentCell.isHidden) {
    //  console.log("Case 3");
      currentCell.visit_risk += 0.01; // Eta ektu dekha lagbe
      // currentCell.risk_score += parseFloat(0.075.toFixed(3)); // 3 decimal point
    }

    //Already been there.
    else {
   //   console.log("Case 4");
      currentCell.visit_risk += 0.02;
    }

    adjacentCell.total_risk=adjacentCell.risk_score+adjacentCell.visit_risk;
    currentCell.total_risk=currentCell.risk_score+currentCell.visit_risk;

    const adjacentRow = adjacentCell.position.row;
    const adjacentCol = adjacentCell.position.column;
    this.AI.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
    this, this.generateGame.board[adjacentRow][adjacentCol] = adjacentCell;

    const currentRow = currentCell.position.row;
    const currentCol = currentCell.position.column;
    this.AI.exploredBoard[currentRow][currentCol] = currentCell;
    this.generateGame.board[currentRow][currentCol] = currentCell;
  }






  updateScore(row: number, col: number) {
    this.AI.player.point -= 1;

    if (this.generateGame.board[row][col].type == CellType.Treasure) {
      this.AI.player.point += 1000;
      this.AI.exploredBoard[row][col] = this.generateGame.board[row][col];
      this.generateGame.treasure_left--;
      console.log(this.generateGame.treasure_left)
      if (this.generateGame.treasure_left === 0) {
        this.showMessage("Congratulations! You found all the Treasure.");
        this.isGameOver = true;
        return;
      }

    }

    else if (this.generateGame.board[row][col].type == CellType.Wumpus) {
      this.AI.player.point -= 1000;
      this.AI.exploredBoard[row][col] = this.generateGame.board[row][col]
      this.showMessage("Oops! Wumpus found you. Game over");
      this.isGameOver = true;
      return;
    }
    //Pit
    else if (this.generateGame.board[row][col].type == CellType.Pit
      || this.generateGame.board[row][col].type == CellType.BreezeAndPit
      || this.generateGame.board[row][col].type == CellType.SmellAndPit
      || this.generateGame.board[row][col].type == CellType.LightAndPit) {
      this.AI.player.point -= 1000;
      this.showMessage("Oops! You fell on a pit. Game over")
      this.isGameOver = true;
      return;
      // alert('You fell on a pit!');
      // this.player.position = { row: 0, col: 0 };
    }

  }

  showMessage(message: string): void {
    this.isGameOver = true;

    const dialogRef = this.dialog.open(MessageModalComponent, {
      width: '300px',
      data: { message }
    })
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['settings']);
    });
    dialogRef.disableClose = true;
  }
  revealBoard() {
    for (let row of this.generateGame.board) {
      for (let cell of row) {
        cell.isHidden = false;
      }
    }
  }
  gameOver() {
    if (this.AI.player.point <= 0) {
      //   console.log("mara kha" + this.AI.player.point);
      this.showMessage('Sorry. No moves left. Game Over.');
      this.isGameOver = true;
      this.revealBoard();
    }
  }
}
