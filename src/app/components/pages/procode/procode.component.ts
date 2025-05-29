import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-procode',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './procode.component.html',
  styleUrl: './procode.component.scss'
})
export class ProcodeComponent {

}
