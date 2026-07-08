import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {

  currentYear: number = new Date().getFullYear();

  appName: string = 'Soluciones Web';

}
