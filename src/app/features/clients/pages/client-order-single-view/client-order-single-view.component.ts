import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ImportsService } from '@app/features/clients/services/imports.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';

type StandardField = {
  id: string;
  label: string;
  apiKey: string;
  inputType?: 'text' | 'date' | 'time' | 'number';
};

type StandardSection = {
  id: string;
  title: string;
  fields: StandardField[];
};

@Component({
  selector: 'app-client-order-single-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-order-single-view.component.html',
  styleUrl: './client-order-single-view.component.css'
})
export class ClientOrderSingleViewComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private importsService = inject(ImportsService);
  private storageService = inject(StorageService);

  companyId = signal<string | null>(null);
  submitLoading = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);

  readonly standardSections: StandardSection[] = [
    {
      id: 'pickup',
      title: 'Datos de recojo',
      fields: [
        { id: 'order_client_code', label: 'Código cliente', apiKey: 'order.client_code' },
        { id: 'order_tracking_number', label: 'N° de guía', apiKey: 'order.tracking_number' },
        { id: 'order_request_date', label: 'Fecha de solicitud', apiKey: 'order.request_date', inputType: 'date' },
        { id: 'pickup_company', label: 'Nombre de empresa (Recojo)', apiKey: 'pickup.company_name' },
        { id: 'pickup_contact', label: 'Nombre de contacto (Recojo)', apiKey: 'pickup.contact_name' },
        { id: 'pickup_phone', label: 'Celular (Recojo)', apiKey: 'pickup.phone' },
        { id: 'pickup_address', label: 'Dirección de recojo', apiKey: 'pickup.address' },
        { id: 'pickup_reference', label: 'Referencia (Recojo)', apiKey: 'pickup.reference' },
        { id: 'pickup_country', label: 'País', apiKey: 'pickup.country' },
        { id: 'pickup_district', label: 'Distrito (Recojo)', apiKey: 'pickup.district' },
        { id: 'pickup_province', label: 'Provincia (Recojo)', apiKey: 'pickup.province' },
        { id: 'pickup_department', label: 'Departamento (Recojo)', apiKey: 'pickup.department' },
        { id: 'pickup_date', label: 'Fecha de recojo', apiKey: 'pickup.date', inputType: 'date' },
        { id: 'pickup_start_time', label: 'Hora inicio de recojo', apiKey: 'pickup.time_from', inputType: 'time' },
        { id: 'pickup_end_time', label: 'Hora fin de recojo', apiKey: 'pickup.time_to', inputType: 'time' }
      ]
    },
    {
      id: 'delivery',
      title: 'Datos de entrega',
      fields: [
        { id: 'delivery_company', label: 'Nombre de empresa (Entrega)', apiKey: 'delivery.company_name' },
        { id: 'delivery_contact', label: 'Nombre de contacto (Entrega)', apiKey: 'delivery.contact_name' },
        { id: 'delivery_document', label: 'DNI (Entrega)', apiKey: 'delivery.dni' },
        { id: 'delivery_phone', label: 'Celular (Entrega)', apiKey: 'delivery.phone' },
        { id: 'delivery_address', label: 'Dirección (Entrega)', apiKey: 'delivery.address' },
        { id: 'delivery_reference', label: 'Referencia (Entrega)', apiKey: 'delivery.reference' },
        { id: 'delivery_district', label: 'Distrito (Entrega)', apiKey: 'delivery.district' },
        { id: 'delivery_province', label: 'Provincia (Entrega)', apiKey: 'delivery.province' },
        { id: 'delivery_department', label: 'Departamento (Entrega)', apiKey: 'delivery.department' }
      ]
    },
    {
      id: 'package',
      title: 'Datos de paquete',
      fields: [
        { id: 'package_description', label: 'Descripción del paquete', apiKey: 'package.description' },
        { id: 'package_qty', label: 'Cantidad de paquetes', apiKey: 'package.quantity', inputType: 'number' },
        { id: 'package_weight', label: 'Peso guía (KG)', apiKey: 'package.weight', inputType: 'number' },
        { id: 'package_size', label: 'Tamaño referencial guía', apiKey: 'package.size' },
        { id: 'package_height', label: 'Alto CM', apiKey: 'package.height', inputType: 'number' },
        { id: 'package_width', label: 'Ancho CM', apiKey: 'package.width', inputType: 'number' },
        { id: 'package_depth', label: 'Profundidad CM', apiKey: 'package.length', inputType: 'number' },
        { id: 'package_volumetric', label: 'Peso volumétrico guía', apiKey: 'package.volumetric_weight', inputType: 'number' },
        { id: 'package_m3', label: 'M3 guía', apiKey: 'package.m3', inputType: 'number' },
        { id: 'package_value', label: 'Valor estimado (opcional)', apiKey: 'order.estimated_value', inputType: 'number' },
        { id: 'package_notes', label: 'Observaciones (opcional)', apiKey: 'order.observations' }
      ]
    }
  ];

  form: FormGroup;

  constructor() {
    this.route.queryParams.subscribe(params => {
      const id = params['company_id'];
      this.companyId.set(typeof id === 'string' && id.length > 0 ? id : null);
    });
    const controls: Record<string, unknown> = {};
    for (const section of this.standardSections) {
      for (const field of section.fields) {
        controls[field.apiKey] = [''];
      }
    }
    this.form = this.fb.group(controls);
  }

  getInputType(field: StandardField): string {
    return field.inputType ?? 'text';
  }

  getSectionTitleShort(sectionId: string): string {
    const map: Record<string, string> = {
      pickup: 'Datos de recojo',
      delivery: 'Datos de entrega',
      package: 'Datos de paquete'
    };
    return map[sectionId] ?? sectionId;
  }

  private readonly requiredApiKeys = ['order.tracking_number', 'order.request_date', 'pickup.address', 'delivery.address'];

  isRequiredField(apiKey: string): boolean {
    return this.requiredApiKeys.includes(apiKey);
  }

  onSubmit(): void {
    this.submitError.set(null);
    this.submitSuccess.set(false);
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!clientId) {
      this.submitError.set('Debes iniciar sesión.');
      return;
    }

    const raw = this.form.getRawValue();
    const order: Record<string, string> = {};
    for (const key of Object.keys(raw)) {
      const v = raw[key];
      if (v != null && String(v).trim() !== '') {
        order[key] = String(v).trim();
      }
    }

    const required: string[] = ['order.tracking_number', 'order.request_date', 'pickup.address', 'delivery.address'];
    const missing = required.filter(k => !order[k]);
    if (missing.length) {
      this.submitError.set('Completa los campos obligatorios: N° de guía, Fecha de solicitud, Dirección de recojo y Dirección de entrega.');
      return;
    }

    this.submitLoading.set(true);
    this.importsService.createSingleOrder({
      client_id: clientId,
      company_id: this.companyId() ?? undefined,
      order
    }).subscribe({
      next: () => {
        this.submitLoading.set(false);
        this.submitSuccess.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.submitLoading.set(false);
        const msg = err?.error?.errors?.[0] ?? err?.message ?? 'No se pudo crear la orden.';
        this.submitError.set(typeof msg === 'string' ? msg : 'Error al guardar.');
      }
    });
  }
}
