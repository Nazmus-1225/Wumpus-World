import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { TempComponent } from './components/temp/temp.component';

const routes: Routes = [
  {path: '', component: BoardComponent}
  // {path: '', component: TempComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
