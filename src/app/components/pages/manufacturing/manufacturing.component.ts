import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-manufacturing',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './manufacturing.component.html',
  styleUrl: './manufacturing.component.scss'
})
export class ManufacturingComponent {

}
