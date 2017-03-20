
function setColor(r, g, b) {

    var rgb = new RGBColor();
    rgb.red = r;
    rgb.green = g;
    rgb.blue = b;

    app.foregroundColor.rgb = rgb;
}
