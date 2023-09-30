import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardComponent } from './components/board/board.component';
import { MatDialogModule } from '@angular/material/dialog';
import { StartComponent } from './components/start/start.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ModalComponent } from './components/modal/modal.component';

@NgModule({
  declarations: [
    AppComponent,
    BoardComponent,
    StartComponent,
    SettingsComponent,
    ModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
