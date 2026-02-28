import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, inject, NgZone, signal, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService } from '@app/features/clients/services/orders.service';
import { StorageService } from '@app/core/storage/storage.service';
import { LocalStorageEnums } from '@app/shared/models/local.storage.enums';
import type { Map, Marker } from 'leaflet';
import type { ManualOrderCreatePayload, ManualOrderSize } from '@app/features/clients/models/manual-order.model';
import {
  LOCATION_COUNTRIES,
  LOCATION_DEPARTMENTS,
  LOCATION_DISTRICTS,
  LOCATION_PROVINCES,
  type LocationOption
} from './client-order-single-view.constants';

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
export class ClientOrderSingleViewComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  private storageService = inject(StorageService);
  private ngZone = inject(NgZone);

  @ViewChild('pickupMap') pickupMapRef!: ElementRef<HTMLDivElement>;
  @ViewChild('deliveryMap') deliveryMapRef!: ElementRef<HTMLDivElement>;

  companyId = signal<string | null>(null);
  submitLoading = signal(false);
  submitError = signal<string | null>(null);
  submitSuccess = signal<boolean>(false);
  mapReady = signal(false);

  /** Dropdown de ubicación abierto (field.id). Cerrar al hacer clic fuera. */
  openLocationSelectId = signal<string | null>(null);
  /** Texto de búsqueda por campo para los dropdowns de ubicación. */
  locationSearchText = signal<Record<string, string>>({});

  readonly totalSteps = 3;
  currentStep = signal(1);
  readonly stepLabels = ['Punto de Recojo', 'Destino de Entrega', 'Detalles del Paquete'] as const;
  readonly stepSubtitles = [
    'Indique la dirección y datos del punto donde se recogerá el paquete.',
    'Defina la ubicación exacta y los detalles del receptor para la entrega final.',
    'Complete las características del paquete a enviar.'
  ] as const;

  private pickupMapInstance: Map | null = null;
  private deliveryMapInstance: Map | null = null;
  private pickupMarker: Marker | null = null;
  private deliveryMarker: Marker | null = null;
  private leafletLib: typeof import('leaflet') | null = null;

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
        { id: 'delivery_country', label: 'País (Entrega)', apiKey: 'delivery.country' },
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
        controls[field.id] = [''];
      }
    }
    controls['pickup_latitude'] = [''];
    controls['pickup_longitude'] = [''];
    controls['delivery_latitude'] = [''];
    controls['delivery_longitude'] = [''];
    this.form = this.fb.group(controls);
    // TODO: eliminar — valores por defecto solo para pruebas
    this.setDefaultTestValues();
  }

  /** Valores por defecto para pruebas. Eliminar cuando ya no se necesiten. */
  private setDefaultTestValues(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.form.patchValue({
      order_tracking_number: 'MAN-TEST-' + Date.now().toString(36).toUpperCase().slice(-6),
      order_request_date: today,
      pickup_company: 'Empresa Recojo Test',
      pickup_contact: 'Contacto Recojo',
      pickup_phone: '999111222',
      pickup_address: 'Av. Recojo 123',
      pickup_reference: 'Cerca al parque',
      pickup_country: 'Peru',
      pickup_district: 'Miraflores',
      pickup_province: 'Lima',
      pickup_department: 'Lima',
      pickup_date: today,
      pickup_start_time: '09:00',
      pickup_end_time: '12:00',
      pickup_latitude: '-12.046374',
      pickup_longitude: '-77.042793',
      delivery_company: 'Empresa Entrega Test',
      delivery_contact: 'Contacto Entrega',
      delivery_phone: '999333444',
      delivery_address: 'Av. Entrega 456',
      delivery_reference: 'Cerca al centro comercial',
      delivery_country: 'Peru',
      delivery_district: 'San Isidro',
      delivery_province: 'Lima',
      delivery_department: 'Lima',
      delivery_latitude: '-12.097500',
      delivery_longitude: '-77.036600',
      package_description: 'Paquete de prueba',
      package_qty: 1,
      package_size: 'M',
      package_weight: '2.5',
      package_height: '20',
      package_width: '30',
      package_depth: '40',
      package_value: '99.90',
      package_notes: 'Orden de prueba desde UI'
    });
  }

  /** Mapeo de clave del formulario (sin puntos) a apiKey para el backend. */
  private formKeyToApiKey(formKey: string): string | null {
    const map: Record<string, string> = {
      pickup_latitude: 'pickup.latitude',
      pickup_longitude: 'pickup.longitude',
      delivery_latitude: 'delivery.latitude',
      delivery_longitude: 'delivery.longitude'
    };
    if (map[formKey]) return map[formKey];
    for (const section of this.standardSections) {
      for (const field of section.fields) {
        if (field.id === formKey) return field.apiKey;
      }
    }
    return null;
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined') return;
    setTimeout(() => this.initLeafletMaps(), 150);
  }

  private async initLeafletMaps(): Promise<void> {
    try {
      const L = await import('leaflet');
      this.leafletLib = L.default;
      this.fixLeafletIcon(this.leafletLib);
      if (this.pickupMapRef?.nativeElement) {
        this.initMap(this.leafletLib, 'pickup');
      }
      if (this.deliveryMapRef?.nativeElement) {
        this.initMap(this.leafletLib, 'delivery');
      }
      this.mapReady.set(true);
    } catch (err) {
      console.warn('Leaflet no cargado:', err);
    }
  }

  private fixLeafletIcon(L: typeof import('leaflet')): void {
    const DefaultIcon = (L as unknown as { Icon: { Default: { prototype: { _getIconUrl?: unknown }; mergeOptions: (o: object) => void } } }).Icon?.Default;
    if (DefaultIcon?.prototype && '_getIconUrl' in DefaultIcon.prototype) {
      delete (DefaultIcon.prototype as { _getIconUrl?: unknown })._getIconUrl;
    }
    if (DefaultIcon?.mergeOptions) {
      DefaultIcon.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
      });
    }
  }

  private initMap(L: typeof import('leaflet'), type: 'pickup' | 'delivery'): void {
    const el = type === 'pickup' ? this.pickupMapRef?.nativeElement : this.deliveryMapRef?.nativeElement;
    if (!el) return;
    const latKey = type === 'pickup' ? 'pickup_latitude' : 'delivery_latitude';
    const lngKey = type === 'pickup' ? 'pickup_longitude' : 'delivery_longitude';
    const center: [number, number] = [-12.0464, -77.0428];
    const map = L.map(el, { center, zoom: 13 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    const marker = L.marker(center).addTo(map);
    map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
      marker.setLatLng(e.latlng);
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      this.ngZone.run(() => {
        this.form.get(latKey)?.setValue(lat);
        this.form.get(lngKey)?.setValue(lng);
      });
    });
    if (type === 'pickup') {
      this.pickupMapInstance = map;
      this.pickupMarker = marker;
    } else {
      this.deliveryMapInstance = map;
      this.deliveryMarker = marker;
    }
    setTimeout(() => map.invalidateSize(), 200);
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

  private readonly requiredApiKeys = [
    'order.tracking_number',
    'order.request_date',
    'pickup.contact_name',
    'pickup.contact_phone',
    'pickup.address',
    'pickup.reference',
    'pickup.country',
    'pickup.department',
    'pickup.province',
    'pickup.district',
    'delivery.contact_name',
    'delivery.contact_phone',
    'delivery.address',
    'delivery.reference',
    'delivery.country',
    'delivery.department',
    'delivery.province',
    'delivery.district',
    'package.description',
    'package.quantity',
    'package.size',
    'package.weight',
    'package.height',
    'package.width',
    'package.length'
  ];

  /** Tamaños válidos para el API (POST /orders/). */
  readonly packageSizes: ManualOrderSize[] = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'CUSTOM'];

  /** Indica si el campo es país, departamento, provincia o distrito (dropdown precargado). */
  isLocationDropdown(apiKey: string): boolean {
    return ['pickup.country', 'pickup.department', 'pickup.province', 'pickup.district',
            'delivery.country', 'delivery.department', 'delivery.province', 'delivery.district'].includes(apiKey);
  }

  /** Opciones para dropdowns de ubicación (por ahora precargadas; luego vendrán de API). */
  getLocationOptions(apiKey: string): LocationOption[] {
    if (apiKey.endsWith('.country')) return LOCATION_COUNTRIES;
    if (apiKey.endsWith('.department')) return LOCATION_DEPARTMENTS;
    if (apiKey.endsWith('.province')) return LOCATION_PROVINCES;
    if (apiKey.endsWith('.district')) return LOCATION_DISTRICTS;
    return [];
  }

  /** Normaliza texto para búsqueda (sin acentos, minúsculas). */
  private normalizeForSearch(s: string): string {
    return (s ?? '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  toggleLocationSelect(fieldId: string): void {
    if (this.openLocationSelectId() === fieldId) {
      this.openLocationSelectId.set(null);
      return;
    }
    this.openLocationSelectId.set(fieldId);
    this.locationSearchText.update((c) => ({ ...c, [fieldId]: c[fieldId] ?? '' }));
    setTimeout(() => {
      const el = document.getElementById(`location-search-${fieldId}`) as HTMLInputElement | null;
      el?.focus();
      el?.select();
    }, 0);
  }

  @HostListener('document:click')
  closeLocationSelects(): void {
    this.openLocationSelectId.set(null);
  }

  isLocationSelectOpen(fieldId: string): boolean {
    return this.openLocationSelectId() === fieldId;
  }

  setLocationSearchValue(fieldId: string, value: string): void {
    this.locationSearchText.update((c) => ({ ...c, [fieldId]: value }));
  }

  getLocationSearchValue(fieldId: string): string {
    return this.locationSearchText()[fieldId] ?? '';
  }

  getFilteredLocationOptions(fieldId: string, apiKey: string): LocationOption[] {
    const options = this.getLocationOptions(apiKey);
    const query = this.normalizeForSearch(this.getLocationSearchValue(fieldId));
    if (!query) return options;
    return options.filter(
      (o) => this.normalizeForSearch(o.label).includes(query) || this.normalizeForSearch(o.value).includes(query)
    );
  }

  getLocationSelectedLabel(fieldId: string, apiKey: string): string {
    const value = this.form.get(fieldId)?.value;
    if (!value) return 'Seleccione...';
    const opt = this.getLocationOptions(apiKey).find((o) => o.value === value);
    return opt?.label ?? value;
  }

  selectLocationOption(fieldId: string, value: string): void {
    this.form.get(fieldId)?.setValue(value);
    this.openLocationSelectId.set(null);
  }

  isRequiredField(apiKey: string): boolean {
    return this.requiredApiKeys.includes(apiKey);
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep() > step;
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
      this.resizeMapForCurrentStep();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      this.resizeMapForCurrentStep();
    }
  }

  /** Ir a un paso concreto al hacer clic en las bolitas del stepper. */
  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
      this.resizeMapForCurrentStep();
    }
  }

  private resizeMapForCurrentStep(): void {
    setTimeout(() => {
      const step = this.currentStep();
      if (step === 1 && this.pickupMapInstance) this.pickupMapInstance.invalidateSize();
      if (step === 2) {
        if (this.deliveryMapInstance) {
          this.deliveryMapInstance.invalidateSize();
        } else if (this.leafletLib && this.deliveryMapRef?.nativeElement) {
          this.initMap(this.leafletLib, 'delivery');
        }
      }
    }, 150);
  }

  isFullWidthField(field: StandardField): boolean {
    const fullIds = [
      'pickup_company', 'pickup_address', 'pickup_reference',
      'delivery_company', 'delivery_address', 'delivery_reference',
      'delivery_country',
      'package_description', 'package_notes'
    ];
    return fullIds.includes(field.id);
  }

  /** Convierte valor de input time (HH:MM o HH:MM:SS) a HH:MM. */
  private toHHMM(value: unknown): string {
    const s = (value ?? '').toString().trim();
    const match = s.match(/^(\d{1,2}):(\d{2})/);
    if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
    return '00:00';
  }

  /** Convierte fecha YYYY-MM-DD + hora opcional a ISO datetime. */
  private toISODateTime(dateStr: string, timeHHMM: string = '00:00'): string {
    if (!dateStr || !dateStr.trim()) return '';
    const [h, m] = timeHHMM.split(':').map(x => x.padStart(2, '0'));
    return `${dateStr.trim()}T${h}:${m}:00Z`;
  }

  private buildPayload(): ManualOrderCreatePayload | null {
    const raw = this.form.getRawValue() as Record<string, unknown>;
    const get = (key: string): string => (raw[key] != null && String(raw[key]).trim() !== '') ? String(raw[key]).trim() : '';
    const companyId = this.companyId();
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!companyId || !clientId) return null;

    const requestDate = get('order_request_date');
    const pickupDate = get('pickup_date');
    const fromTime = this.toHHMM(raw['pickup_start_time']);
    const toTime = this.toHHMM(raw['pickup_end_time']);

    const pickup: ManualOrderCreatePayload['pickup'] = {
      contact_name: get('pickup_contact'),
      contact_phone: get('pickup_phone'),
      address: get('pickup_address'),
      reference: get('pickup_reference'),
      country: get('pickup_country'),
      department: get('pickup_department'),
      province: get('pickup_province'),
      district: get('pickup_district')
    };
    const latPickup = get('pickup_latitude');
    const lngPickup = get('pickup_longitude');
    if (latPickup && lngPickup) {
      pickup.latitude = latPickup;
      pickup.longitude = lngPickup;
    }

    const delivery: ManualOrderCreatePayload['delivery'] = {
      contact_name: get('delivery_contact'),
      contact_phone: get('delivery_phone'),
      address: get('delivery_address'),
      reference: get('delivery_reference'),
      country: get('delivery_country'),
      department: get('delivery_department'),
      province: get('delivery_province'),
      district: get('delivery_district')
    };
    const latDel = get('delivery_latitude');
    const lngDel = get('delivery_longitude');
    if (latDel && lngDel) {
      delivery.latitude = latDel;
      delivery.longitude = lngDel;
    }

    const sizeRaw = get('package_size').toUpperCase();
    const validSizes: ManualOrderSize[] = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'CUSTOM'];
    const size: ManualOrderSize = validSizes.includes(sizeRaw as ManualOrderSize) ? (sizeRaw as ManualOrderSize) : 'M';

    const qty = Math.max(1, parseInt(get('package_qty') || '1', 10));
    const weight = get('package_weight') || '1';
    const height = get('package_height') || '1';
    const width = get('package_width') || '1';
    const length = get('package_depth') || '1';

    const pkg: ManualOrderCreatePayload['packages'][0] = {
      description: get('package_description') || 'Paquete',
      quantity: qty,
      size,
      weight_kg: weight,
      height_cm: height,
      width_cm: width,
      length_cm: length
    };
    const vol = get('package_volumetric');
    const m3 = get('package_m3');
    if (vol) pkg.volumetric_weight = vol;
    if (m3) pkg.m3 = m3;

    return {
      company_id: companyId,
      client_id: clientId,
      tracking_number: get('order_tracking_number'),
      request_date: this.toISODateTime(requestDate, '00:00'),
      pickup_date: this.toISODateTime(pickupDate, fromTime),
      pickup_date_from: fromTime,
      pickup_date_to: toTime,
      estimated_value: get('package_value') || '0',
      observations: get('package_notes') || undefined,
      pickup,
      delivery,
      packages: [pkg]
    };
  }

  onSubmit(): void {
    this.submitError.set(null);
    this.submitSuccess.set(false);
    const clientId = this.storageService.getItem(LocalStorageEnums.ID);
    if (!clientId) {
      this.submitError.set('Debes iniciar sesión.');
      return;
    }
    const companyId = this.companyId();
    if (!companyId) {
      this.submitError.set('Falta la compañía. Entra desde Mis Compañías y haz clic en "Ingreso manual".');
      return;
    }

    const payload = this.buildPayload();
    if (!payload) {
      this.submitError.set('Faltan datos obligatorios.');
      return;
    }

    const required: (keyof ManualOrderCreatePayload)[] = ['tracking_number', 'request_date', 'pickup_date_from', 'pickup_date_to'];
    for (const key of required) {
      if (!payload[key] || String(payload[key]).trim() === '') {
        this.submitError.set('Completa todos los campos obligatorios: N° de guía, Fecha de solicitud, Fecha y horario de recojo, direcciones y paquete.');
        return;
      }
    }
    const stopKeys: (keyof ManualOrderCreatePayload['pickup'])[] = ['contact_name', 'contact_phone', 'address', 'reference', 'country', 'department', 'province', 'district'];
    for (const key of stopKeys) {
      if (!payload.pickup[key]?.trim() || !payload.delivery[key]?.trim()) {
        this.submitError.set('Completa todos los campos obligatorios de recojo y entrega (contacto, dirección, país, departamento, provincia, distrito).');
        return;
      }
    }
    if (!payload.packages.length || !payload.packages[0].description?.trim()) {
      this.submitError.set('Completa los datos del paquete (descripción, cantidad, tamaño, peso y dimensiones).');
      return;
    }

    this.submitLoading.set(true);
    this.ordersService.createOrder(payload).subscribe({
      next: () => {
        this.submitLoading.set(false);
        this.submitSuccess.set(true);
        this.form.reset();
      },
      error: (err) => {
        this.submitLoading.set(false);
        const errors = err?.error?.errors;
        const msg = Array.isArray(errors) && errors.length > 0
          ? (errors[0]?.detail ?? errors[0]?.code ?? JSON.stringify(errors[0]))
          : err?.message ?? 'No se pudo crear la orden.';
        this.submitError.set(typeof msg === 'string' ? msg : 'Error al guardar.');
      }
    });
  }
}
