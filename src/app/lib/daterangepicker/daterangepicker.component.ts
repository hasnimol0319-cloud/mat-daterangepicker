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
import {
  NativeDateAdapter,
  DateAdapter,
  MatNativeDateModule,
} from '@angular/material/core';
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

class LocalizedDateAdapter extends NativeDateAdapter {
  private i18n = inject(TranslationService);
  private khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

  private toKhmer(value: number | string): string {
    return String(value).replace(/\d/g, (digit) => this.khmerDigits[+digit]);
  }

  override getDayOfWeekNames(_style: 'long' | 'short' | 'narrow'): string[] {
    return this.i18n.t().weekdays;
  }

  override getMonthNames(_style: 'long' | 'short' | 'narrow'): string[] {
    return this.i18n.t().monthsShort;
  }

  override getDateNames(): string[] {
    return Array.from({ length: 31 }, (_, index) => index + 1).map((day) =>
      this.i18n.lang() === 'km' ? this.toKhmer(day) : String(day),
    );
  }

  override getYearName(date: Date): string {
    return this.i18n.lang() === 'km'
      ? this.toKhmer(date.getFullYear())
      : super.getYearName(date);
  }

  override format(
    date: Date,
    displayFormat: Intl.DateTimeFormatOptions,
  ): string {
    return this.i18n.lang() === 'km'
      ? `${this.i18n.t().monthsShort[date.getMonth()]} ${this.toKhmer(date.getFullYear())}`
      : super.format(date, displayFormat);
  }
}

@Component({
  selector: 'mat-daterangepicker',
  standalone: true,
  imports: [CommonModule, MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: DateAdapter, useClass: LocalizedDateAdapter },
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DefaultMatCalendarRangeStrategy,
    },
  ],
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatDaterangepickerComponent implements OnInit {
  @Input() dualView = true;
  @Input() applyButton = true;
  @Input() showCustomRanges = true;
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;

  @Output() apply = new EventEmitter<DateRange<Date>>();
  @Output() rangeChange = new EventEmitter<DateRange<Date>>();

  public cdr = inject(ChangeDetectorRef);
  private i18n = inject(TranslationService);
  private strategy = inject<MatDateRangeSelectionStrategy<Date>>(
    MAT_DATE_RANGE_SELECTION_STRATEGY,
  );
  private adapter = inject<DateAdapter<Date>>(DateAdapter);

  selectedRange: DateRange<Date> = new DateRange<Date>(null, null);
  rightCalendarStart!: Date;

  activeQuickRangeKey: string | null = null;
  quickRanges: Array<{
    key: string;
    label: string;
    getValue: () => DateRange<Date>;
  }> = [];

  get applyLabel(): string {
    return this.i18n.t().apply;
  }
  get clearLabel(): string {
    return this.i18n.t().clear;
  }

  constructor() {
    effect(() => {
      this.i18n.t();
      this.rebuildQuickRanges();
      this.adapter.setLocale(this.i18n.lang() === 'en' ? 'en-US' : 'km-KH');
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.selectedRange = new DateRange<Date>(this.startDate, this.endDate);
    this.rightCalendarStart = this.nextMonth(this.startDate ?? new Date());
  }

  private get today(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private makeRange(start: Date, end: Date): DateRange<Date> {
    return new DateRange<Date>(start, end);
  }

  private monthRange(offset: number): DateRange<Date> {
    const today = this.today;
    const start = new Date(today.getFullYear(), today.getMonth() + offset, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
    return this.makeRange(start, end);
  }

  private rebuildQuickRanges(): void {
    const t = this.i18n.t();
    const today = this.today;

    this.quickRanges = [
      {
        key: 'today',
        label: t.today,
        getValue: () => this.makeRange(today, today),
      },
      {
        key: 'yesterday',
        label: t.yesterday,
        getValue: () => {
          const date = new Date(today);
          date.setDate(date.getDate() - 1);
          return this.makeRange(date, date);
        },
      },
      {
        key: 'last7',
        label: t.last7Days,
        getValue: () => {
          const start = new Date(today);
          start.setDate(start.getDate() - 6);
          return this.makeRange(start, today);
        },
      },
      {
        key: 'last30',
        label: t.last30Days,
        getValue: () => {
          const start = new Date(today);
          start.setDate(start.getDate() - 29);
          return this.makeRange(start, today);
        },
      },
      {
        key: 'thisMonth',
        label: t.thisMonth,
        getValue: () => this.monthRange(0),
      },
      {
        key: 'lastMonth',
        label: t.lastMonth,
        getValue: () => this.monthRange(-1),
      },
      {
        key: 'last3Months',
        label: t.last3Months,
        getValue: () => this.monthRange(-2),
      },
      {
        key: 'custom',
        label: t.customRange,
        getValue: () => new DateRange<Date>(null, null),
      },
    ];
  }

  selectQuickRange(qr: (typeof this.quickRanges)[0]): void {
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

    this.selectedRange = this.strategy.selectionFinished(
      date,
      this.selectedRange,
      new Event('click'),
    );
    this.activeQuickRangeKey = null;
    this.rangeChange.emit(this.selectedRange);

    if (
      !this.applyButton &&
      this.selectedRange.start &&
      this.selectedRange.end
    ) {
      this.apply.emit(this.selectedRange);
    }

    this.cdr.markForCheck();
  }

  applyRange(): void {
    this.apply.emit(this.selectedRange);
  }

  clearRange(): void {
    this.selectedRange = new DateRange<Date>(null, null);
    this.activeQuickRangeKey = null;
    this.rangeChange.emit(this.selectedRange);
    this.cdr.markForCheck();
  }

  private nextMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
