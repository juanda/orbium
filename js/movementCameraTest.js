var container, stats;

var camera, scene, renderer;

var body1, body2, plane;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var camera_gui_params = {
    fov: 70,
    position_x: 0,
    position_y: 150,
    position_z: 500,
    near: 1,
    far: 10000
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
    info.id = 'info';
    info.innerHTML = 'Camera Velocity Test';
    container.appendChild(info);

    camera = new THREE.PerspectiveCamera(camera_gui_params.fov, window.innerWidth / window.innerHeight, camera_gui_params.near, camera_gui_params.far);
    camera.position.y = camera_gui_params.position_y;
    camera.position.z = camera_gui_params.position_z;
    camera.position.x = camera_gui_params.position_x;

    scene = new THREE.Scene();

    var geometry = new THREE.SphereGeometry(100,20,20);
    
    var material = new THREE.MeshBasicMaterial({color: 0xff0000});
    
    body1 = new THREE.Mesh(geometry, material);
    
    body2 = new THREE.Mesh(geometry, material);
    body2.position.z = -10000; /* 100 metros */
    
    scene.add(body1);
    scene.add(body2);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

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

var inicio, final, incremento;
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
    inicio = Date.now();
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
    final = Date.now();
    
    incremento = final-inicio;
        
    console.log(incremento + " s elapsed");
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


function animate() {

    requestAnimationFrame(animate);
    
    var info = document.getElementById('info');
    info.innerHTML = 'Camera Velocity Test: ' + camera.position.x + ',' + camera.position.y + ',' +camera.position.z;
    render();
    stats.update();

}

function render() {

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
