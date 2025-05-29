import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-synaplex',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './synaplex.component.html',
  styleUrl: './synaplex.component.scss'
})
export class SynaplexComponent {

}
