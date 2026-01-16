import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ClientService } from '../../../services/client.service';
import { OrderCreate } from '../../../models/order.model';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit {
  private orderService = inject(OrderService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  orderId = signal<string | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  clients = signal<Client[]>([]);
  loadingClients = signal(false);

  orderForm: FormGroup = this.fb.group({
    order_number: ['', [Validators.required, Validators.minLength(2)]],
    client_id: ['', [Validators.required]],
    description: ['', [Validators.required]],
    delivery_address: ['', [Validators.required]],
    delivery_city: ['', [Validators.required]],
    delivery_region: ['', [Validators.required]],
    delivery_country: ['', [Validators.required]],
    notes: ['']
  });

  ngOnInit() {
    this.loadClients();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && this.route.snapshot.url.some(segment => segment.path === 'edit')) {
      this.isEditMode.set(true);
      this.orderId.set(id);
      this.loadOrder(id);
    }
  }

  loadClients() {
    this.loadingClients.set(true);
    this.clientService.getAll(1).subscribe({
      next: (response) => {
        this.clients.set(response.result);
        this.loadingClients.set(false);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.loadingClients.set(false);
      }
    });
  }

  loadOrder(id: string) {
    this.loading.set(true);
    this.orderService.getById(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          order_number: order.order_number || '',
          client_id: order.client_id || '',
          description: order.description || '',
          delivery_address: order.delivery_address || '',
          delivery_city: order.delivery_city || '',
          delivery_region: order.delivery_region || '',
          delivery_country: order.delivery_country || '',
          notes: order.notes || ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar la orden.');
        this.loading.set(false);
        console.error('Error loading order:', err);
      }
    });
  }

  onSubmit() {
    if (this.orderForm.valid) {
      this.loading.set(true);
      this.error.set(null);

      const formValue = { ...this.orderForm.value };
      
      // Asegurar que notes sea string vacío si está vacío o null
      if (!formValue.notes) {
        formValue.notes = '';
      }

      if (this.isEditMode() && this.orderId()) {
        this.orderService.update(this.orderId()!, formValue).subscribe({
          next: () => {
            this.router.navigate(['/orders', this.orderId()]);
          },
          error: (err) => {
            this.error.set('Error al actualizar la orden.');
            this.loading.set(false);
            console.error('Error updating order:', err);
          }
        });
      } else {
        // Preparar el payload según el DTO requerido por la API
        const orderPayload: OrderCreate = {
          order_number: formValue.order_number,
          client_id: formValue.client_id,
          description: formValue.description,
          delivery_address: formValue.delivery_address,
          delivery_city: formValue.delivery_city,
          delivery_region: formValue.delivery_region,
          delivery_country: formValue.delivery_country,
          notes: formValue.notes || ''
        };

        console.log('Enviando orden:', orderPayload);
        
        this.orderService.create(orderPayload).subscribe({
          next: (response) => {
            console.log('Orden creada exitosamente:', response);
            if (response && response.id) {
              this.router.navigate(['/orders', response.id]);
            } else {
              this.router.navigate(['/orders']);
            }
            this.loading.set(false);
          },
          error: (err) => {
            this.loading.set(false);
            console.error('Error creating order:', err);
            console.error('Error details:', err.error);
            
            if (err.status === 400) {
              const errorMessage = err.error?.detail || err.error?.message || 'Datos inválidos. Por favor, verifica todos los campos.';
              this.error.set(errorMessage);
            } else if (err.status === 401) {
              this.error.set('No autorizado. Por favor, inicia sesión nuevamente.');
            } else if (err.status === 0) {
              this.error.set('Error de conexión. Por favor, verifica tu conexión a internet.');
            } else {
              this.error.set('Error al crear la orden. Por favor, intenta nuevamente.');
            }
          }
        });
      }
    } else {
      this.orderForm.markAllAsTouched();
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors!['minlength'].requiredLength} caracteres`;
    }
    return '';
  }
}

