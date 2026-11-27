# nitish-portfolio

## Design direction

The site is **minimal**: dark, dotted, lots of space, one blue accent. Each
change adds one idea and leaves the rest alone.

- **One moving idea at a time.** A page has one interactive moment; hovers get
  one response. When riffing on feedback, change only what was asked.
- **Brand guide is a direction, not a spec.** The NM3217 guide's motifs (dots,
  lit vs unlit LEDs, blue full stop, dotted rules) are raw material to
  reinterpret for the web. Print layouts (business card, resume, terminal
  cover) stay in print.
- **Copy sounds like Nitish**: casual, a little self-deprecating. Plain words
  over developer in-jokes.

### Cross-page system

What ties the pages together:

- the blue full stop on headings and the active item
- dotted rules as every divider
- one signature moment per page (Home: the LED matrix, So Far: the LED year
  readout, Projects: the terminal sidebar)
- one dim level, 35%, for whatever isn't in focus
- small DM Sans eyebrows at 50% white

The **• / •• / ••• dot counts belong to Home only.** Other pages carry meaning
in their labels.

### Home dot matrix (`src/components/DotMatrix.tsx`)

- Icons are Lucide and light dots on the background grid itself, with a
  per-dot random "pixel" switch between icons.
- Grid size is set in one place: `--matrix-dot` in `src/styles/global.css`.
  Pitch and icon-dot size derive from the guide's ratios (dot:gap 3:4, icon
  dot ⅔ of pitch); change size there, not in the TS constants.
- Dropped and not to bring back: a separate denser icon grid, halftone
  sizing, Phosphor icons, a pulse on role change.

### Projects page

- **Terminal sidebar** (`ProjectsSidebar.astro`): `ls projects`, then one
  `ls -l <category>` per category, printed the first time you reach it. The
  prompt is a blue dot, lit for the category you're in and dim for the rest;
  it fades between the two. Output streams in a line at a time with no fade.
  Rows brighten on hover, no highlight box. The sidebar is `fixed`, so it
  never gets pushed up at the end of the page.
- **Easter egg:** each deliberate scroll (or pull, on phones) past the bottom
  types the next of three exchanges: `cd in-progress` gets permission denied,
  `sudo ls in-progress` shows a few joke files ("ok... its mostly ideas but
  still counts"), and `cat in-progress/???.md` is locked too, ending on "you
  know u can just ask me right?" with a `contact.` link to `/contact`. Then
  it's quiet. Clicking the idle prompt (dot + cursor) also runs the next one.
  Copy is Nitish's own; keep it as written.
- **Phones** (`ProjectsPromptBar.astro`, below `lg`): the terminal is one line
  pinned under the header, `• ls -l <category>` with `n/total`, retyped as you
  scroll. Tap it for the full listing (prints line by line, page dims to 35%
  and locks). The easter egg types under the last card, from its own tappable
  prompt or a pull past the bottom.
- **Cards** (`ProjectCard.astro`): image 45%, words 55%. Title trimmed to the
  image's top edge with `text-box: trim-start cap alphabetic`, description
  capped at ~46ch, then a `link / built with` spec. No dotted rule or blue
  bullets on cards: they read as clutter there.
- **Card hover:** viewfinder brackets (one L of lit dots per corner) slide in,
  and the image scales 3%. Effects that cover the image (halftone, a dot
  "lens") were tried and dropped: you couldn't make out the screenshot.

## Prototypes

Design explorations live in `src/pages/prototypes/` as variant pages built on
`_Shell.astro` and `_Picker.astro`.

- After adding a new prototype file, restart `pnpm dev`; until then Tailwind
  skips its classes and the layout looks broken.
- `_Picker` can fire the first `proto:mount` before the page's module script
  runs. A page's init also runs once on load when `#stage` already has content.
