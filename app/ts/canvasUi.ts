/**
 * Simple UI system which uses HTML5 canvas.
 * @description This is minimum defnitions for avoid TS compile error.
 */
namespace CanvasUI {

    /**
     * UI control base class.Base control class
     * @description This is minimum defnitions for avoid TS compile error.
     */
    export abstract class Control {

        manager: Manager;
        showBounds: boolean = false;
        isVisible: boolean = true;

        /**
         * Gets a bounds value.
         */
        bounds() : Rect { return this._bounds; }

        // Mouse events.
        onMouseMove(pos: Point) : boolean { return false; }
        onMouseDown(pos: Point) : boolean { return false; }
        onMouseUp(pos: Point) : boolean { return false; }

        /**
         * Draw methods which get called when it needs to render control.
         * @param context {CanvasRenderingContext2D} The cavas rendering context.
         */
        abstract draw(context: CanvasRenderingContext2D);

        /**
         * Set the bounds for mouse events.
         * @param bounds  {Rect} The bounds value.
         */
        setBounds(bounds: Rect){
            this._bounds = bounds;
        }

        captureMouse() : boolean {
            return this.manager.captureMouse(this);
        }

        releaseMouse() : boolean {
            return this.manager.releaseMouse(this);
        }

        protected _bounds: Rect;
    }

    /**
     * Slider orientation enum
     */
    export enum SliderOrientation {
        Horizontal,
        Vertical,
    }

    /**
     * The Slider class which represets slider control
     */
    export class Slider extends Control {

        orientation: SliderOrientation;
        value: number;

        private _valueChangedCallbacks: Array<(value: number) => void> = new Array();
        private _thumbPos: Vector2;
        private _thumbRc: Rect;
        private _thumbDraggingOffset: Vector2 = null;

        private static _trackWidth: number = 4;
        private static _thumbSize: number = 12;

        private static _thumbVertices: Vector2[] = [
            new Vector2(-6,  0),
            new Vector2( 1, -6),
            new Vector2( 6, -6),
            new Vector2( 6,  6),
            new Vector2( 1,  6),
            new Vector2(-6,  0),
        ];

        constructor(){
            super();

            this.value = 0;
            this.orientation = SliderOrientation.Horizontal;
        }

        onValueChanged(callback: (value: number) => void){
            this._valueChangedCallbacks.push(callback);
        }

        setBounds(bounds: Rect){
            super.setBounds(bounds);
            this.computePositions();
            this.updateThumbRect();
        }

        onMouseUp(pos: Point) : boolean {
            if (this._thumbDraggingOffset != null){
                this.releaseMouse();
                this._thumbDraggingOffset = null;
            }

            return false;
        }

        onMouseDown(pos: Point) : boolean {

            if (this._thumbRc.containsPoint(pos)){

                this._thumbDraggingOffset = new Vector2(
                    this._thumbPos.x - pos.x,
                    this._thumbPos.y - pos.y);

                this.captureMouse();
            }

            return false;
        }

        onMouseMove(pos: Point): boolean {
            if (this._thumbDraggingOffset == null) return false;

            var a = this.computePositions();
            var newValue = (this.orientation == SliderOrientation.Horizontal)?
                Slider.computeValue(a.p1.x, a.p2.x, pos.x + this._thumbDraggingOffset.x):
                Slider.computeValue(a.p1.y, a.p2.y, pos.y + this._thumbDraggingOffset.y);

            this.value = newValue;
            this.updateThumbRect();

            for (var callback of this._valueChangedCallbacks){
                callback(newValue);
            }

            return false;
        }

        draw(context: CanvasRenderingContext2D){

            var a = this.computePositions();
            var p1: Vector2 = a.p1;
            var p2: Vector2 = a.p2;
            var mtx: Matrix = a.mtx;
            var thumbPos = this._thumbPos;

            var trackWidth = Slider._trackWidth;
            var ctx = context;

            // Draw track
            ctx.beginPath();
            ctx.strokeStyle  = '#757575';
            ctx.lineCap = 'round';
            ctx.lineWidth = trackWidth;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle  = '#789ec8';
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(thumbPos.x, thumbPos.y);
            ctx.stroke();

            // Draw thumb
            ctx.strokeStyle  ='#202020';
            ctx.fillStyle ='#f0f0f0';
            ctx.lineWidth = 1;
            ctx.beginPath();

            for(var i = 0; i < Slider._thumbVertices.length; ++i){
                var v = Slider._thumbVertices[i];
                var p = Vector2.add(thumbPos, Vector2.transformNormal(v, mtx));
                if (i == 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }
            }

            ctx.fill();
            ctx.stroke();

            if (this.showBounds){
                ctx.strokeStyle = 'yellow';
                var rc = this._thumbRc;
                ctx.strokeRect(
                    rc.left, rc.top, rc.right - rc.left, rc.bottom - rc.top);
            }
        }

        private computePositions(): {p1: Vector2, p2: Vector2, mtx: Matrix}{
            var p1: Vector2;
            var p2: Vector2;
            var rc = this._bounds;
            var mtx: Matrix;

            if (this.orientation == SliderOrientation.Horizontal){
                var cy = MathHelper.lerp(rc.top, rc.bottom, 0.5);
                p1 = new Vector2(rc.left, cy);
                p2 = new Vector2(rc.right, cy);
                mtx = Matrix.createRotationZ(MathHelper.toRadians(90));
            } else {
                var cx = MathHelper.lerp(rc.left, rc.right, 0.5);
                p1 = new Vector2(cx, rc.bottom);
                p2 = new Vector2(cx, rc.top);
                mtx = Matrix.identity();
            }

            this._thumbPos = Vector2.lerp(p1, p2, this.value);

            return {p1: p1, p2: p2, mtx: mtx};
        }

        private updateThumbRect(){

            var ts = Slider._thumbSize / 2 + 4;
            this._thumbRc = new Rect(
                this._thumbPos.x - ts, this._thumbPos.y - ts,
                this._thumbPos.x + ts, this._thumbPos.y + ts);
        }

        private static computeValue(p1: number, p2: number, p: number){
            return MathHelper.saturate((p - p1) / (p2 - p1));
        }

    }

    /**
     * The Manager class which manages controls.
     */
    export class Manager {

        private _viewport: HTMLElement;
        private _canvas: HTMLCanvasElement;
        private _controls : Control[];
        private _captureedControl: Control = null;
        private _context: CanvasRenderingContext2D;

        constructor(viewport: HTMLElement, canvas : HTMLCanvasElement){
            this._viewport = viewport;
            this._canvas = canvas;
            this._context = canvas.getContext('2d');
            this._controls = new Array();

            var me = this;

            this.handleMouseEvent('pointerdown', function(p: Point, c: Control){
                return c.onMouseDown(p);
            });

            // mouse capturering via document element
            // http://news.qooxdoo.org/mouse-capturing
            document.addEventListener('pointermove', (e) => {
                if (me._captureedControl == null) return;
                me._captureedControl.onMouseMove(Point.subtract(
                    new Point(e.clientX, e.clientY), Rect.fromElementBounds(me._viewport).pos()));
            });

            document.addEventListener('pointerup', (e) => {
                if (me._captureedControl == null) return;
                me._captureedControl.onMouseUp(Point.subtract(
                    new Point(e.clientX, e.clientY), Rect.fromElementBounds(me._viewport).pos()));
            });
        }

        addControl(control: Control){
            control.manager = this;
            this._controls.push(control);
        }

        captureMouse(control: Control) : boolean {
            this._captureedControl = control;
            return true;
        }

        releaseMouse(control: Control) : boolean{
            this._captureedControl = null;
            return true;
        }

        draw(){
            for(var c of this._controls){
                c.draw(this._context);

                if(c.showBounds) {
                    var rc = c.bounds();
                    this._context.strokeStyle = 'red';
                    this._context.lineWidth = 1;
                    this._context.strokeRect(
                        rc.left, rc.top, rc.right - rc.left, rc.bottom - rc.top);
                }
            }
        }

        private handleMouseEvent(eventName: string, callback: (pos: Point, control: Control) => boolean)
        {
            var me = this;

            this._canvas.addEventListener(eventName, (e : MouseEvent) =>
            {
                var pos = Point.subtract(
                    new Point(e.clientX, e.clientY), Rect.fromElementBounds(me._canvas).pos());

                if (me._captureedControl)
                {
                    callback(pos, me._captureedControl);
                }
                else
                {
                    for(var c of me._controls)
                    {
                        if (c.bounds().containsPoint(pos) == false) continue;
                        if (callback(pos, c)) break;
                    }
                }
            });
        }
    }

};