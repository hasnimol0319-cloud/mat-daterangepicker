import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DateRange } from '@angular/material/datepicker';
import {
  CustomDaterangepickerComponent,
  LangCode,
  MatDaterangepickerComponent,
  TranslationService,
} from './lib';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDaterangepickerComponent,
    CustomDaterangepickerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public readonly i18n = inject(TranslationService);

  readonly range1 = signal<DateRange<Date>>(new DateRange<Date>(null, null));
  readonly range2 = signal<DateRange<Date>>(new DateRange<Date>(null, null));
  readonly range3 = signal<DateRange<Date>>(new DateRange<Date>(null, null));

  private readonly rangeSignals = {
    range1: this.range1,
    range2: this.range2,
    range3: this.range3,
  } as const;

  dateForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate: new FormControl<Date | null>(null),
  });

  get startCtrl(): FormControl<Date | null> {
    return this.dateForm.get('startDate') as FormControl<Date | null>;
  }

  get endCtrl(): FormControl<Date | null> {
    return this.dateForm.get('endDate') as FormControl<Date | null>;
  }

  onApply(target: keyof typeof this.rangeSignals, range: DateRange<Date>): void {
    this.rangeSignals[target].set(range);
  }

  setLang(lang: LangCode): void {
    this.i18n.setLang(lang);
  }

  rangeLabel(range: DateRange<Date>): string {
    return range.start && range.end
      ? `${this.formatDate(range.start)} → ${this.formatDate(range.end)}`
      : this.emptyRangeLabel;
  }

  onRangeSelected(range: DateRange<Date>): void {
    this.range1.set(range);
  }

  private get emptyRangeLabel(): string {
    return this.i18n.lang() === 'km' ? 'មិនទាន់បានជ្រើសរើស' : 'No range selected';
  }

  private get locale(): string {
    return this.i18n.lang() === 'km' ? 'km-KH' : 'en-US';
  }

  private formatDate(date: Date | null): string {
    return (
      date?.toLocaleDateString(this.locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) ?? '—'
    );
  }
}
