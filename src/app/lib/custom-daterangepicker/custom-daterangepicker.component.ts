import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { DateRange, MatDaterangepickerComponent } from '../daterangepicker/daterangepicker.component';
import { TranslationService } from '../translation.service';
import { CustomDateFormatterService } from './custom-date-formatter.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'mat-daterangepicker-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './custom-daterangepicker.component.html',
  styleUrls: ['./custom-daterangepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomDaterangepickerComponent {
  @Input() label = '';
  @Input() startControl = new FormControl<Date | null>(null);
  @Input() endControl = new FormControl<Date | null>(null);
  @Input() showCustomRanges = true;
  @Input() dualView = true;

  @Output() rangeSelected = new EventEmitter<DateRange<Date>>();

  @ViewChild('fieldRef') fieldRef!: ElementRef;

  private overlay = inject(Overlay);
  private cdr = inject(ChangeDetectorRef);
  public i18n = inject(TranslationService);
  private dateFormatter = inject(CustomDateFormatterService);
  private hostEl = inject(ElementRef<HTMLElement>);

  private overlayRef?: OverlayRef;

  get startDate(): Date | null {
    return this.startControl.value;
  }

  get endDate(): Date | null {
    return this.endControl.value;
  }

  get displayValue(): string {
    return this.dateFormatter.formatDisplayValue(this.startDate, this.endDate);
  }

  togglePicker(): void {
    this.overlayRef ? this.closePicker() : this.openPicker();
  }

  private createOverlay(): OverlayRef {
    const pos = this.overlay.position()
      .flexibleConnectedTo(this.hostEl)
      .withPositions([
        { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 20 },
        { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -20 },
      ]);

    return this.overlay.create({
      positionStrategy: pos,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
    });
  }

  openPicker(): void {
    this.overlayRef = this.createOverlay();
    this.overlayRef.backdropClick().subscribe(() => this.closePicker());

    const portal = new ComponentPortal(MatDaterangepickerComponent);
    const compRef = this.overlayRef.attach(portal);
    const instance = compRef.instance;

    instance.startDate = this.startDate;
    instance.endDate = this.endDate;
    instance.dualView = this.dualView;
    instance.showCustomRanges = this.showCustomRanges;
    instance.applyButton = true;

    instance.ngOnInit();
    instance.cdr.detectChanges();

    instance.apply.subscribe((range: DateRange<Date>) => {
      this.startControl.setValue(range.start);
      this.endControl.setValue(range.end);
      this.rangeSelected.emit(range);
      this.closePicker();
      this.cdr.markForCheck();
    });
  }

  closePicker(): void {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = undefined;
    this.cdr.markForCheck();
  }

  get isOpen(): boolean {
    return !!this.overlayRef;
  }
}