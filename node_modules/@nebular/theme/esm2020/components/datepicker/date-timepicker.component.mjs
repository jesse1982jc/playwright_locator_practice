import { ChangeDetectionStrategy, Component, Inject, Input, Optional, Output, } from '@angular/core';
import { convertToBoolProperty } from '../helpers';
import { NB_DOCUMENT } from '../../theme.options';
import { NbCalendarWithTimeComponent } from './calendar-with-time.component';
import { NbBasePickerComponent } from './datepicker.component';
import { NB_DATE_SERVICE_OPTIONS } from './datepicker.directive';
import * as i0 from "@angular/core";
import * as i1 from "../cdk/overlay/overlay-position";
import * as i2 from "../cdk/overlay/overlay-trigger";
import * as i3 from "../cdk/overlay/overlay-service";
import * as i4 from "../calendar-kit/services/date.service";
import * as i5 from "../calendar-kit/services/calendar-time-model.service";
/**
 * The DateTimePicker component itself.
 * Provides a proxy to `NbCalendarWithTimeComponent` options as well as custom picker options.
 */
export class NbDateTimePickerComponent extends NbBasePickerComponent {
    constructor(document, positionBuilder, triggerStrategyBuilder, overlay, cfr, dateService, dateServiceOptions, calendarWithTimeModelService) {
        super(document, positionBuilder, triggerStrategyBuilder, overlay, cfr, dateService, dateServiceOptions);
        this.calendarWithTimeModelService = calendarWithTimeModelService;
        this.pickerClass = NbCalendarWithTimeComponent;
        this.showCurrentTimeButton = true;
        this._showAmPmLabel = true;
    }
    get value() {
        return this.picker ? this.picker.date : undefined;
    }
    set value(date) {
        if (!this.picker) {
            this.queue = date;
            return;
        }
        if (date) {
            this.visibleDate = date;
            this.picker.visibleDate = date;
            this.picker.date = date;
            this.picker.cd.markForCheck();
        }
    }
    /**
     * Defines 12 hours format like '07:00 PM'.
     * */
    get twelveHoursFormat() {
        return this._twelveHoursFormat;
    }
    set twelveHoursFormat(value) {
        this._twelveHoursFormat = convertToBoolProperty(value);
    }
    /**
     * Defines should show am/pm label if twelveHoursFormat enabled.
     * */
    get showAmPmLabel() {
        return this._showAmPmLabel;
    }
    set showAmPmLabel(value) {
        this._showAmPmLabel = convertToBoolProperty(value);
    }
    /**
     * Show seconds in timepicker.
     * Ignored when singleColumn is true.
     * */
    get withSeconds() {
        return this._withSeconds;
    }
    set withSeconds(value) {
        this._withSeconds = convertToBoolProperty(value);
    }
    /**
     * Show timepicker values in one column with 60 minutes step by default.
     * */
    get singleColumn() {
        return this._singleColumn;
    }
    set singleColumn(value) {
        this._singleColumn = convertToBoolProperty(value);
    }
    /**
     * Emits date with time when selected.
     * */
    get dateTimeChange() {
        return this.valueChange;
    }
    ngOnInit() {
        this.format = this.format || this.buildTimeFormat();
        this.init$.next();
    }
    patchWithInputs() {
        this.picker.singleColumn = this.singleColumn;
        this.picker.twelveHoursFormat = this.twelveHoursFormat;
        this.picker.showAmPmLabel = this.showAmPmLabel;
        this.picker.withSeconds = this.withSeconds;
        this.picker.step = this.step;
        this.picker.title = this.title;
        this.picker.applyButtonText = this.applyButtonText;
        this.picker.currentTimeButtonText = this.currentTimeButtonText;
        this.picker.showCurrentTimeButton = this.showCurrentTimeButton;
        if (this.twelveHoursFormat) {
            this.picker.timeFormat = this.dateService.getTwelveHoursFormat();
        }
        else {
            this.picker.timeFormat =
                this.withSeconds && !this.singleColumn
                    ? this.dateService.getTwentyFourHoursFormatWithSeconds()
                    : this.dateService.getTwentyFourHoursFormat();
        }
        super.patchWithInputs();
        this.picker.cd.markForCheck();
    }
    get pickerValueChange() {
        return this.picker.dateChange;
    }
    writeQueue() {
        if (this.queue) {
            const date = this.queue;
            this.queue = null;
            this.value = date;
        }
    }
    buildTimeFormat() {
        if (this.singleColumn) {
            return this.calendarWithTimeModelService.buildDateFormat(this.twelveHoursFormat);
        }
        else {
            return this.calendarWithTimeModelService.buildDateFormat(this.twelveHoursFormat, this.withSeconds);
        }
    }
}
NbDateTimePickerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDateTimePickerComponent, deps: [{ token: NB_DOCUMENT }, { token: i1.NbPositionBuilderService }, { token: i2.NbTriggerStrategyBuilderService }, { token: i3.NbOverlayService }, { token: i0.ComponentFactoryResolver }, { token: i4.NbDateService }, { token: NB_DATE_SERVICE_OPTIONS, optional: true }, { token: i5.NbCalendarTimeModelService }], target: i0.ɵɵFactoryTarget.Component });
NbDateTimePickerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "14.2.12", type: NbDateTimePickerComponent, selector: "nb-date-timepicker", inputs: { step: "step", title: "title", applyButtonText: "applyButtonText", currentTimeButtonText: "currentTimeButtonText", showCurrentTimeButton: "showCurrentTimeButton", twelveHoursFormat: "twelveHoursFormat", showAmPmLabel: "showAmPmLabel", withSeconds: "withSeconds", singleColumn: "singleColumn" }, outputs: { dateTimeChange: "dateTimeChange" }, usesInheritance: true, ngImport: i0, template: '', isInline: true, changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.2.12", ngImport: i0, type: NbDateTimePickerComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'nb-date-timepicker',
                    template: '',
                    changeDetection: ChangeDetectionStrategy.OnPush,
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [NB_DOCUMENT]
                }] }, { type: i1.NbPositionBuilderService }, { type: i2.NbTriggerStrategyBuilderService }, { type: i3.NbOverlayService }, { type: i0.ComponentFactoryResolver }, { type: i4.NbDateService }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [NB_DATE_SERVICE_OPTIONS]
                }] }, { type: i5.NbCalendarTimeModelService }]; }, propDecorators: { step: [{
                type: Input
            }], title: [{
                type: Input
            }], applyButtonText: [{
                type: Input
            }], currentTimeButtonText: [{
                type: Input
            }], showCurrentTimeButton: [{
                type: Input
            }], twelveHoursFormat: [{
                type: Input
            }], showAmPmLabel: [{
                type: Input
            }], withSeconds: [{
                type: Input
            }], singleColumn: [{
                type: Input
            }], dateTimeChange: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZS10aW1lcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9mcmFtZXdvcmsvdGhlbWUvY29tcG9uZW50cy9kYXRlcGlja2VyL2RhdGUtdGltZXBpY2tlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixTQUFTLEVBR1QsTUFBTSxFQUNOLEtBQUssRUFFTCxRQUFRLEVBQ1IsTUFBTSxHQUVQLE1BQU0sZUFBZSxDQUFDO0FBR3ZCLE9BQU8sRUFBRSxxQkFBcUIsRUFBa0IsTUFBTSxZQUFZLENBQUM7QUFDbkUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBTWxELE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQy9ELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHdCQUF3QixDQUFDOzs7Ozs7O0FBRWpFOzs7R0FHRztBQU1ILE1BQU0sT0FBTyx5QkFDWCxTQUFRLHFCQUEyRDtJQTZGbkUsWUFDdUIsUUFBUSxFQUM3QixlQUF5QyxFQUN6QyxzQkFBdUQsRUFDdkQsT0FBeUIsRUFDekIsR0FBNkIsRUFDN0IsV0FBNkIsRUFDZ0Isa0JBQWtCLEVBQ3JELDRCQUEyRDtRQUVyRSxLQUFLLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxzQkFBc0IsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBRjlGLGlDQUE0QixHQUE1Qiw0QkFBNEIsQ0FBK0I7UUFsRzdELGdCQUFXLEdBQXlDLDJCQUEyQixDQUFDO1FBNEJqRiwwQkFBcUIsR0FBRyxJQUFJLENBQUM7UUF5QjVCLG1CQUFjLEdBQVksSUFBSSxDQUFDO0lBZ0R6QyxDQUFDO0lBbkdELElBQUks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bEMseUJBQXlCLGdiQUgxQixFQUFFOzRGQUdELHlCQUF5QjtrQkFMckMsU0FBUzttQkFBQztvQkFDVCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5QixRQUFRLEVBQUUsRUFBRTtvQkFDWixlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtpQkFDaEQ7OzBCQWdHSSxNQUFNOzJCQUFDLFdBQVc7OzBCQU1sQixRQUFROzswQkFBSSxNQUFNOzJCQUFDLHVCQUF1QjtxRkExRXBDLElBQUk7c0JBQVosS0FBSztnQkFFRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csZUFBZTtzQkFBdkIsS0FBSztnQkFDRyxxQkFBcUI7c0JBQTdCLEtBQUs7Z0JBQ0cscUJBQXFCO3NCQUE3QixLQUFLO2dCQU1GLGlCQUFpQjtzQkFEcEIsS0FBSztnQkFjRixhQUFhO3NCQURoQixLQUFLO2dCQWVGLFdBQVc7c0JBRGQsS0FBSztnQkFjRixZQUFZO3NCQURmLEtBQUs7Z0JBYVEsY0FBYztzQkFBM0IsTUFBTSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgRXZlbnRFbWl0dGVyLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBPbkluaXQsXG4gIE9wdGlvbmFsLFxuICBPdXRwdXQsXG4gIFR5cGUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBjb252ZXJ0VG9Cb29sUHJvcGVydHksIE5iQm9vbGVhbklucHV0IH0gZnJvbSAnLi4vaGVscGVycyc7XG5pbXBvcnQgeyBOQl9ET0NVTUVOVCB9IGZyb20gJy4uLy4uL3RoZW1lLm9wdGlvbnMnO1xuaW1wb3J0IHsgTmJQb3NpdGlvbkJ1aWxkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vY2RrL292ZXJsYXkvb3ZlcmxheS1wb3NpdGlvbic7XG5pbXBvcnQgeyBOYlRyaWdnZXJTdHJhdGVneUJ1aWxkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vY2RrL292ZXJsYXkvb3ZlcmxheS10cmlnZ2VyJztcbmltcG9ydCB7IE5iT3ZlcmxheVNlcnZpY2UgfSBmcm9tICcuLi9jZGsvb3ZlcmxheS9vdmVybGF5LXNlcnZpY2UnO1xuaW1wb3J0IHsgTmJDYWxlbmRhclRpbWVNb2RlbFNlcnZpY2UgfSBmcm9tICcuLi9jYWxlbmRhci1raXQvc2VydmljZXMvY2FsZW5kYXItdGltZS1tb2RlbC5zZXJ2aWNlJztcbmltcG9ydCB7IE5iRGF0ZVNlcnZpY2UgfSBmcm9tICcuLi9jYWxlbmRhci1raXQvc2VydmljZXMvZGF0ZS5zZXJ2aWNlJztcbmltcG9ydCB7IE5iQ2FsZW5kYXJXaXRoVGltZUNvbXBvbmVudCB9IGZyb20gJy4vY2FsZW5kYXItd2l0aC10aW1lLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBOYkJhc2VQaWNrZXJDb21wb25lbnQgfSBmcm9tICcuL2RhdGVwaWNrZXIuY29tcG9uZW50JztcbmltcG9ydCB7IE5CX0RBVEVfU0VSVklDRV9PUFRJT05TIH0gZnJvbSAnLi9kYXRlcGlja2VyLmRpcmVjdGl2ZSc7XG5cbi8qKlxuICogVGhlIERhdGVUaW1lUGlja2VyIGNvbXBvbmVudCBpdHNlbGYuXG4gKiBQcm92aWRlcyBhIHByb3h5IHRvIGBOYkNhbGVuZGFyV2l0aFRpbWVDb21wb25lbnRgIG9wdGlvbnMgYXMgd2VsbCBhcyBjdXN0b20gcGlja2VyIG9wdGlvbnMuXG4gKi9cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25iLWRhdGUtdGltZXBpY2tlcicsXG4gIHRlbXBsYXRlOiAnJyxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXG59KVxuZXhwb3J0IGNsYXNzIE5iRGF0ZVRpbWVQaWNrZXJDb21wb25lbnQ8RD5cbiAgZXh0ZW5kcyBOYkJhc2VQaWNrZXJDb21wb25lbnQ8RCwgRCwgTmJDYWxlbmRhcldpdGhUaW1lQ29tcG9uZW50PEQ+PlxuICBpbXBsZW1lbnRzIE9uSW5pdFxue1xuICBwcm90ZWN0ZWQgcGlja2VyQ2xhc3M6IFR5cGU8TmJDYWxlbmRhcldpdGhUaW1lQ29tcG9uZW50PEQ+PiA9IE5iQ2FsZW5kYXJXaXRoVGltZUNvbXBvbmVudDtcblxuICBnZXQgdmFsdWUoKTogYW55IHtcbiAgICByZXR1cm4gdGhpcy5waWNrZXIgPyB0aGlzLnBpY2tlci5kYXRlIDogdW5kZWZpbmVkO1xuICB9XG4gIHNldCB2YWx1ZShkYXRlOiBhbnkpIHtcbiAgICBpZiAoIXRoaXMucGlja2VyKSB7XG4gICAgICB0aGlzLnF1ZXVlID0gZGF0ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZGF0ZSkge1xuICAgICAgdGhpcy52aXNpYmxlRGF0ZSA9IGRhdGU7XG4gICAgICB0aGlzLnBpY2tlci52aXNpYmxlRGF0ZSA9IGRhdGU7XG4gICAgICB0aGlzLnBpY2tlci5kYXRlID0gZGF0ZTtcbiAgICAgIHRoaXMucGlja2VyLmNkLm1hcmtGb3JDaGVjaygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIG1pbnV0ZXMgc3RlcCB3aGVuIHdlIHVzZSBmaWxsIHRpbWUgZm9ybWF0LlxuICAgKiBJZiBzZXQgdG8gMjAsIGl0IHdpbGwgYmU6ICcxMjowMCwgMTI6MjA6IDEyOjQwLCAxMzowMC4uLidcbiAgICogKi9cbiAgQElucHV0KCkgc3RlcDogbnVtYmVyO1xuXG4gIEBJbnB1dCgpIHRpdGxlOiBzdHJpbmc7XG4gIEBJbnB1dCgpIGFwcGx5QnV0dG9uVGV4dDogc3RyaW5nO1xuICBASW5wdXQoKSBjdXJyZW50VGltZUJ1dHRvblRleHQ6IHN0cmluZztcbiAgQElucHV0KCkgc2hvd0N1cnJlbnRUaW1lQnV0dG9uID0gdHJ1ZTtcblxuICAvKipcbiAgICogRGVmaW5lcyAxMiBob3VycyBmb3JtYXQgbGlrZSAnMDc6MDAgUE0nLlxuICAgKiAqL1xuICBASW5wdXQoKVxuICBnZXQgdHdlbHZlSG91cnNGb3JtYXQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3R3ZWx2ZUhvdXJzRm9ybWF0O1xuICB9XG4gIHNldCB0d2VsdmVIb3Vyc0Zvcm1hdCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3R3ZWx2ZUhvdXJzRm9ybWF0ID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBfdHdlbHZlSG91cnNGb3JtYXQ6IGJvb2xlYW47XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV90d2VsdmVIb3Vyc0Zvcm1hdDogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgc2hvdWxkIHNob3cgYW0vcG0gbGFiZWwgaWYgdHdlbHZlSG91cnNGb3JtYXQgZW5hYmxlZC5cbiAgICogKi9cbiAgQElucHV0KClcbiAgZ2V0IHNob3dBbVBtTGFiZWwoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3Nob3dBbVBtTGFiZWw7XG4gIH1cbiAgc2V0IHNob3dBbVBtTGFiZWwodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9zaG93QW1QbUxhYmVsID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcm90ZWN0ZWQgX3Nob3dBbVBtTGFiZWw6IGJvb2xlYW4gPSB0cnVlO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2hvd0FtUG1MYWJlbDogTmJCb29sZWFuSW5wdXQ7XG5cbiAgLyoqXG4gICAqIFNob3cgc2Vjb25kcyBpbiB0aW1lcGlja2VyLlxuICAgKiBJZ25vcmVkIHdoZW4gc2luZ2xlQ29sdW1uIGlzIHRydWUuXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCB3aXRoU2Vjb25kcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fd2l0aFNlY29uZHM7XG4gIH1cbiAgc2V0IHdpdGhTZWNvbmRzKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fd2l0aFNlY29uZHMgPSBjb252ZXJ0VG9Cb29sUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIF93aXRoU2Vjb25kczogYm9vbGVhbjtcbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3dpdGhTZWNvbmRzOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogU2hvdyB0aW1lcGlja2VyIHZhbHVlcyBpbiBvbmUgY29sdW1uIHdpdGggNjAgbWludXRlcyBzdGVwIGJ5IGRlZmF1bHQuXG4gICAqICovXG4gIEBJbnB1dCgpXG4gIGdldCBzaW5nbGVDb2x1bW4oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3NpbmdsZUNvbHVtbjtcbiAgfVxuICBzZXQgc2luZ2xlQ29sdW1uKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fc2luZ2xlQ29sdW1uID0gY29udmVydFRvQm9vbFByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBfc2luZ2xlQ29sdW1uOiBib29sZWFuO1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfc2luZ2xlQ29sdW1uOiBOYkJvb2xlYW5JbnB1dDtcblxuICAvKipcbiAgICogRW1pdHMgZGF0ZSB3aXRoIHRpbWUgd2hlbiBzZWxlY3RlZC5cbiAgICogKi9cbiAgQE91dHB1dCgpIGdldCBkYXRlVGltZUNoYW5nZSgpOiBFdmVudEVtaXR0ZXI8RD4ge1xuICAgIHJldHVybiB0aGlzLnZhbHVlQ2hhbmdlIGFzIEV2ZW50RW1pdHRlcjxEPjtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTkJfRE9DVU1FTlQpIGRvY3VtZW50LFxuICAgIHBvc2l0aW9uQnVpbGRlcjogTmJQb3NpdGlvbkJ1aWxkZXJTZXJ2aWNlLFxuICAgIHRyaWdnZXJTdHJhdGVneUJ1aWxkZXI6IE5iVHJpZ2dlclN0cmF0ZWd5QnVpbGRlclNlcnZpY2UsXG4gICAgb3ZlcmxheTogTmJPdmVybGF5U2VydmljZSxcbiAgICBjZnI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICBkYXRlU2VydmljZTogTmJEYXRlU2VydmljZTxEPixcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KE5CX0RBVEVfU0VSVklDRV9PUFRJT05TKSBkYXRlU2VydmljZU9wdGlvbnMsXG4gICAgcHJvdGVjdGVkIGNhbGVuZGFyV2l0aFRpbWVNb2RlbFNlcnZpY2U6IE5iQ2FsZW5kYXJUaW1lTW9kZWxTZXJ2aWNlPEQ+LFxuICApIHtcbiAgICBzdXBlcihkb2N1bWVudCwgcG9zaXRpb25CdWlsZGVyLCB0cmlnZ2VyU3RyYXRlZ3lCdWlsZGVyLCBvdmVybGF5LCBjZnIsIGRhdGVTZXJ2aWNlLCBkYXRlU2VydmljZU9wdGlvbnMpO1xuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5mb3JtYXQgPSB0aGlzLmZvcm1hdCB8fCB0aGlzLmJ1aWxkVGltZUZvcm1hdCgpO1xuICAgIHRoaXMuaW5pdCQubmV4dCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHBhdGNoV2l0aElucHV0cygpIHtcbiAgICB0aGlzLnBpY2tlci5zaW5nbGVDb2x1bW4gPSB0aGlzLnNpbmdsZUNvbHVtbjtcbiAgICB0aGlzLnBpY2tlci50d2VsdmVIb3Vyc0Zvcm1hdCA9IHRoaXMudHdlbHZlSG91cnNGb3JtYXQ7XG4gICAgdGhpcy5waWNrZXIuc2hvd0FtUG1MYWJlbCA9IHRoaXMuc2hvd0FtUG1MYWJlbDtcbiAgICB0aGlzLnBpY2tlci53aXRoU2Vjb25kcyA9IHRoaXMud2l0aFNlY29uZHM7XG4gICAgdGhpcy5waWNrZXIuc3RlcCA9IHRoaXMuc3RlcDtcbiAgICB0aGlzLnBpY2tlci50aXRsZSA9IHRoaXMudGl0bGU7XG4gICAgdGhpcy5waWNrZXIuYXBwbHlCdXR0b25UZXh0ID0gdGhpcy5hcHBseUJ1dHRvblRleHQ7XG4gICAgdGhpcy5waWNrZXIuY3VycmVudFRpbWVCdXR0b25UZXh0ID0gdGhpcy5jdXJyZW50VGltZUJ1dHRvblRleHQ7XG4gICAgdGhpcy5waWNrZXIuc2hvd0N1cnJlbnRUaW1lQnV0dG9uID0gdGhpcy5zaG93Q3VycmVudFRpbWVCdXR0b247XG5cbiAgICBpZiAodGhpcy50d2VsdmVIb3Vyc0Zvcm1hdCkge1xuICAgICAgdGhpcy5waWNrZXIudGltZUZvcm1hdCA9IHRoaXMuZGF0ZVNlcnZpY2UuZ2V0VHdlbHZlSG91cnNGb3JtYXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5waWNrZXIudGltZUZvcm1hdCA9XG4gICAgICAgIHRoaXMud2l0aFNlY29uZHMgJiYgIXRoaXMuc2luZ2xlQ29sdW1uXG4gICAgICAgICAgPyB0aGlzLmRhdGVTZXJ2aWNlLmdldFR3ZW50eUZvdXJIb3Vyc0Zvcm1hdFdpdGhTZWNvbmRzKClcbiAgICAgICAgICA6IHRoaXMuZGF0ZVNlcnZpY2UuZ2V0VHdlbnR5Rm91ckhvdXJzRm9ybWF0KCk7XG4gICAgfVxuICAgIHN1cGVyLnBhdGNoV2l0aElucHV0cygpO1xuXG4gICAgdGhpcy5waWNrZXIuY2QubWFya0ZvckNoZWNrKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0IHBpY2tlclZhbHVlQ2hhbmdlKCk6IE9ic2VydmFibGU8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMucGlja2VyLmRhdGVDaGFuZ2U7XG4gIH1cblxuICBwcm90ZWN0ZWQgd3JpdGVRdWV1ZSgpIHtcbiAgICBpZiAodGhpcy5xdWV1ZSkge1xuICAgICAgY29uc3QgZGF0ZSA9IHRoaXMucXVldWU7XG4gICAgICB0aGlzLnF1ZXVlID0gbnVsbDtcbiAgICAgIHRoaXMudmFsdWUgPSBkYXRlO1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBidWlsZFRpbWVGb3JtYXQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy5zaW5nbGVDb2x1bW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGVuZGFyV2l0aFRpbWVNb2RlbFNlcnZpY2UuYnVpbGREYXRlRm9ybWF0KHRoaXMudHdlbHZlSG91cnNGb3JtYXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWxlbmRhcldpdGhUaW1lTW9kZWxTZXJ2aWNlLmJ1aWxkRGF0ZUZvcm1hdCh0aGlzLnR3ZWx2ZUhvdXJzRm9ybWF0LCB0aGlzLndpdGhTZWNvbmRzKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==