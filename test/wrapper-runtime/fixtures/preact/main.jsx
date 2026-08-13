// Renders the DOM described by contract.js. Assertions live there, not here.
import { render } from 'preact';
import { useState } from 'preact/hooks';
import { Card, TopBar, ActivityHeatmap, TimePicker } from '@arclux/arc-ui-preact';
import { FIXTURE, ROWS } from './contract.js';

function App() {
  const [value, setValue] = useState(FIXTURE.pickerInitial);
  const [count, setCount] = useState(0);

  return (
    <>
      <Card id="card" padding={FIXTURE.cardPadding}>
        <span id="card-default">DEFAULT</span>
        <span id="card-footer" slot="footer">FOOTER</span>
      </Card>

      <Card id="card-unset" />

      <TopBar id="topbar" heading={FIXTURE.topBarHeading}>
        <span id="tb-logo" slot="logo">LOGO</span>
        <span id="tb-actions" slot="actions">ACTIONS</span>
      </TopBar>

      <ActivityHeatmap
        id="heatmap"
        data={ROWS}
        weeks={FIXTURE.heatmapWeeks}
        endDate={FIXTURE.heatmapEndDate}
      />

      {/* Preact lowercases `on*` props onto the DOM, so the wrapper's own event
          mapping is the subject here — `onArcChange` is what a consumer writes
          and what the generated `TimePickerProps` advertises. */}
      <TimePicker
        id="picker"
        value={value}
        onArcChange={(e) => {
          setValue(e.detail.value);
          setCount((c) => c + 1);
        }}
      />

      <output id="echo">{value}</output>
      <output id="events">{count}</output>
    </>
  );
}

render(<App />, document.getElementById('root'));
