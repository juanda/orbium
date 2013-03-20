var container, stats;
//var btnPlay, btnStop, btnPause;
var requestAnimationId;
var balls = [];
var worldStatus = "STOPPED";


var camera, scene, renderer;


var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var camera_gui_params = {
    fov: 70,
    position_x: 0,
    position_y: 150,
    position_z: 250,
    near: 1,
    far: 10000
};

init();
//animate();

function init() {

//    container = document.createElement('div');
//    document.body.appendChild(container);

    container = document.getElementById('world');
    info = document.getElementById('info');
//    btnPlay = document.getElementById('btnPlay');
//    btnStop = document.getElementById('btnStop');
//    btnPause = document.getElementById('btnPause');        

    camera = new THREE.PerspectiveCamera(camera_gui_params.fov, window.innerWidth / window.innerHeight, camera_gui_params.near, camera_gui_params.far);
    camera.position.y = camera_gui_params.position_y;
    camera.position.z = camera_gui_params.position_z;
    camera.position.x = camera_gui_params.position_x;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    render();

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild(stats.domElement);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    btnPlay.addEventListener('click', btnPlayClick, false);
    btnStop.addEventListener('click', btnStopClick, false);
    btnPause.addEventListener('click', btnPauseClick, false);

    btnAddBall.addEventListener('click', btnAddBallClick, false);

    window.addEventListener('resize', onWindowResize, false);

}

function btnPlayClick() {
    animate();
    worldStatus = "RUNNING";
}

function btnStopClick() {
    cancelAnimationFrame(requestAnimationId);

    // Reset world state
    for (k in balls) {
        balls[k].position.y = balls[k].position.y0;
        balls[k].position.x = balls[k].position.x0;
    }    

    worldStatus = "STOPPED";
    render();
}

function btnPauseClick() {
    cancelAnimationFrame(requestAnimationId);
    worldStatus = "PAUSED";
}

function btnAddBallClick() {
    if (worldStatus != "STOPPED")
        return;
    var geometry = new THREE.SphereGeometry(10, 20, 20);

    var material = new THREE.MeshBasicMaterial({color: 0xff0000});

    var body = new THREE.Mesh(geometry, material);
    body.position.y0 = 300;
    body.position.x0 = Math.floor(Math.random() * 300)
    body.position.y = body.position.y0;
    body.position.x = body.position.x0;

    balls.push(body);

    scene.add(body);
    render();
}

var time;
var dt;
var timeElapsed;
var veloCamara; /* en metros/segundo */
var repeat;
var deltaCamera;
var inicio;
var startTimer = false;
function animate() {

    requestAnimationId = requestAnimationFrame(animate);

    render();
    stats.update();
    var now = new Date().getTime();
    dt = now - (time || now);
    if (startTimer) {
        timeElapsed = now - inicio;
    }
    time = now;

    veloCamara = 1;
    repeat = dt;
    //deltaCamera = 10;
    deltaCamera = veloCamara * repeat / 10;

}

function render() {
    if (worldStatus != "STOPPED") {
        btnAddBall.disabled = true;
    }else{
        btnAddBall.disabled = false;
    }
    for (k in balls) {
        balls[k].position.y -= Math.random()*5;
    }
    // info.innerHTML = "requestAnimationId: " + requestAnimationId;
    renderer.render(scene, camera);

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
 * La formula es esta: veloCamara = (deltaCamara/repeat)*10 metros/segundos
 * 
 * Ahora se trata de fijar la correspondencia entre la unidad de longitud
 * en es espacio webGL y en el espacio simulado. Por ejemplo, si hacemos que
 * 1 unidad del espacio webGL sea igual a 1 cm, entonces:
 * velocamara = 1000 cm/s = 10 m/s
 * 
 * Importante: Existe un límite para el valor de repeat. Este límite viene dado:
 * 
 * 1) por el propio motor de javascript; la especificación es 4 ms
 * 
 * 2) por la performance del webgl; si la animación se esta renderizando a un
 *    ritmo de 30 fps, es decir que entre dos frames pasan 33 ms, no podemos 
 *    poner un valor menor a 33ms. Bueno, si lo podemos poner, pero los cálculos
 *    anteriores ya no son válidos, ya que parten del supuesto de que la camara
 *    se mueve deltaCamera cada repeat ms, y esto deja de ser cierto para una
 *    cantidad menor a 33ms.
 *    
 * El algoritmo para fijar la velocidad de la cámara es el siguiente:
 * 
 * En todo momento se mide el fps, o mejor dicho, su inversa, es decir el
 * nº de milisegundos entre dos frames. Almacenamos en la variable repeat
 * este intervalo. Entonces, teniendo en cuenta todo lo que hemos dicho antes, 
 * adaptamos el deltaCamara para que la velocidad sea la fijada:
 * 
 * deltaCamera = veloCamara * repeat / 10; 
 * 
 * Esto sería en m/s teniendo en cuenta que hemos elegido un tamaño de 1cm para
 * ls unidad de espacio de webgl.
 */



var timers = {};
var keys = {
    37: function() {
        MoveCamera(-deltaCamera, 0, 0);
    },
    38: function() {
        MoveCamera(0, deltaCamera, 0);
    },
    39: function() {
        MoveCamera(deltaCamera, 0, 0);
    },
    40: function() {
        MoveCamera(0, -deltaCamera, 0);
    },
    65: function() {
        MoveCamera(0, 0, -deltaCamera);
    },
    90: function() {
        MoveCamera(0, 0, deltaCamera);
    }
};

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


    startTimer = true;
    if (!inicio) {
        inicio = new Date().getTime();
    }

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



    startTimer = false;

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
