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

//
// init world
//
function init() {

    container = $('#world');
    var info = $('#info');

    camera = new THREE.PerspectiveCamera(camera_gui_params.fov, window.innerWidth / window.innerHeight, camera_gui_params.near, camera_gui_params.far);
    camera.position.y = camera_gui_params.position_y;
    camera.position.z = camera_gui_params.position_z;
    camera.position.x = camera_gui_params.position_x;

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    container.append(renderer.domElement);

    render();

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    
    info.append(stats.domElement);

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    window.addEventListener('resize', onWindowResize, false);

    $('#btnPlay').click(btnPlayClick);
    $('#btnStop').click(btnStopClick);
    $('#btnPause').click(btnPauseClick);

    $('#btnAddBall').click(btnAddBallClick);
    
    $('#btnBallParamsOK').click(btnBallParamsOKClick);
    $('#btnBallParamsCancel').click(btnBallParamsCancel);

}

//
// Animation
//

var time;
var dt;
var timeElapsed;
var veloCamara; /* en metros/segundo */
var repeat;
var deltaCamera;
var inicio;
function animate() {

    requestAnimationId = requestAnimationFrame(animate);

    render();
    stats.update();
    
    var now = new Date().getTime();
    dt = now - (time || now);
    
    time = now;

    veloCamara = 1;
    repeat = dt;
    //deltaCamera = 10;
    deltaCamera = veloCamara * repeat / 10;

}

//
// render
//

function render() {
    if (worldStatus != "STOPPED") {
        btnAddBall.disabled = true;
    } else {
        btnAddBall.disabled = false;
    }
    for (k in balls) {
        balls[k].position.y -= Math.random() * 2;
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
// Buttons actions
//
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

    $('#windowBallParams').modal('show');
}

function btnBallParamsOKClick() {

    var params = {
        r: $('#inputRadious').val(),
        x0: $('#inputX0').val(),
        y0: $('#inputY0').val(),
        z0: $('#inputZ0').val(),
        vx0: $('#inputVX0').val(),
        vy0: $('#inputVY0').val(),
        vz0: $('#inputVZ0').val()
    };

    console.log(params);

    $('#windowBallParams').modal('hide');


    var geometry = new THREE.SphereGeometry(params.r, 20, 20);

    var material = new THREE.MeshBasicMaterial({color: 0xff0000});

    var body = new THREE.Mesh(geometry, material);
    body.position.y0 = params.y0;
    body.position.x0 = params.x0;
    body.position.z0 = params.z0;
    //body.velocity.x0 = params.vx0;
    
    body.position.y = body.position.y0;
    body.position.x = body.position.x0;
    body.position.z = body.position.z0;

    balls.push(body);

    scene.add(body);
    render();
}

function btnBallParamsCancel() {
    $('#windowBallParams').modal('hide');
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
