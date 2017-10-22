/// <reference path="d.ts/jquery.d.ts"/>

/**
 * The class fire resize event when given event size changed.
 */
class ResizeWatcher {

    /**
     * @description Create an instance of ResizeWatcher object.
     *
     * @param      element {JQuery} The JQuery object for watching resize event.
     * @param      callback call back function will be called when given elemnt size changed.
     */
    constructor(
        public element: JQuery,
        public callback : (element?: JQuery) => void){

        // Set invalid width/height values to fire first resize event.
        this.lastWidth = -1;
        this.lastHeight = -1;

        var requestAnimationFrame = window.requestAnimationFrame;

        var me = this;
        var checkResize = function(){
            var w = me.element.width();
            var h = me.element.height();
            if (w != me.lastWidth || h != me.lastHeight){
                me.lastWidth = w;
                me.lastHeight = h;
                me.callback();
            }

            requestAnimationFrame(checkResize);
        };

        requestAnimationFrame(checkResize);
    }

    private lastWidth : number;
    private lastHeight : number;
}