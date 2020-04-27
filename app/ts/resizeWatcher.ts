
/**
 * The class fire resize event when given event size changed.
 */
class ResizeWatcher {

    /**
     * @description Create an instance of ResizeWatcher object.
     *
     * @param      element {HTMLElement} The HTMEL object for watching resize event.
     * @param      callback call back function will be called when given elemnt size changed.
     */
    constructor(
        public element: HTMLElement,
        public callback : (element?: HTMLElement) => void){

        // Set invalid width/height values to fire first resize event.
        this.lastWidth = -1;
        this.lastHeight = -1;

        var requestAnimationFrame = window.requestAnimationFrame;

        var me = this;
        var checkResize = function(){
            var rc = me.element.getBoundingClientRect();
            var w = rc.width;
            var h = rc.height;
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