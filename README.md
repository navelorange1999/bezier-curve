# Bezier Curve

A small Vue 3 + TypeScript + Canvas demo for drawing and visualizing n-th order Bezier curves.

This project is built as an educational visualization rather than a full curve editor. Instead of calling Canvas bezier APIs directly, it computes intermediate points recursively and animates the curve generation process step by step.

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Demo

https://navelorange1999.github.io/bezier-curve/

## What It Does

- Lets you place control points by clicking on the canvas
- Draws Bezier curves of arbitrary order as long as there are at least 3 points
- Animates the full interpolation process instead of rendering only the final curve
- Shows the construction layers used to generate the curve
- Lets you reset the canvas and start over

## Interaction

1. Click anywhere on the canvas to add control points.
2. After at least 3 points are placed, click `Start draw`.
3. Watch the curve being constructed over time.
4. Click `Clear` to reset the canvas and point list.

## Visual Legend

- Gray points: control points placed by the user
- Green polylines: intermediate interpolation layers
- Blue points: the current point on the Bezier curve for the current `t`
- Red polyline: the accumulated Bezier curve path

## How It Works

The implementation follows the same idea as de Casteljau's algorithm:

1. For a given interpolation value `t`, take every adjacent pair of points.
2. Compute the point between them with linear interpolation:

```ts
P = (1 - t) * P1 + t * P2
```

3. Use the newly generated points as the next layer.
4. Repeat recursively until only one point remains.
5. Append that final point to the output path.
6. Increase `t` gradually and redraw the scene to animate the full curve.

In this repository:

- `src/utils/bezierUtils.ts` contains the linear interpolation helper
- `src/utils/DrawHelper.ts` handles canvas drawing and recursive curve construction
- `src/App.vue` wires the canvas events to the drawing logic

## Tech Stack

- Vue 3
- TypeScript
- Vite
- HTML Canvas

## Local Development

Install dependencies and start the dev server:

```bash
yarn install
yarn dev
```

Create a production build:

```bash
yarn build
```

## Project Structure

```text
src/
├── App.vue                 # Canvas page and interaction logic
├── components/
│   ├── Tools.vue           # Clear / draw controls
│   └── Record.vue          # Unused point list component
├── utils/
│   ├── bezierUtils.ts      # Linear interpolation helper
│   └── DrawHelper.ts       # Canvas drawing and recursive Bezier animation
└── typings.ts              # Shared point type
```

## Notes And Limitations

- The canvas size is currently fixed at `900 x 450`.
- Control points can be added, but not dragged, edited, or removed individually.
- The current UI starts drawing only when there are at least 3 control points.
- This is a visualization demo focused on curve construction, not a production-ready design tool.
