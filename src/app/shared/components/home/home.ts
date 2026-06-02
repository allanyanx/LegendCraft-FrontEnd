import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NgFor],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  tarjetasVacias = [1, 2, 3, 4, 5];
}
