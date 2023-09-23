import { Injectable } from '@angular/core';
import { Cell } from '../models/cell';

@Injectable({
  providedIn: 'root'
})
export class PathFindingService {

  constructor() { }
 
  findCellWithLeastDanger(
    start: Cell,
    targets: Cell[],
    grid: Cell[][]
  ): Cell | null {
    // Dijkstra's algorithm to find the shortest path to all cells
    const shortestPaths = this.dijkstra(start, grid);
  
    let leastDangerCell: Cell | null = null;
    let shortestPathLength = Number.MAX_VALUE;
  
    for (const target of targets) {
      const targetPathLength = shortestPaths[target.position.row][target.position.column].distance;
      if (targetPathLength < shortestPathLength) {
        shortestPathLength = targetPathLength;
        leastDangerCell = target;
      }
    }
  
    return leastDangerCell;
  }
  
   dijkstra(start: Cell, grid: Cell[][]): { distance: number; previous: Cell | null }[][] {
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    const distances: { distance: number; previous: Cell | null }[][] = [];
  
    for (let row = 0; row < numRows; row++) {
      distances[row] = [];
      for (let col = 0; col < numCols; col++) {
        distances[row][col] = { distance: Number.MAX_VALUE, previous: null };
      }
    }
  
    distances[start.position.row][start.position.column].distance = 0;
  
    const unvisitedCells: Cell[] = [];
  
    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        unvisitedCells.push(grid[row][col]);
      }
    }
  
    while (unvisitedCells.length > 0) {
      unvisitedCells.sort(
        (a, b) => distances[a.position.row][a.position.column].distance - distances[b.position.row][b.position.column].distance
      );
      const closestCell = unvisitedCells.shift() as Cell;
  
      if (distances[closestCell.position.row][closestCell.position.column].distance === Number.MAX_VALUE) {
        break;
      }
  
      const neighbors = this.getNeighbors(closestCell, grid);
  
      for (const neighbor of neighbors) {
        const alt = distances[closestCell.position.row][closestCell.position.column].distance + 1; // Assuming each step has a distance of 1
        if (alt < distances[neighbor.position.row][neighbor.position.column].distance) {
          distances[neighbor.position.row][neighbor.position.column].distance = alt;
          distances[neighbor.position.row][neighbor.position.column].previous = closestCell;
        }
      }
    }
  
    return distances;
  }
  
 getNeighbors(cell: Cell, grid: Cell[][]): Cell[] {
    const neighbors: Cell[] = [];
    const numRows = grid.length;
    const numCols = grid[0].length;
  
    const offsets = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];
  
    for (const offset of offsets) {
      const newRow = cell.position.row + offset.row;
      const newCol = cell.position.column + offset.col;
  
      if (newRow >= 0 && newRow < numRows && newCol >= 0 && newCol < numCols) {
        neighbors.push(grid[newRow][newCol]);
      }
    }
  
    return neighbors;
  }
  
}
