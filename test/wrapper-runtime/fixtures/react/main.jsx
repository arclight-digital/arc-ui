// Renders the DOM described by contract.js. Assertions live there, not here.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Card, TopBar, ActivityHeatmap, TimePicker } from '@arclux/arc-ui-react';
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

createRoot(document.getElementById('root')).render(<App />);
