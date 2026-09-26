// Renders the DOM described by contract.js. Assertions live there, not here.
import { Component } from '@angular/core';
import { Card, TopBar, ActivityHeatmap, TimePicker, Checkbox } from '@arclux/arc-ui-angular';
import { FIXTURE, ROWS } from './contract.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Card, TopBar, ActivityHeatmap, TimePicker, Checkbox],
  template: `
    <arc-card id="card" [padding]="fixture.cardPadding">
      <span id="card-default">DEFAULT</span>
      <span id="card-footer" slot="footer">FOOTER</span>
    </arc-card>

    <arc-card id="card-unset"></arc-card>

    <arc-top-bar id="topbar" [heading]="fixture.topBarHeading">
      <span id="tb-logo" slot="logo">LOGO</span>
      <span id="tb-actions" slot="actions">ACTIONS</span>
    </arc-top-bar>

    <arc-activity-heatmap
      id="heatmap"
      [data]="rows"
      [weeks]="fixture.heatmapWeeks"
      [endDate]="fixture.heatmapEndDate"
    ></arc-activity-heatmap>

    <!-- \`[(value)]\` is the write-back the wrapper's \`@Output() valueChange\`
         exists to serve; the separate binding counts the raw event. -->
    <arc-time-picker
      id="picker"
      [(value)]="value"
      (arc-change)="count = count + 1"
    ></arc-time-picker>

    <!-- Unset, as a two-way binding starts out: see the bindable-unset probe. -->
    <arc-checkbox id="unset-bind" [(checked)]="unsetChecked"></arc-checkbox>

    <output id="echo">{{ value }}</output>
    <output id="events">{{ count }}</output>
  `,
})
export class AppComponent {
  readonly fixture = FIXTURE;
  readonly rows = ROWS;
  value = FIXTURE.pickerInitial;
  count = 0;
  unsetChecked: boolean | undefined = undefined;
}
