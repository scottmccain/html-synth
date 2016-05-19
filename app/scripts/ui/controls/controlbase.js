function ControlBase(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

};

ControlBase.prototype.bind = function (obj, toProperty, fromProperty, bothways) {

    var toPropertyClosure = toProperty;
    var changing = false;

    this.watch(fromProperty, function (id, oldval, newval) {

        if (oldval != newval && obj[fromPropertyClosure] !== newval) {
            //console.log("to:");
            //console.log("o." + id + " changed from " + oldval + " to " + newval);

            changing = true;
            obj[toPropertyClosure] = newval;
            changing = false;
        }

        return newval;
    });

    if (bothways) {

        var fromPropertyClosure = fromProperty;
        var that = this;

        // watch object as well
        obj.watch(toProperty, function(id, oldval, newval) {

            if (oldval != newval && that[fromPropertyClosure] !== newval && !changing) {

                //console.log(fromPropertyClosure);
                console.log("o." + id + " changed from " + oldval + " to " + newval);
                //console.log(that[fromPropertyClosure]);
                //console.log(that['val']);

                that[fromPropertyClosure] = newval;
            }

            return newval;
        });
    }

    return this;
};