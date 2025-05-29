import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynaplexComponent } from './synaplex.component';

describe('SynaplexComponent', () => {
  let component: SynaplexComponent;
  let fixture: ComponentFixture<SynaplexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynaplexComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SynaplexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
