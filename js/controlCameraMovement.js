var container, stats;

var camera, scene, renderer;

var cube, plane;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var camera_gui_params = {
    fov: 70,
    position_x: 0,
    position_y: 150,
    position_z: 500,
    near: 1,
    far: 1000
};

var cube_gui_params = {
    position_x: 0,
    position_y: 150,
    position_z: 0
};

init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = 'Drag to spin the cube';
    container.appendChild(info);

    camera = new THREE.PerspectiveCamera(camera_gui_params.fov, window.innerWidth / window.innerHeight, camera_gui_params.near, camera_gui_params.far);
    camera.position.y = camera_gui_params.position_y;
    camera.position.z = camera_gui_params.position_z;
    camera.position.x = camera_gui_params.position_x;

    scene = new THREE.Scene();

    // Cube

    var geometry = new THREE.CubeGeometry(200, 200, 200);

    for (var i = 0; i < geometry.faces.length; i++) {

        geometry.faces[ i ].color.setHex(Math.random() * 0xffffff);

    }

    var material = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});

    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 150;
    scene.add(cube);

    // Plane

    var geometry = new THREE.PlaneGeometry(2000, 2000);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    var material = new THREE.MeshBasicMaterial({color: 0xe0e0e0});

    plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    window.addEventListener('resize', onWindowResize, false);

}

/**
 * Codigo para el control del movimiento de la camara.
 * 
 * Para conseguir un movimiento fluido es necesario controlar explicitamemte
 * el timer asociado al evento keydown. La cosa es que una vez que presionamos
 * una tecla y la mantenemos pulsada, el navegado no reconoce este evento hasta
 * pasado un pequeño tiempo. Y esto da lugar a que el control no sea fluido, de
 * manera que cuando cambias de tecla para mover la camara hacia otro lado, se
 * produce un paron antes de volver a moverse.
 * 
 * En la funcion onKeyDown, que es el listener del evento keydown, crea un
 * timer (setInterval) asociado a la tecla pulsada y que ejecuta la funcion
 * asociada a la tecla mediante el array keys cada x milisegundos, siendo 
 * x el valor dado en el parametro repeat.
 * 
 * Cuando la tecla se suelta, este timer se elimina. Esto se hace en onKeyUp.
 * 
 * Esto nos proporciona, ademas, una forma de controlar la velocidad de la 
 * camara. Si, por ejemplo, fijamos el parametro deltaCamara a 10, y el 
 * parametro repeat a 10 ms, la velocidad sera: 10/10 unidades/ms, es decir:
 * 
 * velocamara = 1000 unidades/s
 * 
 * Ahora se trata de fijar la correspondencia entre la unidad de longitud
 * en es espacio webGL y en el espacio simulado. Por ejemplo, si hacemos que
 * 1 unidad del espacio webGL sea igual a 1 cm, entonces:
 * velocamara = 1000 cm/s = 10 m/s
 * 
 */

var deltaCamera = 10;
var timers = {};
var keys = {
    37: function() {
        MoveCamera(-deltaCamera, 0, 0);
    },
    38: function() {
        MoveCamera(0, -deltaCamera, 0);
    },
    39: function() {
        MoveCamera(deltaCamera, 0, 0);
    },
    40: function() {
        MoveCamera(0, deltaCamera, 0);
    },
    65: function() {
        MoveCamera(0, 0, -deltaCamera);
    },
    90: function() {
        MoveCamera(0, 0, deltaCamera);
    }
};

var repeat = 10;

/**
 * Cuando presionamos una tecla, si dicha tecla esta registrada en el
 * array keys, entonces se asocia un timer a esa tecla de manera que
 * la funcion asociada a la tecla en el array keys se repite cada 
 * repeat milisegundos
 * 
 * @param {type} event
 * @returns {Boolean}
 */
function onKeyDown(event) {
   
    var key = (event || window.event).keyCode;
    if (!(key in keys))
        return true;
    if (!(key in timers)) {
        timers[key] = null;
        keys[key]();
        if (repeat !== 0)
            timers[key] = setInterval(keys[key], repeat);
    }
    return false;
}

/**
 * Cuando levantamos una tecla, si habia un timer asociado a dicha tecla,
 * se elimina y se deja de ejecutar la funcion asociada a la tecla en el
 * array keys
 * 
 * @param {type} event
 * @returns {undefined}
 */
function onKeyUp(event) {
    var key = (event || window.event).keyCode;
    if (key in timers) {
        if (timers[key] !== null)
            clearInterval(timers[key]);
        delete timers[key];
    }
}

function MoveCamera(vx, vy, vz) {
    camera.position.x += vx;
    camera.position.y += vy;
    camera.position.z += vz;
}


function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

//

function onDocumentMouseDown(event) {

    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;

}

function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;

    targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.02;

}

function onDocumentMouseUp(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentMouseOut(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);

}

function onDocumentTouchStart(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
        targetRotationOnMouseDown = targetRotation;

    }

}

function onDocumentTouchMove(event) {

    if (event.touches.length === 1) {

        event.preventDefault();

        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        targetRotation = targetRotationOnMouseDown + (mouseX - mouseXOnMouseDown) * 0.05;

    }

}

//

function animate() {

    requestAnimationFrame(animate);

    render();
    stats.update();

}

function render() {

    plane.rotation.y = cube.rotation.y += (targetRotation - cube.rotation.y) * 0.05;
    plane.position.x = cube.position.x;
    plane.position.z = cube.position.z;
    renderer.render(scene, camera);

}

function addGUICameraControl(gui, camera, gui_params) {

    var folder_camera = gui.addFolder('Camera');
    var camera_fov_controller = folder_camera.add(gui_params, 'fov', 0, 360).step(1);
    var camera_position_y_controller = folder_camera.add(gui_params, 'position_y', -500, 500).step(10);
    var camera_position_z_controller = folder_camera.add(gui_params, 'position_z', -500, 500).step(10);
    var camera_position_x_controller = folder_camera.add(gui_params, 'position_x', -500, 500).step(10);
    var camera_near_controller = folder_camera.add(gui_params, 'near', 1, 3000).step(10);
    var camera_far_controller = folder_camera.add(gui_params, 'far', 1, 3000).step(10);

    camera_fov_controller.onChange(function(fov) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
    });

    camera_position_y_controller.onChange(function(y) {
        camera.position.y = y;
        camera.updateProjectionMatrix();
    });

    camera_position_z_controller.onChange(function(z) {
        camera.position.z = z;
        camera.updateProjectionMatrix();
    });

    camera_position_x_controller.onChange(function(x) {
        camera.position.x = x;
        camera.updateProjectionMatrix();
    });

    camera_near_controller.onChange(function(near) {
        camera.near = near;
        camera.updateProjectionMatrix();
    });

    camera_far_controller.onChange(function(far) {
        camera.far = far;
        camera.updateProjectionMatrix();
    });
}

function addGUICubeControl(gui, cube, gui_params) {

    var folder_cube = gui.addFolder('Cube');
    var cube_position_x_controller = folder_cube.add(gui_params, 'position_x', -500, 500).step(10);
    var cube_position_y_controller = folder_cube.add(gui_params, 'position_y', -500, 500).step(10);
    var cube_position_z_controller = folder_cube.add(gui_params, 'position_z', -500, 500).step(10);

    cube_position_x_controller.onChange(function(x) {
        cube.position.x = x;
        //camera.updateProjectionMatrix();
    });
    cube_position_y_controller.onChange(function(y) {
        cube.position.y = y;
        //camera.updateProjectionMatrix();
    });
    cube_position_z_controller.onChange(function(z) {
        cube.position.z = z;
        //camera.updateProjectionMatrix();
    });
}

function OB_ReferenceFrame(lon, color) {

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(lon, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, lon, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, lon));

    var material;
    if (!color) {
        color = 0xff0000;
    }
    material = new THREE.LineBasicMaterial({color: color});

    return new THREE.Line(geometry, material, THREE.LinePieces);
}
