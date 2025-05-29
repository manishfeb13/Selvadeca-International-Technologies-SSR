import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcodeComponent } from './procode.component';

describe('ProcodeComponent', () => {
  let component: ProcodeComponent;
  let fixture: ComponentFixture<ProcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
