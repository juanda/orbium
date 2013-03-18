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

//    KeyboardController({
//        37: function() {
//            MoveCamera(-1, 0, 0);
//        },
//        38: function() {
//            MoveCamera(0, -1, 0);
//        },
//        39: function() {
//            MoveCamera(1, 0, 0);
//        },
//        40: function() {
//            MoveCamera(0, 1, 0);
//        },
//        65: function() {
//            MoveCamera(0, 0, -1);
//        },
//        90: function() {
//            MoveCamera(0, 0, 1);
//        }
//    }
//    , 200);

    //

    window.addEventListener('resize', onWindowResize, false);

}

var map = {};
var cameraControlKeyMap = {
    forward: 65, /*A*/
    backward: 90, /*Z*/
    left: 37, /*left*/
    up: 38, /*up*/
    rigth: 39, /*rigth*/
    down: 40, /*down*/
};

var veloCamera = 10;
var timers = {};
var keys = {
    37: function() {
        MoveCamera(-veloCamera, 0, 0);
    },
    38: function() {
        MoveCamera(0, -veloCamera, 0);
    },
    39: function() {
        MoveCamera(veloCamera, 0, 0);
    },
    40: function() {
        MoveCamera(0, veloCamera, 0);
    },
    65: function() {
        MoveCamera(0, 0, -veloCamera);
    },
    90: function() {
        MoveCamera(0, 0, veloCamera);
    }
};

var repeat = 100;

function onKeyDown(event) {
    console.log(event.keyCode);
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




function onKeyUpOrDown(e) {
    var veloCamera = 5;

    // e = e || event;//to deal with IE
    map[e.keyCode] = e.type == 'keydown' ? true : false;

    // stop if two complementary controls are pressed
    if (
            map[cameraControlKeyMap.up] && map[cameraControlKeyMap.down]
            ||
            map[cameraControlKeyMap.left] && map[cameraControlKeyMap.rigth]
            ||
            map[cameraControlKeyMap.forward] && map[cameraControlKeyMap.backward]
            )
        return;

    if (map[cameraControlKeyMap.up])
        camera.position.y += veloCamera;
    if (map[cameraControlKeyMap.down])
        camera.position.y -= veloCamera;
    if (map[cameraControlKeyMap.left])
        camera.position.x -= veloCamera;
    if (map[cameraControlKeyMap.rigth])
        camera.position.x += veloCamera;
    if (map[cameraControlKeyMap.forward])
        camera.position.z -= veloCamera;
    if (map[cameraControlKeyMap.backward])
        camera.position.z += veloCamera;

    //console.log(map);
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
