import { Injectable, signal, computed } from '@angular/core';

export type LangCode = 'en' | 'km';

export interface DaterangepickerI18n {
  // Quick-range labels
  today: string;
  yesterday: string;
  last7Days: string;
  last30Days: string;
  thisMonth: string;
  lastMonth: string;
  last3Months: string;
  customRange: string;
  // Buttons
  apply: string;
  clear: string;
  // Month names (full)
  months: string[];
  // Month names (short / header)
  monthsShort: string[];
  // Day-of-week headers
  weekdays: string[];

}

const EN: DaterangepickerI18n = {
  today:        'Today',
  yesterday:    'Yesterday',
  last7Days:    'Last 7 Days',
  last30Days:   'Last 30 Days',
  thisMonth:    'This Month',
  lastMonth:    'Last Month',
  last3Months:  'Last 3 Months',
  customRange:  'Custom Range',
  apply:        'Apply',
  clear:        'Clear',
  months: [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ],
  monthsShort: [
    'JAN','FEB','MAR','APR','MAY','JUN',
    'JUL','AUG','SEP','OCT','NOV','DEC',
  ],
  weekdays: ['Su','Mo','Tu','We','Th','Fr','Sa'],

};

const KM: DaterangepickerI18n = {
  today:        'ថ្ងៃនេះ',
  yesterday:    'ម្សិលមិញ',
  last7Days:    '៧ ថ្ងៃចុងក្រោយ',
  last30Days:   '៣០ ថ្ងៃចុងក្រោយ',
  thisMonth:    'ខែនេះ',
  lastMonth:    'ខែមុន',
  last3Months:  '៣ ខែចុងក្រោយ',
  customRange:  'កំណត់ផ្ទាល់ខ្លួន',
  apply:        'អនុវត្ត',
  clear:        'សម្អាត',
  months: [
    'មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា',
    'កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ',
  ],
  monthsShort: [
    'មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា',
    'កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ',
  ],
  weekdays: ['អា','ច','អ','ព','ព្រ','សុ','ស'],
};

const LOCALES: Record<LangCode, DaterangepickerI18n> = { en: EN, km: KM };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private _lang = signal<LangCode>('en');

  readonly lang = this._lang.asReadonly();

  readonly t = computed<DaterangepickerI18n>(() => LOCALES[this._lang()]);

  setLang(lang: LangCode): void {
    this._lang.set(lang);
  }

  toggle(): void {
    this._lang.set(this._lang() === 'en' ? 'km' : 'en');
  }
}
