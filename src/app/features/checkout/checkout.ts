import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  private fb = inject(FormBuilder);
  public cartService = inject(CartService);
  private orderService = inject(OrderService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  checkoutForm!: FormGroup;

  ngOnInit() {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      city: ['', Validators.required],
      zip: ['', Validators.required],
      phone: ['', Validators.required],
      paymentMethod: ['Transferencia Bancaria', Validators.required],
      createAccount: [false],
      password: ['']
    });

    // Autocompletar datos si el usuario está registrado
    const user = this.authService.currentUser();
    if (user) {
      this.checkoutForm.patchValue({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || ''
      });
    }
    
    if (!this.cartService.cart()) {
      this.cartService.loadCart().subscribe({
        error: () => console.log('Could not load cart')
      });
    }
  }

  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    const formData = this.checkoutForm.value;
    
    // Mapeo al OrderCreateDto esperado por el Backend
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const orderData = {
      guestEmail: formData.email,
      guestFirstName: firstName,
      guestLastName: lastName,
      shippingAddress: formData.address,
      city: formData.city,
      zip: formData.zip,
      contactPhone: formData.phone,
      paymentMethod: formData.paymentMethod
    };

    // Si el usuario marcó crear cuenta y no está registrado
    if (formData.createAccount && !this.authService.currentUser()) {
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: firstName,
        lastName: lastName
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          // Logueamos silenciosamente
          this.authService.login({ email: formData.email, password: formData.password }).subscribe({
            next: () => this.executePlaceOrder(orderData),
            error: () => this.executePlaceOrder(orderData)
          });
        },
        error: (err) => {
          this.toastService.show('Error creando la cuenta: ' + (err.error?.message || 'Intente nuevamente.'), 'error');
        }
      });
    } else {
      this.executePlaceOrder(orderData);
    }
  }

  private executePlaceOrder(orderData: any) {
    this.orderService.placeOrder(orderData).subscribe({
      next: (order: any) => {
        this.toastService.show('¡Orden confirmada con éxito! Nro de Orden: ' + (order.trackingNumber || order.id), 'success');
        
        // Recargar el carrito para reflejar que quedó vacío desde el servidor
        this.cartService.loadCart().subscribe(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err) => {
        this.toastService.show('Error al procesar la orden: ' + (err.error?.message || 'Intenta de nuevo'), 'error');
      }
    });
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder.jpg';
    return url.startsWith('/') ? environment.apiUrl.replace('/api', '') + url : url;
  }
}
