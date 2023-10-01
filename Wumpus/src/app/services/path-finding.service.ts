import { Injectable } from '@angular/core';
import { Cell, CellType } from '../models/cell';
import { HelperService } from './helper.service';

@Injectable({
  providedIn: 'root',
})
export class PathFindingService {
  constructor(private helper: HelperService) {}

  areCellsEqual(cell1: Cell | null, cell2: Cell | null): boolean {
    if (cell1 != null && cell2 != null) {
      return (
        cell1.position.row === cell2.position.row &&
        cell1.position.column === cell2.position.column
      );
    } else {
      return false;
    }
  }

  calculateHeuristic(current: Cell, target: Cell): number {
    return (
      Math.abs(current.position.row - target.position.row) +
      Math.abs(current.position.column - target.position.column)
    );
  }
  findCellWithLeastDanger(start: Cell, targets: Cell[]): Cell | null {
    // Initialize an array to store distances and paths for all targets
    const distancesAndPathsArray: {
      distance: number | undefined;
      path: Cell[];
    }[] = [];

    for (const target of targets) {
      // Calculate the shortest path and distance to the current target
      const distancesAndPaths = this.findShortestPath(start, target);

      // Get the distance and path for the current target and add it to the array
      distancesAndPathsArray.push(
        distancesAndPaths || { distance: undefined, path: [] }
      );
    }

    // Initialize the least danger cell and shortest path length
    let leastDangerCell: Cell | null = null;
    let shortestPathLength = Number.MAX_VALUE;
    let shortestRisk = Number.MAX_VALUE;
    // Find the least dangerous cell from the array of distances and paths
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      const { distance, path } = distancesAndPathsArray[i];
      let pathRisk = 0;
      path.forEach((cell) => {
        pathRisk += cell.total_risk + target.total_risk;
      });
      console.log(
        `Distance to Target: ${distance}` +
          ' row ' +
          target.position.column +
          ' column ' +
          target.position.row
      );
      console.log(
        'Path to Target:',
        path.map(
          (cell) =>
            ' row ' + cell.position.column + ' column ' + cell.position.row
        )
      );
      console.log(`Total Risk for Path: ${pathRisk}`);
      // if (distance !== undefined && distance < shortestPathLength) {
      //     shortestPathLength = distance;
      //     leastDangerCell = target;
      // }
      if (pathRisk < shortestRisk) {
        shortestRisk = pathRisk;
        leastDangerCell = path[1];
      }
    }

 

    return leastDangerCell;
  }

  findShortestPath(
    start: Cell,
    target: Cell
  ): { distance: number; path: Cell[] } | null {
    const openList: Cell[] = [];
    const closedList = new Map<Cell, boolean>();
    const gScores = new Map<Cell, number>();
    const fScores = new Map<Cell, number>();
    const paths = new Map<Cell, Cell[]>(); // Map to store paths

    gScores.set(start, 0);
    fScores.set(start, this.calculateHeuristic(start, target));
    paths.set(start, [start]); // Initialize the path with the start cell

    openList.push(start);

    while (openList.length > 0) {
      openList.sort((a, b) => (fScores.get(a) || 0) - (fScores.get(b) || 0));

      const current = openList.shift();

      if (!current) break;

      closedList.set(current, true);

      current.adjacentCells = this.helper.calculateAdjacentCells(
        current.position.row,
        current.position.column
      );

      for (const neighbor of current.adjacentCells) {
        if (closedList.has(neighbor)) continue; // Skip already evaluated cells
        if (neighbor.isHidden && !this.areCellsEqual(neighbor, target)) {
          continue;
        }
        const tentativeGScore = (gScores.get(current) || 0) + 1;

        if (
          !openList.includes(neighbor) ||
          tentativeGScore < (gScores.get(neighbor) || 0)
        ) {
          gScores.set(neighbor, tentativeGScore);
          fScores.set(
            neighbor,
            tentativeGScore + this.calculateHeuristic(neighbor, target)
          );

          // Update the path to the neighbor
          paths.set(neighbor, [...paths.get(current)!, neighbor]);

          if (neighbor === target) {
            // If the neighbor is the target, return the distance and path
            return {
              distance: gScores.get(neighbor) || 0,
              path: paths.get(neighbor) || [],
            };
          }

          if (!openList.includes(neighbor)) {
            openList.push(neighbor);
          }
        }
      }
    }

    // If no path is found to the target, return null
    return null;
  }
}
