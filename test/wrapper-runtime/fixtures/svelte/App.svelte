<!-- Renders the DOM described by contract.js. Assertions live there, not here. -->
<script>
  import { Card, TopBar, ActivityHeatmap, TimePicker } from '@arclux/arc-ui-svelte';
  import { FIXTURE, ROWS } from './contract.js';

  let value = $state(FIXTURE.pickerInitial);
  let count = $state(0);
</script>

<Card id="card" padding={FIXTURE.cardPadding}>
  <span id="card-default">DEFAULT</span>
  {#snippet footer()}<span id="card-footer" slot="footer">FOOTER</span>{/snippet}
</Card>

<Card id="card-unset" />

<TopBar id="topbar" heading={FIXTURE.topBarHeading}>
  {#snippet logo()}<span id="tb-logo" slot="logo">LOGO</span>{/snippet}
  {#snippet actions()}<span id="tb-actions" slot="actions">ACTIONS</span>{/snippet}
</TopBar>

<ActivityHeatmap
  id="heatmap"
  data={ROWS}
  weeks={FIXTURE.heatmapWeeks}
  endDate={FIXTURE.heatmapEndDate}
/>

<!-- `bind:value` is the write-back the wrapper's `$bindable` exists to serve;
     the separate handler counts the raw event. -->
<TimePicker id="picker" bind:value onarc-change={() => count++} />

<output id="echo">{value}</output>
<output id="events">{count}</output>
