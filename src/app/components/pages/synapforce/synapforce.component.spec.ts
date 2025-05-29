import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SynapforceComponent } from './synapforce.component';

describe('SynapforceComponent', () => {
  let component: SynapforceComponent;
  let fixture: ComponentFixture<SynapforceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SynapforceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SynapforceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
