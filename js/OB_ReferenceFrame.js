/**
 * @author juandalibaba / http://juandarodriguez.es
 */

THREE.OB_ReferenceFrame = function( ) {

    THREE.Object3D.call(this);
    
    this.x_axis.geometry = new THREE.Geometry();

    this.x_axis.geometry.vertices.push(new THREE.Vector3(-500, 0, 0));
    this.x_axis.geometry.vertices.push(new THREE.Vector3(500, 0, 0));

    this.x_axis.line = new THREE.Line(this.x_axis.geometry);

    this.y_axis.geometry = new THREE.Geometry();

    this.y_axis.vertices.push(new THREE.Vector3(0, -500, 0));
    this.y_axis.vertices.push(new THREE.Vector3(0, 500, 0));

    y_axis.line = new THREE.Line(geometry);

    this.z_axis.geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(0, 0, -500));
    geometry.vertices.push(new THREE.Vector3(0, 0, 500));

    var z_axis = new THREE.Line(geometry);
    
    this.geometry = new THREE.Geometry();
    this.material = (material !== undefined) ? material : new THREE.LineBasicMaterial({color: Math.random() * 0xffffff});
    this.type = (type !== undefined) ? type : THREE.LineStrip;

    if (this.geometry) {

        if (!this.geometry.boundingSphere) {

            this.geometry.computeBoundingSphere();

        }

    }

};

THREE.LineStrip = 0;
THREE.LinePieces = 1;

THREE.Line.prototype = Object.create(THREE.Object3D.prototype);

THREE.Line.prototype.clone = function(object) {

    if (object === undefined)
        object = new THREE.Line(this.geometry, this.material, this.type);

    THREE.Object3D.prototype.clone.call(this, object);

    return object;

};