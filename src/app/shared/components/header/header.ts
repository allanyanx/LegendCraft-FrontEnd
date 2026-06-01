import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBar } from '../search-bar/search-bar';
import { CartWidget } from '../cart-widget/cart-widget';

@Component({
  selector: 'app-header',
  imports: [SearchBar, CartWidget, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  //Variable de prueba para el diseño visual
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
