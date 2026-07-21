---
title: GridStage
summary: '獨立開發開源舞蹈隊形編輯器，功能橫向超越 ArrangeUs 等商用軟體。創新導入「影片轉隊形圖」與「即時同步協作」核心技術，建立高技術壁壘，大幅優化傳統排舞工作流。'
date: 2026-06-20

# External links shown on the project card / page
links:
  - type: code
    url: https://github.com/ChangShengHsun/GridStage
  - type: site
    url: https://changshenghsun.github.io/GridStage/

tags:
  - TypeScript
  - React
  - Real-time Collaboration
  - Computer Vision
---

**2026 — in active development**

## Why I built this

As a dancer, formations were always the part nobody wanted to handle. How do you
place everyone so the stage actually looks right? Will two people run into each
other halfway through a transition? Those questions bothered me every time we
put a piece together. I went looking for an open-source tool and there was
none — and I was not about to pay a subscription for the commercial ones. So I
built **GridStage**.

## What it is

A top-down 2D stage where you place performers, add formations along a timeline
synced to the music, and preview the walk-in transitions in 2D or 3D. It exports
walk-chart PDFs (one page per dancer), videos, and GIFs. Several people can edit
the same piece at once — live cursors, presence, and undo that only reverts your
own changes — over a CRDT, a data structure where concurrent edits merge without
a central referee.
The part I care most about is the vision pipeline: pause a rehearsal video on a
formation, click the four stage corners once, and the app detects the dancers,
maps their foot positions onto the stage floor, and drops them into the editor
as a normal editable formation. All of it runs in the browser.

## Where it stands

v0.8.6 · 130 commits · ~16k lines of strict-mode TypeScript in a pnpm monorepo ·
24 unit-test files plus a Playwright end-to-end suite. Three ways to run it, none
requiring an account: a Windows/macOS desktop app, an installable PWA that works
offline on a phone, and a Docker self-host stack.

Measured, not claimed:

- **60 performers × 4 formations** in a permanent end-to-end stress test —
  dragging stays accurate and playback holds ~57 fps (CI floor 20).
- **Video → formation capture** runs entirely client-side (YOLOX-nano through
  onnxruntime-web, WebGPU with a wasm fallback): 6 of 7 dancers recovered from a
  real six-dancer rehearsal photo, ~1.8 s per frame on CPU alone. Zero server
  cost, and no one's rehearsal footage leaves their laptop.

Against **ArrangeUs**, the category leader, and the other commercial formation
apps I audited before starting, these are the things they do not do at all
(checked July 2026; their feature lists do move):

| Capability | GridStage | ArrangeUs & other commercial apps |
| --- | --- | --- |
| Real-time multi-user editing | CRDT (Yjs) — live cursors, presence, per-user undo | one editor at a time, files passed around |
| Formations captured from a rehearsal video | on-device detection + homography | nothing on the market does this |
| Rehearsal-vs-plan review | per-dancer drift, C-position centering, left–right asymmetry | — |
| Transition collision warnings | Hungarian matching + sweep-line crossing detection | — |
| 3D preview | camera presets + follow-a-performer | limited |
| Video / GIF export with music | yes | limited |
| Price and licence | free, MIT, self-hostable | subscription, closed source |

The place I am clearly behind is distribution, not capability: ArrangeUs has
457k+ users and years of tutorials, GridStage has an install page.

## What's next

- **Building a user community.** The capability gap is closed; the distribution
  one is not. Demo videos and an in-app guide are already in progress, and the
  next step is getting the editor in front of real dance teams and cheer squads
  and running on their feedback — the work that decides whether GridStage stays
  a portfolio piece or becomes a tool people actually choreograph with.
- **Accounts and cloud sync.** Today a piece lives on one machine and travels as
  a `.gridstage` file. This is the largest remaining gap against commercial
  tools, and the one architectural decision I still owe the project — self-host
  or a hosted backend.
- **Full rehearsal-vs-plan deviation report.** The first cut compares one paused
  frame against the plan. Scanning a whole rehearsal into a per-formation error
  timeline is the version that closes the plan → rehearse → correct loop, and
  it is the hardest part for anyone to copy.
- **Stage lighting and cue sheets.** Colored lights on the 2D stage and a 3D
  wash, cues on the timeline, exported as a printable cue sheet — the other half
  of what a stage manager actually needs.
- **Plugins and a community template library**, so formation libraries can grow
  without me writing every one of them.
