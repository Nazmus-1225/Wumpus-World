import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GenerateGameService } from './generate-game.service';
import { AIService } from './ai.service';
import { Cell, CellType } from '../models/cell';
import { MessageModalComponent } from '../components/message-modal/message-modal.component';

@Injectable({
  providedIn: 'root'
})
export class EvaluateService {

  constructor(private dialog: MatDialog,
    private generateGame: GenerateGameService,
    private AI: AIService) { }


  isGameOver: boolean = false;


  updateRisk(row: number, col: number) {
    const cell = this.generateGame.board[row][col];

    switch (cell.type) {
      case CellType.Treasure:
        cell.treasure_probability = 1;
        cell.risk_score = -1;
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

    }

    this.AI.exploredBoard[row][col] = this.generateGame.board[row][col] = cell;

    const adjacentCells = this.calculateAdjacentCells(row, col);

    for (const offset of adjacentCells) {
      const adjacentRow = row + offset.position.row;
      const adjacentCol = col + offset.position.column;

      if (
        adjacentRow >= 0 && adjacentRow < this.generateGame.board.length &&
        adjacentCol >= 0 && adjacentCol < this.generateGame.board[0].length
      ) {
        const adjacentCell = this.generateGame.board[adjacentRow][adjacentCol];
        this.updateAdjacentRisk(adjacentCell);
      }
    }
  }

  updateAdjacentRisk(adjacentCell: Cell) {

    switch (adjacentCell.type) {
      case CellType.Breeze:
        adjacentCell.pit_probability += 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.Smell:
        adjacentCell.wumpus_probability += 0.3;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.Light:
        adjacentCell.treasure_probability -= 0.3;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.BreezeAndSmell:
        adjacentCell.pit_probability += 0.2;
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.BreezeAndLight:
        adjacentCell.pit_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.SmellAndLight:
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;

      case CellType.Smell_Breeze_And_Light:
        adjacentCell.pit_probability += 0.2;
        adjacentCell.wumpus_probability += 0.2;
        adjacentCell.treasure_probability -= 0.2;
        adjacentCell.risk_score = adjacentCell.risk_score + adjacentCell.pit_probability + adjacentCell.wumpus_probability + adjacentCell.treasure_probability;
        break;
    }

    // Update the adjacent cell in the explored board
    const adjacentRow = adjacentCell.position.row;
    const adjacentCol = adjacentCell.position.column;
    this.AI.exploredBoard[adjacentRow][adjacentCol] = adjacentCell;
  }


  calculateAdjacentCells(row: number, col: number): Cell[] {
    const adjacentCellPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];

    const validAdjacentCellPositions = adjacentCellPositions.filter((position) =>
      this.isValidCellPosition(position.row, position.col)
    );

    const adjacentCells = validAdjacentCellPositions.map((position) =>
      this.generateGame.board[position.row][position.col]
    );

    return adjacentCells;
  }

  isValidCellPosition(row: number, col: number): boolean {
    return (
      row >= 0 &&
      row < this.generateGame.board.length &&
      col >= 0 &&
      col < this.generateGame.board[0].length
    );
  }

  updateScore(row: number, col: number) {
    this.AI.player.point -= 1;

    if (this.generateGame.board[row][col].type == CellType.Treasure) {
      this.AI.player.point += 1000;
      this.AI.exploredBoard[row][col] = this.generateGame.board[row][col];
      this.showMessage("Congratulations! You found the Treasure.");
      this.isGameOver = true;
      return;
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
    const dialogRef = this.dialog.open(MessageModalComponent, {
      width: '300px',
      data: { message }
    });

    dialogRef.afterClosed().subscribe(() => {
      window.location.reload();
    });
    // dialogRef.disableClose = true;
  }

  gameOver() {
    if (this.AI.player.point <= 0) {
      this.showMessage('Sorry. No moves left. Game Over.');
      this.isGameOver = true;
    }
  }
}
