import { Injectable, inject } from '@angular/core';
import { TranslationService } from '../translation.service';

@Injectable({ providedIn: 'root' })
export class CustomDateFormatterService {
    private readonly i18n = inject(TranslationService);

    private readonly khmerNumbers = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    private readonly khmerMonths = [
        'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
        'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
    ];
    private readonly monthsShort = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    private get isKhmer(): boolean {
        return this.i18n.lang() === 'km';
    }

    formatDate(value: Date | null): string {
        if (!value) {
            return '';
        }

        const month = this.isKhmer
            ? this.khmerMonths[value.getMonth()]
            : this.monthsShort[value.getMonth()];

        const day = this.formatNumber(value.getDate());
        const year = this.formatNumber(value.getFullYear());

        return `${day}-${month}-${year}`;
    }

    formatDisplayValue(start: Date | null, end: Date | null): string {
        return [this.formatDate(start), this.formatDate(end)].filter(Boolean).join(' – ');
    }

    private formatNumber(value: number): string {
        if (!this.isKhmer) {
            return String(value);
        }
        return String(value).replace(/\d/g, (digit) => this.khmerNumbers[+digit]);
    }
}