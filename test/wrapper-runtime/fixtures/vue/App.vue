<!-- Renders the DOM described by contract.js. Assertions live there, not here. -->
<script setup>
import { ref } from 'vue';
import { Card, TopBar, ActivityHeatmap, TimePicker } from '@arclux/arc-ui-vue';
import { FIXTURE, ROWS } from './contract.js';

const value = ref(FIXTURE.pickerInitial);
const count = ref(0);
</script>

<template>
  <Card id="card" :padding="FIXTURE.cardPadding">
    <span id="card-default">DEFAULT</span>
    <template #footer><span id="card-footer" slot="footer">FOOTER</span></template>
  </Card>

  <Card id="card-unset" />

  <TopBar id="topbar" :heading="FIXTURE.topBarHeading">
    <template #logo><span id="tb-logo" slot="logo">LOGO</span></template>
    <template #actions><span id="tb-actions" slot="actions">ACTIONS</span></template>
  </TopBar>

  <ActivityHeatmap
    id="heatmap"
    :data="ROWS"
    :weeks="FIXTURE.heatmapWeeks"
    :endDate="FIXTURE.heatmapEndDate"
  />

  <!-- `v-model:value` is the write-back the wrapper's `update:value` emit
       exists to serve; the separate handler counts the raw event. -->
  <TimePicker id="picker" v-model:value="value" @arc-change="count++" />

  <output id="echo">{{ value }}</output>
  <output id="events">{{ count }}</output>
</template>
