/**
 * arc-video: the poster-to-playing state machine, the house event contract
 * (arc-play / arc-pause / arc-ended, each with detail.value = currentTime),
 * the player keyboard map, and the controls="false" ambient mode.
 *
 * No real media loads here: the tests stub the inner video element's media
 * surface (paused/duration/currentTime/play/pause) and drive the component
 * through the same DOM events a playing video would fire, which keeps every
 * test deterministic and off the network.
 */
import { expect } from '@esm-bundle/chai';
import { mount, cleanup, tick } from './helpers.js';

import '../src/content/video.register.js';

afterEach(() => cleanup());

async function mountVideo(attrs = '') {
  const el = mount(`<arc-video ${attrs}></arc-video>`);
  await el.updateComplete;
  return el;
}

const inner = (el) => el.shadowRoot.querySelector('video');
const wrapper = (el) => el.shadowRoot.querySelector('.video');
const controlsBar = (el) => el.shadowRoot.querySelector('.video__controls');
const overlay = (el) => el.shadowRoot.querySelector('.video__overlay');

/**
 * Replace the media surface of the inner video with a deterministic stub.
 * play()/pause() flip paused and fire the same non-bubbling events the real
 * element would, which is what the component's handlers are bound to.
 */
function stubMedia(video, { duration = 100, currentTime = 0 } = {}) {
  const state = { paused: true, time: currentTime };
  Object.defineProperty(video, 'duration', { configurable: true, get: () => duration });
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    get: () => state.time,
    set: (v) => { state.time = v; },
  });
  Object.defineProperty(video, 'paused', { configurable: true, get: () => state.paused });
  video.play = () => {
    state.paused = false;
    video.dispatchEvent(new Event('play'));
    return Promise.resolve();
  };
  video.pause = () => {
    state.paused = true;
    video.dispatchEvent(new Event('pause'));
  };
  return state;
}

/** Record the three house events in fire order. */
function record(el) {
  const seen = [];
  for (const name of ['arc-play', 'arc-pause', 'arc-ended']) {
    el.addEventListener(name, (e) => seen.push([name, e.detail.value]));
  }
  return seen;
}

function press(el, key) {
  wrapper(el).dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, composed: true })
  );
}

describe('arc-video poster state', () => {
  it('a bare element renders an empty styled frame without crashing', async () => {
    const el = await mountVideo();
    expect(wrapper(el)).to.exist;
    expect(inner(el)).to.exist;
    expect(inner(el).hasAttribute('src')).to.be.false;
    expect(overlay(el), 'play overlay shows before first play').to.exist;
    expect(controlsBar(el), 'no control bar before first play').to.not.exist;
  });

  it('passes src, poster and preload through to the native element', async () => {
    const el = await mountVideo('src="demo.mp4" poster="demo.jpg" preload="none"');
    const video = inner(el);
    expect(video.getAttribute('src')).to.equal('demo.mp4');
    expect(video.getAttribute('poster')).to.equal('demo.jpg');
    expect(video.getAttribute('preload')).to.equal('none');
  });

  it('labels the region and the overlay play button', async () => {
    const el = await mountVideo('label="Launch recap"');
    expect(wrapper(el).getAttribute('aria-label')).to.equal('Launch recap');
    const play = el.shadowRoot.querySelector('.video__play');
    expect(play.getAttribute('aria-label')).to.equal('Play Launch recap');

    const bare = await mountVideo();
    expect(wrapper(bare).getAttribute('aria-label')).to.equal('Video player');
  });
});

describe('arc-video playing state', () => {
  it('play switches from overlay to control bar and fires arc-play', async () => {
    const el = await mountVideo();
    const seen = record(el);

    inner(el).dispatchEvent(new Event('play'));
    await el.updateComplete;

    expect(overlay(el), 'overlay leaves once playback starts').to.not.exist;
    expect(controlsBar(el), 'control bar appears').to.exist;
    expect(seen).to.deep.equal([['arc-play', 0]]);
  });

  it('pause and ended fire with the current time on detail.value', async () => {
    const el = await mountVideo();
    const video = inner(el);
    const media = stubMedia(video, { duration: 60 });
    const seen = record(el);

    video.play();
    media.time = 42;
    video.pause();
    media.time = 60;
    video.dispatchEvent(new Event('ended'));
    await tick();

    expect(seen).to.deep.equal([
      ['arc-play', 0],
      ['arc-pause', 42],
      ['arc-ended', 60],
    ]);
  });

  it('the control bar play toggle drives the media element', async () => {
    const el = await mountVideo();
    const media = stubMedia(inner(el));

    inner(el).play();
    await el.updateComplete;

    const toggle = el.shadowRoot.querySelector('[part="play-toggle"]');
    expect(toggle.getAttribute('aria-label')).to.equal('Pause');

    toggle.click();
    await el.updateComplete;
    expect(media.paused).to.be.true;
    expect(toggle.getAttribute('aria-label')).to.equal('Play');
  });

  it('scrubbing seeks directly and updates the readout', async () => {
    const el = await mountVideo();
    const video = inner(el);
    stubMedia(video, { duration: 100 });

    video.play();
    video.dispatchEvent(new Event('loadedmetadata'));
    await el.updateComplete;

    const scrubber = el.shadowRoot.querySelector('.video__scrubber');
    expect(scrubber.getAttribute('max')).to.equal('100');

    scrubber.value = '30';
    scrubber.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;

    expect(video.currentTime).to.equal(30);
    expect(
      el.shadowRoot.querySelector('.video__time-current').textContent
    ).to.equal('0:30');
    expect(
      el.shadowRoot.querySelector('.video__time-total').textContent
    ).to.equal('1:40');
  });

  it('idle-dimmed controls come back to full strength on pointer activity', async () => {
    const el = await mountVideo();
    inner(el).dispatchEvent(new Event('play'));
    await el.updateComplete;

    // Drive the state machine directly rather than waiting out the 2s timer.
    el._controlsVisible = false;
    await el.updateComplete;
    expect(controlsBar(el).classList.contains('video__controls--idle')).to.be.true;

    wrapper(el).dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
    await el.updateComplete;
    expect(controlsBar(el).classList.contains('video__controls--idle')).to.be.false;
  });
});

describe('arc-video keyboard', () => {
  it('Space and K toggle playback', async () => {
    const el = await mountVideo();
    const media = stubMedia(inner(el));

    press(el, ' ');
    await el.updateComplete;
    expect(media.paused).to.be.false;

    press(el, 'k');
    await el.updateComplete;
    expect(media.paused).to.be.true;

    press(el, 'K');
    await el.updateComplete;
    expect(media.paused).to.be.false;
  });

  it('arrows seek five seconds, clamped to the media bounds', async () => {
    const el = await mountVideo();
    const video = inner(el);
    stubMedia(video, { duration: 12, currentTime: 4 });

    press(el, 'ArrowRight');
    expect(video.currentTime).to.equal(9);

    press(el, 'ArrowRight');
    expect(video.currentTime, 'clamped at duration').to.equal(12);

    press(el, 'ArrowLeft');
    expect(video.currentTime).to.equal(7);

    press(el, 'ArrowLeft');
    press(el, 'ArrowLeft');
    expect(video.currentTime, 'clamped at zero').to.equal(0);
  });

  it('M toggles mute on the host and the media element', async () => {
    const el = await mountVideo();

    press(el, 'm');
    await el.updateComplete;
    expect(el.muted).to.be.true;
    expect(inner(el).muted).to.be.true;

    press(el, 'M');
    await el.updateComplete;
    expect(el.muted).to.be.false;
    expect(inner(el).muted).to.be.false;
  });

  it('F is a quiet no-op when fullscreen is unavailable', async () => {
    const el = await mountVideo();
    // Simulate an embedded context with no fullscreen API on the element.
    Object.defineProperty(wrapper(el), 'requestFullscreen', {
      configurable: true,
      value: undefined,
    });
    press(el, 'f');
    await el.updateComplete; // nothing thrown, nothing changed
    expect(el._fullscreen).to.be.false;
  });
});

describe('arc-video controls="false"', () => {
  it('never shows the control bar, even during playback', async () => {
    const el = await mountVideo('controls="false"');
    inner(el).dispatchEvent(new Event('play'));
    await el.updateComplete;
    expect(controlsBar(el)).to.not.exist;
  });

  it('is not focusable and ignores the player keys', async () => {
    const el = await mountVideo('controls="false"');
    stubMedia(inner(el));

    expect(wrapper(el).hasAttribute('tabindex')).to.be.false;

    press(el, 'm');
    await el.updateComplete;
    expect(el.muted, 'M does nothing in ambient mode').to.be.false;
  });

  it('a bare controls attribute still means true', async () => {
    const el = await mountVideo('controls');
    expect(el.controls).to.be.true;
    expect(wrapper(el).getAttribute('tabindex')).to.equal('0');
  });
});
