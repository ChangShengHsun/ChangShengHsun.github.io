---
title: OpenStage
summary: 'An open-source collaborative 3D stage formation and choreography editor.'
date: 2026-05-01  # Placeholder date — adjust to your actual project start

# External links shown on the project card / page
links:
  - type: site
    url: https://github.com/ChangShengHsun/OpenStage

tags:
  - TypeScript
  - React
  - Real-time Collaboration
---

An open-source stage formation and choreography editor for choreographers,
cheer coaches, and stage managers. Plan 2D formations on a digital stage,
sync them to music, preview transitions in **2D and 3D**, and export
walk-chart PDFs or rendered videos.

<!--more-->

Built with React (react-konva for the 2D canvas, @react-three/fiber for 3D
preview) and a NestJS backend, with real-time multi-user editing powered by
Yjs CRDT — shared cursors and per-user undo included. Ships as a standalone
Windows desktop app that works offline for solo editing.
