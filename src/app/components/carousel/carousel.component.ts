import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnDestroy {

  private _images: string[] = [];

  @Input()
  set images(value: string[]) {
  this._images = value;
  if (value?.length) {
    console.log(value)
    this.startAutoSlide();
  }
}

  activeIndex = signal(0);
  private intervalId!: ReturnType<typeof setInterval>;

  // ngOnInit(): void {
  //   this.startAutoSlide();
  // }



  next(): void {
  if (this._images.length === 0) return;
  this.activeIndex.update(i => (i + 1) % this._images.length);
}

prev(): void {
  if (this._images.length === 0) return;
  this.activeIndex.update(i => (i - 1 + this._images.length) % this._images.length);
}

goTo(index: number): void {
  if (index >= 0 && index < this._images.length) {
    this.activeIndex.set(index);
  }
}


startAutoSlide(): void {
  if (!this._images || this._images.length === 0) return;
  this.intervalId = setInterval(() => {
    this.next();
  }, 6000);
}

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}


