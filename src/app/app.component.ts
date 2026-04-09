import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DateRange } from '@angular/material/datepicker';
import { MatDaterangepickerComponent, TranslationService, LangCode } from './lib';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomDaterangepickerComponent } from './lib';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDaterangepickerComponent,
    CustomDaterangepickerComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  i18n = inject(TranslationService);

  range1 = signal<DateRange<Date>>(new DateRange<Date>(null, null));
  range2 = signal<DateRange<Date>>(new DateRange<Date>(null, null));
  range3 = signal<DateRange<Date>>(new DateRange<Date>(null, null));

  onApply(target: 'range1' | 'range2' | 'range3', range: DateRange<Date>): void {
    if (target === 'range1') this.range1.set(range);
    if (target === 'range2') this.range2.set(range);
    if (target === 'range3') this.range3.set(range);
  }

  setLang(lang: LangCode): void {
    this.i18n.setLang(lang);
  }

  fmt(d: Date | null): string {
    if (!d) return '—';
    const locale = this.i18n.lang() === 'km' ? 'km-KH' : 'en-US';
    return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  rangeLabel(r: DateRange<Date>): string {
    if (!r.start && !r.end) {
      return this.i18n.lang() === 'km' ? 'មិនទាន់បានជ្រើសរើស' : 'No range selected';
    }
    return `${this.fmt(r.start)}  →  ${this.fmt(r.end)}`;
  }




  // In the class:
  dateForm = new FormGroup({
    startDate: new FormControl<Date | null>(null),
    endDate:   new FormControl<Date | null>(null),
  });

  get startCtrl() { return this.dateForm.get('startDate') as FormControl<Date | null>; }
  get endCtrl()   { return this.dateForm.get('endDate')   as FormControl<Date | null>; }

  onRangeSelected(range: DateRange<Date>): void {
    console.log('Range selected:', range.start, range.end);
  }
}
