import { Injectable } from '@angular/core';
import { Cell, CellType } from '../models/cell';
import { HelperService } from './helper.service';
import { Path } from '../models/path';

@Injectable({
  providedIn: 'root'
})
export class PathFindingService {
  constructor(private helper: HelperService) {
  }

  findCellWithLeastDanger(
        start: Cell,
        targets: Cell[],
        grid: Cell[][]
      ): Cell | null {
       
       
const shortestPaths = this.findShortestPaths(start, targets);
// for (const cell of shortestPaths.keys()) {
//     const distance = shortestPaths.get(cell);
//     console.log(`Cell: ${cell.position.column}, ${cell.position.row}`);
//     console.log(`Distance: ${distance}`);
//     console.log(`f_score: ${cell.f_score || 0}`);
//     console.log(`g_score: ${cell.g_score || 0}`);
//     console.log(`Visited: ${cell.visited}`);
//     // Add more properties as needed
//     console.log('---');
// }
targets = targets.filter((target) => !this.areCellsEqual(target, start))
        let leastDangerCell: Cell | null = {
          type: CellType.Empty,
          position: { row: 0, column: 9 },
          isHidden: true,
          hasBreeze: false,
          hasSmell: false,
          hasLight: false,
          wumpus_probability: 0.01,
          pit_probability: 0.05,
          treasure_probability: -0.01,
          risk_score: 0,
          visit_risk: 0,
          total_risk: 0,
          adjacentCells: this.helper.calculateAdjacentCells(0,9),
       
        };
        let shortestPathLength = Number.MAX_VALUE;
        
        for (const target of targets) {
       
        const targetPathLength = shortestPaths.get(target);
      console.log("distance "+targetPathLength+" Row "+target.position.column+" Column "+target.position.row)
       if (targetPathLength !== undefined && targetPathLength < shortestPathLength) {
        shortestPathLength = targetPathLength;
        leastDangerCell = target;
      }
        }
       console.log("ans "+shortestPathLength+" Row "+leastDangerCell.position.column+" Column "+leastDangerCell.position.row)
        return leastDangerCell;
      }

      
  calculateHeuristic(current: Cell, target: Cell): number {
    return Math.abs(current.position.row - target.position.row) + Math.abs(current.position.column - target.position.column);
}
findShortestPaths(
  start: Cell,
   targets: Cell[]
): Map<Cell, number> {
  const openList: Cell[] = [];
  const closedList = new Map<Cell, boolean>();
  const gScores = new Map<Cell, number>();
  const fScores = new Map<Cell, number>();

  gScores.set(start, 0);
  fScores.set(start, this.calculateHeuristic(start, start));

  openList.push(start);

  while (openList.length > 0) {
      // Find the cell with the lowest f-score in the open list
      openList.sort((a, b) => (fScores.get(a) || 0) - (fScores.get(b) || 0));

      const current = openList.shift();

      if (!current) break;

      closedList.set(current, true);
current.adjacentCells=this.helper.calculateAdjacentCells(current.position.row, current.position.column)
      for (const neighbor of current.adjacentCells) {
          if (closedList.has(neighbor)) continue;
          const tentativeGScore = (gScores.get(current) || 0) +neighbor.total_risk+current.total_risk+1; // Assuming a cost of 1 to move between adjacent cells

          if (!openList.includes(neighbor)) {
              openList.push(neighbor);
          } else if (tentativeGScore >= (gScores.get(neighbor) || 0)) {
              continue; // This is not a better path
          }

          // This path is the best one so far. Record it!
          gScores.set(neighbor, tentativeGScore);
          fScores.set(neighbor, tentativeGScore + this.calculateHeuristic(neighbor, start));
      }
  }

  // Extract the distances (g-scores) to all cells from the start cell
  const distances = new Map<Cell, number>();
  for (const cell of closedList.keys()) {
      distances.set(cell, gScores.get(cell) || 0);
  }

  return distances;
}

  areCellsEqual(cell1: Cell, cell2: Cell): boolean {
    return (
      cell1.position.row === cell2.position.row &&
      cell1.position.column === cell2.position.column
    );
  }
}


//mubins a* in ts
// function calculateHeuristic(x1: number, y1: number, x2: number, y2: number): number {
// return Math.abs(x1 - x2) + Math.abs(y1 - y2);
// }

// function findPath(startX: number, startY: number, targetX: number, targetY: number): { x: number; y: number }[] | null {
//     const openList: Path[] = []; // Priority queue of open nodes
//     const closedList = new Set<string>(); // Set of closed nodes

//     const startNode = new Path(startX, startY);
//     const targetNode = new Path(targetX, targetY);

//     openList.push(startNode);

//     while (openList.length > 0) {
//         // Find the node with the lowest f score in the open list
//         const currentNode = openList.reduce((minNode, node) =>
//             node.f < minNode.f ? node : minNode, openList[0]);

//         // Remove the current node from the open list
//         openList.splice(openList.indexOf(currentNode), 1);

//         // Add the current node to the closed list
//         closedList.add(`${currentNode.x}-${currentNode.y}`);

//         // Check if we've reached the target
//         if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
//             const path: { x: number; y: number }[] = [];
//             let current: Path | null = currentNode;

//             while (current) {
//                 path.unshift({ x: current.x, y: current.y });
//                 current = current.parent;
//             }

//             return path;
//         }

//         // Generate neighbor nodes
//         const neighbors = [
//             { x: currentNode.x - 1, y: currentNode.y },
//             { x: currentNode.x + 1, y: currentNode.y },
//             { x: currentNode.x, y: currentNode.y - 1 },
//             { x: currentNode.x, y: currentNode.y + 1 },
//         ];

//         for (const neighbor of neighbors) {
//             const [nx, ny] = [neighbor.x, neighbor.y];

//             // Skip if neighbor is out of bounds or in closed list
//             if (
//                 nx < 0 || nx >= 10 ||
//                 ny < 0 || ny >= 10 ||
//                 closedList.has(`${nx}-${ny}`)
//             ) {
//                 continue;
//             }

//             if (!isCellVisited(nx, ny) && !(nx === targetX && ny === targetY)) {
//                 continue;
//             }

//             // Calculate tentative g score
//             const gScore = currentNode.g + 1; // Assuming uniform cost

//             // Check if neighbor is not in the open list or has a lower g score
//             let neighborNode = openList.find(node => node.x === nx && node.y === ny);

//             if (!neighborNode || gScore < (neighborNode as Path).g) {
//                 if (!neighborNode) {
//                     neighborNode = new Path(nx, ny);
//                     openList.push(neighborNode);
//                 }

//                 (neighborNode as Path).parent = currentNode;
//                 (neighborNode as Path).g = gScore;
//                 (neighborNode as Path).h = calculateHeuristic(nx, ny, targetX, targetY);
//             }
//         }
//     }

//     return null; // Path not found
// }

// function isCellVisited(x: number, y: number): boolean {
   
//     return false; // Replace with your implementation
// }



// dijkstra :3
//   findCellWithLeastDanger(
//     start: Cell,
//     targets: Cell[],
//     grid: Cell[][]
//   ): Cell | null {
//     // Dijkstra's algorithm to find the shortest path to all cells
   
//     const shortestPaths = this.dijkstra(start, grid,targets);
  
//     let leastDangerCell: Cell | null = {
//       type: CellType.Empty,
//       position: { row: 0, column: 9 },
//       isHidden: true,
//       hasBreeze: false,
//       hasSmell: false,
//       hasLight: false,
//       wumpus_probability: 0.01,
//       pit_probability: 0.05,
//       treasure_probability: -0.01,
//       risk_score: 0,
//       visit_risk: 0,
//       total_risk: 0,
//       adjacentCells: this.helper.calculateAdjacentCells(0,9),
//       path_risk:0,
//       visited:false
//     };
//     let shortestPathLength = Number.MAX_VALUE;
//     targets = targets.filter((target) => !this.areCellsEqual(target, start));
    
//     for (const target of targets) {
   
//       const targetPathLength = shortestPaths[target.position.row][target.position.column].distance;
//       console.log("distance "+targetPathLength+" Row "+target.position.column+" Column "+target.position.row)
//       if (targetPathLength < shortestPathLength) {
//         shortestPathLength = targetPathLength;
//         leastDangerCell = target;
//       }
//     }
//    console.log("ans "+shortestPathLength+" Row "+leastDangerCell.position.column+" Column "+leastDangerCell.position.row)
//     return leastDangerCell;
//   }
  
//   areCellsEqual(cell1: Cell, cell2: Cell): boolean {
//     return (
//       cell1.position.row === cell2.position.row &&
//       cell1.position.column === cell2.position.column
//     );
//   }

//    dijkstra(start: Cell, grid: Cell[][],targets:Cell[]): { distance: number; previous: Cell | null }[][] {
//     const numRows = grid.length;
//     const numCols = grid[0].length;
  
//     const distances: { distance: number; previous: Cell | null }[][] = [];
  
//     for (let row = 0; row < numRows; row++) {
//       distances[row] = [];
//       for (let col = 0; col < numCols; col++) {
//         distances[row][col] = { distance: Number.MAX_VALUE, previous: null };
//       }
//     }
  
//    distances[start.position.row][start.position.column].distance = 0;
  
//     const unvisitedCells: Cell[] = [];
  
//     for (let row = 0; row < numRows; row++) {
//       for (let col = 0; col < numCols; col++) {
//         unvisitedCells.push(grid[row][col]);
//       }
//     }
  
// while (unvisitedCells.length > 0) {
//   unvisitedCells.sort(
//     (a, b) => distances[a.position.row][a.position.column].distance + a.total_risk - distances[b.position.row][b.position.column].distance - b.total_risk
//   );
//   const closestCell = unvisitedCells.shift() as Cell;

//   if (distances[closestCell.position.row][closestCell.position.column].distance === Number.MAX_VALUE) {
//     // No more accessible cells, break the loop
//     break;
//   }
//   const neighbors = this.helper.calculateAdjacentUnvisitedCells(closestCell.position.row, closestCell.position.column);
// //   for (const neighbor of neighbors) {
// //     console.log(`Row: ${closestCell.position.row}, Column: ${closestCell.position.column}`)
// //     console.log(`Row: ${neighbor.position.row}, Column: ${neighbor.position.column}`);
// // }
//   closestCell.adjacentCells=this.helper.calculateAdjacentCells(closestCell.position.row,closestCell.position.column)
//   if(!closestCell.isHidden){
//   for (const neighbor of closestCell.adjacentCells ) {
//     console.log(closestCell.position.row+" "+closestCell.position.column)
//    console.log(neighbor.position.row+" "+neighbor.position.column)  
//    console.log( distances[closestCell.position.row][closestCell.position.column].distance)
//    console.log( "before "+distances[neighbor.position.row][neighbor.position.column].distance) 

//     const alt = distances[closestCell.position.row][closestCell.position.column].distance +neighbor.total_risk+closestCell.total_risk;
//     // console.log(
//     //       " alt "+alt
//     //       +" row "+closestCell.position.column+" col "+closestCell.position.row+ 
//     //       " risk "+ closestCell.total_risk
//     //     );
//     if (alt <= distances[neighbor.position.row][neighbor.position.column].distance) {
//       distances[neighbor.position.row][neighbor.position.column].distance = alt;
//       distances[neighbor.position.row][neighbor.position.column].previous = closestCell;
//     }
//     console.log("After "+ distances[neighbor.position.row][neighbor.position.column].distance) 
//   }
// }
//   console.log("ekta done")

// }

//     return distances;
//   }}

//   function isNeighborAdjacent(currentCell: Cell, neighborCell: Cell): boolean {
//     const { row: currentRow, column: currentColumn } = currentCell.position;
//     const { row: neighborRow, column: neighborColumn } = neighborCell.position;
//     // Cells are considered adjacent if they share a common edge
//     return (
//       (Math.abs(currentRow - neighborRow) === 1 && currentColumn === neighborColumn) ||
//       (Math.abs(currentColumn - neighborColumn) === 1 && currentRow === neighborRow)
//     );
//   }


//Mubin
// function findPath(startX: number, startY: number, targetX: number, targetY: number) {
//     const openList = []; // Priority queue of open nodes
//     const closedList = new Set(); // Set of closed nodes

//     const startNode = new Node(startX, startY);
//     const targetNode = new Node(targetX, targetY);

//     openList.push(startNode);

//     while (openList.length > 0) {
//         // Find the node with the lowest f score in the open list
//         const currentNode = openList.reduce((minNode, node) =>
//             node.f < minNode.f ? node : minNode, openList[0]);

//         // Remove the current node from the open list
//         openList.splice(openList.indexOf(currentNode), 1);

//         // Add the current node to the closed list
//         closedList.add(${currentNode.x}-${currentNode.y});

//         // Check if we've reached the target
//         if (currentNode.x === targetNode.x && currentNode.y === targetNode.y) {
//             const path = [];
//             let current = currentNode;

//             while (current) {
//                 path.unshift({ x: current.x, y: current.y });
//                 current = current.parent;
//             }

//             return path;
//         }

//         // Generate neighbor nodes
//         const neighbors = [
//             { x: currentNode.x - 1, y: currentNode.y },
//             { x: currentNode.x + 1, y: currentNode.y },
//             { x: currentNode.x, y: currentNode.y - 1 },
//             { x: currentNode.x, y: currentNode.y + 1 },
//         ];

//         for (const neighbor of neighbors) {
//             const [nx, ny] = [neighbor.x, neighbor.y];

//             // Skip if neighbor is out of bounds or in closed list
//             if (
//                 nx < 0 || nx >= 10 ||
//                 ny < 0 || ny >= 10 ||
//                 closedList.has(${nx}-${ny})
//             ) {
//                 continue;
//             }

//             if (!recordedPositions[ny].some(cell => cell.x === nx && cell.y === ny) && !(nx === targetX && ny === targetY)) {
//                 continue;
//             }

//             // Calculate tentative g score
//             const gScore = currentNode.g + 1; // Assuming uniform cost

//             // Check if neighbor is not in the open list or has a lower g score
//             let neighborNode = openList.find(node => node.x === nx && node.y === ny);

//             if (!neighborNode || gScore < neighborNode.g) {
//                 if (!neighborNode) {
//                     neighborNode = new Node(nx, ny);
//                     openList.push(neighborNode);
//                 }

//                 neighborNode.parent = currentNode;
//                 neighborNode.g = gScore;
//                 neighborNode.h = calculateHeuristic(nx, ny, targetX, targetY);
//             }
//         }
//     }
// }

// // Calculate Manhattan distance heuristic
// function calculateHeuristic(x1: number, y1: number, x2: number, y2: number) {
//     return Math.abs(x1 - x2) + Math.abs(y1 - y2);
// }

