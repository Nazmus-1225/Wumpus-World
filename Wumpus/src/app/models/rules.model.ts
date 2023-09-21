export class Rules {
}

//Target
// Find Treasure
// Find wumpus and kill
// If pit found then always avoid
// Track the path

// Rules
//1.if !breeze -> no pit in the adjacents. chance of pit 0% (confirm)
//2. if breeze -> pit in at least one of them. chance of pit +=20%

//(One wumpus)
//3. if !smell -> no wumpus in the adjacents. chance of wumpus 0% (confirm)
//4. if smell -> wumpus in one of them. chance of wumpus +=30%  
//5. if chance of wumpus>=90% -> shoot (confirm wumpus)

//6. if !light -> no treasure in the adjacents. chance of treasure 0% (confirm)
//7. if light -> treasure in one of them. chance of treasure +=30%
//8. if chance of treasure>=90% -> pick it  (confirm)


//Flag_Score
//-100 for pit/wumpus
//+100 for treasure
//-10 for visited