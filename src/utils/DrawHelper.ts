import { Point, PointGroup } from "../typings";
import { getTPoint } from "./bezierUtils";
import { CANVAS_COLORS } from "./canvasPalette";

class DrawHelper {
  protected _ctx: CanvasRenderingContext2D | undefined;
  protected _animationFrame: number | undefined;
  protected _speed = 1;

  constructor(ctx?: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  public get ctx(): CanvasRenderingContext2D | undefined {
    return this._ctx;
  }

  public set ctx(ctx: CanvasRenderingContext2D | undefined) {
    this._ctx = ctx;
  }

  protected stopAnimation(): void {
    if (this._animationFrame === undefined) return;

    window.cancelAnimationFrame(this._animationFrame);
    this._animationFrame = undefined;
  }

  public setSpeed(speed: number): void {
    this._speed = Math.min(2, Math.max(0.1, speed));
  }

  protected clearCanvas(): void {
    if (!this._ctx) return;

    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  protected drawControlPoints(points: Point[]): void {
    points.forEach((point) => this.drawPoint(point, CANVAS_COLORS.control));
  }

  protected drawBezierFrame(
    pathPoints: Point[],
    t: number,
    finalPath: Point[]
  ): Point | undefined {
    if (pathPoints.length === 0) return undefined;

    if (pathPoints.length < 2) {
      const currentPoint = pathPoints[0];

      finalPath.push(currentPoint);
      this.drawPaths(finalPath, CANVAS_COLORS.curve);

      return currentPoint;
    }

    this.drawPaths(pathPoints, CANVAS_COLORS.guide);

    const tPoints = [] as Point[];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      tPoints.push(getTPoint(pathPoints[i], pathPoints[i + 1], t));
    }

    return this.drawBezierFrame(tPoints, t, finalPath);
  }

  public clear(): void {
    this.stopAnimation();
    this.clearCanvas();
  }

  public drawRect(x: number, y: number, w: number, h: number): void {
    if (!this._ctx) return;

    this._ctx.strokeRect(x, y, w, h);
  }

  public drawPoint({ x, y }: Point, color?: string): void {
    if (!this._ctx) return;

    this._ctx.beginPath();
    this._ctx.moveTo(x, y);
    this._ctx.arc(x, y, 5, 0, Math.PI * 2);
    this._ctx.fillStyle = color || CANVAS_COLORS.control;
    this._ctx.fill();
  }

  public drawPaths(points: Point[], color?: string): void {
    if (!this._ctx || points.length === 0) return;

    this._ctx.lineWidth = 2;
    this._ctx.strokeStyle = color || CANVAS_COLORS.curve;
    this._ctx.beginPath();

    points.forEach(({ x, y }, index) => {
      if (index === 0) {
        this._ctx?.moveTo(x, y);
        return;
      }

      this._ctx?.lineTo(x, y);
    });

    this._ctx.stroke();
  }

  public renderPointGroups(groups: PointGroup[]): void {
    if (!this._ctx) return;

    this.stopAnimation();
    this.clearCanvas();
    groups.forEach((group) => this.drawControlPoints(group));
  }

  public drawBezier(groups: PointGroup[], speed: number): void {
    if (!this._ctx) return;

    const drawableGroups = groups.filter((group) => group.length >= 3);
    if (drawableGroups.length === 0) return;

    this.stopAnimation();

    this.setSpeed(speed);
    const finalPaths = drawableGroups.map(() => [] as Point[]);

    let currentGroupIndex = 0;
    let offset = 0;
    let previousTime: number | undefined;

    const renderFrame = () => {
      this.clearCanvas();

      drawableGroups.forEach((group, index) => {
        if (index < currentGroupIndex) {
          this.drawPaths(group, CANVAS_COLORS.guide);
          this.drawPaths(finalPaths[index], CANVAS_COLORS.curve);
          this.drawControlPoints(group);
          return;
        }

        if (index > currentGroupIndex) {
          this.drawControlPoints(group);
          return;
        }

        const currentPoint = this.drawBezierFrame(group, offset, finalPaths[index]);

        this.drawControlPoints(group);
        if (currentPoint) {
          this.drawPoint(currentPoint, CANVAS_COLORS.curve);
        }
      });
    };

    const animate = (timestamp: number) => {
      if (currentGroupIndex >= drawableGroups.length) {
        this._animationFrame = undefined;
        return;
      }

      if (previousTime === undefined) {
        previousTime = timestamp;
      } else {
        offset = Math.min(
          1,
          offset + (timestamp - previousTime) * 0.001 * this._speed
        );
        previousTime = timestamp;
      }

      renderFrame();

      if (offset >= 1) {
        currentGroupIndex += 1;
        offset = 0;
        previousTime = undefined;

        if (currentGroupIndex >= drawableGroups.length) {
          this._animationFrame = undefined;
          return;
        }
      }

      this._animationFrame = window.requestAnimationFrame(animate);
    };

    this._animationFrame = window.requestAnimationFrame(animate);
  }
}

export default DrawHelper;
