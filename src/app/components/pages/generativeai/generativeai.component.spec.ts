import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerativeaiComponent } from './generativeai.component';

describe('GenerativeaiComponent', () => {
  let component: GenerativeaiComponent;
  let fixture: ComponentFixture<GenerativeaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerativeaiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerativeaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
