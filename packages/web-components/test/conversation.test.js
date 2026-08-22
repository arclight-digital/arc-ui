/**
 * arc-conversation / arc-message — the transcript pair.
 *
 * What is pinned here: the three role voices render distinct alignment
 * classes and an unknown role lands on the default, the markdown path renders
 * slotted text through arc-markdown and re-renders when the slot changes
 * (including the firstUpdated read that survives the DSD slotchange trap),
 * the pending indicator, the follow-the-bottom scroll rule and its refusal to
 * yank a reader who scrolled up, scrollToEnd(), the away/return event pair
 * with distance payloads, timestamp composition, and that a bare arc-message
 * outside any conversation renders safely.
 */
import { expect } from '@esm-bundle/chai';
import '../src/feedback/conversation.register.js';
import '../src/feedback/message.register.js';
import { mount, cleanup, tick } from './helpers.js';

/** The rendered wrapper inside a message's shadow root. */
const bubbleRow = (message) => message.shadowRoot.querySelector('.message');

/** Wait a frame, so the conversation's follow-up pin has run. */
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));

/** The scroll container inside a conversation's shadow root. */
const scroller = (conversation) => conversation.shadowRoot.querySelector('.conversation');
/**
 * How far the transcript is from its bottom, in px, computed from the scroll
 * box rather than read off `_distanceFromEnd`.
 *
 * Same arithmetic as the getter, deliberately: the claim these tests make is
 * about where the view *is*, and reading the component's own opinion of that
 * would pass just as well if the pin never moved the scroller.
 */
const distanceFromEnd = (el) => {
  const c = scroller(el);
  return Math.max(0, c.scrollHeight - c.scrollTop - c.clientHeight);
};

/** Mount a fixed-height conversation with enough messages to overflow it. */
async function mountOverflowing(count = 12) {
  const messages = Array.from(
    { length: count },
    (_, i) => `<arc-message speaker="${i % 2 ? 'assistant' : 'user'}">Message ${i}</arc-message>`
  ).join('');
  const el = mount(
    `<arc-conversation style="--conversation-height: 160px; width: 320px">${messages}</arc-conversation>`
  );
  await el.updateComplete;
  await Promise.all([...el.querySelectorAll('arc-message')].map((m) => m.updateComplete));
  await tick(); // observer flush
  await nextFrame(); // the initial pin re-runs after the children render
  return el;
}

/** Drive the scroll position directly and run the scroll handler. */
function scrollTo(conversation, top) {
  const c = scroller(conversation);
  c.scrollTop = top;
  c.dispatchEvent(new Event('scroll'));
}

describe('arc-message roles', () => {
  afterEach(cleanup);

  it('renders a distinct alignment class per role', async () => {
    for (const role of ['user', 'assistant', 'system']) {
      const el = mount(`<arc-message speaker="${role}">hi</arc-message>`);
      await el.updateComplete;
      expect(
        bubbleRow(el).classList.contains(`message--${role}`),
        `role="${role}" must carry its own class`
      ).to.equal(true);
    }
  });

  it('defaults to user, and routes an unknown role onto user', async () => {
    const bare = mount('<arc-message>hi</arc-message>');
    const unknown = mount('<arc-message speaker="robot">hi</arc-message>');
    await bare.updateComplete;
    await unknown.updateComplete;
    expect(bubbleRow(bare).classList.contains('message--user')).to.equal(true);
    expect(bubbleRow(unknown).classList.contains('message--user')).to.equal(true);
    expect(bubbleRow(unknown).classList.contains('message--robot')).to.equal(false);
  });
});

describe('arc-message markdown', () => {
  afterEach(cleanup);

  it('renders slotted text through arc-markdown', async () => {
    const el = mount('<arc-message speaker="assistant" markdown>Use **bold** moves</arc-message>');
    await el.updateComplete;
    await tick();
    await el.updateComplete;

    const md = el.shadowRoot.querySelector('arc-markdown');
    expect(md, 'markdown mode must compose arc-markdown').to.exist;
    await md.updateComplete;
    const strong = md.shadowRoot.querySelector('strong');
    expect(strong, 'the slot text must arrive parsed').to.exist;
    expect(strong.textContent).to.equal('bold');
  });

  it('re-renders when the slotted text changes', async () => {
    const el = mount('<arc-message markdown>plain</arc-message>');
    await el.updateComplete;
    await tick();

    el.textContent = 'now with *emphasis*';
    await tick(); // slotchange
    await el.updateComplete;
    const md = el.shadowRoot.querySelector('arc-markdown');
    await md.updateComplete;
    expect(md.shadowRoot.querySelector('em'), 'a slot update must re-parse').to.exist;
  });

  it('reads the slot when no native slotchange ever arrives (DSD ordering)', async () => {
    // Under declarative shadow DOM the parser assigns the slot before the
    // component's listener exists, so the initial slotchange is missed. Model
    // that by dropping the *trusted* event — the one the browser sends, which a
    // server-rendered upgrade never gets — and leaving only the synthetic
    // dispatch from hydrateSlots.
    //
    // This used to stub the handler out entirely and assert that a second,
    // direct read in firstUpdated saved the render. That read is gone:
    // hydrateSlots delivers the missing event through the same handler a real
    // slotchange reaches, which is one mechanism instead of two, and stubbing
    // the handler now defeats the thing under test rather than isolating it.
    const el = document.createElement('arc-message');
    el.markdown = true;
    const read = el._onSlotChange.bind(el);
    el._onSlotChange = (e) => {
      if (!e.isTrusted) read(e);
    };
    el.append(document.createTextNode('**upgraded**'));
    document.body.append(el);
    await el.updateComplete;
    await tick(); // the hydration dispatch, and the render it schedules
    await el.updateComplete;

    const md = el.shadowRoot.querySelector('arc-markdown');
    expect(md, 'the hydration dispatch must have read the already-assigned slot').to.exist;
    await md.updateComplete;
    expect(md.shadowRoot.querySelector('strong')).to.exist;
  });

  it('leaves slotted markup alone when markdown is off', async () => {
    const el = mount('<arc-message>**not parsed**</arc-message>');
    await el.updateComplete;
    await tick();
    expect(el.shadowRoot.querySelector('arc-markdown')).to.equal(null);
    expect(el.textContent).to.contain('**not parsed**');
  });
});

describe('arc-message pending', () => {
  afterEach(cleanup);

  it('renders the typing indicator with three dots in place of the body', async () => {
    const el = mount('<arc-message speaker="assistant" pending></arc-message>');
    await el.updateComplete;
    const dots = el.shadowRoot.querySelectorAll('.message__pending-dot');
    expect(dots.length).to.equal(3);
  });

  it('clears the indicator when pending flips off', async () => {
    const el = mount('<arc-message speaker="assistant" pending>Done</arc-message>');
    await el.updateComplete;
    el.pending = false;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.message__pending')).to.equal(null);
  });
});

describe('arc-message meta line', () => {
  afterEach(cleanup);

  it('renders author and a relative timestamp through arc-time-ago', async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3_600_000).toISOString();
    const el = mount(`<arc-message author="Ada" timestamp="${twoHoursAgo}">hi</arc-message>`);
    await el.updateComplete;

    expect(el.shadowRoot.querySelector('.message__author').textContent).to.equal('Ada');
    const time = el.shadowRoot.querySelector('arc-time-ago');
    expect(time, 'timestamps must compose arc-time-ago').to.exist;
    expect(time.getAttribute('datetime')).to.equal(twoHoursAgo);
    await time.updateComplete;
    expect(time.shadowRoot.textContent).to.contain('2 hours ago');
  });

  it('renders no meta line without author or timestamp', async () => {
    const el = mount('<arc-message>hi</arc-message>');
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.message__meta')).to.equal(null);
  });
});

describe('arc-conversation auto-scroll', () => {
  afterEach(cleanup);

  it('opens scrolled to the latest message', async () => {
    const el = await mountOverflowing();
    const c = scroller(el);
    expect(c.scrollHeight, 'the fixture must actually overflow').to.be.greaterThan(c.clientHeight);
    expect(distanceFromEnd(el)).to.be.at.most(1);
  });

  it('follows an appended message when the reader is near the bottom', async () => {
    const el = await mountOverflowing();
    scrollTo(el, scroller(el).scrollHeight); // pinned to the end

    const msg = document.createElement('arc-message');
    msg.setAttribute('role', 'assistant');
    msg.textContent = 'A brand new reply that takes up space';
    el.append(msg);
    await msg.updateComplete;
    await tick(); // MutationObserver flush
    await nextFrame(); // the pin re-runs once the message's shadow has rendered

    expect(distanceFromEnd(el), 'the view must stick to the new end').to.be.at.most(1);
  });

  it('never yanks a reader who has scrolled up', async () => {
    const el = await mountOverflowing();
    scrollTo(el, 0); // reading the top of the transcript
    const before = scroller(el).scrollTop;

    const msg = document.createElement('arc-message');
    msg.textContent = 'New message while reading history';
    el.append(msg);
    await msg.updateComplete;
    await tick();
    await nextFrame(); // even the deferred pin must respect the reader

    expect(scroller(el).scrollTop, 'scroll position must not move').to.equal(before);
  });

  it('follows streaming growth of an existing message (characterData)', async () => {
    const el = await mountOverflowing();
    scrollTo(el, scroller(el).scrollHeight);

    const last = el.querySelector('arc-message:last-of-type');
    last.append(document.createTextNode(' — and a long streamed continuation of the reply. '.repeat(10)));
    await tick();
    await nextFrame();

    expect(distanceFromEnd(el)).to.be.at.most(1);
  });

  it('leaves scrolling alone entirely when autoScroll is false', async () => {
    const el = await mountOverflowing();
    el.autoScroll = false;
    scrollTo(el, scroller(el).scrollHeight);

    const msg = document.createElement('arc-message');
    msg.textContent = 'Appended without follow';
    el.append(msg);
    await msg.updateComplete;
    await tick();

    expect(distanceFromEnd(el), 'the appended message must sit below the fold').to.be.greaterThan(1);
  });
});

describe('arc-conversation scrollToEnd()', () => {
  afterEach(cleanup);

  it('scrolls the container to the bottom on demand', async () => {
    const el = await mountOverflowing();
    scrollTo(el, 0);
    expect(distanceFromEnd(el)).to.be.greaterThan(0);

    el.scrollToEnd();
    expect(distanceFromEnd(el)).to.be.at.most(1);
  });
});

describe('arc-conversation scroll events', () => {
  afterEach(cleanup);

  it('fires arc-scroll-away once, with the distance from the bottom', async () => {
    const el = await mountOverflowing();
    const details = [];
    el.addEventListener('arc-scroll-away', (e) => details.push(e.detail));

    scrollTo(el, 0);
    scrollTo(el, 10); // still far away — no second event
    expect(details.length).to.equal(1);
    expect(details[0].value).to.be.a('number');
    expect(details[0].value).to.be.greaterThan(100);
  });

  it('fires arc-scroll-return when the reader comes back within the threshold', async () => {
    const el = await mountOverflowing();
    const details = [];
    el.addEventListener('arc-scroll-return', (e) => details.push(e.detail));

    scrollTo(el, 0);
    scrollTo(el, scroller(el).scrollHeight);
    expect(details.length).to.equal(1);
    expect(details[0].value).to.be.at.most(100);
  });

  it('scrollToEnd() from far away announces the return', async () => {
    const el = await mountOverflowing();
    scrollTo(el, 0);
    const details = [];
    el.addEventListener('arc-scroll-return', (e) => details.push(e.detail));

    el.scrollToEnd();
    expect(details.length).to.equal(1);
  });
});

describe('bare arc-message', () => {
  afterEach(cleanup);

  it('renders safely outside any conversation', async () => {
    const el = mount('<arc-message speaker="assistant" author="Solo">Standing alone</arc-message>');
    await el.updateComplete;
    expect(bubbleRow(el).classList.contains('message--assistant')).to.equal(true);
    expect(el.textContent).to.contain('Standing alone');
  });
});
