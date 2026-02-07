import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ModalComponent } from '@app/shared/ui/modal/modal.component';

@Component({
  selector: 'app-client-shipments-upload-view',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  templateUrl: './client-shipments-upload-view.component.html',
  styleUrl: './client-shipments-upload-view.component.css'
})
export class ClientShipmentsUploadViewComponent {
  uploadModalOpen = signal(false);

  openUploadModal(): void {
    this.uploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.uploadModalOpen.set(false);
  }
}
