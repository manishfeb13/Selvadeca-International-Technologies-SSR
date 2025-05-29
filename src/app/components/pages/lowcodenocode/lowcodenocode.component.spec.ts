import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LowcodenocodeComponent } from './lowcodenocode.component';

describe('LowcodenocodeComponent', () => {
  let component: LowcodenocodeComponent;
  let fixture: ComponentFixture<LowcodenocodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LowcodenocodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LowcodenocodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
