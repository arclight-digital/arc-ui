// Renders the DOM described by contract.js. Assertions live there, not here.
import { createSignal } from 'solid-js';
import { render } from 'solid-js/web';
import { Card, TopBar, ActivityHeatmap, TimePicker } from '@arclux/arc-ui-solid';
import { FIXTURE, ROWS } from './contract.js';

function App() {
  const [value, setValue] = createSignal(FIXTURE.pickerInitial);
  const [count, setCount] = createSignal(0);

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

      <TimePicker
        id="picker"
        value={value()}
        onArcChange={(e) => {
          setValue(e.detail.value);
          setCount((c) => c + 1);
        }}
      />

      <output id="echo">{value()}</output>
      <output id="events">{count()}</output>
    </>
  );
}

render(() => <App />, document.getElementById('root'));
