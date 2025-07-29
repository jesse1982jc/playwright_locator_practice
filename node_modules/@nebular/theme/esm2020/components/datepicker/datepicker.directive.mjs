/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Directive, forwardRef, Inject, InjectionToken, Input, } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators, } from '@angular/forms';
import { fromEvent, merge, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, pairwise, startWith, take, takeUntil, tap } from 'rxjs/operators';
import { NB_DOCUMENT } from '../../theme.options';
import * as i0 from "@angular/core";
import * as i1 from "../calendar-kit/services/date.service";
/**
 * The `NbDatepickerAdapter` instances provide way how to parse, format and validate
 * different date types.
 * */
export class NbDatepickerAdapter {
}
/**
 * Datepicker is an control that can pick any values anyway.
 * It has to be bound to the datepicker directive through nbDatepicker input.
 * */
export class NbDatepicker {
}
export const NB_DATE_ADAPTER = new InjectionToken('Datepicker Adapter');
export const NB_DATE_SERVICE_OPTIONS = new InjectionToken('Date service options');
/**
 * The `NbDatepickerDirective` is form control that gives you ability to select dates and ranges. The datepicker
 * is shown when input receives a `focus` event.
 *
 * ```html
 * <input [nbDatepicker]="datepicker">
 * <nb-datepicker #datepicker></nb-datepicker>
 * ```
 *
 * @stacked-example(Showcase, datepicker/datepicker-showcase.component)
 *
 * ### Installation
 *
 * Import `NbDatepickerModule.forRoot()` to your root module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbDatepickerModule.forRoot(),
 *   ],
 * })
 * export class AppModule { }
 * ```
 * And `NbDatepickerModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbDatepickerModule,
 *   ],
 * })
 *
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * If you want to use range selection, you have to use `NbRangepickerComponent` instead:
 *
 * ```html
 * <input [nbDatepicker]="rangepicker">
 * <nb-rangepicker #rangepicker></nb-rangepicker>
 * ```
 *
 * Both range and date pickers support all parameters as calendar, so, check `NbCalendarComponent` for additional
 * info.
 *
 * @stacked-example(Range showcase, datepicker/rangepicker-showcase.component)
 *
 * Datepicker is the form control so it can be bound with angular forms through ngModel and form controls.
 *
 * @stacked-example(Forms, datepicker/datepicker-forms.component)
 *
 * `NbDatepickerDirective` may be validated using `min` and `max` dates passed to the datepicker.
 *
 * @stacked-example(Validation, datepicker/datepicker-validation.component)
 *
 * Also `NbDatepickerDirective` may be filtered using `filter` predicate
 * that receives date object and has to return a boolean value.
 *
 * @stacked-example(Filter, datepicker/datepicker-filter.component)
 *
 * If you need to pick a time along with the date, you can use nb-date-timepicker
 *
 * ```html
 * <input nbInput placeholder="Pick Date" [nbDatepicker]="dateTimePicker">
 * <nb-date-timepicker withSeconds #dateTimePicker></nb-date-timepicker>
 * ```
 * @stacked-example(Date timepicker, datepicker/date-timepicker-showcase.component)
 *
 * A single column picker with options value as time and minute, so users won’t be able to pick
 * hours and minutes individually.
 *
 * @stacked-example(Date timepicker single column, datepicker/date-timepicker-single-column.component)

 * The `NbDatepickerComponent` supports date formatting:
 *
 * ```html
 * <input [nbDatepicker]="datepicker">
 * <nb-datepicker #datepicker format="MM\dd\yyyy"></nb-datepicker>
 * ```
 * <span id="formatting-issue"></span>
 * ## Formatting Issue
 *
 * By default, datepicker uses angulars `LOCALE_ID` token for localization and `DatePipe` for dates formatting.
 * And native `Date.parse(...)` for dates parsing. But native `Date.parse` function doesn't support formats.
 * To provide custom formatting you have to use one of the following packages:
 *
 * - `@nebular/moment` - provides moment date adapter that uses moment for date objects. This means datepicker than
 * will operate only moment date objects. If you want to use it you have to install it: `npm i @nebular/moment`, and
 * import `NbMomentDateModule` from this package.
 *
 * - `@nebular/date-fns` - adapter for popular date-fns library. This way is preferred if you need only date formatting.
 * Because date-fns is treeshakable, tiny and operates native date objects. If you want to use it you have to
 * install it: `npm i @nebular/date-fns`, and import `NbDateFnsDateModule` from this package.
 *
 * ### NbDateFnsDateModule
 *
 * Format is required when using `NbDateFnsDateModule`. You can set it via `format` input on datepicker component:
 * ```html
 * <nb-datepicker format="dd.MM.yyyy"></nb-datepicker>
 * ```
 * Also format can be set globally with `NbDateFnsDateModule.forRoot({ format: 'dd.MM.yyyy' })` and
 * `NbDateFnsDateModule.forChild({ format: 'dd.MM.yyyy' })` methods.
 *
 * Please note to use some of the formatting tokens you also need to pass
 * `{ useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true }` to date-fns parse and format functions.
 * You can configure options passed this functions by setting `formatOptions` and
 * `parseOptions` of options object passed to `NbDateFnsDateModule.forRoot` and `NbDateFnsDateModule.forChild` methods.
 * ```ts
 * NbDateFnsDateModule.forRoot({
 *   parseOptions: { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true },
 *   formatOptions: { useAdditionalWeekYearTokens: true, useAdditionalDayOfYearTokens: true },
 * })
 * ```
 * Further info on `date-fns` formatting tokens could be found at
 * [date-fns docs](https://date-fns.org/v2.0.0-alpha.27/docs/Unicode-Tokens).
 *
 * You can also use `parseOptions` and `formatOptions` to provide locale.
 * ```ts
 * import { eo } from 'date-fns/locale';
 *
 * @NgModule({
 *   imports: [
 *     NbDateFnsDateModule.forRoot({
 *       parseOptions: { locale: eo },
 *       formatOptions: { locale: eo },
 *     }),
 *   ],
 * })
 * ```
 *
 * @styles
 *
 * datepicker-background-color:
 * datepicker-border-color:
 * datepicker-border-style:
 * datepicker-border-width:
 * datepicker-border-radius:
 * datepicker-shadow:
 * */
export class NbDatepickerDirective {
    constructor(document, datepickerAdapters, hostRef, dateService, changeDetector) {
        this.document = document;
        this.datepickerAdapters = datepickerAdapters;
        this.hostRef = hostRef;
        this.dateService = dateService;
        this.changeDetector = changeDetector;
        this.destroy$ = new Subject();
        this.isDatepickerReady = false;
        this.onChange = () => { };
        this.onTouched = () => { };
        /**
         * Form control validators will be called in validators context, so, we need to bind them.
         * */
        this.validator = Validators.compose([this.parseValidator, this.minValidator, this.maxValidator, this.filterValidator].map((fn) => fn.bind(this)));
        this.subscribeOnInputChange();
    }
    /**
     * Provides datepicker component.
     * */
    // eslint-disable-next-line @angular-eslint/no-input-rename
    set setPicker(picker) {
        this.picker = picker;
        this.setupPicker();
    }
    /**
     * Returns html input element.
     * */
    get input() {
        return this.hostRef.nativeElement;
    }
    /**
     * Returns host input value.
     * */
    get inputValue() {
        return this.input.value;
    }
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    /**
     * Writes value in picker and html input element.
     * */
    writeValue(value) {
        if (this.isDatepickerReady) {
            this.writePicker(value);
            this.writeInput(value);
        }
        else {
            this.queue = value;
        }
    }
    registerOnChange(fn) {
        this.onChange = fn;
    }
    registerOnTouched(fn) {
        this.onTouched = fn;
    }
    setDisabledState(isDisabled) {
        this.input.disabled = isDisabled;
    }
    /**
     * Form control validation based on picker validator config.
     * */
    validate() {
        return this.validator(null);
    }
    /**
     * Hides picker, focuses the input
     */
    hidePicker() {
        this.input.focus();
        this.picker.hide();
    }
    /**
     * Validates that we can parse value correctly.
     * */
    parseValidator() {
        /**
         * Date services treat empty string as invalid date.
         * That's why we're getting invalid formControl in case of empty input which is not required.
         * */
        if (this.inputValue === '') {
            return null;
        }
        const isValid = this.datepickerAdapter.isValid(this.inputValue, this.picker.format);
        return isValid ? null : { nbDatepickerParse: { value: this.inputValue } };
    }
    /**
     * Validates passed value is greater than min.
     * */
    minValidator() {
        const config = this.picker.getValidatorConfig();
        const date = this.datepickerAdapter.parse(this.inputValue, this.picker.format);
        return !config.min || !date || this.dateService.compareDates(config.min, date) <= 0
            ? null
            : { nbDatepickerMin: { min: config.min, actual: date } };
    }
    /**
     * Validates passed value is smaller than max.
     * */
    maxValidator() {
        const config = this.picker.getValidatorConfig();
        const date = this.datepickerAdapter.parse(this.inputValue, this.picker.format);
        return !config.max || !date || this.dateService.compareDates(config.max, date) >= 0
            ? null
            : { nbDatepickerMax: { max: config.max, actual: date } };
    }
    /**
     * Validates passed value satisfy the filter.
     * */
    filterValidator() {
        const config = this.picker.getValidatorConfig();
        const date = this.datepickerAdapter.parse(this.inputValue, this.picker.format);
        return !config.filter || !date || config.filter(date) ? null : { nbDatepickerFilter: true };
    }
    /**
     * Chooses datepicker adapter based on passed picker component.
     * */
    chooseDatepickerAdapter() {
        this.datepickerAdapter = this.datepickerAdapters.find(({ picker }) => this.picker instanceof picker);
        if (this.noDatepickerAdapterProvided()) {
            throw new Error('No datepickerAdapter provided for picker');
        }
    }
    /**
     * Attaches picker to the host input element and subscribes on value changes.
     * */
    setupPicker() {
        this.chooseDatepickerAdapter();
        this.picker.attach(this.hostRef);
        if (this.inputValue) {
            this.picker.value = this.datepickerAdapter.parse(this.inputValue, this.picker.format);
        }
        this.pickerInputsChangedSubscription?.unsubscribe();
        this.pickerInputsChangedSubscription = this.picker.formatChanged$
            .pipe(map(() => this.picker.format), startWith(this.picker.format), distinctUntilChanged(), pairwise(), takeUntil(this.destroy$))
            .subscribe(([prevFormat, nextFormat]) => {
            if (this.inputValue) {
                const date = this.datepickerAdapter.parse(this.inputValue, prevFormat);
                this.writeInput(date);
            }
        });
        // In case datepicker component placed after the input with datepicker directive,
        // we can't read `this.picker.format` on first change detection run,
        // since it's not bound yet, so we have to wait for datepicker component initialization.
        if (!this.isDatepickerReady) {
            this.picker.init
                .pipe(take(1), tap(() => (this.isDatepickerReady = true)), filter(() => !!this.queue), takeUntil(this.destroy$))
                .subscribe(() => {
                this.writeValue(this.queue);
                this.changeDetector.detectChanges();
                this.queue = undefined;
            });
        }
        this.picker.valueChange.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            this.writePicker(value);
            this.writeInput(value);
            this.onChange(value);
            if (this.picker.shouldHide()) {
                this.hidePicker();
            }
        });
        merge(this.picker.blur, fromEvent(this.input, 'blur').pipe(filter(() => !this.picker.isShown && this.document.activeElement !== this.input)))
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.onTouched());
    }
    writePicker(value) {
        this.picker.value = value;
    }
    writeInput(value) {
        this.hostRef.nativeElement.value = this.datepickerAdapter.format(value, this.picker.format);
    }
    /**
     * Validates if no datepicker adapter provided.
     * */
    noDatepickerAdapterProvided() {
        return !this.datepickerAdapter || !(this.datepickerAdapter instanceof NbDatepickerAdapter);
    }
    subscribeOnInputChange() {
        fromEvent(this.input, 'input')
            .pipe(map(() => this.inputValue), takeUntil(this.destroy$))
            .subscribe((value) => this.handleInputChange(value));
    }
    /**
     * Parses input value and write if it isn't null.
     * */
    handleInputChange(value) {
        const date = this.parseInputValue(value);
        this.onChange(date);
        this.writePicker(date);
    }
    parseInputValue(value) {
        if (this.datepickerAdapter.isValid(value, this.picker.format)) {
            return this.datepickerAdapter.parse(value, this.picker.format);
        }
        return null;
    }
}
NbDatepickerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDatepickerDirective, deps: [{ token: NB_DOCUMENT }, { token: NB_DATE_ADAPTER }, { token: i0.ElementRef }, { token: i1.NbDateService }, { token: i0.ChangeDetectorRef }], target: i0.ɵɵFactoryTarget.Directive });
NbDatepickerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.12", type: NbDatepickerDirective, selector: "input[nbDatepicker]", inputs: { setPicker: ["nbDatepicker", "setPicker"] }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NbDatepickerDirective),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => NbDatepickerDirective),
            multi: true,
        },
    ], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDatepickerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[nbDatepicker]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NbDatepickerDirective),
                            multi: true,
                        },
                        {
                            provide: NG_VALIDATORS,
                            useExisting: forwardRef(() => NbDatepickerDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DATE_ADAPTER]
                }] }, { type: i0.ElementRef }, { type: i1.NbDateService }, { type: i0.ChangeDetectorRef }]; }, propDecorators: { setPicker: [{
                type: Input,
                args: ['nbDatepicker']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXBpY2tlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3RoZW1lL2NvbXBvbmVudHMvZGF0ZXBpY2tlci9kYXRlcGlja2VyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHO0FBRUgsT0FBTyxFQUVMLFNBQVMsRUFFVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLGNBQWMsRUFDZCxLQUFLLEdBR04sTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUVMLGFBQWEsRUFDYixpQkFBaUIsRUFJakIsVUFBVSxHQUNYLE1BQU0sZ0JBQWdCLENBQUM7QUFDeEIsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQWMsT0FBTyxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUMzRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUcsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7QUFHbEQ7OztLQUdLO0FBQ0wsTUFBTSxPQUFnQixtQkFBbUI7Q0FvQnhDO0FBc0JEOzs7S0FHSztBQUNMLE1BQU0sT0FBZ0IsWUFBWTtDQW1DakM7QUFFRCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxjQUFjLENBQTJCLG9CQUFvQixDQUFDLENBQUM7QUFFbEcsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxjQUFjLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUVsRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzdELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUNoRTtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQzs7bUhBMVFVLHFCQUFxQixrQkFvQ3RCLFdBQVcsYUFDWCxlQUFlO3VHQXJDZCxxQkFBcUIsb0dBYnJCO1FBQ1Q7WUFDRSxPQUFPLEVBQUUsaUJBQWlCO1lBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMscUJBQXFCLENBQUM7WUFDcEQsS0FBSyxFQUFFLElBQUk7U0FDWjtRQUNEO1lBQ0UsT0FBTyxFQUFFLGFBQWE7WUFDdEIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNwRCxLQUFLLEVBQUUsSUFBSTtTQUNaO0tBQ0Y7NEZBRVUscUJBQXFCO2tCQWZqQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsaUJBQWlCOzRCQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQzs0QkFDcEQsS0FBSyxFQUFFLElBQUk7eUJBQ1o7d0JBQ0Q7NEJBQ0UsT0FBTyxFQUFFLGFBQWE7NEJBQ3RCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDOzRCQUNwRCxLQUFLLEVBQUUsSUFBSTt5QkFDWjtxQkFDRjtpQkFDRjs7MEJBcUNJLE1BQU07MkJBQUMsV0FBVzs7MEJBQ2xCLE1BQU07MkJBQUMsZUFBZTtpSUEvQnJCLFNBQVM7c0JBRFosS0FBSzt1QkFBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgQWt2ZW8uIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuIFNlZSBMaWNlbnNlLnR4dCBpbiB0aGUgcHJvamVjdCByb290IGZvciBsaWNlbnNlIGluZm9ybWF0aW9uLlxuICovXG5cbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIGZvcndhcmRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIElucHV0LFxuICBPbkRlc3Ryb3ksXG4gIFR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQ29udHJvbFZhbHVlQWNjZXNzb3IsXG4gIE5HX1ZBTElEQVRPUlMsXG4gIE5HX1ZBTFVFX0FDQ0VTU09SLFxuICBWYWxpZGF0aW9uRXJyb3JzLFxuICBWYWxpZGF0b3IsXG4gIFZhbGlkYXRvckZuLFxuICBWYWxpZGF0b3JzLFxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBmcm9tRXZlbnQsIG1lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0LCBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGRpc3RpbmN0VW50aWxDaGFuZ2VkLCBmaWx0ZXIsIG1hcCwgcGFpcndpc2UsIHN0YXJ0V2l0aCwgdGFrZSwgdGFrZVVudGlsLCB0YXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IE5CX0RPQ1VNRU5UIH0gZnJvbSAnLi4vLi4vdGhlbWUub3B0aW9ucyc7XG5pbXBvcnQgeyBOYkRhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vY2FsZW5kYXIta2l0L3NlcnZpY2VzL2RhdGUuc2VydmljZSc7XG5cbi8qKlxuICogVGhlIGBOYkRhdGVwaWNrZXJBZGFwdGVyYCBpbnN0YW5jZXMgcHJvdmlkZSB3YXkgaG93IHRvIHBhcnNlLCBmb3JtYXQgYW5kIHZhbGlkYXRlXG4gKiBkaWZmZXJlbnQgZGF0ZSB0eXBlcy5cbiAqICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTmJEYXRlcGlja2VyQWRhcHRlcjxEPiB7XG4gIC8qKlxuICAgKiBQaWNrZXIgY29tcG9uZW50IGNsYXNzLlxuICAgKiAqL1xuICBhYnN0cmFjdCBwaWNrZXI6IFR5cGU8YW55PjtcblxuICAvKipcbiAgICogUGFyc2UgZGF0ZSBzdHJpbmcgYWNjb3JkaW5nIHRvIHRoZSBmb3JtYXQuXG4gICAqICovXG4gIGFic3RyYWN0IHBhcnNlKHZhbHVlOiBzdHJpbmcsIGZvcm1hdDogc3RyaW5nKTogRDtcblxuICAvKipcbiAgICogRm9ybWF0IGRhdGUgYWNjb3JkaW5nIHRvIHRoZSBmb3JtYXQuXG4gICAqICovXG4gIGFic3RyYWN0IGZvcm1hdCh2YWx1ZTogRCwgZm9ybWF0OiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyBkYXRlIHN0cmluZyBhY2NvcmRpbmcgdG8gdGhlIHBhc3NlZCBmb3JtYXQuXG4gICAqICovXG4gIGFic3RyYWN0IGlzVmFsaWQodmFsdWU6IHN0cmluZywgZm9ybWF0OiBzdHJpbmcpOiBib29sZWFuO1xufVxuXG4vKipcbiAqIFZhbGlkYXRvcnMgY29uZmlnIHRoYXQgd2lsbCBiZSB1c2VkIGJ5IGZvcm0gY29udHJvbCB0byBwZXJmb3JtIHByb3BlciB2YWxpZGF0aW9uLlxuICogKi9cbmV4cG9ydCBpbnRlcmZhY2UgTmJQaWNrZXJWYWxpZGF0b3JDb25maWc8RD4ge1xuICAvKipcbiAgICogTWluaW11bSBkYXRlIGF2YWlsYWJsZSBpbiBwaWNrZXIuXG4gICAqICovXG4gIG1pbjogRDtcblxuICAvKipcbiAgICogTWF4aW11bSBkYXRlIGF2YWlsYWJsZSBpbiBwaWNrZXIuXG4gICAqICovXG4gIG1heDogRDtcblxuICAvKipcbiAgICogUHJlZGljYXRlIHRoYXQgZGV0ZXJtaW5lcyBpcyB2YWx1ZSBhdmFpbGFibGUgZm9yIHBpY2tpbmcuXG4gICAqICovXG4gIGZpbHRlcjogKEQpID0+IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGF0ZXBpY2tlciBpcyBhbiBjb250cm9sIHRoYXQgY2FuIHBpY2sgYW55IHZhbHVlcyBhbnl3YXkuXG4gKiBJdCBoYXMgdG8gYmUgYm91bmQgdG8gdGhlIGRhdGVwaWNrZXIgZGlyZWN0aXZlIHRocm91Z2ggbmJEYXRlcGlja2VyIGlucHV0LlxuICogKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOYkRhdGVwaWNrZXI8VCwgRCA9IFQ+IHtcbiAgLyoqXG4gICAqIEhUTUwgaW5wdXQgZWxlbWVudCBkYXRlIGZvcm1hdC5cbiAgICogKi9cbiAgYWJzdHJhY3QgZm9ybWF0OiBzdHJpbmc7XG5cbiAgYWJzdHJhY3QgZ2V0IHZhbHVlKCk6IFQ7XG5cbiAgYWJzdHJhY3Qgc2V0IHZhbHVlKHZhbHVlOiBUKTtcblxuICBhYnN0cmFjdCBnZXQgdmFsdWVDaGFuZ2UoKTogT2JzZXJ2YWJsZTxUPjtcblxuICBhYnN0cmFjdCBnZXQgaW5pdCgpOiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBkYXRlcGlja2VyIHRvIHRoZSBuYXRpdmUgaW5wdXQgZWxlbWVudC5cbiAgICogKi9cbiAgYWJzdHJhY3QgYXR0YWNoKGhvc3RSZWY6IEVsZW1lbnRSZWYpO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHZhbGlkYXRvciBjb25maWd1cmF0aW9uIGJhc2VkIG9uIHRoZSBpbnB1dCBwcm9wZXJ0aWVzLlxuICAgKiAqL1xuICBhYnN0cmFjdCBnZXRWYWxpZGF0b3JDb25maWcoKTogTmJQaWNrZXJWYWxpZGF0b3JDb25maWc8RD47XG5cbiAgYWJzdHJhY3Qgc2hvdygpO1xuXG4gIGFic3RyYWN0IGhpZGUoKTtcblxuICBhYnN0cmFjdCBzaG91bGRIaWRlKCk6IGJvb2xlYW47XG5cbiAgYWJzdHJhY3QgZ2V0IGlzU2hvd24oKTogYm9vbGVhbjtcblxuICBhYnN0cmFjdCBnZXQgYmx1cigpOiBPYnNlcnZhYmxlPHZvaWQ+O1xuXG4gIGFic3RyYWN0IGdldCBmb3JtYXRDaGFuZ2VkJCgpOiBPYnNlcnZhYmxlPHZvaWQ+O1xufVxuXG5leHBvcnQgY29uc3QgTkJfREFURV9BREFQVEVSID0gbmV3IEluamVjdGlvblRva2VuPE5iRGF0ZXBpY2tlckFkYXB0ZXI8YW55Pj4oJ0RhdGVwaWNrZXIgQWRhcHRlcicpO1xuXG5leHBvcnQgY29uc3QgTkJfREFURV9TRVJWSUNFX09QVElPTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW4oJ0RhdGUgc2VydmljZSBvcHRpb25zJyk7XG5cbi8qKlxuICogVGhlIGBOYkRhdGVwaWNrZXJEaXJlY3RpdmVgIGlzIGZvcm0gY29udHJvbCB0aGF0IGdpdmVzIHlvdSBhYmlsaXR5IHRvIHNlbGVjdCBkYXRlcyBhbmQgcmFuZ2VzLiBUaGUgZGF0ZXBpY2tlclxuICogaXMgc2hvd24gd2hlbiBpbnB1dCByZWNlaXZlcyBhIGBmb2N1c2AgZXZlbnQuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFtuYkRhdGVwaWNrZXJdPVwiZGF0ZXBpY2tlclwiPlxuICogPG5iLWRhdGVwaWNrZXIgI2RhdGVwaWNrZXI+PC9uYi1kYXRlcGlja2VyPlxuICogYGBgXG4gKlxuICogQHN0YWNrZWQtZXhhbXBsZShTaG93Y2FzZSwgZGF0ZXBpY2tlci9kYXRlcGlja2VyLXNob3djYXNlLmNvbXBvbmVudClcbiAqXG4gKiAjIyMgSW5zdGFsbGF0aW9uXG4gKlxuICogSW1wb3J0IGBOYkRhdGVwaWNrZXJNb2R1bGUuZm9yUm9vdCgpYCB0byB5b3VyIHJvb3QgbW9kdWxlLlxuICogYGBgdHNcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtcbiAqICAgICAvLyAuLi5cbiAqICAgICBOYkRhdGVwaWNrZXJNb2R1bGUuZm9yUm9vdCgpLFxuICogICBdLFxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgeyB9XG4gKiBgYGBcbiAqIEFuZCBgTmJEYXRlcGlja2VyTW9kdWxlYCB0byB5b3VyIGZlYXR1cmUgbW9kdWxlLlxuICogYGBgdHNcbiAqIEBOZ01vZHVsZSh7XG4gKiAgIGltcG9ydHM6IFtcbiAqICAgICAvLyAuLi5cbiAqICAgICBOYkRhdGVwaWNrZXJNb2R1bGUsXG4gKiAgIF0sXG4gKiB9KVxuICpcbiAqIGV4cG9ydCBjbGFzcyBQYWdlTW9kdWxlIHsgfVxuICogYGBgXG4gKiAjIyMgVXNhZ2VcbiAqXG4gKiBJZiB5b3Ugd2FudCB0byB1c2UgcmFuZ2Ugc2VsZWN0aW9uLCB5b3UgaGF2ZSB0byB1c2UgYE5iUmFuZ2VwaWNrZXJDb21wb25lbnRgIGluc3RlYWQ6XG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFtuYkRhdGVwaWNrZXJdPVwicmFuZ2VwaWNrZXJcIj5cbiAqIDxuYi1yYW5nZXBpY2tlciAjcmFuZ2VwaWNrZXI+PC9uYi1yYW5nZXBpY2tlcj5cbiAqIGBgYFxuICpcbiAqIEJvdGggcmFuZ2UgYW5kIGRhdGUgcGlja2VycyBzdXBwb3J0IGFsbCBwYXJhbWV0ZXJzIGFzIGNhbGVuZGFyLCBzbywgY2hlY2sgYE5iQ2FsZW5kYXJDb21wb25lbnRgIGZvciBhZGRpdGlvbmFsXG4gKiBpbmZvLlxuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoUmFuZ2Ugc2hvd2Nhc2UsIGRhdGVwaWNrZXIvcmFuZ2VwaWNrZXItc2hvd2Nhc2UuY29tcG9uZW50KVxuICpcbiAqIERhdGVwaWNrZXIgaXMgdGhlIGZvcm0gY29udHJvbCBzbyBpdCBjYW4gYmUgYm91bmQgd2l0aCBhbmd1bGFyIGZvcm1zIHRocm91Z2ggbmdNb2RlbCBhbmQgZm9ybSBjb250cm9scy5cbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKEZvcm1zLCBkYXRlcGlja2VyL2RhdGVwaWNrZXItZm9ybXMuY29tcG9uZW50KVxuICpcbiAqIGBOYkRhdGVwaWNrZXJEaXJlY3RpdmVgIG1heSBiZSB2YWxpZGF0ZWQgdXNpbmcgYG1pbmAgYW5kIGBtYXhgIGRhdGVzIHBhc3NlZCB0byB0aGUgZGF0ZXBpY2tlci5cbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKFZhbGlkYXRpb24sIGRhdGVwaWNrZXIvZGF0ZXBpY2tlci12YWxpZGF0aW9uLmNvbXBvbmVudClcbiAqXG4gKiBBbHNvIGBOYkRhdGVwaWNrZXJEaXJlY3RpdmVgIG1heSBiZSBmaWx0ZXJlZCB1c2luZyBgZmlsdGVyYCBwcmVkaWNhdGVcbiAqIHRoYXQgcmVjZWl2ZXMgZGF0ZSBvYmplY3QgYW5kIGhhcyB0byByZXR1cm4gYSBib29sZWFuIHZhbHVlLlxuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoRmlsdGVyLCBkYXRlcGlja2VyL2RhdGVwaWNrZXItZmlsdGVyLmNvbXBvbmVudClcbiAqXG4gKiBJZiB5b3UgbmVlZCB0byBwaWNrIGEgdGltZSBhbG9uZyB3aXRoIHRoZSBkYXRlLCB5b3UgY2FuIHVzZSBuYi1kYXRlLXRpbWVwaWNrZXJcbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgbmJJbnB1dCBwbGFjZWhvbGRlcj1cIlBpY2sgRGF0ZVwiIFtuYkRhdGVwaWNrZXJdPVwiZGF0ZVRpbWVQaWNrZXJcIj5cbiAqIDxuYi1kYXRlLXRpbWVwaWNrZXIgd2l0aFNlY29uZHMgI2RhdGVUaW1lUGlja2VyPjwvbmItZGF0ZS10aW1lcGlja2VyPlxuICogYGBgXG4gKiBAc3RhY2tlZC1leGFtcGxlKERhdGUgdGltZXBpY2tlciwgZGF0ZXBpY2tlci9kYXRlLXRpbWVwaWNrZXItc2hvd2Nhc2UuY29tcG9uZW50KVxuICpcbiAqIEEgc2luZ2xlIGNvbHVtbiBwaWNrZXIgd2l0aCBvcHRpb25zIHZhbHVlIGFzIHRpbWUgYW5kIG1pbnV0ZSwgc28gdXNlcnMgd29u4oCZdCBiZSBhYmxlIHRvIHBpY2tcbiAqIGhvdXJzIGFuZCBtaW51dGVzIGluZGl2aWR1YWxseS5cbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKERhdGUgdGltZXBpY2tlciBzaW5nbGUgY29sdW1uLCBkYXRlcGlja2VyL2RhdGUtdGltZXBpY2tlci1zaW5nbGUtY29sdW1uLmNvbXBvbmVudClcblxuICogVGhlIGBOYkRhdGVwaWNrZXJDb21wb25lbnRgIHN1cHBvcnRzIGRhdGUgZm9ybWF0dGluZzpcbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgW25iRGF0ZXBpY2tlcl09XCJkYXRlcGlja2VyXCI+XG4gKiA8bmItZGF0ZXBpY2tlciAjZGF0ZXBpY2tlciBmb3JtYXQ9XCJNTVxcZGRcXHl5eXlcIj48L25iLWRhdGVwaWNrZXI+XG4gKiBgYGBcbiAqIDxzcGFuIGlkPVwiZm9ybWF0dGluZy1pc3N1ZVwiPjwvc3Bhbj5cbiAqICMjIEZvcm1hdHRpbmcgSXNzdWVcbiAqXG4gKiBCeSBkZWZhdWx0LCBkYXRlcGlja2VyIHVzZXMgYW5ndWxhcnMgYExPQ0FMRV9JRGAgdG9rZW4gZm9yIGxvY2FsaXphdGlvbiBhbmQgYERhdGVQaXBlYCBmb3IgZGF0ZXMgZm9ybWF0dGluZy5cbiAqIEFuZCBuYXRpdmUgYERhdGUucGFyc2UoLi4uKWAgZm9yIGRhdGVzIHBhcnNpbmcuIEJ1dCBuYXRpdmUgYERhdGUucGFyc2VgIGZ1bmN0aW9uIGRvZXNuJ3Qgc3VwcG9ydCBmb3JtYXRzLlxuICogVG8gcHJvdmlkZSBjdXN0b20gZm9ybWF0dGluZyB5b3UgaGF2ZSB0byB1c2Ugb25lIG9mIHRoZSBmb2xsb3dpbmcgcGFja2FnZXM6XG4gKlxuICogLSBgQG5lYnVsYXIvbW9tZW50YCAtIHByb3ZpZGVzIG1vbWVudCBkYXRlIGFkYXB0ZXIgdGhhdCB1c2VzIG1vbWVudCBmb3IgZGF0ZSBvYmplY3RzLiBUaGlzIG1lYW5zIGRhdGVwaWNrZXIgdGhhblxuICogd2lsbCBvcGVyYXRlIG9ubHkgbW9tZW50IGRhdGUgb2JqZWN0cy4gSWYgeW91IHdhbnQgdG8gdXNlIGl0IHlvdSBoYXZlIHRvIGluc3RhbGwgaXQ6IGBucG0gaSBAbmVidWxhci9tb21lbnRgLCBhbmRcbiAqIGltcG9ydCBgTmJNb21lbnREYXRlTW9kdWxlYCBmcm9tIHRoaXMgcGFja2FnZS5cbiAqXG4gKiAtIGBAbmVidWxhci9kYXRlLWZuc2AgLSBhZGFwdGVyIGZvciBwb3B1bGFyIGRhdGUtZm5zIGxpYnJhcnkuIFRoaXMgd2F5IGlzIHByZWZlcnJlZCBpZiB5b3UgbmVlZCBvbmx5IGRhdGUgZm9ybWF0dGluZy5cbiAqIEJlY2F1c2UgZGF0ZS1mbnMgaXMgdHJlZXNoYWthYmxlLCB0aW55IGFuZCBvcGVyYXRlcyBuYXRpdmUgZGF0ZSBvYmplY3RzLiBJZiB5b3Ugd2FudCB0byB1c2UgaXQgeW91IGhhdmUgdG9cbiAqIGluc3RhbGwgaXQ6IGBucG0gaSBAbmVidWxhci9kYXRlLWZuc2AsIGFuZCBpbXBvcnQgYE5iRGF0ZUZuc0RhdGVNb2R1bGVgIGZyb20gdGhpcyBwYWNrYWdlLlxuICpcbiAqICMjIyBOYkRhdGVGbnNEYXRlTW9kdWxlXG4gKlxuICogRm9ybWF0IGlzIHJlcXVpcmVkIHdoZW4gdXNpbmcgYE5iRGF0ZUZuc0RhdGVNb2R1bGVgLiBZb3UgY2FuIHNldCBpdCB2aWEgYGZvcm1hdGAgaW5wdXQgb24gZGF0ZXBpY2tlciBjb21wb25lbnQ6XG4gKiBgYGBodG1sXG4gKiA8bmItZGF0ZXBpY2tlciBmb3JtYXQ9XCJkZC5NTS55eXl5XCI+PC9uYi1kYXRlcGlja2VyPlxuICogYGBgXG4gKiBBbHNvIGZvcm1hdCBjYW4gYmUgc2V0IGdsb2JhbGx5IHdpdGggYE5iRGF0ZUZuc0RhdGVNb2R1bGUuZm9yUm9vdCh7IGZvcm1hdDogJ2RkLk1NLnl5eXknIH0pYCBhbmRcbiAqIGBOYkRhdGVGbnNEYXRlTW9kdWxlLmZvckNoaWxkKHsgZm9ybWF0OiAnZGQuTU0ueXl5eScgfSlgIG1ldGhvZHMuXG4gKlxuICogUGxlYXNlIG5vdGUgdG8gdXNlIHNvbWUgb2YgdGhlIGZvcm1hdHRpbmcgdG9rZW5zIHlvdSBhbHNvIG5lZWQgdG8gcGFzc1xuICogYHsgdXNlQWRkaXRpb25hbFdlZWtZZWFyVG9rZW5zOiB0cnVlLCB1c2VBZGRpdGlvbmFsRGF5T2ZZZWFyVG9rZW5zOiB0cnVlIH1gIHRvIGRhdGUtZm5zIHBhcnNlIGFuZCBmb3JtYXQgZnVuY3Rpb25zLlxuICogWW91IGNhbiBjb25maWd1cmUgb3B0aW9ucyBwYXNzZWQgdGhpcyBmdW5jdGlvbnMgYnkgc2V0dGluZyBgZm9ybWF0T3B0aW9uc2AgYW5kXG4gKiBgcGFyc2VPcHRpb25zYCBvZiBvcHRpb25zIG9iamVjdCBwYXNzZWQgdG8gYE5iRGF0ZUZuc0RhdGVNb2R1bGUuZm9yUm9vdGAgYW5kIGBOYkRhdGVGbnNEYXRlTW9kdWxlLmZvckNoaWxkYCBtZXRob2RzLlxuICogYGBgdHNcbiAqIE5iRGF0ZUZuc0RhdGVNb2R1bGUuZm9yUm9vdCh7XG4gKiAgIHBhcnNlT3B0aW9uczogeyB1c2VBZGRpdGlvbmFsV2Vla1llYXJUb2tlbnM6IHRydWUsIHVzZUFkZGl0aW9uYWxEYXlPZlllYXJUb2tlbnM6IHRydWUgfSxcbiAqICAgZm9ybWF0T3B0aW9uczogeyB1c2VBZGRpdGlvbmFsV2Vla1llYXJUb2tlbnM6IHRydWUsIHVzZUFkZGl0aW9uYWxEYXlPZlllYXJUb2tlbnM6IHRydWUgfSxcbiAqIH0pXG4gKiBgYGBcbiAqIEZ1cnRoZXIgaW5mbyBvbiBgZGF0ZS1mbnNgIGZvcm1hdHRpbmcgdG9rZW5zIGNvdWxkIGJlIGZvdW5kIGF0XG4gKiBbZGF0ZS1mbnMgZG9jc10oaHR0cHM6Ly9kYXRlLWZucy5vcmcvdjIuMC4wLWFscGhhLjI3L2RvY3MvVW5pY29kZS1Ub2tlbnMpLlxuICpcbiAqIFlvdSBjYW4gYWxzbyB1c2UgYHBhcnNlT3B0aW9uc2AgYW5kIGBmb3JtYXRPcHRpb25zYCB0byBwcm92aWRlIGxvY2FsZS5cbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBlbyB9IGZyb20gJ2RhdGUtZm5zL2xvY2FsZSc7XG4gKlxuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW1xuICogICAgIE5iRGF0ZUZuc0RhdGVNb2R1bGUuZm9yUm9vdCh7XG4gKiAgICAgICBwYXJzZU9wdGlvbnM6IHsgbG9jYWxlOiBlbyB9LFxuICogICAgICAgZm9ybWF0T3B0aW9uczogeyBsb2NhbGU6IGVvIH0sXG4gKiAgICAgfSksXG4gKiAgIF0sXG4gKiB9KVxuICogYGBgXG4gKlxuICogQHN0eWxlc1xuICpcbiAqIGRhdGVwaWNrZXItYmFja2dyb3VuZC1jb2xvcjpcbiAqIGRhdGVwaWNrZXItYm9yZGVyLWNvbG9yOlxuICogZGF0ZXBpY2tlci1ib3JkZXItc3R5bGU6XG4gKiBkYXRlcGlja2VyLWJvcmRlci13aWR0aDpcbiAqIGRhdGVwaWNrZXItYm9yZGVyLXJhZGl1czpcbiAqIGRhdGVwaWNrZXItc2hhZG93OlxuICogKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ2lucHV0W25iRGF0ZXBpY2tlcl0nLFxuICBwcm92aWRlcnM6IFtcbiAgICB7XG4gICAgICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcbiAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IE5iRGF0ZXBpY2tlckRpcmVjdGl2ZSksXG4gICAgICBtdWx0aTogdHJ1ZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXG4gICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBOYkRhdGVwaWNrZXJEaXJlY3RpdmUpLFxuICAgICAgbXVsdGk6IHRydWUsXG4gICAgfSxcbiAgXSxcbn0pXG5leHBvcnQgY2xhc3MgTmJEYXRlcGlja2VyRGlyZWN0aXZlPEQ+IGltcGxlbWVudHMgT25EZXN0cm95LCBDb250cm9sVmFsdWVBY2Nlc3NvciwgVmFsaWRhdG9yIHtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIGRhdGVwaWNrZXIgY29tcG9uZW50LlxuICAgKiAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQGFuZ3VsYXItZXNsaW50L25vLWlucHV0LXJlbmFtZVxuICBASW5wdXQoJ25iRGF0ZXBpY2tlcicpXG4gIHNldCBzZXRQaWNrZXIocGlja2VyOiBOYkRhdGVwaWNrZXI8RD4pIHtcbiAgICB0aGlzLnBpY2tlciA9IHBpY2tlcjtcbiAgICB0aGlzLnNldHVwUGlja2VyKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgcGlja2VySW5wdXRzQ2hhbmdlZFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBEYXRlcGlja2VyIGFkYXB0ZXIuXG4gICAqICovXG4gIHByb3RlY3RlZCBkYXRlcGlja2VyQWRhcHRlcjogTmJEYXRlcGlja2VyQWRhcHRlcjxEPjtcblxuICAvKipcbiAgICogRGF0ZXBpY2tlciBpbnN0YW5jZS5cbiAgICogKi9cbiAgcHJvdGVjdGVkIHBpY2tlcjogTmJEYXRlcGlja2VyPEQ+O1xuICBwcm90ZWN0ZWQgZGVzdHJveSQgPSBuZXcgU3ViamVjdDx2b2lkPigpO1xuICBwcm90ZWN0ZWQgaXNEYXRlcGlja2VyUmVhZHk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHJvdGVjdGVkIHF1ZXVlOiBEIHwgdW5kZWZpbmVkO1xuICBwcm90ZWN0ZWQgb25DaGFuZ2U6IChEKSA9PiB2b2lkID0gKCkgPT4ge307XG4gIHByb3RlY3RlZCBvblRvdWNoZWQ6ICgpID0+IHZvaWQgPSAoKSA9PiB7fTtcblxuICAvKipcbiAgICogRm9ybSBjb250cm9sIHZhbGlkYXRvcnMgd2lsbCBiZSBjYWxsZWQgaW4gdmFsaWRhdG9ycyBjb250ZXh0LCBzbywgd2UgbmVlZCB0byBiaW5kIHRoZW0uXG4gICAqICovXG4gIHByb3RlY3RlZCB2YWxpZGF0b3I6IFZhbGlkYXRvckZuID0gVmFsaWRhdG9ycy5jb21wb3NlKFxuICAgIFt0aGlzLnBhcnNlVmFsaWRhdG9yLCB0aGlzLm1pblZhbGlkYXRvciwgdGhpcy5tYXhWYWxpZGF0b3IsIHRoaXMuZmlsdGVyVmFsaWRhdG9yXS5tYXAoKGZuKSA9PiBmbi5iaW5kKHRoaXMpKSxcbiAgKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBASW5qZWN0KE5CX0RPQ1VNRU5UKSBwcm90ZWN0ZWQgZG9jdW1lbnQsXG4gICAgQEluamVjdChOQl9EQVRFX0FEQVBURVIpIHByb3RlY3RlZCBkYXRlcGlja2VyQWRhcHRlcnM6IE5iRGF0ZXBpY2tlckFkYXB0ZXI8RD5bXSxcbiAgICBwcm90ZWN0ZWQgaG9zdFJlZjogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgZGF0ZVNlcnZpY2U6IE5iRGF0ZVNlcnZpY2U8RD4sXG4gICAgcHJvdGVjdGVkIGNoYW5nZURldGVjdG9yOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgKSB7XG4gICAgdGhpcy5zdWJzY3JpYmVPbklucHV0Q2hhbmdlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBodG1sIGlucHV0IGVsZW1lbnQuXG4gICAqICovXG4gIGdldCBpbnB1dCgpOiBIVE1MSW5wdXRFbGVtZW50IHtcbiAgICByZXR1cm4gdGhpcy5ob3N0UmVmLm5hdGl2ZUVsZW1lbnQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBob3N0IGlucHV0IHZhbHVlLlxuICAgKiAqL1xuICBnZXQgaW5wdXRWYWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmlucHV0LnZhbHVlO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZXN0cm95JC5uZXh0KCk7XG4gICAgdGhpcy5kZXN0cm95JC5jb21wbGV0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFdyaXRlcyB2YWx1ZSBpbiBwaWNrZXIgYW5kIGh0bWwgaW5wdXQgZWxlbWVudC5cbiAgICogKi9cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogRCkge1xuICAgIGlmICh0aGlzLmlzRGF0ZXBpY2tlclJlYWR5KSB7XG4gICAgICB0aGlzLndyaXRlUGlja2VyKHZhbHVlKTtcbiAgICAgIHRoaXMud3JpdGVJbnB1dCh2YWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucXVldWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLm9uQ2hhbmdlID0gZm47XG4gIH1cblxuICByZWdpc3Rlck9uVG91Y2hlZChmbjogYW55KTogdm9pZCB7XG4gICAgdGhpcy5vblRvdWNoZWQgPSBmbjtcbiAgfVxuXG4gIHNldERpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuaW5wdXQuZGlzYWJsZWQgPSBpc0Rpc2FibGVkO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvcm0gY29udHJvbCB2YWxpZGF0aW9uIGJhc2VkIG9uIHBpY2tlciB2YWxpZGF0b3IgY29uZmlnLlxuICAgKiAqL1xuICB2YWxpZGF0ZSgpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgcmV0dXJuIHRoaXMudmFsaWRhdG9yKG51bGwpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIHBpY2tlciwgZm9jdXNlcyB0aGUgaW5wdXRcbiAgICovXG4gIHByb3RlY3RlZCBoaWRlUGlja2VyKCkge1xuICAgIHRoaXMuaW5wdXQuZm9jdXMoKTtcbiAgICB0aGlzLnBpY2tlci5oaWRlKCk7XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGVzIHRoYXQgd2UgY2FuIHBhcnNlIHZhbHVlIGNvcnJlY3RseS5cbiAgICogKi9cbiAgcHJvdGVjdGVkIHBhcnNlVmFsaWRhdG9yKCk6IFZhbGlkYXRpb25FcnJvcnMgfCBudWxsIHtcbiAgICAvKipcbiAgICAgKiBEYXRlIHNlcnZpY2VzIHRyZWF0IGVtcHR5IHN0cmluZyBhcyBpbnZhbGlkIGRhdGUuXG4gICAgICogVGhhdCdzIHdoeSB3ZSdyZSBnZXR0aW5nIGludmFsaWQgZm9ybUNvbnRyb2wgaW4gY2FzZSBvZiBlbXB0eSBpbnB1dCB3aGljaCBpcyBub3QgcmVxdWlyZWQuXG4gICAgICogKi9cbiAgICBpZiAodGhpcy5pbnB1dFZhbHVlID09PSAnJykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgaXNWYWxpZCA9IHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIuaXNWYWxpZCh0aGlzLmlucHV0VmFsdWUsIHRoaXMucGlja2VyLmZvcm1hdCk7XG4gICAgcmV0dXJuIGlzVmFsaWQgPyBudWxsIDogeyBuYkRhdGVwaWNrZXJQYXJzZTogeyB2YWx1ZTogdGhpcy5pbnB1dFZhbHVlIH0gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgcGFzc2VkIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBtaW4uXG4gICAqICovXG4gIHByb3RlY3RlZCBtaW5WYWxpZGF0b3IoKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGlja2VyLmdldFZhbGlkYXRvckNvbmZpZygpO1xuICAgIGNvbnN0IGRhdGUgPSB0aGlzLmRhdGVwaWNrZXJBZGFwdGVyLnBhcnNlKHRoaXMuaW5wdXRWYWx1ZSwgdGhpcy5waWNrZXIuZm9ybWF0KTtcbiAgICByZXR1cm4gIWNvbmZpZy5taW4gfHwgIWRhdGUgfHwgdGhpcy5kYXRlU2VydmljZS5jb21wYXJlRGF0ZXMoY29uZmlnLm1pbiwgZGF0ZSkgPD0gMFxuICAgICAgPyBudWxsXG4gICAgICA6IHsgbmJEYXRlcGlja2VyTWluOiB7IG1pbjogY29uZmlnLm1pbiwgYWN0dWFsOiBkYXRlIH0gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgcGFzc2VkIHZhbHVlIGlzIHNtYWxsZXIgdGhhbiBtYXguXG4gICAqICovXG4gIHByb3RlY3RlZCBtYXhWYWxpZGF0b3IoKTogVmFsaWRhdGlvbkVycm9ycyB8IG51bGwge1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMucGlja2VyLmdldFZhbGlkYXRvckNvbmZpZygpO1xuICAgIGNvbnN0IGRhdGUgPSB0aGlzLmRhdGVwaWNrZXJBZGFwdGVyLnBhcnNlKHRoaXMuaW5wdXRWYWx1ZSwgdGhpcy5waWNrZXIuZm9ybWF0KTtcbiAgICByZXR1cm4gIWNvbmZpZy5tYXggfHwgIWRhdGUgfHwgdGhpcy5kYXRlU2VydmljZS5jb21wYXJlRGF0ZXMoY29uZmlnLm1heCwgZGF0ZSkgPj0gMFxuICAgICAgPyBudWxsXG4gICAgICA6IHsgbmJEYXRlcGlja2VyTWF4OiB7IG1heDogY29uZmlnLm1heCwgYWN0dWFsOiBkYXRlIH0gfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgcGFzc2VkIHZhbHVlIHNhdGlzZnkgdGhlIGZpbHRlci5cbiAgICogKi9cbiAgcHJvdGVjdGVkIGZpbHRlclZhbGlkYXRvcigpOiBWYWxpZGF0aW9uRXJyb3JzIHwgbnVsbCB7XG4gICAgY29uc3QgY29uZmlnID0gdGhpcy5waWNrZXIuZ2V0VmFsaWRhdG9yQ29uZmlnKCk7XG4gICAgY29uc3QgZGF0ZSA9IHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIucGFyc2UodGhpcy5pbnB1dFZhbHVlLCB0aGlzLnBpY2tlci5mb3JtYXQpO1xuICAgIHJldHVybiAhY29uZmlnLmZpbHRlciB8fCAhZGF0ZSB8fCBjb25maWcuZmlsdGVyKGRhdGUpID8gbnVsbCA6IHsgbmJEYXRlcGlja2VyRmlsdGVyOiB0cnVlIH07XG4gIH1cblxuICAvKipcbiAgICogQ2hvb3NlcyBkYXRlcGlja2VyIGFkYXB0ZXIgYmFzZWQgb24gcGFzc2VkIHBpY2tlciBjb21wb25lbnQuXG4gICAqICovXG4gIHByb3RlY3RlZCBjaG9vc2VEYXRlcGlja2VyQWRhcHRlcigpIHtcbiAgICB0aGlzLmRhdGVwaWNrZXJBZGFwdGVyID0gdGhpcy5kYXRlcGlja2VyQWRhcHRlcnMuZmluZCgoeyBwaWNrZXIgfSkgPT4gdGhpcy5waWNrZXIgaW5zdGFuY2VvZiBwaWNrZXIpO1xuXG4gICAgaWYgKHRoaXMubm9EYXRlcGlja2VyQWRhcHRlclByb3ZpZGVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZGF0ZXBpY2tlckFkYXB0ZXIgcHJvdmlkZWQgZm9yIHBpY2tlcicpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBwaWNrZXIgdG8gdGhlIGhvc3QgaW5wdXQgZWxlbWVudCBhbmQgc3Vic2NyaWJlcyBvbiB2YWx1ZSBjaGFuZ2VzLlxuICAgKiAqL1xuICBwcm90ZWN0ZWQgc2V0dXBQaWNrZXIoKSB7XG4gICAgdGhpcy5jaG9vc2VEYXRlcGlja2VyQWRhcHRlcigpO1xuICAgIHRoaXMucGlja2VyLmF0dGFjaCh0aGlzLmhvc3RSZWYpO1xuXG4gICAgaWYgKHRoaXMuaW5wdXRWYWx1ZSkge1xuICAgICAgdGhpcy5waWNrZXIudmFsdWUgPSB0aGlzLmRhdGVwaWNrZXJBZGFwdGVyLnBhcnNlKHRoaXMuaW5wdXRWYWx1ZSwgdGhpcy5waWNrZXIuZm9ybWF0KTtcbiAgICB9XG5cbiAgICB0aGlzLnBpY2tlcklucHV0c0NoYW5nZWRTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5waWNrZXJJbnB1dHNDaGFuZ2VkU3Vic2NyaXB0aW9uID0gdGhpcy5waWNrZXIuZm9ybWF0Q2hhbmdlZCRcbiAgICAgIC5waXBlKFxuICAgICAgICBtYXAoKCkgPT4gdGhpcy5waWNrZXIuZm9ybWF0KSxcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMucGlja2VyLmZvcm1hdCksXG4gICAgICAgIGRpc3RpbmN0VW50aWxDaGFuZ2VkKCksXG4gICAgICAgIHBhaXJ3aXNlKCksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKFtwcmV2Rm9ybWF0LCBuZXh0Rm9ybWF0XSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5pbnB1dFZhbHVlKSB7XG4gICAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIucGFyc2UodGhpcy5pbnB1dFZhbHVlLCBwcmV2Rm9ybWF0KTtcbiAgICAgICAgICB0aGlzLndyaXRlSW5wdXQoZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgLy8gSW4gY2FzZSBkYXRlcGlja2VyIGNvbXBvbmVudCBwbGFjZWQgYWZ0ZXIgdGhlIGlucHV0IHdpdGggZGF0ZXBpY2tlciBkaXJlY3RpdmUsXG4gICAgLy8gd2UgY2FuJ3QgcmVhZCBgdGhpcy5waWNrZXIuZm9ybWF0YCBvbiBmaXJzdCBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bixcbiAgICAvLyBzaW5jZSBpdCdzIG5vdCBib3VuZCB5ZXQsIHNvIHdlIGhhdmUgdG8gd2FpdCBmb3IgZGF0ZXBpY2tlciBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24uXG4gICAgaWYgKCF0aGlzLmlzRGF0ZXBpY2tlclJlYWR5KSB7XG4gICAgICB0aGlzLnBpY2tlci5pbml0XG4gICAgICAgIC5waXBlKFxuICAgICAgICAgIHRha2UoMSksXG4gICAgICAgICAgdGFwKCgpID0+ICh0aGlzLmlzRGF0ZXBpY2tlclJlYWR5ID0gdHJ1ZSkpLFxuICAgICAgICAgIGZpbHRlcigoKSA9PiAhIXRoaXMucXVldWUpLFxuICAgICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgICAgKVxuICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICB0aGlzLndyaXRlVmFsdWUodGhpcy5xdWV1ZSk7XG4gICAgICAgICAgdGhpcy5jaGFuZ2VEZXRlY3Rvci5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgICAgICAgdGhpcy5xdWV1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5waWNrZXIudmFsdWVDaGFuZ2UucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpLnN1YnNjcmliZSgodmFsdWU6IEQpID0+IHtcbiAgICAgIHRoaXMud3JpdGVQaWNrZXIodmFsdWUpO1xuICAgICAgdGhpcy53cml0ZUlucHV0KHZhbHVlKTtcbiAgICAgIHRoaXMub25DaGFuZ2UodmFsdWUpO1xuXG4gICAgICBpZiAodGhpcy5waWNrZXIuc2hvdWxkSGlkZSgpKSB7XG4gICAgICAgIHRoaXMuaGlkZVBpY2tlcigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbWVyZ2UoXG4gICAgICB0aGlzLnBpY2tlci5ibHVyLFxuICAgICAgZnJvbUV2ZW50KHRoaXMuaW5wdXQsICdibHVyJykucGlwZShcbiAgICAgICAgZmlsdGVyKCgpID0+ICF0aGlzLnBpY2tlci5pc1Nob3duICYmIHRoaXMuZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGhpcy5pbnB1dCksXG4gICAgICApLFxuICAgIClcbiAgICAgIC5waXBlKHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSlcbiAgICAgIC5zdWJzY3JpYmUoKCkgPT4gdGhpcy5vblRvdWNoZWQoKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgd3JpdGVQaWNrZXIodmFsdWU6IEQpIHtcbiAgICB0aGlzLnBpY2tlci52YWx1ZSA9IHZhbHVlO1xuICB9XG5cbiAgcHJvdGVjdGVkIHdyaXRlSW5wdXQodmFsdWU6IEQpIHtcbiAgICB0aGlzLmhvc3RSZWYubmF0aXZlRWxlbWVudC52YWx1ZSA9IHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIuZm9ybWF0KHZhbHVlLCB0aGlzLnBpY2tlci5mb3JtYXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyBpZiBubyBkYXRlcGlja2VyIGFkYXB0ZXIgcHJvdmlkZWQuXG4gICAqICovXG4gIHByb3RlY3RlZCBub0RhdGVwaWNrZXJBZGFwdGVyUHJvdmlkZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICF0aGlzLmRhdGVwaWNrZXJBZGFwdGVyIHx8ICEodGhpcy5kYXRlcGlja2VyQWRhcHRlciBpbnN0YW5jZW9mIE5iRGF0ZXBpY2tlckFkYXB0ZXIpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uSW5wdXRDaGFuZ2UoKSB7XG4gICAgZnJvbUV2ZW50KHRoaXMuaW5wdXQsICdpbnB1dCcpXG4gICAgICAucGlwZShcbiAgICAgICAgbWFwKCgpID0+IHRoaXMuaW5wdXRWYWx1ZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UodmFsdWUpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZXMgaW5wdXQgdmFsdWUgYW5kIHdyaXRlIGlmIGl0IGlzbid0IG51bGwuXG4gICAqICovXG4gIHByb3RlY3RlZCBoYW5kbGVJbnB1dENoYW5nZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgY29uc3QgZGF0ZSA9IHRoaXMucGFyc2VJbnB1dFZhbHVlKHZhbHVlKTtcblxuICAgIHRoaXMub25DaGFuZ2UoZGF0ZSk7XG4gICAgdGhpcy53cml0ZVBpY2tlcihkYXRlKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBwYXJzZUlucHV0VmFsdWUodmFsdWUpOiBEIHwgbnVsbCB7XG4gICAgaWYgKHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIuaXNWYWxpZCh2YWx1ZSwgdGhpcy5waWNrZXIuZm9ybWF0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0ZXBpY2tlckFkYXB0ZXIucGFyc2UodmFsdWUsIHRoaXMucGlja2VyLmZvcm1hdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==