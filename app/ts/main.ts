/// <reference path="d.ts/cep.d.ts"/>
/// <reference path="d.ts/jquery.d.ts"/>

/**
 * Color Temperature class
 */
class ColorTemperature {

    readonly NumWingCells: number = 3;
    readonly MiredRangeMin: number = 10;
    readonly MiredRangeMax: number = 100;
    readonly LuminanceRangeMin: number = 0.1;
    readonly LuminanceRangeMax: number = 2.0;
    readonly NumCells: number  = this.NumWingCells * 2 + 1;

    constructor() {}

    private _uiManager: CanvasUI.Manager;
    private grid: ColorGrid;
    private resizeWatcher: ResizeWatcher;
    private _selectedColor: RgbColor;
    private _sliders: CanvasUI.Slider[];

    private _miredScale: number = 0.3;
    private _luminanceScale: number = 0.3;

    initialize() : void {

        var me = this;

        this._sliders = [null, null];
        this._uiManager = new CanvasUI.Manager($('.viewport'), $('#mainCanvas'));

        this.grid = new ColorGrid(3);
        this.updateColors(new RgbColor(0.8, 0.8, 0.8));
        this.resizeWatcher = new ResizeWatcher($('#screen'),
            function() {me.onResize(); });

        $('#mainCanvas').mousedown((e) => {
            var color = me.grid.getColor(e.offsetX, e.offsetY);
            if (color) me.setColor(color);
        });
    }

    setColor(color: RgbColor){
        if (this._selectedColor.r != color.r ||
            this._selectedColor.g != color.g ||
            this._selectedColor.b != color.b){

            setColor(color);

            this.updateColors(color);
            this.draw();
        }
    }

    updateColors(color: RgbColor) : void {

        this._selectedColor = color;
        var centerXyz = ColorSpace.linearSrgbToCieXyz(color);
        var centerLab = centerXyz.toCieLab();

        // Compute center color from color temperature along with given color's luminance.
        // https: //en.wikipedia.org/wiki/Illuminant_D65#Why_6504_K.3F
        var d65 = 1.4388 / 1.438 * 6500;
        var centerMired = ColorTemperature.kelvinToMired(d65);
        var centerTempXyz = CieChromaticityXyColor
                .fromTemperature(ColorTemperature.miredToKelvin(centerMired))
                .toCieXyz(centerXyz.y);
        var centerTempLab = centerTempXyz.toCieLab();

        var miredStep = MathHelper.lerp(this.MiredRangeMin, this.MiredRangeMax,
                            this._miredScale) / this.grid.numWingCells();
        var luminaceStep = MathHelper.lerp(this.LuminanceRangeMin, this.LuminanceRangeMax,
                            this._luminanceScale) / this.grid.numWingCells();

        this.grid.updateColors(function(it: ColorGirdIterator) : RgbColor {

            var tempLab = centerLab;

            if (!it.isCenterX) {
                // Compute color temperature modified color.
                // 1: CIE xy chromaticity coordinate from given color temperature.
                // 2: CIE XYZ from CIE xy chromaticity along with original luminance(Y).
                var mired = centerMired + it.x * miredStep;
                tempLab = CieChromaticityXyColor
                            .fromTemperature(ColorTemperature.miredToKelvin(mired))
                            .toCieXyz(centerXyz.y).toCieLab();

                tempLab.a = centerLab.a + (tempLab.a - centerTempLab.a);
                tempLab.b = centerLab.b + (tempLab.b - centerTempLab.b);
            }

            var xyz = new CieLabColor(
                MathHelper.clamp(tempLab.l - it.y * luminaceStep, 0, 100),
                tempLab.a,
                tempLab.b).toCieXyz();

            return ColorSpace.cieXyzToLinearSrgb(xyz);
        });
    }

    private onResize() : void {

        var scr = $('#screen');
        var sw = scr.width();
        var sh = scr.height();

        var cx = 0;
        var cy = 0;
        var padding = 8;
        var vpSize;

        if (sw > sh)
        {
            vpSize = sh - padding;
            cx = (sw - vpSize) / 2;
            cy = padding / 2;
        }else{
            vpSize = sw - padding;
            cx = padding / 2;
            cy = (sh - vpSize) / 2;
        }

        $('.viewport').width(vpSize);
        $('.viewport').height(vpSize);
        $('.viewport').css('left', cx.toString() + 'px');
        $('.viewport').css('top', cy.toString() + 'px');

        var mainCanvas : any = $('#mainCanvas')[0];
        var ctx = mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, $('#mainCanvas').width(), $('#mainCanvas').height());

        ctx.canvas.width = vpSize;
        ctx.canvas.height = vpSize;

        this.grid.resize(vpSize - 32);
        this.resizeSliders();

        this.draw();
    };

    draw() : void {
        var mainCanvas : any = $('#mainCanvas')[0];
        var ctx = mainCanvas.getContext('2d');

        // Clear main canvas
        ctx.clearRect(0, 0, $('#mainCanvas').width(), $('#mainCanvas').height());
        this.grid.draw(ctx);
        this._uiManager.draw();
    }

    private resizeSliders(){

        var me = this;

        // ensure sliders instance.
        if (this._sliders[0] == null){
            var slider = new CanvasUI.Slider();
            slider.orientation = CanvasUI.SliderOrientation.Horizontal;
            slider.value = this._miredScale;

            slider.onValueChanged(function(value: number){
                me._miredScale = value;
                me.updateColors(me._selectedColor);
                me.draw();
            });

            this._uiManager.addControl(slider);
            this._sliders[0] = slider;
        }

        if (this._sliders[1] == null){
            var slider = new CanvasUI.Slider();
            slider.orientation = CanvasUI.SliderOrientation.Vertical;
            slider.value = this._luminanceScale;

            slider.onValueChanged(function(value: number){
                me._luminanceScale = value;
                me.updateColors(me._selectedColor);
                me.draw();
            });

            this._uiManager.addControl(slider);
            this._sliders[1] = slider;
        }

        var size = this.grid.gridSize();
        this._sliders[0].setBounds(new Rect(8, size, size - 8, size + 32));
        this._sliders[1].setBounds(new Rect(size, 8, size + 32, size - 8));
    }

    static kelvinToMired(kelvin : number) : number {
        return 1000000 / kelvin;
    }

    static miredToKelvin(mired: number) : number {
        return 1000000 / mired;
    }
}

// Get a reference to a CSInterface object
var csInterface = new CSInterface();
var gExtensionID = undefined;

if (typeof (csInterface.getExtensionID) == "function") {

    try {
        gExtensionID = csInterface.getExtensionID();
    }
    catch (Exception) {
        // getExtensionID throws exception when it runs on typical web-browser for debug.
        // Set null to csInterface for disable AdobeCEP features.
        csInterface = null;
    }

} else {
    csInterface = null;
}

var eventSet = 1936028772; // "setd"
var gRegisteredEvents = [eventSet];
var colorTemperature = new ColorTemperature();

function PhotoshopCallbackUnique(csEvent) {

    if (typeof csEvent.data === "string") {

        var eventDataString = csEvent.data.replace("ver1,{", "{");
        var eventData = JSON.parse(eventDataString);

        var args = eventData.eventData;

        if (eventData.eventID === eventSet && args.hasOwnProperty("source") && args.hasOwnProperty("to")) {
            if (args.source === "eyeDropperSample" || args.source === "photoshopPicker") {
                if (args.to._obj === "RGBColor") {
                    var t = args.to;
                    colorTemperature.updateColors(new RgbColor(t.red / 255, t.grain / 255, t.blue / 255));
                    colorTemperature.draw();
                }
            }
        }
    }
}

function setColor(color: RgbColor) {
    var r = Math.floor(MathHelper.saturate(color.r) * 255);
    var g = Math.floor(MathHelper.saturate(color.g) * 255);
    var b = Math.floor(MathHelper.saturate(color.b) * 255);
    if (csInterface) csInterface.evalScript(`setColor(${r}, ${g}, ${b})`);
}

$(document).ready(function(){

    colorTemperature.initialize();

    if (csInterface) {
        // all callbacks need to be unique so only your panel gets them
        // for Photoshop specific add on the id of your extension
        csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + gExtensionID, PhotoshopCallbackUnique);

        // Tell Photoshop the events we want to listen for
        var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
        event.extensionId = gExtensionID;
        event.data = gRegisteredEvents.toString();
        csInterface.dispatchEvent(event);
    }

});
