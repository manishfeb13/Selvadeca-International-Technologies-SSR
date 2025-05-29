import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-fintech',
  imports: [ MatIconModule, MatButtonModule, MatCardModule ],
  templateUrl: './fintech.component.html',
  styleUrl: './fintech.component.scss'
})
export class FintechComponent {

}
