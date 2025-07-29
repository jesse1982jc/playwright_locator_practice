import { Component, Input, Output, ViewChild, EventEmitter, ChangeDetectionStrategy, PLATFORM_ID, Inject } from '@angular/core';
import { trimLabel } from '../trim-label.helper';
import { reduceTicks } from './ticks.helper';
import { roundedRect } from '../../common/shape.helper';
import { isPlatformBrowser } from '@angular/common';
import { Orientation } from '../types/orientation.enum';
import { TextAnchor } from '../types/text-anchor.enum';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class YAxisTicksComponent {
    constructor(platformId) {
        this.platformId = platformId;
        this.tickArguments = [5];
        this.tickStroke = '#ccc';
        this.trimTicks = true;
        this.maxTickLength = 16;
        this.showGridLines = false;
        this.showRefLabels = false;
        this.showRefLines = false;
        this.dimensionsChanged = new EventEmitter();
        this.innerTickSize = 6;
        this.tickPadding = 3;
        this.verticalSpacing = 20;
        this.textAnchor = TextAnchor.Middle;
        this.width = 0;
        this.outerTickSize = 6;
        this.rotateLabels = false;
        this.referenceLineLength = 0;
        this.Orientation = Orientation;
    }
    ngOnChanges(changes) {
        this.update();
    }
    ngAfterViewInit() {
        setTimeout(() => this.updateDims());
    }
    updateDims() {
        if (!isPlatformBrowser(this.platformId)) {
            // for SSR, use approximate value instead of measured
            this.width = this.getApproximateAxisWidth();
            this.dimensionsChanged.emit({ width: this.width });
            return;
        }
        const width = parseInt(this.ticksElement.nativeElement.getBoundingClientRect().width, 10);
        if (width !== this.width) {
            this.width = width;
            this.dimensionsChanged.emit({ width });
            setTimeout(() => this.updateDims());
        }
    }
    update() {
        const scale = this.scale;
        const sign = this.orient === Orientation.Top || this.orient === Orientation.Right ? -1 : 1;
        this.tickSpacing = Math.max(this.innerTickSize, 0) + this.tickPadding;
        this.ticks = this.getTicks();
        if (this.tickFormatting) {
            this.tickFormat = this.tickFormatting;
        }
        else if (scale.tickFormat) {
            // eslint-disable-next-line prefer-spread
            this.tickFormat = scale.tickFormat.apply(scale, this.tickArguments);
        }
        else {
            this.tickFormat = function (d) {
                if (d.constructor.name === 'Date') {
                    return d.toLocaleDateString();
                }
                return d.toLocaleString();
            };
        }
        this.adjustedScale = scale.bandwidth
            ? function (d) {
                return scale(d) + scale.bandwidth() * 0.5;
            }
            : scale;
        if (this.showRefLines && this.referenceLines) {
            this.setReferencelines();
        }
        switch (this.orient) {
            case Orientation.Top:
                this.transform = function (tick) {
                    return 'translate(' + this.adjustedScale(tick) + ',0)';
                };
                this.textAnchor = TextAnchor.Middle;
                this.y2 = this.innerTickSize * sign;
                this.y1 = this.tickSpacing * sign;
                this.dy = sign < 0 ? '0em' : '.71em';
                break;
            case Orientation.Bottom:
                this.transform = function (tick) {
                    return 'translate(' + this.adjustedScale(tick) + ',0)';
                };
                this.textAnchor = TextAnchor.Middle;
                this.y2 = this.innerTickSize * sign;
                this.y1 = this.tickSpacing * sign;
                this.dy = sign < 0 ? '0em' : '.71em';
                break;
            case Orientation.Left:
                this.transform = function (tick) {
                    return 'translate(0,' + this.adjustedScale(tick) + ')';
                };
                this.textAnchor = TextAnchor.End;
                this.x2 = this.innerTickSize * -sign;
                this.x1 = this.tickSpacing * -sign;
                this.dy = '.32em';
                break;
            case Orientation.Right:
                this.transform = function (tick) {
                    return 'translate(0,' + this.adjustedScale(tick) + ')';
                };
                this.textAnchor = TextAnchor.Start;
                this.x2 = this.innerTickSize * -sign;
                this.x1 = this.tickSpacing * -sign;
                this.dy = '.32em';
                break;
            default:
        }
        setTimeout(() => this.updateDims());
    }
    setReferencelines() {
        this.refMin = this.adjustedScale(Math.min.apply(null, this.referenceLines.map(item => item.value)));
        this.refMax = this.adjustedScale(Math.max.apply(null, this.referenceLines.map(item => item.value)));
        this.referenceLineLength = this.referenceLines.length;
        this.referenceAreaPath = roundedRect(0, this.refMax, this.gridLineWidth, this.refMin - this.refMax, 0, [
            false,
            false,
            false,
            false
        ]);
    }
    getTicks() {
        let ticks;
        const maxTicks = this.getMaxTicks(20);
        const maxScaleTicks = this.getMaxTicks(50);
        if (this.tickValues) {
            ticks = this.tickValues;
        }
        else if (this.scale.ticks) {
            ticks = this.scale.ticks.apply(this.scale, [maxScaleTicks]);
        }
        else {
            ticks = this.scale.domain();
            ticks = reduceTicks(ticks, maxTicks);
        }
        return ticks;
    }
    getMaxTicks(tickHeight) {
        return Math.floor(this.height / tickHeight);
    }
    tickTransform(tick) {
        return `translate(${this.adjustedScale(tick)},${this.verticalSpacing})`;
    }
    gridLineTransform() {
        return `translate(5,0)`;
    }
    tickTrim(label) {
        return this.trimTicks ? trimLabel(label, this.maxTickLength) : label;
    }
    getApproximateAxisWidth() {
        const maxChars = Math.max(...this.ticks.map(t => this.tickTrim(this.tickFormat(t)).length));
        const charWidth = 7;
        return maxChars * charWidth;
    }
}
YAxisTicksComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: YAxisTicksComponent, deps: [{ token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Component });
YAxisTicksComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.1.0", type: YAxisTicksComponent, selector: "g[ngx-charts-y-axis-ticks]", inputs: { scale: "scale", orient: "orient", tickArguments: "tickArguments", tickValues: "tickValues", tickStroke: "tickStroke", trimTicks: "trimTicks", maxTickLength: "maxTickLength", tickFormatting: "tickFormatting", showGridLines: "showGridLines", gridLineWidth: "gridLineWidth", height: "height", referenceLines: "referenceLines", showRefLabels: "showRefLabels", showRefLines: "showRefLines" }, outputs: { dimensionsChanged: "dimensionsChanged" }, viewQueries: [{ propertyName: "ticksElement", first: true, predicate: ["ticksel"], descendants: true }], usesOnChanges: true, ngImport: i0, template: `
    <svg:g #ticksel>
      <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="transform(tick)">
        <title>{{ tickFormat(tick) }}</title>
        <svg:text
          stroke-width="0.01"
          [attr.dy]="dy"
          [attr.x]="x1"
          [attr.y]="y1"
          [attr.text-anchor]="textAnchor"
          [style.font-size]="'12px'"
        >
          {{ tickTrim(tickFormat(tick)) }}
        </svg:text>
      </svg:g>
    </svg:g>

    <svg:path
      *ngIf="referenceLineLength > 1 && refMax && refMin && showRefLines"
      class="reference-area"
      [attr.d]="referenceAreaPath"
      [attr.transform]="gridLineTransform()"
    />
    <svg:g *ngFor="let tick of ticks" [attr.transform]="transform(tick)">
      <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
        <svg:line
          *ngIf="orient === Orientation.Left"
          class="gridline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="gridLineWidth"
        />
        <svg:line
          *ngIf="orient === Orientation.Right"
          class="gridline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="-gridLineWidth"
        />
      </svg:g>
    </svg:g>

    <svg:g *ngFor="let refLine of referenceLines">
      <svg:g *ngIf="showRefLines" [attr.transform]="transform(refLine.value)">
        <svg:line
          class="refline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="gridLineWidth"
          [attr.transform]="gridLineTransform()"
        />
        <svg:g *ngIf="showRefLabels">
          <title>{{ tickTrim(tickFormat(refLine.value)) }}</title>
          <svg:text
            class="refline-label"
            [attr.dy]="dy"
            [attr.y]="-6"
            [attr.x]="gridLineWidth"
            [attr.text-anchor]="textAnchor"
          >
            {{ refLine.name }}
          </svg:text>
        </svg:g>
      </svg:g>
    </svg:g>
  `, isInline: true, directives: [{ type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }], changeDetection: i0.ChangeDetectionStrategy.OnPush });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.1.0", ngImport: i0, type: YAxisTicksComponent, decorators: [{
            type: Component,
            args: [{
                    selector: 'g[ngx-charts-y-axis-ticks]',
                    template: `
    <svg:g #ticksel>
      <svg:g *ngFor="let tick of ticks" class="tick" [attr.transform]="transform(tick)">
        <title>{{ tickFormat(tick) }}</title>
        <svg:text
          stroke-width="0.01"
          [attr.dy]="dy"
          [attr.x]="x1"
          [attr.y]="y1"
          [attr.text-anchor]="textAnchor"
          [style.font-size]="'12px'"
        >
          {{ tickTrim(tickFormat(tick)) }}
        </svg:text>
      </svg:g>
    </svg:g>

    <svg:path
      *ngIf="referenceLineLength > 1 && refMax && refMin && showRefLines"
      class="reference-area"
      [attr.d]="referenceAreaPath"
      [attr.transform]="gridLineTransform()"
    />
    <svg:g *ngFor="let tick of ticks" [attr.transform]="transform(tick)">
      <svg:g *ngIf="showGridLines" [attr.transform]="gridLineTransform()">
        <svg:line
          *ngIf="orient === Orientation.Left"
          class="gridline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="gridLineWidth"
        />
        <svg:line
          *ngIf="orient === Orientation.Right"
          class="gridline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="-gridLineWidth"
        />
      </svg:g>
    </svg:g>

    <svg:g *ngFor="let refLine of referenceLines">
      <svg:g *ngIf="showRefLines" [attr.transform]="transform(refLine.value)">
        <svg:line
          class="refline-path gridline-path-horizontal"
          x1="0"
          [attr.x2]="gridLineWidth"
          [attr.transform]="gridLineTransform()"
        />
        <svg:g *ngIf="showRefLabels">
          <title>{{ tickTrim(tickFormat(refLine.value)) }}</title>
          <svg:text
            class="refline-label"
            [attr.dy]="dy"
            [attr.y]="-6"
            [attr.x]="gridLineWidth"
            [attr.text-anchor]="textAnchor"
          >
            {{ refLine.name }}
          </svg:text>
        </svg:g>
      </svg:g>
    </svg:g>
  `,
                    changeDetection: ChangeDetectionStrategy.OnPush
                }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }]; }, propDecorators: { scale: [{
                type: Input
            }], orient: [{
                type: Input
            }], tickArguments: [{
                type: Input
            }], tickValues: [{
                type: Input
            }], tickStroke: [{
                type: Input
            }], trimTicks: [{
                type: Input
            }], maxTickLength: [{
                type: Input
            }], tickFormatting: [{
                type: Input
            }], showGridLines: [{
                type: Input
            }], gridLineWidth: [{
                type: Input
            }], height: [{
                type: Input
            }], referenceLines: [{
                type: Input
            }], showRefLabels: [{
                type: Input
            }], showRefLines: [{
                type: Input
            }], dimensionsChanged: [{
                type: Output
            }], ticksElement: [{
                type: ViewChild,
                args: ['ticksel']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieS1heGlzLXRpY2tzLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3N3aW1sYW5lL25neC1jaGFydHMvc3JjL2xpYi9jb21tb24vYXhlcy95LWF4aXMtdGlja3MuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUNMLE1BQU0sRUFHTixTQUFTLEVBQ1QsWUFBWSxFQUVaLHVCQUF1QixFQUV2QixXQUFXLEVBQ1gsTUFBTSxFQUNQLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNqRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7OztBQXFFdkQsTUFBTSxPQUFPLG1CQUFtQjtJQTRDOUIsWUFBeUMsVUFBZTtRQUFmLGVBQVUsR0FBVixVQUFVLENBQUs7UUF6Qy9DLGtCQUFhLEdBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5QixlQUFVLEdBQUcsTUFBTSxDQUFDO1FBQ3BCLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsa0JBQWEsR0FBVyxFQUFFLENBQUM7UUFFM0Isa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFJL0Isa0JBQWEsR0FBWSxLQUFLLENBQUM7UUFDL0IsaUJBQVksR0FBWSxLQUFLLENBQUM7UUFFN0Isc0JBQWlCLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVqRCxrQkFBYSxHQUFXLENBQUMsQ0FB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NENWLFdBQVc7b0dBNUNwQixtQkFBbUIsbW9CQWpFcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOERUOzJGQUdVLG1CQUFtQjtrQkFuRS9CLFNBQVM7bUJBQUM7b0JBQ1QsUUFBUSxFQUFFLDRCQUE0QjtvQkFDdEMsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThEVDtvQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtpQkFDaEQ7OzBCQTZDYyxNQUFNOzJCQUFDLFdBQVc7NENBM0N0QixLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csTUFBTTtzQkFBZCxLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxjQUFjO3NCQUF0QixLQUFLO2dCQUNHLGFBQWE7c0JBQXJCLEtBQUs7Z0JBQ0csYUFBYTtzQkFBckIsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csY0FBYztzQkFBdEIsS0FBSztnQkFDRyxhQUFhO3NCQUFyQixLQUFLO2dCQUNHLFlBQVk7c0JBQXBCLEtBQUs7Z0JBRUksaUJBQWlCO3NCQUExQixNQUFNO2dCQTBCZSxZQUFZO3NCQUFqQyxTQUFTO3VCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBDb21wb25lbnQsXG4gIElucHV0LFxuICBPdXRwdXQsXG4gIE9uQ2hhbmdlcyxcbiAgRWxlbWVudFJlZixcbiAgVmlld0NoaWxkLFxuICBFdmVudEVtaXR0ZXIsXG4gIEFmdGVyVmlld0luaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBTaW1wbGVDaGFuZ2VzLFxuICBQTEFURk9STV9JRCxcbiAgSW5qZWN0XG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgdHJpbUxhYmVsIH0gZnJvbSAnLi4vdHJpbS1sYWJlbC5oZWxwZXInO1xuaW1wb3J0IHsgcmVkdWNlVGlja3MgfSBmcm9tICcuL3RpY2tzLmhlbHBlcic7XG5pbXBvcnQgeyByb3VuZGVkUmVjdCB9IGZyb20gJy4uLy4uL2NvbW1vbi9zaGFwZS5oZWxwZXInO1xuaW1wb3J0IHsgaXNQbGF0Zm9ybUJyb3dzZXIgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgT3JpZW50YXRpb24gfSBmcm9tICcuLi90eXBlcy9vcmllbnRhdGlvbi5lbnVtJztcbmltcG9ydCB7IFRleHRBbmNob3IgfSBmcm9tICcuLi90eXBlcy90ZXh0LWFuY2hvci5lbnVtJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLXktYXhpcy10aWNrc10nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxzdmc6ZyAjdGlja3NlbD5cbiAgICAgIDxzdmc6ZyAqbmdGb3I9XCJsZXQgdGljayBvZiB0aWNrc1wiIGNsYXNzPVwidGlja1wiIFthdHRyLnRyYW5zZm9ybV09XCJ0cmFuc2Zvcm0odGljaylcIj5cbiAgICAgICAgPHRpdGxlPnt7IHRpY2tGb3JtYXQodGljaykgfX08L3RpdGxlPlxuICAgICAgICA8c3ZnOnRleHRcbiAgICAgICAgICBzdHJva2Utd2lkdGg9XCIwLjAxXCJcbiAgICAgICAgICBbYXR0ci5keV09XCJkeVwiXG4gICAgICAgICAgW2F0dHIueF09XCJ4MVwiXG4gICAgICAgICAgW2F0dHIueV09XCJ5MVwiXG4gICAgICAgICAgW2F0dHIudGV4dC1hbmNob3JdPVwidGV4dEFuY2hvclwiXG4gICAgICAgICAgW3N0eWxlLmZvbnQtc2l6ZV09XCInMTJweCdcIlxuICAgICAgICA+XG4gICAgICAgICAge3sgdGlja1RyaW0odGlja0Zvcm1hdCh0aWNrKSkgfX1cbiAgICAgICAgPC9zdmc6dGV4dD5cbiAgICAgIDwvc3ZnOmc+XG4gICAgPC9zdmc6Zz5cblxuICAgIDxzdmc6cGF0aFxuICAgICAgKm5nSWY9XCJyZWZlcmVuY2VMaW5lTGVuZ3RoID4gMSAmJiByZWZNYXggJiYgcmVmTWluICYmIHNob3dSZWZMaW5lc1wiXG4gICAgICBjbGFzcz1cInJlZmVyZW5jZS1hcmVhXCJcbiAgICAgIFthdHRyLmRdPVwicmVmZXJlbmNlQXJlYVBhdGhcIlxuICAgICAgW2F0dHIudHJhbnNmb3JtXT1cImdyaWRMaW5lVHJhbnNmb3JtKClcIlxuICAgIC8+XG4gICAgPHN2ZzpnICpuZ0Zvcj1cImxldCB0aWNrIG9mIHRpY2tzXCIgW2F0dHIudHJhbnNmb3JtXT1cInRyYW5zZm9ybSh0aWNrKVwiPlxuICAgICAgPHN2ZzpnICpuZ0lmPVwic2hvd0dyaWRMaW5lc1wiIFthdHRyLnRyYW5zZm9ybV09XCJncmlkTGluZVRyYW5zZm9ybSgpXCI+XG4gICAgICAgIDxzdmc6bGluZVxuICAgICAgICAgICpuZ0lmPVwib3JpZW50ID09PSBPcmllbnRhdGlvbi5MZWZ0XCJcbiAgICAgICAgICBjbGFzcz1cImdyaWRsaW5lLXBhdGggZ3JpZGxpbmUtcGF0aC1ob3Jpem9udGFsXCJcbiAgICAgICAgICB4MT1cIjBcIlxuICAgICAgICAgIFthdHRyLngyXT1cImdyaWRMaW5lV2lkdGhcIlxuICAgICAgICAvPlxuICAgICAgICA8c3ZnOmxpbmVcbiAgICAgICAgICAqbmdJZj1cIm9yaWVudCA9PT0gT3JpZW50YXRpb24uUmlnaHRcIlxuICAgICAgICAgIGNsYXNzPVwiZ3JpZGxpbmUtcGF0aCBncmlkbGluZS1wYXRoLWhvcml6b250YWxcIlxuICAgICAgICAgIHgxPVwiMFwiXG4gICAgICAgICAgW2F0dHIueDJdPVwiLWdyaWRMaW5lV2lkdGhcIlxuICAgICAgICAvPlxuICAgICAgPC9zdmc6Zz5cbiAgICA8L3N2ZzpnPlxuXG4gICAgPHN2ZzpnICpuZ0Zvcj1cImxldCByZWZMaW5lIG9mIHJlZmVyZW5jZUxpbmVzXCI+XG4gICAgICA8c3ZnOmcgKm5nSWY9XCJzaG93UmVmTGluZXNcIiBbYXR0ci50cmFuc2Zvcm1dPVwidHJhbnNmb3JtKHJlZkxpbmUudmFsdWUpXCI+XG4gICAgICAgIDxzdmc6bGluZVxuICAgICAgICAgIGNsYXNzPVwicmVmbGluZS1wYXRoIGdyaWRsaW5lLXBhdGgtaG9yaXpvbnRhbFwiXG4gICAgICAgICAgeDE9XCIwXCJcbiAgICAgICAgICBbYXR0ci54Ml09XCJncmlkTGluZVdpZHRoXCJcbiAgICAgICAgICBbYXR0ci50cmFuc2Zvcm1dPVwiZ3JpZExpbmVUcmFuc2Zvcm0oKVwiXG4gICAgICAgIC8+XG4gICAgICAgIDxzdmc6ZyAqbmdJZj1cInNob3dSZWZMYWJlbHNcIj5cbiAgICAgICAgICA8dGl0bGU+e3sgdGlja1RyaW0odGlja0Zvcm1hdChyZWZMaW5lLnZhbHVlKSkgfX08L3RpdGxlPlxuICAgICAgICAgIDxzdmc6dGV4dFxuICAgICAgICAgICAgY2xhc3M9XCJyZWZsaW5lLWxhYmVsXCJcbiAgICAgICAgICAgIFthdHRyLmR5XT1cImR5XCJcbiAgICAgICAgICAgIFthdHRyLnldPVwiLTZcIlxuICAgICAgICAgICAgW2F0dHIueF09XCJncmlkTGluZVdpZHRoXCJcbiAgICAgICAgICAgIFthdHRyLnRleHQtYW5jaG9yXT1cInRleHRBbmNob3JcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt7IHJlZkxpbmUubmFtZSB9fVxuICAgICAgICAgIDwvc3ZnOnRleHQ+XG4gICAgICAgIDwvc3ZnOmc+XG4gICAgICA8L3N2ZzpnPlxuICAgIDwvc3ZnOmc+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIFlBeGlzVGlja3NDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMsIEFmdGVyVmlld0luaXQge1xuICBASW5wdXQoKSBzY2FsZTtcbiAgQElucHV0KCkgb3JpZW50OiBPcmllbnRhdGlvbjtcbiAgQElucHV0KCkgdGlja0FyZ3VtZW50czogbnVtYmVyW10gPSBbNV07XG4gIEBJbnB1dCgpIHRpY2tWYWx1ZXM6IHN0cmluZ1tdIHwgbnVtYmVyW107XG4gIEBJbnB1dCgpIHRpY2tTdHJva2UgPSAnI2NjYyc7XG4gIEBJbnB1dCgpIHRyaW1UaWNrczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIG1heFRpY2tMZW5ndGg6IG51bWJlciA9IDE2O1xuICBASW5wdXQoKSB0aWNrRm9ybWF0dGluZztcbiAgQElucHV0KCkgc2hvd0dyaWRMaW5lczogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBncmlkTGluZVdpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIGhlaWdodDogbnVtYmVyO1xuICBASW5wdXQoKSByZWZlcmVuY2VMaW5lcztcbiAgQElucHV0KCkgc2hvd1JlZkxhYmVsczogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBzaG93UmVmTGluZXM6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBAT3V0cHV0KCkgZGltZW5zaW9uc0NoYW5nZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgaW5uZXJUaWNrU2l6ZTogbnVtYmVyID0gNjtcbiAgdGlja1BhZGRpbmc6IG51bWJlciA9IDM7XG4gIHRpY2tTcGFjaW5nOiBudW1iZXI7XG4gIHZlcnRpY2FsU3BhY2luZzogbnVtYmVyID0gMjA7XG4gIHRleHRBbmNob3I6IFRleHRBbmNob3IgPSBUZXh0QW5jaG9yLk1pZGRsZTtcbiAgZHk6IHN0cmluZztcbiAgeDE6IG51bWJlcjtcbiAgeDI6IG51bWJlcjtcbiAgeTE6IG51bWJlcjtcbiAgeTI6IG51bWJlcjtcbiAgYWRqdXN0ZWRTY2FsZTogYW55O1xuICB0cmFuc2Zvcm06IChvOiBhbnkpID0+IHN0cmluZztcbiAgdGlja0Zvcm1hdDogKG86IGFueSkgPT4gc3RyaW5nO1xuICB0aWNrczogYW55W107XG4gIHdpZHRoOiBudW1iZXIgPSAwO1xuICBvdXRlclRpY2tTaXplOiBudW1iZXIgPSA2O1xuICByb3RhdGVMYWJlbHM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcmVmTWF4OiBudW1iZXI7XG4gIHJlZk1pbjogbnVtYmVyO1xuICByZWZlcmVuY2VMaW5lTGVuZ3RoOiBudW1iZXIgPSAwO1xuICByZWZlcmVuY2VBcmVhUGF0aDogc3RyaW5nO1xuXG4gIHJlYWRvbmx5IE9yaWVudGF0aW9uID0gT3JpZW50YXRpb247XG5cbiAgQFZpZXdDaGlsZCgndGlja3NlbCcpIHRpY2tzRWxlbWVudDogRWxlbWVudFJlZjtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIHBsYXRmb3JtSWQ6IGFueSkge31cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgdGhpcy51cGRhdGUoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpOiB2b2lkIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlRGltcygpKTtcbiAgfVxuXG4gIHVwZGF0ZURpbXMoKTogdm9pZCB7XG4gICAgaWYgKCFpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLnBsYXRmb3JtSWQpKSB7XG4gICAgICAvLyBmb3IgU1NSLCB1c2UgYXBwcm94aW1hdGUgdmFsdWUgaW5zdGVhZCBvZiBtZWFzdXJlZFxuICAgICAgdGhpcy53aWR0aCA9IHRoaXMuZ2V0QXBwcm94aW1hdGVBeGlzV2lkdGgoKTtcbiAgICAgIHRoaXMuZGltZW5zaW9uc0NoYW5nZWQuZW1pdCh7IHdpZHRoOiB0aGlzLndpZHRoIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHdpZHRoID0gcGFyc2VJbnQodGhpcy50aWNrc0VsZW1lbnQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCwgMTApO1xuICAgIGlmICh3aWR0aCAhPT0gdGhpcy53aWR0aCkge1xuICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5kaW1lbnNpb25zQ2hhbmdlZC5lbWl0KHsgd2lkdGggfSk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlRGltcygpKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjYWxlO1xuICAgIGNvbnN0IHNpZ24gPSB0aGlzLm9yaWVudCA9PT0gT3JpZW50YXRpb24uVG9wIHx8IHRoaXMub3JpZW50ID09PSBPcmllbnRhdGlvbi5SaWdodCA/IC0xIDogMTtcbiAgICB0aGlzLnRpY2tTcGFjaW5nID0gTWF0aC5tYXgodGhpcy5pbm5lclRpY2tTaXplLCAwKSArIHRoaXMudGlja1BhZGRpbmc7XG5cbiAgICB0aGlzLnRpY2tzID0gdGhpcy5nZXRUaWNrcygpO1xuXG4gICAgaWYgKHRoaXMudGlja0Zvcm1hdHRpbmcpIHtcbiAgICAgIHRoaXMudGlja0Zvcm1hdCA9IHRoaXMudGlja0Zvcm1hdHRpbmc7XG4gICAgfSBlbHNlIGlmIChzY2FsZS50aWNrRm9ybWF0KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJlZmVyLXNwcmVhZFxuICAgICAgdGhpcy50aWNrRm9ybWF0ID0gc2NhbGUudGlja0Zvcm1hdC5hcHBseShzY2FsZSwgdGhpcy50aWNrQXJndW1lbnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aWNrRm9ybWF0ID0gZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgaWYgKGQuY29uc3RydWN0b3IubmFtZSA9PT0gJ0RhdGUnKSB7XG4gICAgICAgICAgcmV0dXJuIGQudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGQudG9Mb2NhbGVTdHJpbmcoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdGhpcy5hZGp1c3RlZFNjYWxlID0gc2NhbGUuYmFuZHdpZHRoXG4gICAgICA/IGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgcmV0dXJuIHNjYWxlKGQpICsgc2NhbGUuYmFuZHdpZHRoKCkgKiAwLjU7XG4gICAgICAgIH1cbiAgICAgIDogc2NhbGU7XG5cbiAgICBpZiAodGhpcy5zaG93UmVmTGluZXMgJiYgdGhpcy5yZWZlcmVuY2VMaW5lcykge1xuICAgICAgdGhpcy5zZXRSZWZlcmVuY2VsaW5lcygpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5vcmllbnQpIHtcbiAgICAgIGNhc2UgT3JpZW50YXRpb24uVG9wOlxuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0aWNrKSB7XG4gICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKSArICcsMCknO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRleHRBbmNob3IgPSBUZXh0QW5jaG9yLk1pZGRsZTtcbiAgICAgICAgdGhpcy55MiA9IHRoaXMuaW5uZXJUaWNrU2l6ZSAqIHNpZ247XG4gICAgICAgIHRoaXMueTEgPSB0aGlzLnRpY2tTcGFjaW5nICogc2lnbjtcbiAgICAgICAgdGhpcy5keSA9IHNpZ24gPCAwID8gJzBlbScgOiAnLjcxZW0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgT3JpZW50YXRpb24uQm90dG9tOlxuICAgICAgICB0aGlzLnRyYW5zZm9ybSA9IGZ1bmN0aW9uICh0aWNrKSB7XG4gICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIHRoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKSArICcsMCknO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRleHRBbmNob3IgPSBUZXh0QW5jaG9yLk1pZGRsZTtcbiAgICAgICAgdGhpcy55MiA9IHRoaXMuaW5uZXJUaWNrU2l6ZSAqIHNpZ247XG4gICAgICAgIHRoaXMueTEgPSB0aGlzLnRpY2tTcGFjaW5nICogc2lnbjtcbiAgICAgICAgdGhpcy5keSA9IHNpZ24gPCAwID8gJzBlbScgOiAnLjcxZW0nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgT3JpZW50YXRpb24uTGVmdDpcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSBmdW5jdGlvbiAodGljaykge1xuICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHRoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKSArICcpJztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50ZXh0QW5jaG9yID0gVGV4dEFuY2hvci5FbmQ7XG4gICAgICAgIHRoaXMueDIgPSB0aGlzLmlubmVyVGlja1NpemUgKiAtc2lnbjtcbiAgICAgICAgdGhpcy54MSA9IHRoaXMudGlja1NwYWNpbmcgKiAtc2lnbjtcbiAgICAgICAgdGhpcy5keSA9ICcuMzJlbSc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBPcmllbnRhdGlvbi5SaWdodDpcbiAgICAgICAgdGhpcy50cmFuc2Zvcm0gPSBmdW5jdGlvbiAodGljaykge1xuICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKDAsJyArIHRoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKSArICcpJztcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy50ZXh0QW5jaG9yID0gVGV4dEFuY2hvci5TdGFydDtcbiAgICAgICAgdGhpcy54MiA9IHRoaXMuaW5uZXJUaWNrU2l6ZSAqIC1zaWduO1xuICAgICAgICB0aGlzLngxID0gdGhpcy50aWNrU3BhY2luZyAqIC1zaWduO1xuICAgICAgICB0aGlzLmR5ID0gJy4zMmVtJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgIH1cbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlRGltcygpKTtcbiAgfVxuXG4gIHNldFJlZmVyZW5jZWxpbmVzKCk6IHZvaWQge1xuICAgIHRoaXMucmVmTWluID0gdGhpcy5hZGp1c3RlZFNjYWxlKFxuICAgICAgTWF0aC5taW4uYXBwbHkoXG4gICAgICAgIG51bGwsXG4gICAgICAgIHRoaXMucmVmZXJlbmNlTGluZXMubWFwKGl0ZW0gPT4gaXRlbS52YWx1ZSlcbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMucmVmTWF4ID0gdGhpcy5hZGp1c3RlZFNjYWxlKFxuICAgICAgTWF0aC5tYXguYXBwbHkoXG4gICAgICAgIG51bGwsXG4gICAgICAgIHRoaXMucmVmZXJlbmNlTGluZXMubWFwKGl0ZW0gPT4gaXRlbS52YWx1ZSlcbiAgICAgIClcbiAgICApO1xuICAgIHRoaXMucmVmZXJlbmNlTGluZUxlbmd0aCA9IHRoaXMucmVmZXJlbmNlTGluZXMubGVuZ3RoO1xuXG4gICAgdGhpcy5yZWZlcmVuY2VBcmVhUGF0aCA9IHJvdW5kZWRSZWN0KDAsIHRoaXMucmVmTWF4LCB0aGlzLmdyaWRMaW5lV2lkdGgsIHRoaXMucmVmTWluIC0gdGhpcy5yZWZNYXgsIDAsIFtcbiAgICAgIGZhbHNlLFxuICAgICAgZmFsc2UsXG4gICAgICBmYWxzZSxcbiAgICAgIGZhbHNlXG4gICAgXSk7XG4gIH1cblxuICBnZXRUaWNrcygpOiBhbnlbXSB7XG4gICAgbGV0IHRpY2tzO1xuICAgIGNvbnN0IG1heFRpY2tzID0gdGhpcy5nZXRNYXhUaWNrcygyMCk7XG4gICAgY29uc3QgbWF4U2NhbGVUaWNrcyA9IHRoaXMuZ2V0TWF4VGlja3MoNTApO1xuXG4gICAgaWYgKHRoaXMudGlja1ZhbHVlcykge1xuICAgICAgdGlja3MgPSB0aGlzLnRpY2tWYWx1ZXM7XG4gICAgfSBlbHNlIGlmICh0aGlzLnNjYWxlLnRpY2tzKSB7XG4gICAgICB0aWNrcyA9IHRoaXMuc2NhbGUudGlja3MuYXBwbHkodGhpcy5zY2FsZSwgW21heFNjYWxlVGlja3NdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGlja3MgPSB0aGlzLnNjYWxlLmRvbWFpbigpO1xuICAgICAgdGlja3MgPSByZWR1Y2VUaWNrcyh0aWNrcywgbWF4VGlja3MpO1xuICAgIH1cblxuICAgIHJldHVybiB0aWNrcztcbiAgfVxuXG4gIGdldE1heFRpY2tzKHRpY2tIZWlnaHQ6IG51bWJlcik6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IodGhpcy5oZWlnaHQgLyB0aWNrSGVpZ2h0KTtcbiAgfVxuXG4gIHRpY2tUcmFuc2Zvcm0odGljazogbnVtYmVyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3RoaXMuYWRqdXN0ZWRTY2FsZSh0aWNrKX0sJHt0aGlzLnZlcnRpY2FsU3BhY2luZ30pYDtcbiAgfVxuXG4gIGdyaWRMaW5lVHJhbnNmb3JtKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGB0cmFuc2xhdGUoNSwwKWA7XG4gIH1cblxuICB0aWNrVHJpbShsYWJlbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50cmltVGlja3MgPyB0cmltTGFiZWwobGFiZWwsIHRoaXMubWF4VGlja0xlbmd0aCkgOiBsYWJlbDtcbiAgfVxuXG4gIGdldEFwcHJveGltYXRlQXhpc1dpZHRoKCk6IG51bWJlciB7XG4gICAgY29uc3QgbWF4Q2hhcnMgPSBNYXRoLm1heCguLi50aGlzLnRpY2tzLm1hcCh0ID0+IHRoaXMudGlja1RyaW0odGhpcy50aWNrRm9ybWF0KHQpKS5sZW5ndGgpKTtcbiAgICBjb25zdCBjaGFyV2lkdGggPSA3O1xuICAgIHJldHVybiBtYXhDaGFycyAqIGNoYXJXaWR0aDtcbiAgfVxufVxuIl19