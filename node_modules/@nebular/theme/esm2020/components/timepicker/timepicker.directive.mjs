import { Attribute, Directive, forwardRef, Inject, Input, isDevMode, } from '@angular/core';
import { distinctUntilChanged, filter, map, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { fromEvent, merge, Subject } from 'rxjs';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { NbAdjustment, NbPosition, } from '../cdk/overlay/overlay-position';
import { NbTrigger } from '../cdk/overlay/overlay-trigger';
import { NB_DOCUMENT } from '../../theme.options';
import * as i0 from "@angular/core";
import * as i1 from "../cdk/overlay/overlay-position";
import * as i2 from "../cdk/overlay/overlay-trigger";
import * as i3 from "../cdk/overlay/overlay-service";
import * as i4 from "../calendar-kit/services/calendar-time-model.service";
import * as i5 from "../calendar-kit/services/date.service";
/**
 * The `NbTimePickerDirective` is form control that gives you ability to select a time. The timepicker
 * is shown when input receives a `focus` event.
 * ```html
 * <input [nbTimepicker]="timepicker">
 * <nb-timepicker #timepicker></nb-timepicker>
 * ```
 *
 * @stacked-example(Showcase, timepicker/timepicker-showcase.component)
 *
 * ### Installation
 *
 * Import `NbTimepickerModule.forRoot()` to your root module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbTimepickerModule.forRoot(),
 *   ],
 * })
 * export class AppModule { }
 * ```
 * And `NbTimepickerModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbTimepickerModule,
 *   ],
 * })
 * export class PageModule { }
 *
 * ```
 * <div id="native-parse-issue" class="note note-warning">
 * <div class="note-title">Note</div>
 * <div class="note-body">
 * Timepicker uses native Date object by default, which doesn't support parsing by custom format.
 * According to the ECMAScript specification, the only supported format is a format described by ISO 8061 standard.
 * This standard requires date part to be included in the date string,
 * meaning you have to type a date+time in the input.
 * We highly recommend you to use NbDateFnsDateModule or NbMomentDateModule to be able to support time only strings in
 * the timepicker inputs. These modules use date-fns and moment date libraries, which provide capabilities
 * to parse time only strings.
 * See "Formatting Issue" at
 * <a href="https://akveo.github.io/nebular/docs/components/datepicker/overview#formatting-issue">Date picker docs</a>
 * for installation instructions.
 * </div>
 * </div>
 * <hr>
 *
 * ### Usage
 *
 * To show seconds column along with hours and minutes use `withSeconds` input
 *
 * ```html
 * <input [nbTimepicker]="timepicker">
 * <nb-timepicker #timepicker withSeconds></nb-timepicker>
 * ```
 * @stacked-example(Time picker with seconds, timepicker/timepicker-with-seconds.component)
 *
 * To force timepicker work in 12 hours format, use `twelveHoursFormat` input.
 * By default, timepicker choose 12 or 24 formats based on application locale standards
 *
 * ```html
 * <input [nbTimepicker]="timepicker" twelveHoursFormat>
 * <nb-timepicker #timepicker></nb-timepicker>
 * ```
 *
 * @stacked-example(Twelve hours format showcase, timepicker/timepicker-twelve-hours-format.component)
 *
 * A single column picker with options value as time and minute, so users won’t be able to pick
 * hours and minutes individually.
 * You can control options minutes offset via `step` input, e.g.: 11:00, 11:20, 11:40...'
 *
 * @stacked-example(Single column, timepicker/timepicker-single-column.component)
 *
 * Timepicker support forms and reactive forms API so you can provide value using `formControl` and `ngModel` directives
 * @stacked-example(Form control, timepicker/timepicker-form-control.component)
 *
 * <input [nbTimepicker]="timepicker" twelveHoursFormat>
 * <nb-timepicker #timepicke [formControl]="formControl"></nb-timepicker>
 *
 * @stacked-example(NgModel, timepicker/timepicker-ng-model.component)
 *
 * <input [nbTimepicker]="timepicker" twelveHoursFormat>
 * <nb-timepicker #timepicke [ngModel]="date"></nb-timepicker>
 *
 * You can provide localized versions of the timepicker text via the `localization` property of the config
 * object passed to the `forRoot` or `forChild` methods of the `NbTimepickerModule`:
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NbTimepickerModule.forRoot({
 *       localization: {
 *         hoursText: 'Hr',
 *         minutesText: 'Min',
 *         secondsText: 'Sec',
 *         ampmText: 'Am/Pm',
 *       }
 *     }),
 *   ],
 * })
 * export class AppModule { }
 * ```
 *
 * @styles
 *
 * timepicker-cell-text-color:
 * timepicker-cell-hover-background-color:
 * timepicker-cell-hover-text-color:
 * timepicker-cell-focus-background-color:
 * timepicker-cell-focus-text-color:
 * timepicker-cell-active-background-color:
 * timepicker-cell-active-text-color:
 * timepicker-cell-text-font-size:
 * timepicker-cell-text-font-family:
 * timepicker-cell-text-line-height:
 * timepicker-cell-text-font-weight:
 * timepicker-cell-height:
 * timepicker-header-cell-text-color:
 * timepicker-header-cell-text-font-size:
 * timepicker-header-cell-text-font-family:
 * timepicker-header-cell-height:
 * timepicker-header-cell-text-line-height:
 * timepicker-header-cell-text-font-weight:
 * timepicker-border-color:
 * timepicker-border-style:
 * timepicker-border-width:
 * timepicker-scrollbar-color:
 * timepicker-scrollbar-background-color:
 * timepicker-scrollbar-width:
 * timepicker-single-column-width:
 * timepicker-multiple-column-width:
 * timepicker-title-height:
 * timepicker-title-padding:
 * timepicker-container-width:
 * timepicker-container-height:
 * */
export class NbTimePickerDirective {
    constructor(document, positionBuilder, hostRef, triggerStrategyBuilder, overlay, cd, calendarTimeModelService, dateService, renderer, placeholder) {
        this.document = document;
        this.positionBuilder = positionBuilder;
        this.hostRef = hostRef;
        this.triggerStrategyBuilder = triggerStrategyBuilder;
        this.overlay = overlay;
        this.cd = cd;
        this.calendarTimeModelService = calendarTimeModelService;
        this.dateService = dateService;
        this.renderer = renderer;
        this.placeholder = placeholder;
        /**
         * Time picker overlay offset.
         * */
        this.overlayOffset = 8;
        this.destroy$ = new Subject();
        this.onChange = () => { };
        this.onTouched = () => { };
    }
    /**
     * Provides timepicker component.
     * */
    get timepicker() {
        return this._timePickerComponent;
    }
    set timepicker(timePicker) {
        this._timePickerComponent = timePicker;
        this.pickerInputsChangedSubscription?.unsubscribe();
        this.pickerInputsChangedSubscription = this._timePickerComponent.timepickerFormatChange$
            .pipe(map(() => this._timePickerComponent.computedTimeFormat), startWith(this._timePickerComponent.computedTimeFormat), distinctUntilChanged(), pairwise(), takeUntil(this.destroy$))
            .subscribe(([prevFormat, nextFormat]) => {
            if (this.inputValue) {
                const date = this.dateService.parse(this.inputValue, prevFormat);
                this.writeValue(date);
            }
        });
    }
    /**
     * Returns html input element.
     * @docs-private
     * */
    get input() {
        return this.hostRef.nativeElement;
    }
    /**
     * Determines is timepicker overlay opened.
     * @docs-private
     * */
    get isOpen() {
        return this.overlayRef && this.overlayRef.hasAttached();
    }
    /**
     * Determines is timepicker overlay closed.
     * @docs-private
     * */
    get isClosed() {
        return !this.isOpen;
    }
    /**
     * Returns host input value.
     * @docs-private
     * */
    get inputValue() {
        return this.input.value;
    }
    set inputValue(value) {
        this.input.value = value;
    }
    ngAfterViewInit() {
        this.subscribeOnInputChange();
        if (!this.placeholder) {
            this.renderer.setProperty(this.input, 'placeholder', this.timepicker.computedTimeFormat);
        }
        this.triggerStrategy = this.createTriggerStrategy();
        this.subscribeOnTriggers();
        this.subscribeToBlur();
    }
    show() {
        if (this.isClosed) {
            this.attachToOverlay();
        }
    }
    hide() {
        if (this.isOpen) {
            this.overlayRef.detach();
            this.cd.markForCheck();
        }
    }
    /**
     * Attaches picker to the timepicker portal.
     * @docs-private
     * */
    attachToOverlay() {
        if (!this.overlayRef) {
            this.setupTimepicker();
            this.initOverlay();
        }
        this.overlayRef.attach(this.timepicker.portal);
    }
    setupTimepicker() {
        if (this.dateService.getId() === 'native' && isDevMode()) {
            console.warn('Date.parse does not support parsing time with custom format.' +
                ' See details here https://akveo.github.io/nebular/docs/components/datepicker/overview#native-parse-issue');
        }
        this.timepicker.setHost(this.hostRef);
        if (this.inputValue) {
            const val = this.dateService.getId() === 'native' ? this.parseNativeDateString(this.inputValue) : this.inputValue;
            this.timepicker.date = this.dateService.parse(val, this.timepicker.computedTimeFormat);
        }
        else {
            this.timepicker.date = this.calendarTimeModelService.getResetTime();
        }
    }
    initOverlay() {
        this.positionStrategy = this.createPositionStrategy();
        this.subscribeOnApplyClick();
        this.createOverlay();
    }
    subscribeOnApplyClick() {
        this.timepicker.onSelectTime.pipe(takeUntil(this.destroy$)).subscribe((value) => {
            const time = this.dateService.format(value.time, this.timepicker.computedTimeFormat).toUpperCase();
            this.inputValue = time;
            this.timepicker.date = value.time;
            this.onChange(value.time);
            if (value.save) {
                this.lastInputValue = time;
                this.hide();
            }
        });
    }
    createOverlay() {
        const scrollStrategy = this.createScrollStrategy();
        this.overlayRef = this.overlay.create({ positionStrategy: this.positionStrategy, scrollStrategy });
    }
    subscribeOnTriggers() {
        this.triggerStrategy.show$.pipe(filter(() => this.isClosed)).subscribe(() => this.show());
        this.triggerStrategy.hide$.pipe(filter(() => this.isOpen)).subscribe(() => {
            this.inputValue = this.lastInputValue || '';
            this.hide();
        });
    }
    createTriggerStrategy() {
        return this.triggerStrategyBuilder
            .trigger(NbTrigger.FOCUS)
            .host(this.hostRef.nativeElement)
            .container(() => this.getContainer())
            .build();
    }
    createPositionStrategy() {
        return this.positionBuilder
            .connectedTo(this.hostRef)
            .position(NbPosition.BOTTOM)
            .offset(this.overlayOffset)
            .adjustment(NbAdjustment.COUNTERCLOCKWISE);
    }
    getContainer() {
        return (this.overlayRef &&
            this.isOpen &&
            {
                location: {
                    nativeElement: this.overlayRef.overlayElement,
                },
            });
    }
    createScrollStrategy() {
        return this.overlay.scrollStrategies.block();
    }
    subscribeOnInputChange() {
        fromEvent(this.input, 'input')
            .pipe(map(() => this.inputValue), takeUntil(this.destroy$))
            .subscribe((value) => this.handleInputChange(value));
    }
    subscribeToBlur() {
        merge(this.timepicker.blur, fromEvent(this.input, 'blur').pipe(filter(() => !this.isOpen && this.document.activeElement !== this.input)))
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.onTouched());
    }
    /**
     * Parses input value and write if it isn't null.
     * @docs-private
     * */
    handleInputChange(value) {
        if (this.dateService.getId() === 'native') {
            /**
             * Native date service dont parse only time string value,
             * and we adding year mouth and day to convert string to valid date format
             **/
            value = this.parseNativeDateString(value);
        }
        const isValidDate = this.dateService.isValidDateString(value, this.timepicker.computedTimeFormat);
        if (isValidDate) {
            this.lastInputValue = value;
            const date = this.dateService.parse(value, this.timepicker.computedTimeFormat);
            this.onChange(date);
            this.timepicker.date = date;
        }
    }
    updateValue(value) {
        if (value) {
            this.timepicker.date = value;
            const timeString = this.dateService.format(value, this.timepicker.computedTimeFormat).toUpperCase();
            this.inputValue = timeString;
            this.lastInputValue = timeString;
        }
    }
    writeValue(value) {
        this.updateValue(value);
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
    parseNativeDateString(value) {
        const date = this.dateService.today();
        const year = this.dateService.getYear(date);
        const month = this.calendarTimeModelService.paddToTwoSymbols(this.dateService.getMonth(date));
        const day = this.calendarTimeModelService.paddToTwoSymbols(this.dateService.getDate(date));
        return `${year}-${month}-${day} ${value}`;
    }
}
NbTimePickerDirective.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbTimePickerDirective, deps: [{ token: NB_DOCUMENT }, { token: i1.NbPositionBuilderService }, { token: i0.ElementRef }, { token: i2.NbTriggerStrategyBuilderService }, { token: i3.NbOverlayService }, { token: i0.ChangeDetectorRef }, { token: i4.NbCalendarTimeModelService }, { token: i5.NbDateService }, { token: i0.Renderer2 }, { token: 'placeholder', attribute: true }], target: i0.ɵɵFactoryTarget.Directive });
NbTimePickerDirective.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.2.12", type: NbTimePickerDirective, selector: "input[nbTimepicker]", inputs: { timepicker: ["nbTimepicker", "timepicker"], overlayOffset: "overlayOffset" }, providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NbTimePickerDirective),
            multi: true,
        },
    ], ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbTimePickerDirective, decorators: [{
            type: Directive,
            args: [{
                    selector: 'input[nbTimepicker]',
                    providers: [
                        {
                            provide: NG_VALUE_ACCESSOR,
                            useExisting: forwardRef(() => NbTimePickerDirective),
                            multi: true,
                        },
                    ],
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: i1.NbPositionBuilderService }, { type: i0.ElementRef }, { type: i2.NbTriggerStrategyBuilderService }, { type: i3.NbOverlayService }, { type: i0.ChangeDetectorRef }, { type: i4.NbCalendarTimeModelService }, { type: i5.NbDateService }, { type: i0.Renderer2 }, { type: undefined, decorators: [{
                    type: Attribute,
                    args: ['placeholder']
                }] }]; }, propDecorators: { timepicker: [{
                type: Input,
                args: ['nbTimepicker']
            }], overlayOffset: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXBpY2tlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvZnJhbWV3b3JrL3RoZW1lL2NvbXBvbmVudHMvdGltZXBpY2tlci90aW1lcGlja2VyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBRUwsU0FBUyxFQUdULFNBQVMsRUFFVCxVQUFVLEVBQ1YsTUFBTSxFQUNOLEtBQUssRUFDTCxTQUFTLEdBRVYsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRyxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQWdCLE1BQU0sTUFBTSxDQUFDO0FBQy9ELE9BQU8sRUFBd0IsaUJBQWlCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUd6RSxPQUFPLEVBRUwsWUFBWSxFQUNaLFVBQVUsR0FFWCxNQUFNLGlDQUFpQyxDQUFDO0FBRXpDLE9BQU8sRUFBRSxTQUFTLEVBQXNELE1BQU0sZ0NBQWdDLENBQUM7QUFJL0csT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7O0FBRWxEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0EwSUs7QUFXTCxNQUFNLE9BQU8scUJBQXFCO0lBa0ZoQyxZQUNpQyxRQUFRLEVBQzdCLGVBQXlDLEVBQ3pDLE9BQW1CLEVBQ25CLHNCQUF1RCxFQUN2RCxPQUF5QixFQUN6QixFQUFxQixFQUNyQix3QkFBdUQsRUFDdkQsV0FBNkIsRUFDN0IsUUFBbUIsRUFDTyxXQUFtQjtRQVR4QixhQUFRLEdBQVIsUUFBUSxDQUFBO1FBQzdCLG9CQUFlLEdBQWYsZUFBZSxDQUEwQjtRQUN6QyxZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQ25CLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBaUM7UUFDdkQsWUFBTyxHQUFQLE9BQU8sQ0FBa0I7UUFDekIsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFDckIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUErQjtRQUN2RCxnQkFBVyxHQUFYLFdBQVcsQ0FBa0I7UUFDN0IsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUNPLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBN0R6RDs7YUFFSztRQUNJLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBZWpCLGFBQVEsR0FBa0IsSUFBSSxPQUFPLEVBQVEsQ0FBQztRQUM5QyxhQUFRLEdBQXVCLEdBQUcsRUFBRSxHQUFFLENBQUMsQ0FBQztRQUN4QyxjQUFTLEdBQUcsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDO0lBMEM1QixDQUFDO0lBNUZKOztTQUVLO0lBQ0wsSUFDSSxVQUFVO1FBQ1osT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQUksVUFBVSxDQUFDLFVBQW9DO1FBQ2pELElBQUksQ0FBQyxvQkFBb0IsR0FBRyxVQUFVLENBQUM7UUFFdkMsSUFBSSxDQUFDLCtCQUErQixFQUFFLFdBQVcsRUFBRSxDQUFDO1FBQ3BELElBQUksQ0FBQywrQkFBK0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsdUJBQXVCO2FBQ3JGLElBQUksQ0FDSCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGtCQUFrQixDQUFDLEVBQ3ZELFNBQVMsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsa0JBQWtCLENBQUMsRUFDdkQsb0JBQW9CLEVBQUUsRUFDdEIsUUFBUSxFQUFFLEVBQ1YsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FDekI7YUFDQSxTQUFTLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFO1lBQ3RDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtnQkFDbkIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDakUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN2QjtRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQStCRDs7O1NBR0s7SUFDTCxJQUFJLEtBQUs7UUFDUCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7O1NBR0s7SUFDTCxJQUFJLE1BQU07UUFDUixPQUFPLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBRUQ7OztTQUdLO0lBQ0wsSUFBSSxRQUFRO1FBQ1YsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdEIsQ0FBQztJQWVEOzs7U0FHSztJQUNMLElBQUksVUFBVTtRQUNaLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksVUFBVSxDQUFDLEtBQWE7UUFDMUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRCxlQUFlO1FBQ2IsSUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7UUFFOUIsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQzFGO1FBQ0QsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUNwRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDakIsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3hCO0lBQ0gsQ0FBQztJQUVELElBQUk7UUFDRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDeEI7SUFDSCxDQUFDO0lBRUQ7OztTQUdLO0lBQ0ssZUFBZTtRQUN2QixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1NBQ3BCO1FBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxRQUFRLElBQUksU0FBUyxFQUFFLEVBQUU7WUFDeEQsT0FBTyxDQUFDLElBQUksQ0FDViw4REFBOEQ7Z0JBQzVELDBHQUEwRyxDQUM3RyxDQUFDO1NBQ0g7UUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1lBQ2xILElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDeEY7YUFBTTtZQUNMLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUNyRTtJQUNILENBQUM7SUFFUyxXQUFXO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVTLHFCQUFxQjtRQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQStCLEVBQUUsRUFBRTtZQUN4RyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFCLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDZCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQztnQkFDM0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2I7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFUyxhQUFhO1FBQ3JCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUNyRyxDQUFDO0lBRVMsbUJBQW1CO1FBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTFGLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtZQUN4RSxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVTLHFCQUFxQjtRQUM3QixPQUFPLElBQUksQ0FBQyxzQkFBc0I7YUFDL0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7YUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO2FBQ2hDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDcEMsS0FBSyxFQUFFLENBQUM7SUFDYixDQUFDO0lBRVMsc0JBQXNCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLGVBQWU7YUFDeEIsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7YUFDekIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7YUFDM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7YUFDMUIsVUFBVSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFUyxZQUFZO1FBQ3BCLE9BQU8sQ0FDTCxJQUFJLENBQUMsVUFBVTtZQUNmLElBQUksQ0FBQyxNQUFNO1lBQ1E7Z0JBQ2pCLFFBQVEsRUFBRTtvQkFDUixhQUFhLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjO2lCQUM5QzthQUNGLENBQ0YsQ0FBQztJQUNKLENBQUM7SUFFUyxvQkFBb0I7UUFDNUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQy9DLENBQUM7SUFFUyxzQkFBc0I7UUFDOUIsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO2FBQzNCLElBQUksQ0FDSCxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUMxQixTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUN6QjthQUNBLFNBQVMsQ0FBQyxDQUFDLEtBQWEsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVTLGVBQWU7UUFDdkIsS0FBSyxDQUNILElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUNwQixTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDN0c7YUFDRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQzthQUM5QixTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7U0FHSztJQUNLLGlCQUFpQixDQUFDLEtBQWE7UUFDdkMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLFFBQVEsRUFBRTtZQUN6Qzs7O2dCQUdJO1lBQ0osS0FBSyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMzQztRQUVELE1BQU0sV0FBVyxHQUFZLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRyxJQUFJLFdBQVcsRUFBRTtZQUNmLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBRTVCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7U0FDN0I7SUFDSCxDQUFDO0lBRVMsV0FBVyxDQUFDLEtBQVE7UUFDNUIsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFFN0IsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNwRyxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztZQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLFVBQVUsQ0FBQztTQUNsQztJQUNILENBQUM7SUFFRCxVQUFVLENBQUMsS0FBUTtRQUNqQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxFQUFzQjtRQUNyQyxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBRUQsaUJBQWlCLENBQUMsRUFBTztRQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsVUFBbUI7UUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsVUFBVSxDQUFDO0lBQ25DLENBQUM7SUFFUyxxQkFBcUIsQ0FBQyxLQUFhO1FBQzNDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUYsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFM0YsT0FBTyxHQUFHLElBQUksSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQzVDLENBQUM7O21IQTFTVSxxQkFBcUIsa0JBbUZ0QixXQUFXLCtSQVNSLGFBQWE7dUdBNUZmLHFCQUFxQixzSUFSckI7UUFDVDtZQUNFLE9BQU8sRUFBRSxpQkFBaUI7WUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQztZQUNwRCxLQUFLLEVBQUUsSUFBSTtTQUNaO0tBQ0Y7NEZBRVUscUJBQXFCO2tCQVZqQyxTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFNBQVMsRUFBRTt3QkFDVDs0QkFDRSxPQUFPLEVBQUUsaUJBQWlCOzRCQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQzs0QkFDcEQsS0FBSyxFQUFFLElBQUk7eUJBQ1o7cUJBQ0Y7aUJBQ0Y7OzBCQW9GSSxNQUFNOzJCQUFDLFdBQVc7OzBCQVNsQixTQUFTOzJCQUFDLGFBQWE7NENBdkZ0QixVQUFVO3NCQURiLEtBQUs7dUJBQUMsY0FBYztnQkE4QlosYUFBYTtzQkFBckIsS0FBSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIEF0dHJpYnV0ZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudFJlZixcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBpc0Rldk1vZGUsXG4gIFJlbmRlcmVyMixcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBkaXN0aW5jdFVudGlsQ2hhbmdlZCwgZmlsdGVyLCBtYXAsIHBhaXJ3aXNlLCBzdGFydFdpdGgsIHRha2VVbnRpbCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcbmltcG9ydCB7IGZyb21FdmVudCwgbWVyZ2UsIFN1YmplY3QsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE5HX1ZBTFVFX0FDQ0VTU09SIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTmJUaW1lUGlja2VyQ29tcG9uZW50IH0gZnJvbSAnLi90aW1lcGlja2VyLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOYk92ZXJsYXlSZWYsIE5iU2Nyb2xsU3RyYXRlZ3kgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9tYXBwaW5nJztcbmltcG9ydCB7XG4gIE5iQWRqdXN0YWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3ksXG4gIE5iQWRqdXN0bWVudCxcbiAgTmJQb3NpdGlvbixcbiAgTmJQb3NpdGlvbkJ1aWxkZXJTZXJ2aWNlLFxufSBmcm9tICcuLi9jZGsvb3ZlcmxheS9vdmVybGF5LXBvc2l0aW9uJztcbmltcG9ydCB7IE5iT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9vdmVybGF5LXNlcnZpY2UnO1xuaW1wb3J0IHsgTmJUcmlnZ2VyLCBOYlRyaWdnZXJTdHJhdGVneSwgTmJUcmlnZ2VyU3RyYXRlZ3lCdWlsZGVyU2VydmljZSB9IGZyb20gJy4uL2Nkay9vdmVybGF5L292ZXJsYXktdHJpZ2dlcic7XG5pbXBvcnQgeyBOYlNlbGVjdGVkVGltZVBheWxvYWQgfSBmcm9tICcuL21vZGVsJztcbmltcG9ydCB7IE5iRGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9jYWxlbmRhci1raXQvc2VydmljZXMvZGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IE5iQ2FsZW5kYXJUaW1lTW9kZWxTZXJ2aWNlIH0gZnJvbSAnLi4vY2FsZW5kYXIta2l0L3NlcnZpY2VzL2NhbGVuZGFyLXRpbWUtbW9kZWwuc2VydmljZSc7XG5pbXBvcnQgeyBOQl9ET0NVTUVOVCB9IGZyb20gJy4uLy4uL3RoZW1lLm9wdGlvbnMnO1xuXG4vKipcbiAqIFRoZSBgTmJUaW1lUGlja2VyRGlyZWN0aXZlYCBpcyBmb3JtIGNvbnRyb2wgdGhhdCBnaXZlcyB5b3UgYWJpbGl0eSB0byBzZWxlY3QgYSB0aW1lLiBUaGUgdGltZXBpY2tlclxuICogaXMgc2hvd24gd2hlbiBpbnB1dCByZWNlaXZlcyBhIGBmb2N1c2AgZXZlbnQuXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgW25iVGltZXBpY2tlcl09XCJ0aW1lcGlja2VyXCI+XG4gKiA8bmItdGltZXBpY2tlciAjdGltZXBpY2tlcj48L25iLXRpbWVwaWNrZXI+XG4gKiBgYGBcbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKFNob3djYXNlLCB0aW1lcGlja2VyL3RpbWVwaWNrZXItc2hvd2Nhc2UuY29tcG9uZW50KVxuICpcbiAqICMjIyBJbnN0YWxsYXRpb25cbiAqXG4gKiBJbXBvcnQgYE5iVGltZXBpY2tlck1vZHVsZS5mb3JSb290KClgIHRvIHlvdXIgcm9vdCBtb2R1bGUuXG4gKiBgYGB0c1xuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW1xuICogICAgIC8vIC4uLlxuICogICAgIE5iVGltZXBpY2tlck1vZHVsZS5mb3JSb290KCksXG4gKiAgIF0sXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiAqIGBgYFxuICogQW5kIGBOYlRpbWVwaWNrZXJNb2R1bGVgIHRvIHlvdXIgZmVhdHVyZSBtb2R1bGUuXG4gKiBgYGB0c1xuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW1xuICogICAgIC8vIC4uLlxuICogICAgIE5iVGltZXBpY2tlck1vZHVsZSxcbiAqICAgXSxcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgUGFnZU1vZHVsZSB7IH1cbiAqXG4gKiBgYGBcbiAqIDxkaXYgaWQ9XCJuYXRpdmUtcGFyc2UtaXNzdWVcIiBjbGFzcz1cIm5vdGUgbm90ZS13YXJuaW5nXCI+XG4gKiA8ZGl2IGNsYXNzPVwibm90ZS10aXRsZVwiPk5vdGU8L2Rpdj5cbiAqIDxkaXYgY2xhc3M9XCJub3RlLWJvZHlcIj5cbiAqIFRpbWVwaWNrZXIgdXNlcyBuYXRpdmUgRGF0ZSBvYmplY3QgYnkgZGVmYXVsdCwgd2hpY2ggZG9lc24ndCBzdXBwb3J0IHBhcnNpbmcgYnkgY3VzdG9tIGZvcm1hdC5cbiAqIEFjY29yZGluZyB0byB0aGUgRUNNQVNjcmlwdCBzcGVjaWZpY2F0aW9uLCB0aGUgb25seSBzdXBwb3J0ZWQgZm9ybWF0IGlzIGEgZm9ybWF0IGRlc2NyaWJlZCBieSBJU08gODA2MSBzdGFuZGFyZC5cbiAqIFRoaXMgc3RhbmRhcmQgcmVxdWlyZXMgZGF0ZSBwYXJ0IHRvIGJlIGluY2x1ZGVkIGluIHRoZSBkYXRlIHN0cmluZyxcbiAqIG1lYW5pbmcgeW91IGhhdmUgdG8gdHlwZSBhIGRhdGUrdGltZSBpbiB0aGUgaW5wdXQuXG4gKiBXZSBoaWdobHkgcmVjb21tZW5kIHlvdSB0byB1c2UgTmJEYXRlRm5zRGF0ZU1vZHVsZSBvciBOYk1vbWVudERhdGVNb2R1bGUgdG8gYmUgYWJsZSB0byBzdXBwb3J0IHRpbWUgb25seSBzdHJpbmdzIGluXG4gKiB0aGUgdGltZXBpY2tlciBpbnB1dHMuIFRoZXNlIG1vZHVsZXMgdXNlIGRhdGUtZm5zIGFuZCBtb21lbnQgZGF0ZSBsaWJyYXJpZXMsIHdoaWNoIHByb3ZpZGUgY2FwYWJpbGl0aWVzXG4gKiB0byBwYXJzZSB0aW1lIG9ubHkgc3RyaW5ncy5cbiAqIFNlZSBcIkZvcm1hdHRpbmcgSXNzdWVcIiBhdFxuICogPGEgaHJlZj1cImh0dHBzOi8vYWt2ZW8uZ2l0aHViLmlvL25lYnVsYXIvZG9jcy9jb21wb25lbnRzL2RhdGVwaWNrZXIvb3ZlcnZpZXcjZm9ybWF0dGluZy1pc3N1ZVwiPkRhdGUgcGlja2VyIGRvY3M8L2E+XG4gKiBmb3IgaW5zdGFsbGF0aW9uIGluc3RydWN0aW9ucy5cbiAqIDwvZGl2PlxuICogPC9kaXY+XG4gKiA8aHI+XG4gKlxuICogIyMjIFVzYWdlXG4gKlxuICogVG8gc2hvdyBzZWNvbmRzIGNvbHVtbiBhbG9uZyB3aXRoIGhvdXJzIGFuZCBtaW51dGVzIHVzZSBgd2l0aFNlY29uZHNgIGlucHV0XG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IFtuYlRpbWVwaWNrZXJdPVwidGltZXBpY2tlclwiPlxuICogPG5iLXRpbWVwaWNrZXIgI3RpbWVwaWNrZXIgd2l0aFNlY29uZHM+PC9uYi10aW1lcGlja2VyPlxuICogYGBgXG4gKiBAc3RhY2tlZC1leGFtcGxlKFRpbWUgcGlja2VyIHdpdGggc2Vjb25kcywgdGltZXBpY2tlci90aW1lcGlja2VyLXdpdGgtc2Vjb25kcy5jb21wb25lbnQpXG4gKlxuICogVG8gZm9yY2UgdGltZXBpY2tlciB3b3JrIGluIDEyIGhvdXJzIGZvcm1hdCwgdXNlIGB0d2VsdmVIb3Vyc0Zvcm1hdGAgaW5wdXQuXG4gKiBCeSBkZWZhdWx0LCB0aW1lcGlja2VyIGNob29zZSAxMiBvciAyNCBmb3JtYXRzIGJhc2VkIG9uIGFwcGxpY2F0aW9uIGxvY2FsZSBzdGFuZGFyZHNcbiAqXG4gKiBgYGBodG1sXG4gKiA8aW5wdXQgW25iVGltZXBpY2tlcl09XCJ0aW1lcGlja2VyXCIgdHdlbHZlSG91cnNGb3JtYXQ+XG4gKiA8bmItdGltZXBpY2tlciAjdGltZXBpY2tlcj48L25iLXRpbWVwaWNrZXI+XG4gKiBgYGBcbiAqXG4gKiBAc3RhY2tlZC1leGFtcGxlKFR3ZWx2ZSBob3VycyBmb3JtYXQgc2hvd2Nhc2UsIHRpbWVwaWNrZXIvdGltZXBpY2tlci10d2VsdmUtaG91cnMtZm9ybWF0LmNvbXBvbmVudClcbiAqXG4gKiBBIHNpbmdsZSBjb2x1bW4gcGlja2VyIHdpdGggb3B0aW9ucyB2YWx1ZSBhcyB0aW1lIGFuZCBtaW51dGUsIHNvIHVzZXJzIHdvbuKAmXQgYmUgYWJsZSB0byBwaWNrXG4gKiBob3VycyBhbmQgbWludXRlcyBpbmRpdmlkdWFsbHkuXG4gKiBZb3UgY2FuIGNvbnRyb2wgb3B0aW9ucyBtaW51dGVzIG9mZnNldCB2aWEgYHN0ZXBgIGlucHV0LCBlLmcuOiAxMTowMCwgMTE6MjAsIDExOjQwLi4uJ1xuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoU2luZ2xlIGNvbHVtbiwgdGltZXBpY2tlci90aW1lcGlja2VyLXNpbmdsZS1jb2x1bW4uY29tcG9uZW50KVxuICpcbiAqIFRpbWVwaWNrZXIgc3VwcG9ydCBmb3JtcyBhbmQgcmVhY3RpdmUgZm9ybXMgQVBJIHNvIHlvdSBjYW4gcHJvdmlkZSB2YWx1ZSB1c2luZyBgZm9ybUNvbnRyb2xgIGFuZCBgbmdNb2RlbGAgZGlyZWN0aXZlc1xuICogQHN0YWNrZWQtZXhhbXBsZShGb3JtIGNvbnRyb2wsIHRpbWVwaWNrZXIvdGltZXBpY2tlci1mb3JtLWNvbnRyb2wuY29tcG9uZW50KVxuICpcbiAqIDxpbnB1dCBbbmJUaW1lcGlja2VyXT1cInRpbWVwaWNrZXJcIiB0d2VsdmVIb3Vyc0Zvcm1hdD5cbiAqIDxuYi10aW1lcGlja2VyICN0aW1lcGlja2UgW2Zvcm1Db250cm9sXT1cImZvcm1Db250cm9sXCI+PC9uYi10aW1lcGlja2VyPlxuICpcbiAqIEBzdGFja2VkLWV4YW1wbGUoTmdNb2RlbCwgdGltZXBpY2tlci90aW1lcGlja2VyLW5nLW1vZGVsLmNvbXBvbmVudClcbiAqXG4gKiA8aW5wdXQgW25iVGltZXBpY2tlcl09XCJ0aW1lcGlja2VyXCIgdHdlbHZlSG91cnNGb3JtYXQ+XG4gKiA8bmItdGltZXBpY2tlciAjdGltZXBpY2tlIFtuZ01vZGVsXT1cImRhdGVcIj48L25iLXRpbWVwaWNrZXI+XG4gKlxuICogWW91IGNhbiBwcm92aWRlIGxvY2FsaXplZCB2ZXJzaW9ucyBvZiB0aGUgdGltZXBpY2tlciB0ZXh0IHZpYSB0aGUgYGxvY2FsaXphdGlvbmAgcHJvcGVydHkgb2YgdGhlIGNvbmZpZ1xuICogb2JqZWN0IHBhc3NlZCB0byB0aGUgYGZvclJvb3RgIG9yIGBmb3JDaGlsZGAgbWV0aG9kcyBvZiB0aGUgYE5iVGltZXBpY2tlck1vZHVsZWA6XG4gKiBgYGB0c1xuICogQE5nTW9kdWxlKHtcbiAqICAgaW1wb3J0czogW1xuICogICAgIC8vIC4uLlxuICogICAgIE5iVGltZXBpY2tlck1vZHVsZS5mb3JSb290KHtcbiAqICAgICAgIGxvY2FsaXphdGlvbjoge1xuICogICAgICAgICBob3Vyc1RleHQ6ICdIcicsXG4gKiAgICAgICAgIG1pbnV0ZXNUZXh0OiAnTWluJyxcbiAqICAgICAgICAgc2Vjb25kc1RleHQ6ICdTZWMnLFxuICogICAgICAgICBhbXBtVGV4dDogJ0FtL1BtJyxcbiAqICAgICAgIH1cbiAqICAgICB9KSxcbiAqICAgXSxcbiAqIH0pXG4gKiBleHBvcnQgY2xhc3MgQXBwTW9kdWxlIHsgfVxuICogYGBgXG4gKlxuICogQHN0eWxlc1xuICpcbiAqIHRpbWVwaWNrZXItY2VsbC10ZXh0LWNvbG9yOlxuICogdGltZXBpY2tlci1jZWxsLWhvdmVyLWJhY2tncm91bmQtY29sb3I6XG4gKiB0aW1lcGlja2VyLWNlbGwtaG92ZXItdGV4dC1jb2xvcjpcbiAqIHRpbWVwaWNrZXItY2VsbC1mb2N1cy1iYWNrZ3JvdW5kLWNvbG9yOlxuICogdGltZXBpY2tlci1jZWxsLWZvY3VzLXRleHQtY29sb3I6XG4gKiB0aW1lcGlja2VyLWNlbGwtYWN0aXZlLWJhY2tncm91bmQtY29sb3I6XG4gKiB0aW1lcGlja2VyLWNlbGwtYWN0aXZlLXRleHQtY29sb3I6XG4gKiB0aW1lcGlja2VyLWNlbGwtdGV4dC1mb250LXNpemU6XG4gKiB0aW1lcGlja2VyLWNlbGwtdGV4dC1mb250LWZhbWlseTpcbiAqIHRpbWVwaWNrZXItY2VsbC10ZXh0LWxpbmUtaGVpZ2h0OlxuICogdGltZXBpY2tlci1jZWxsLXRleHQtZm9udC13ZWlnaHQ6XG4gKiB0aW1lcGlja2VyLWNlbGwtaGVpZ2h0OlxuICogdGltZXBpY2tlci1oZWFkZXItY2VsbC10ZXh0LWNvbG9yOlxuICogdGltZXBpY2tlci1oZWFkZXItY2VsbC10ZXh0LWZvbnQtc2l6ZTpcbiAqIHRpbWVwaWNrZXItaGVhZGVyLWNlbGwtdGV4dC1mb250LWZhbWlseTpcbiAqIHRpbWVwaWNrZXItaGVhZGVyLWNlbGwtaGVpZ2h0OlxuICogdGltZXBpY2tlci1oZWFkZXItY2VsbC10ZXh0LWxpbmUtaGVpZ2h0OlxuICogdGltZXBpY2tlci1oZWFkZXItY2VsbC10ZXh0LWZvbnQtd2VpZ2h0OlxuICogdGltZXBpY2tlci1ib3JkZXItY29sb3I6XG4gKiB0aW1lcGlja2VyLWJvcmRlci1zdHlsZTpcbiAqIHRpbWVwaWNrZXItYm9yZGVyLXdpZHRoOlxuICogdGltZXBpY2tlci1zY3JvbGxiYXItY29sb3I6XG4gKiB0aW1lcGlja2VyLXNjcm9sbGJhci1iYWNrZ3JvdW5kLWNvbG9yOlxuICogdGltZXBpY2tlci1zY3JvbGxiYXItd2lkdGg6XG4gKiB0aW1lcGlja2VyLXNpbmdsZS1jb2x1bW4td2lkdGg6XG4gKiB0aW1lcGlja2VyLW11bHRpcGxlLWNvbHVtbi13aWR0aDpcbiAqIHRpbWVwaWNrZXItdGl0bGUtaGVpZ2h0OlxuICogdGltZXBpY2tlci10aXRsZS1wYWRkaW5nOlxuICogdGltZXBpY2tlci1jb250YWluZXItd2lkdGg6XG4gKiB0aW1lcGlja2VyLWNvbnRhaW5lci1oZWlnaHQ6XG4gKiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnaW5wdXRbbmJUaW1lcGlja2VyXScsXG4gIHByb3ZpZGVyczogW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxuICAgICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gTmJUaW1lUGlja2VyRGlyZWN0aXZlKSxcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgIH0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIE5iVGltZVBpY2tlckRpcmVjdGl2ZTxEPiBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgLyoqXG4gICAqIFByb3ZpZGVzIHRpbWVwaWNrZXIgY29tcG9uZW50LlxuICAgKiAqL1xuICBASW5wdXQoJ25iVGltZXBpY2tlcicpXG4gIGdldCB0aW1lcGlja2VyKCk6IE5iVGltZVBpY2tlckNvbXBvbmVudDxEPiB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWVQaWNrZXJDb21wb25lbnQ7XG4gIH1cblxuICBzZXQgdGltZXBpY2tlcih0aW1lUGlja2VyOiBOYlRpbWVQaWNrZXJDb21wb25lbnQ8RD4pIHtcbiAgICB0aGlzLl90aW1lUGlja2VyQ29tcG9uZW50ID0gdGltZVBpY2tlcjtcblxuICAgIHRoaXMucGlja2VySW5wdXRzQ2hhbmdlZFN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgICB0aGlzLnBpY2tlcklucHV0c0NoYW5nZWRTdWJzY3JpcHRpb24gPSB0aGlzLl90aW1lUGlja2VyQ29tcG9uZW50LnRpbWVwaWNrZXJGb3JtYXRDaGFuZ2UkXG4gICAgICAucGlwZShcbiAgICAgICAgbWFwKCgpID0+IHRoaXMuX3RpbWVQaWNrZXJDb21wb25lbnQuY29tcHV0ZWRUaW1lRm9ybWF0KSxcbiAgICAgICAgc3RhcnRXaXRoKHRoaXMuX3RpbWVQaWNrZXJDb21wb25lbnQuY29tcHV0ZWRUaW1lRm9ybWF0KSxcbiAgICAgICAgZGlzdGluY3RVbnRpbENoYW5nZWQoKSxcbiAgICAgICAgcGFpcndpc2UoKSxcbiAgICAgICAgdGFrZVVudGlsKHRoaXMuZGVzdHJveSQpLFxuICAgICAgKVxuICAgICAgLnN1YnNjcmliZSgoW3ByZXZGb3JtYXQsIG5leHRGb3JtYXRdKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmlucHV0VmFsdWUpIHtcbiAgICAgICAgICBjb25zdCBkYXRlID0gdGhpcy5kYXRlU2VydmljZS5wYXJzZSh0aGlzLmlucHV0VmFsdWUsIHByZXZGb3JtYXQpO1xuICAgICAgICAgIHRoaXMud3JpdGVWYWx1ZShkYXRlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cbiAgcHJvdGVjdGVkIF90aW1lUGlja2VyQ29tcG9uZW50OiBOYlRpbWVQaWNrZXJDb21wb25lbnQ8RD47XG4gIHByb3RlY3RlZCBwaWNrZXJJbnB1dHNDaGFuZ2VkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb24gfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIFRpbWUgcGlja2VyIG92ZXJsYXkgb2Zmc2V0LlxuICAgKiAqL1xuICBASW5wdXQoKSBvdmVybGF5T2Zmc2V0ID0gODtcblxuICAvKipcbiAgICogU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGxhdGVzdCBzZWxlY3RlZCBkYXRlLlxuICAgKiBVcGRhdGVkIHdoZW4gdmFsdWUgaXMgdXBkYXRlZCBwcm9ncmFtbWF0aWNhbGx5ICh3cml0ZVZhbHVlKSwgdmlhIHRpbWVwaWNrZXIgKHN1YnNjcmliZU9uQXBwbHlDbGljaylcbiAgICogb3IgdmlhIGlucHV0IGZpZWxkIChoYW5kbGVJbnB1dENoYW5nZSlcbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgcHJvdGVjdGVkIGxhc3RJbnB1dFZhbHVlOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBQb3NpdGlvbmluZyBzdHJhdGVneSB1c2VkIGJ5IG92ZXJsYXkuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogKi9cbiAgcHJvdGVjdGVkIHBvc2l0aW9uU3RyYXRlZ3k6IE5iQWRqdXN0YWJsZUNvbm5lY3RlZFBvc2l0aW9uU3RyYXRlZ3k7XG4gIHByb3RlY3RlZCBvdmVybGF5UmVmOiBOYk92ZXJsYXlSZWY7XG4gIHByb3RlY3RlZCBkZXN0cm95JDogU3ViamVjdDx2b2lkPiA9IG5ldyBTdWJqZWN0PHZvaWQ+KCk7XG4gIHByb3RlY3RlZCBvbkNoYW5nZTogKHZhbHVlOiBEKSA9PiB2b2lkID0gKCkgPT4ge307XG4gIHByb3RlY3RlZCBvblRvdWNoZWQgPSAoKSA9PiB7fTtcbiAgLyoqXG4gICAqIFRyaWdnZXIgc3RyYXRlZ3kgdXNlZCBieSBvdmVybGF5LlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqICovXG4gIHByb3RlY3RlZCB0cmlnZ2VyU3RyYXRlZ3k6IE5iVHJpZ2dlclN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGh0bWwgaW5wdXQgZWxlbWVudC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiAqL1xuICBnZXQgaW5wdXQoKTogSFRNTElucHV0RWxlbWVudCB7XG4gICAgcmV0dXJuIHRoaXMuaG9zdFJlZi5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaXMgdGltZXBpY2tlciBvdmVybGF5IG9wZW5lZC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiAqL1xuICBnZXQgaXNPcGVuKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm92ZXJsYXlSZWYgJiYgdGhpcy5vdmVybGF5UmVmLmhhc0F0dGFjaGVkKCk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lcyBpcyB0aW1lcGlja2VyIG92ZXJsYXkgY2xvc2VkLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqICovXG4gIGdldCBpc0Nsb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gIXRoaXMuaXNPcGVuO1xuICB9XG5cbiAgY29uc3RydWN0b3IoXG4gICAgQEluamVjdChOQl9ET0NVTUVOVCkgcHJvdGVjdGVkIGRvY3VtZW50LFxuICAgIHByb3RlY3RlZCBwb3NpdGlvbkJ1aWxkZXI6IE5iUG9zaXRpb25CdWlsZGVyU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgaG9zdFJlZjogRWxlbWVudFJlZixcbiAgICBwcm90ZWN0ZWQgdHJpZ2dlclN0cmF0ZWd5QnVpbGRlcjogTmJUcmlnZ2VyU3RyYXRlZ3lCdWlsZGVyU2VydmljZSxcbiAgICBwcm90ZWN0ZWQgb3ZlcmxheTogTmJPdmVybGF5U2VydmljZSxcbiAgICBwcm90ZWN0ZWQgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByb3RlY3RlZCBjYWxlbmRhclRpbWVNb2RlbFNlcnZpY2U6IE5iQ2FsZW5kYXJUaW1lTW9kZWxTZXJ2aWNlPEQ+LFxuICAgIHByb3RlY3RlZCBkYXRlU2VydmljZTogTmJEYXRlU2VydmljZTxEPixcbiAgICBwcm90ZWN0ZWQgcmVuZGVyZXI6IFJlbmRlcmVyMixcbiAgICBAQXR0cmlidXRlKCdwbGFjZWhvbGRlcicpIHByb3RlY3RlZCBwbGFjZWhvbGRlcjogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaG9zdCBpbnB1dCB2YWx1ZS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiAqL1xuICBnZXQgaW5wdXRWYWx1ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmlucHV0LnZhbHVlO1xuICB9XG5cbiAgc2V0IGlucHV0VmFsdWUodmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuaW5wdXQudmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLnN1YnNjcmliZU9uSW5wdXRDaGFuZ2UoKTtcblxuICAgIGlmICghdGhpcy5wbGFjZWhvbGRlcikge1xuICAgICAgdGhpcy5yZW5kZXJlci5zZXRQcm9wZXJ0eSh0aGlzLmlucHV0LCAncGxhY2Vob2xkZXInLCB0aGlzLnRpbWVwaWNrZXIuY29tcHV0ZWRUaW1lRm9ybWF0KTtcbiAgICB9XG4gICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kgPSB0aGlzLmNyZWF0ZVRyaWdnZXJTdHJhdGVneSgpO1xuICAgIHRoaXMuc3Vic2NyaWJlT25UcmlnZ2VycygpO1xuICAgIHRoaXMuc3Vic2NyaWJlVG9CbHVyKCk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIGlmICh0aGlzLmlzQ2xvc2VkKSB7XG4gICAgICB0aGlzLmF0dGFjaFRvT3ZlcmxheSgpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGUoKSB7XG4gICAgaWYgKHRoaXMuaXNPcGVuKSB7XG4gICAgICB0aGlzLm92ZXJsYXlSZWYuZGV0YWNoKCk7XG4gICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBdHRhY2hlcyBwaWNrZXIgdG8gdGhlIHRpbWVwaWNrZXIgcG9ydGFsLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqICovXG4gIHByb3RlY3RlZCBhdHRhY2hUb092ZXJsYXkoKSB7XG4gICAgaWYgKCF0aGlzLm92ZXJsYXlSZWYpIHtcbiAgICAgIHRoaXMuc2V0dXBUaW1lcGlja2VyKCk7XG4gICAgICB0aGlzLmluaXRPdmVybGF5KCk7XG4gICAgfVxuICAgIHRoaXMub3ZlcmxheVJlZi5hdHRhY2godGhpcy50aW1lcGlja2VyLnBvcnRhbCk7XG4gIH1cblxuICBzZXR1cFRpbWVwaWNrZXIoKSB7XG4gICAgaWYgKHRoaXMuZGF0ZVNlcnZpY2UuZ2V0SWQoKSA9PT0gJ25hdGl2ZScgJiYgaXNEZXZNb2RlKCkpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ0RhdGUucGFyc2UgZG9lcyBub3Qgc3VwcG9ydCBwYXJzaW5nIHRpbWUgd2l0aCBjdXN0b20gZm9ybWF0LicgK1xuICAgICAgICAgICcgU2VlIGRldGFpbHMgaGVyZSBodHRwczovL2FrdmVvLmdpdGh1Yi5pby9uZWJ1bGFyL2RvY3MvY29tcG9uZW50cy9kYXRlcGlja2VyL292ZXJ2aWV3I25hdGl2ZS1wYXJzZS1pc3N1ZScsXG4gICAgICApO1xuICAgIH1cbiAgICB0aGlzLnRpbWVwaWNrZXIuc2V0SG9zdCh0aGlzLmhvc3RSZWYpO1xuICAgIGlmICh0aGlzLmlucHV0VmFsdWUpIHtcbiAgICAgIGNvbnN0IHZhbCA9IHRoaXMuZGF0ZVNlcnZpY2UuZ2V0SWQoKSA9PT0gJ25hdGl2ZScgPyB0aGlzLnBhcnNlTmF0aXZlRGF0ZVN0cmluZyh0aGlzLmlucHV0VmFsdWUpIDogdGhpcy5pbnB1dFZhbHVlO1xuICAgICAgdGhpcy50aW1lcGlja2VyLmRhdGUgPSB0aGlzLmRhdGVTZXJ2aWNlLnBhcnNlKHZhbCwgdGhpcy50aW1lcGlja2VyLmNvbXB1dGVkVGltZUZvcm1hdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGltZXBpY2tlci5kYXRlID0gdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UuZ2V0UmVzZXRUaW1lKCk7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGluaXRPdmVybGF5KCkge1xuICAgIHRoaXMucG9zaXRpb25TdHJhdGVneSA9IHRoaXMuY3JlYXRlUG9zaXRpb25TdHJhdGVneSgpO1xuICAgIHRoaXMuc3Vic2NyaWJlT25BcHBseUNsaWNrKCk7XG4gICAgdGhpcy5jcmVhdGVPdmVybGF5KCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Vic2NyaWJlT25BcHBseUNsaWNrKCkge1xuICAgIHRoaXMudGltZXBpY2tlci5vblNlbGVjdFRpbWUucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpLnN1YnNjcmliZSgodmFsdWU6IE5iU2VsZWN0ZWRUaW1lUGF5bG9hZDxEPikgPT4ge1xuICAgICAgY29uc3QgdGltZSA9IHRoaXMuZGF0ZVNlcnZpY2UuZm9ybWF0KHZhbHVlLnRpbWUsIHRoaXMudGltZXBpY2tlci5jb21wdXRlZFRpbWVGb3JtYXQpLnRvVXBwZXJDYXNlKCk7XG4gICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aW1lO1xuICAgICAgdGhpcy50aW1lcGlja2VyLmRhdGUgPSB2YWx1ZS50aW1lO1xuICAgICAgdGhpcy5vbkNoYW5nZSh2YWx1ZS50aW1lKTtcbiAgICAgIGlmICh2YWx1ZS5zYXZlKSB7XG4gICAgICAgIHRoaXMubGFzdElucHV0VmFsdWUgPSB0aW1lO1xuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBjcmVhdGVPdmVybGF5KCkge1xuICAgIGNvbnN0IHNjcm9sbFN0cmF0ZWd5ID0gdGhpcy5jcmVhdGVTY3JvbGxTdHJhdGVneSgpO1xuICAgIHRoaXMub3ZlcmxheVJlZiA9IHRoaXMub3ZlcmxheS5jcmVhdGUoeyBwb3NpdGlvblN0cmF0ZWd5OiB0aGlzLnBvc2l0aW9uU3RyYXRlZ3ksIHNjcm9sbFN0cmF0ZWd5IH0pO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uVHJpZ2dlcnMoKSB7XG4gICAgdGhpcy50cmlnZ2VyU3RyYXRlZ3kuc2hvdyQucGlwZShmaWx0ZXIoKCkgPT4gdGhpcy5pc0Nsb3NlZCkpLnN1YnNjcmliZSgoKSA9PiB0aGlzLnNob3coKSk7XG5cbiAgICB0aGlzLnRyaWdnZXJTdHJhdGVneS5oaWRlJC5waXBlKGZpbHRlcigoKSA9PiB0aGlzLmlzT3BlbikpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aGlzLmxhc3RJbnB1dFZhbHVlIHx8ICcnO1xuICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgY3JlYXRlVHJpZ2dlclN0cmF0ZWd5KCk6IE5iVHJpZ2dlclN0cmF0ZWd5IHtcbiAgICByZXR1cm4gdGhpcy50cmlnZ2VyU3RyYXRlZ3lCdWlsZGVyXG4gICAgICAudHJpZ2dlcihOYlRyaWdnZXIuRk9DVVMpXG4gICAgICAuaG9zdCh0aGlzLmhvc3RSZWYubmF0aXZlRWxlbWVudClcbiAgICAgIC5jb250YWluZXIoKCkgPT4gdGhpcy5nZXRDb250YWluZXIoKSlcbiAgICAgIC5idWlsZCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVBvc2l0aW9uU3RyYXRlZ3koKTogTmJBZGp1c3RhYmxlQ29ubmVjdGVkUG9zaXRpb25TdHJhdGVneSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb25CdWlsZGVyXG4gICAgICAuY29ubmVjdGVkVG8odGhpcy5ob3N0UmVmKVxuICAgICAgLnBvc2l0aW9uKE5iUG9zaXRpb24uQk9UVE9NKVxuICAgICAgLm9mZnNldCh0aGlzLm92ZXJsYXlPZmZzZXQpXG4gICAgICAuYWRqdXN0bWVudChOYkFkanVzdG1lbnQuQ09VTlRFUkNMT0NLV0lTRSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0Q29udGFpbmVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm92ZXJsYXlSZWYgJiZcbiAgICAgIHRoaXMuaXNPcGVuICYmXG4gICAgICA8Q29tcG9uZW50UmVmPGFueT4+e1xuICAgICAgICBsb2NhdGlvbjoge1xuICAgICAgICAgIG5hdGl2ZUVsZW1lbnQ6IHRoaXMub3ZlcmxheVJlZi5vdmVybGF5RWxlbWVudCxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGNyZWF0ZVNjcm9sbFN0cmF0ZWd5KCk6IE5iU2Nyb2xsU3RyYXRlZ3kge1xuICAgIHJldHVybiB0aGlzLm92ZXJsYXkuc2Nyb2xsU3RyYXRlZ2llcy5ibG9jaygpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN1YnNjcmliZU9uSW5wdXRDaGFuZ2UoKSB7XG4gICAgZnJvbUV2ZW50KHRoaXMuaW5wdXQsICdpbnB1dCcpXG4gICAgICAucGlwZShcbiAgICAgICAgbWFwKCgpID0+IHRoaXMuaW5wdXRWYWx1ZSksXG4gICAgICAgIHRha2VVbnRpbCh0aGlzLmRlc3Ryb3kkKSxcbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKHZhbHVlOiBzdHJpbmcpID0+IHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UodmFsdWUpKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzdWJzY3JpYmVUb0JsdXIoKSB7XG4gICAgbWVyZ2UoXG4gICAgICB0aGlzLnRpbWVwaWNrZXIuYmx1cixcbiAgICAgIGZyb21FdmVudCh0aGlzLmlucHV0LCAnYmx1cicpLnBpcGUoZmlsdGVyKCgpID0+ICF0aGlzLmlzT3BlbiAmJiB0aGlzLmRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRoaXMuaW5wdXQpKSxcbiAgICApXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95JCkpXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMub25Ub3VjaGVkKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBpbnB1dCB2YWx1ZSBhbmQgd3JpdGUgaWYgaXQgaXNuJ3QgbnVsbC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiAqL1xuICBwcm90ZWN0ZWQgaGFuZGxlSW5wdXRDaGFuZ2UodmFsdWU6IHN0cmluZykge1xuICAgIGlmICh0aGlzLmRhdGVTZXJ2aWNlLmdldElkKCkgPT09ICduYXRpdmUnKSB7XG4gICAgICAvKipcbiAgICAgICAqIE5hdGl2ZSBkYXRlIHNlcnZpY2UgZG9udCBwYXJzZSBvbmx5IHRpbWUgc3RyaW5nIHZhbHVlLFxuICAgICAgICogYW5kIHdlIGFkZGluZyB5ZWFyIG1vdXRoIGFuZCBkYXkgdG8gY29udmVydCBzdHJpbmcgdG8gdmFsaWQgZGF0ZSBmb3JtYXRcbiAgICAgICAqKi9cbiAgICAgIHZhbHVlID0gdGhpcy5wYXJzZU5hdGl2ZURhdGVTdHJpbmcodmFsdWUpO1xuICAgIH1cblxuICAgIGNvbnN0IGlzVmFsaWREYXRlOiBib29sZWFuID0gdGhpcy5kYXRlU2VydmljZS5pc1ZhbGlkRGF0ZVN0cmluZyh2YWx1ZSwgdGhpcy50aW1lcGlja2VyLmNvbXB1dGVkVGltZUZvcm1hdCk7XG4gICAgaWYgKGlzVmFsaWREYXRlKSB7XG4gICAgICB0aGlzLmxhc3RJbnB1dFZhbHVlID0gdmFsdWU7XG5cbiAgICAgIGNvbnN0IGRhdGUgPSB0aGlzLmRhdGVTZXJ2aWNlLnBhcnNlKHZhbHVlLCB0aGlzLnRpbWVwaWNrZXIuY29tcHV0ZWRUaW1lRm9ybWF0KTtcbiAgICAgIHRoaXMub25DaGFuZ2UoZGF0ZSk7XG4gICAgICB0aGlzLnRpbWVwaWNrZXIuZGF0ZSA9IGRhdGU7XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIHVwZGF0ZVZhbHVlKHZhbHVlOiBEKSB7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLnRpbWVwaWNrZXIuZGF0ZSA9IHZhbHVlO1xuXG4gICAgICBjb25zdCB0aW1lU3RyaW5nID0gdGhpcy5kYXRlU2VydmljZS5mb3JtYXQodmFsdWUsIHRoaXMudGltZXBpY2tlci5jb21wdXRlZFRpbWVGb3JtYXQpLnRvVXBwZXJDYXNlKCk7XG4gICAgICB0aGlzLmlucHV0VmFsdWUgPSB0aW1lU3RyaW5nO1xuICAgICAgdGhpcy5sYXN0SW5wdXRWYWx1ZSA9IHRpbWVTdHJpbmc7XG4gICAgfVxuICB9XG5cbiAgd3JpdGVWYWx1ZSh2YWx1ZTogRCk6IHZvaWQge1xuICAgIHRoaXMudXBkYXRlVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgcmVnaXN0ZXJPbkNoYW5nZShmbjogKHZhbHVlOiBhbnkpID0+IHt9KTogdm9pZCB7XG4gICAgdGhpcy5vbkNoYW5nZSA9IGZuO1xuICB9XG5cbiAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IGFueSk6IHZvaWQge1xuICAgIHRoaXMub25Ub3VjaGVkID0gZm47XG4gIH1cblxuICBzZXREaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLmlucHV0LmRpc2FibGVkID0gaXNEaXNhYmxlZDtcbiAgfVxuXG4gIHByb3RlY3RlZCBwYXJzZU5hdGl2ZURhdGVTdHJpbmcodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZGF0ZSA9IHRoaXMuZGF0ZVNlcnZpY2UudG9kYXkoKTtcbiAgICBjb25zdCB5ZWFyID0gdGhpcy5kYXRlU2VydmljZS5nZXRZZWFyKGRhdGUpO1xuICAgIGNvbnN0IG1vbnRoID0gdGhpcy5jYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UucGFkZFRvVHdvU3ltYm9scyh0aGlzLmRhdGVTZXJ2aWNlLmdldE1vbnRoKGRhdGUpKTtcbiAgICBjb25zdCBkYXkgPSB0aGlzLmNhbGVuZGFyVGltZU1vZGVsU2VydmljZS5wYWRkVG9Ud29TeW1ib2xzKHRoaXMuZGF0ZVNlcnZpY2UuZ2V0RGF0ZShkYXRlKSk7XG5cbiAgICByZXR1cm4gYCR7eWVhcn0tJHttb250aH0tJHtkYXl9ICR7dmFsdWV9YDtcbiAgfVxufVxuIl19