import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-message-modal',
  templateUrl: './message-modal.component.html',
  styleUrls: ['./message-modal.component.css']
})

export class MessageModalComponent {
  message: string;
  constructor(
    public dialogRef: MatDialogRef<MessageModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {
    this.message = data.message;
  }

  closeModal(): void {
    this.dialogRef.close();
    window.location.reload();
  }
}
