import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NativeDateAdapter, DateAdapter, MatNativeDateModule } from '@angular/material/core';
import {
  MatCalendar,
  MatCalendarHeader,
  DateRange,
  DefaultMatCalendarRangeStrategy,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDateRangeSelectionStrategy,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { TranslationService } from '../translation.service';

export { DateRange };

/** Extends NativeDateAdapter to serve translated month/weekday names */
class LocalizedDateAdapter extends NativeDateAdapter {
  private i18n = inject(TranslationService);
  private convertToKhmerNumber(year: number): string {
    const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const convertToKhmerNumerals = (num: number) =>
    num.toString().split('').map(digit => khmerNumerals[parseInt(digit)]).join('');
    return convertToKhmerNumerals(year);
  }

  override getDayOfWeekNames(_style: 'long' | 'short' | 'narrow'): string[] {
    return this.i18n.t().weekdays;
  }
  override getMonthNames(_style: 'long' | 'short' | 'narrow'): string[] {
    return this.i18n.t().monthsShort;
  }
  override getDateNames(): string[] {
     const days = Array.from({ length: 31 }, (_, i) => (i + 1));  
      return this.i18n.lang() === 'km' ? days.map(day => this.convertToKhmerNumber(day)) : days.map(String);  
  }
  override getYearName(date: Date): string {
    const year = date.getFullYear();
    return this.i18n.lang() === 'km' ? this.convertToKhmerNumber(year) : super.getYearName(date);
  }
  override format(date: Date, displayFormat: Intl.DateTimeFormatOptions): string {
    const month = this.i18n.t().monthsShort[date.getMonth()];
    const year = date.getFullYear();
    return this.i18n.lang() === 'km' ? `${month} ${this.convertToKhmerNumber(year)}` : super.format(date, displayFormat);
  }
}

@Component({
  selector: 'mat-daterangepicker',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: DateAdapter, useClass: LocalizedDateAdapter },
    { provide: MAT_DATE_RANGE_SELECTION_STRATEGY, useClass: DefaultMatCalendarRangeStrategy },
  ],
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatDaterangepickerComponent implements OnInit {
  @Input() dualView         = true;
  @Input() applyButton      = true;
  @Input() showCustomRanges = true;
  @Input() startDate: Date | null = null;
  @Input() endDate:   Date | null = null;
  @Input() minDate:   Date | null = null;
  @Input() maxDate:   Date | null = null;

  @Output() apply       = new EventEmitter<DateRange<Date>>();
  @Output() rangeChange = new EventEmitter<DateRange<Date>>();

  public  cdr      = inject(ChangeDetectorRef);
  private i18n     = inject(TranslationService);
  private strategy = inject<MatDateRangeSelectionStrategy<Date>>(MAT_DATE_RANGE_SELECTION_STRATEGY);
  private adapter  = inject<DateAdapter<Date>>(DateAdapter);

  selectedRange: DateRange<Date> = new DateRange<Date>(null, null);
  rightCalendarStart!: Date;

  activeQuickRangeKey: string | null = null;
  quickRanges: Array<{ key: string; label: string; getValue: () => DateRange<Date> }> = [];

  get applyLabel(): string { return this.i18n.t().apply; }
  get clearLabel(): string { return this.i18n.t().clear; }

  constructor() {
    effect(() => {
      this.i18n.t();
      this.rebuildQuickRanges();
      const locale = this.i18n.lang() === 'en' ? 'en-US' : 'km-KH';
      this.adapter.setLocale(locale);
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.selectedRange      = new DateRange<Date>(this.startDate, this.endDate);
    this.rightCalendarStart = this.nextMonth(this.startDate ?? new Date());
    this.rebuildQuickRanges();
  }

  private rebuildQuickRanges(): void {
    const t     = this.i18n.t();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const r     = (s: Date, e: Date) => new DateRange<Date>(s, e);

    this.quickRanges = [
      { key: 'today',       label: t.today,       getValue: () => r(new Date(today), new Date(today)) },
      { key: 'yesterday',   label: t.yesterday,   getValue: () => { const d = new Date(today); d.setDate(d.getDate()-1); return r(d, new Date(d)); } },
      { key: 'last7',       label: t.last7Days,   getValue: () => { const s = new Date(today); s.setDate(s.getDate()-6); return r(s, new Date(today)); } },
      { key: 'last30',      label: t.last30Days,  getValue: () => { const s = new Date(today); s.setDate(s.getDate()-29); return r(s, new Date(today)); } },
      { key: 'thisMonth',   label: t.thisMonth,   getValue: () => r(new Date(today.getFullYear(), today.getMonth(), 1), new Date(today.getFullYear(), today.getMonth()+1, 0)) },
      { key: 'lastMonth',   label: t.lastMonth,   getValue: () => r(new Date(today.getFullYear(), today.getMonth()-1, 1), new Date(today.getFullYear(), today.getMonth(), 0)) },
      { key: 'last3Months', label: t.last3Months, getValue: () => r(new Date(today.getFullYear(), today.getMonth()-2, 1), new Date(today.getFullYear(), today.getMonth()+1, 0)) },
      { key: 'custom',      label: t.customRange, getValue: () => new DateRange<Date>(null, null) },
    ];
  }

  selectQuickRange(qr: typeof this.quickRanges[0]): void {
    this.activeQuickRangeKey = qr.key;
    const range = qr.getValue();
    this.selectedRange = range;
    if (range.start) {
      this.rightCalendarStart = this.nextMonth(range.start);
    }
    this.rangeChange.emit(range);
    if (!this.applyButton) this.apply.emit(range);
    this.cdr.markForCheck();
  }

  onDateSelected(date: Date | null): void {
    if (!date) return;
    // Use the 2-arg overload (no Event needed)
    const newRange = this.strategy.selectionFinished(date, this.selectedRange, new Event("click"));
    this.selectedRange       = newRange;
    this.activeQuickRangeKey = null;
    this.rangeChange.emit(newRange);
    if (!this.applyButton && newRange.start && newRange.end) {
      this.apply.emit(newRange);
    }
    this.cdr.markForCheck();
  }

  applyRange(): void { this.apply.emit(this.selectedRange); }

  clearRange(): void {
    this.selectedRange       = new DateRange<Date>(null, null);
    this.activeQuickRangeKey = null;
    this.rangeChange.emit(this.selectedRange);
    this.cdr.markForCheck();
  }

  private nextMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }

  trackByIndex(i: number): number { return i; }
}
