import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
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
  openSelectId = signal<string | null>(null);
  selectedLabels = signal<Record<string, string>>({
    order_ref_id: 'ID de Pedido (Sistema)',
    order_date_created: 'Fecha de Creación',
    service_type_name: 'Tipo de Servicio'
  });

  openUploadModal(): void {
    this.uploadModalOpen.set(true);
  }

  closeUploadModal(): void {
    this.uploadModalOpen.set(false);
  }

  @HostListener('document:click')
  closeSelects(): void {
    this.openSelectId.set(null);
  }

  toggleSelect(id: string): void {
    this.openSelectId.set(this.openSelectId() === id ? null : id);
  }

  isSelectOpen(id: string): boolean {
    return this.openSelectId() === id;
  }

  getSelectedLabel(id: string): string {
    return this.selectedLabels()[id] ?? 'Seleccionar campo';
  }

  selectOption(id: string, label: string): void {
    this.selectedLabels.update((current) => ({ ...current, [id]: label }));
    this.openSelectId.set(null);
  }
}
