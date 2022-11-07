// build runs on http://127.0.0.1:3000

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { io } from 'socket.io-client'
import * as Tone from 'tone'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

/************************************************************************
 * Create the scene
 ***********************************************************************/

// create the scene
const scene = new THREE.Scene()
//scene.background = new THREE.Color(0x90d7ff)

// create the clock
const clock = new THREE.Clock()

// set the background image
// image sourced from https://www.rawpixel.com/image/2332064/free-photo-image-galaxy-universe-stars
scene.background = new THREE.TextureLoader().load('img/galaxy-space-textured-background.jpg')

// create load managers and animation mixers
const loadManager = new THREE.LoadingManager()
let mixer_1: THREE.AnimationMixer
let mixer_2: THREE.AnimationMixer
let mixer_3: THREE.AnimationMixer
let mixer_4: THREE.AnimationMixer

// create the background mesh
let bgMesh
{
    const loader = new THREE.TextureLoader()
    const texture = loader.load(
        'img/galaxy-space-textured-background.jpg',
    )
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter

    const shader = THREE.ShaderLib.equirect
    const material = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide,
    })
    material.uniforms.tEquirect.value = texture
    const plane = new THREE.BoxGeometry(800, 800, 800)
    bgMesh = new THREE.Mesh(plane, material)
    scene.add(bgMesh)
}



// create the camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

/**************************************
* Create Lights
**************************************/

// ambient light
var ambiLight = new THREE.AmbientLight(0x111111)
scene.add(ambiLight)

// hemisphere light
var hsLight = new THREE.HemisphereLight(0xffff00, 0xffff00, 0.61)
scene.add(hsLight)

// directional light
var dLight = new THREE.DirectionalLight(0xff00ff, 6)
dLight.position.set(0, 100, 0)
dLight.castShadow = true
dLight.shadow.mapSize.width = 400
dLight.shadow.mapSize.height = 400
dLight.shadow.camera.near = 0.5
dLight.shadow.camera.far = 500
scene.add(dLight)

console.log("Lights added")

// Rect area light
const width = 25
const height = 25
const intensity = 60
const rectLight = new THREE.RectAreaLight(0xffff00, intensity, width, height)
rectLight.position.set(20, 15, 20)
rectLight.lookAt(0, 0, 0)
scene.add(rectLight)


// Create Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.shadowMap.enabled = true

// set up VR
document.body.appendChild(VRButton.createButton(renderer))

// create camera controls
const controls = new OrbitControls(camera, renderer.domElement)

// generate random colour
var color = '#';

var letters = '0123456789ABCDEF';
    
for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
}
    



// Construct user objects
const geometry = new THREE.SphereGeometry()
// images sourced from https://3dtextures.me/2019/03/18/disco-ball-001/
var texture = new THREE.TextureLoader().load('img/Disco_Ball_001_ambientOcclusion.jpg')
var norm = new THREE.TextureLoader().load('img/Disco_Ball_001_normal.jpg')
var bump = new THREE.TextureLoader().load('img/Disco_Ball_001_height.png')
var material = new THREE.MeshPhysicalMaterial({
    map: texture,
    normalMap: norm,
    color: color,
    roughness: 0,
    metalness: 0.9,
    clearcoat: .5,
    clearcoatRoughness: 0.1,
    bumpMap: bump
})
// image sourced from https://3dtextures.me/2019/03/18/disco-ball-001/
var roughnessMap = new THREE.TextureLoader().load('img/Disco_Ball_001_basecolor.jpg')
roughnessMap.magFilter = THREE.NearestFilter
material.roughnessMap = roughnessMap

const myObject3D = new THREE.Object3D()
myObject3D.position.x = Math.random() * 4 - 2
myObject3D.position.z = Math.random() * 4 - 2
myObject3D.position.y = 0.5
myObject3D.receiveShadow = true
myObject3D.castShadow = true

camera.position.z = 5

// resize scene when window is resized
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true
    render()
}

// create floor
function createFloor() {
    var floorGeom = new THREE.PlaneGeometry(200, 200, 1, 1)
    var floorTex = new THREE.Texture()
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping
    floorTex.repeat.set(100, 100)
    floorTex.anisotropy = 16
    floorTex.encoding = THREE.sRGBEncoding

    // floor texture sourced at https://unsplash.com/photos/_OoK2W7OPRM
    new THREE.ImageLoader().load('img/max-williams-_OoK2W7OPRM-unsplash.jpg', function (img) {
        floorTex.image = img
        floorTex.needsUpdate = true
    });

    // floor material
    var floorMat = new THREE.MeshPhongMaterial({
        reflectivity: .5
    })
    floorMat.map = floorTex
    var floor = new THREE.Mesh(floorGeom, floorMat)
    floor.receiveShadow = true
    floor.position.y = -0.5
    floor.rotation.x = -0.5 * Math.PI
    floor.rotation.z = -0.35 * Math.PI
    scene.add(floor)

    console.log("Floor added")
}

//create building objects
function createObjects() {
    // images sourced from https://www.sketchuptextureclub.com/textures/materials/metals/perforated/speaker-grille-metal-texture-seamless-10523
    var texture = new THREE.TextureLoader().load('img/52_speaker grille metal texture-seamless.png')
    var norm = new THREE.TextureLoader().load('img/52_speaker grille metal texture-seamless_normal.png')
    var bump = new THREE.TextureLoader().load('img/52_speaker grille metal texture-seamless_displacement.png')
    const buildingMat = new THREE.MeshPhysicalMaterial({
        map: texture,
        normalMap: norm,
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.9,
        clearcoat: .3,
        clearcoatRoughness: 0.5,
        bumpMap: bump
    })


    const buildingGeom1 = new THREE.BoxGeometry(10, 30, 10)
    const building1 = new THREE.Mesh(buildingGeom1, buildingMat)
    building1.receiveShadow = true
    building1.castShadow = true
    building1.position.y = 0.5
    building1.position.z = 30
    building1.position.x = 20
    scene.add(building1)

    const buildingGeom2 = new THREE.BoxGeometry(10, 30, 10)
    const building2 = new THREE.Mesh(buildingGeom2, buildingMat)
    building2.receiveShadow = true
    building2.castShadow = true
    building2.position.y = 2
    building2.position.z = -20
    building2.position.x = -30
    scene.add(building2)

    const buildingGeom3 = new THREE.BoxGeometry(10, 30, 10)
    const building3 = new THREE.Mesh(buildingGeom3, buildingMat)
    building3.receiveShadow = true
    building3.castShadow = true
    building3.position.y = 6.5
    building3.position.z = -30
    building3.position.x = 20
    scene.add(building3)

    const buildingGeom4 = new THREE.BoxGeometry(10, 30, 10)
    const building4 = new THREE.Mesh(buildingGeom4, buildingMat)
    building4.receiveShadow = true
    building4.castShadow = true
    building4.position.y = -1.5
    building4.position.z = 20
    building4.position.x = -30
    scene.add(building4)

    const buildingGeom5 = new THREE.BoxGeometry(10, 30, 10)
    const building5 = new THREE.Mesh(buildingGeom5, buildingMat)
    building5.receiveShadow = true
    building5.castShadow = true
    building5.position.y = -3.5
    building5.position.z = 45
    building5.position.x = 25
    scene.add(building5)

    const buildingGeom6 = new THREE.BoxGeometry(10, 30, 10)
    const building6 = new THREE.Mesh(buildingGeom6, buildingMat)
    building6.receiveShadow = true
    building6.castShadow = true
    building6.position.y = 5.5
    building6.position.z = 40
    building6.position.x = 30
    scene.add(building6)

    const buildingGeom7 = new THREE.BoxGeometry(10, 30, 10)
    const building7 = new THREE.Mesh(buildingGeom7, buildingMat)
    building7.receiveShadow = true
    building7.castShadow = true
    building7.position.y = 0.5
    building7.position.z = 3
    building7.position.x = 20
    scene.add(building7)

    const buildingGeom8 = new THREE.BoxGeometry(10, 30, 10)
    const building8 = new THREE.Mesh(buildingGeom8, buildingMat)
    building8.receiveShadow = true
    building8.castShadow = true
    building8.position.y = 2
    building8.position.z = -20
    building8.position.x = -3
    scene.add(building8)

    const buildingGeom9 = new THREE.BoxGeometry(10, 30, 10)
    const building9 = new THREE.Mesh(buildingGeom9, buildingMat)
    building9.receiveShadow = true
    building9.castShadow = true
    building9.position.y = 6.5
    building9.position.z = -12
    building9.position.x = 40
    scene.add(building9)

    const buildingGeom10 = new THREE.BoxGeometry(10, 30, 10)
    const building10 = new THREE.Mesh(buildingGeom10, buildingMat)
    building10.receiveShadow = true
    building10.castShadow = true
    building10.position.y = -1.5
    building10.position.z = 10
    building10.position.x = -15
    scene.add(building10)

    const buildingGeom11 = new THREE.BoxGeometry(10, 30, 10)
    const building11 = new THREE.Mesh(buildingGeom11, buildingMat)
    building11.receiveShadow = true
    building11.castShadow = true
    building11.position.y = -3.5
    building11.position.z = -45
    building11.position.x = 2
    scene.add(building11)

    const buildingGeom12 = new THREE.BoxGeometry(10, 30, 10)
    const building12 = new THREE.Mesh(buildingGeom12, buildingMat)
    building12.receiveShadow = true
    building12.castShadow = true
    building12.position.y = 5.5
    building12.position.z = 20
    building12.position.x = 10
    scene.add(building12)

    const buildingGeom13 = new THREE.BoxGeometry(10, 30, 10)
    const building13 = new THREE.Mesh(buildingGeom13, buildingMat)
    building13.receiveShadow = true
    building13.castShadow = true
    building13.position.y = 0.5
    building13.position.z = 3
    building13.position.x = 20
    scene.add(building13)

    const buildingGeom14 = new THREE.BoxGeometry(10, 30, 10)
    const building14 = new THREE.Mesh(buildingGeom14, buildingMat)
    building14.receiveShadow = true
    building14.castShadow = true
    building14.position.y = 2
    building14.position.z = -20
    building14.position.x = -3
    scene.add(building14)

    const buildingGeom15 = new THREE.BoxGeometry(10, 30, 10)
    const building15 = new THREE.Mesh(buildingGeom15, buildingMat)
    building15.receiveShadow = true
    building15.castShadow = true
    building15.position.y = 6.5
    building15.position.z = 20
    building15.position.x = -8
    scene.add(building15)

    const buildingGeom16 = new THREE.CylinderGeometry(5, 5, 30, 32)
    const building16 = new THREE.Mesh(buildingGeom16, buildingMat)
    building16.receiveShadow = true
    building16.castShadow = true
    building16.position.y = 10.5
    building16.position.z = 30
    building16.position.x = -10
    scene.add(building16)

    const buildingGeom17 = new THREE.CylinderGeometry(5, 5, 30, 32)
    const building17 = new THREE.Mesh(buildingGeom17, buildingMat)
    building17.receiveShadow = true
    building17.castShadow = true
    building17.position.y = -3.5
    building17.position.z = 8
    building17.position.x = 25
    scene.add(building17)

    const buildingGeom18 = new THREE.CylinderGeometry(5, 5, 30, 32)
    const building18 = new THREE.Mesh(buildingGeom18, buildingMat)
    building18.receiveShadow = true
    building18.castShadow = true
    building18.position.y = 5.5
    building18.position.z = -7
    building18.position.x = -18
    scene.add(building18)

    const buildingGeom19 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building19 = new THREE.Mesh(buildingGeom19, buildingMat)
    building19.receiveShadow = true
    building19.castShadow = true
    building19.position.y = 6.5
    building19.position.z = 90
    building19.position.x = -8
    scene.add(building19)

    const buildingGeom20 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building20 = new THREE.Mesh(buildingGeom20, buildingMat)
    building20.receiveShadow = true
    building20.castShadow = true
    building20.position.y = 10.5
    building20.position.z = 30
    building20.position.x = -40
    scene.add(building20)

    const buildingGeom21 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building21 = new THREE.Mesh(buildingGeom21, buildingMat)
    building21.receiveShadow = true
    building21.castShadow = true
    building21.position.y = -3.5
    building21.position.z = 8
    building21.position.x = 55
    scene.add(building21)

    const buildingGeom22 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building22 = new THREE.Mesh(buildingGeom22, buildingMat)
    building22.receiveShadow = true
    building22.castShadow = true
    building22.position.y = 5.5
    building22.position.z = -9
    building22.position.x = -58
    scene.add(building22)

    const buildingGeom23 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building23 = new THREE.Mesh(buildingGeom23, buildingMat)
    building23.receiveShadow = true
    building23.castShadow = true
    building23.position.y = 0.5
    building23.position.z = 60
    building23.position.x = 20
    scene.add(building23)

    const buildingGeom24 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building24 = new THREE.Mesh(buildingGeom24, buildingMat)
    building24.receiveShadow = true
    building24.castShadow = true
    building24.position.y = 2
    building24.position.z = -70
    building24.position.x = -3
    scene.add(building24)

    const buildingGeom25 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building25 = new THREE.Mesh(buildingGeom25, buildingMat)
    building25.receiveShadow = true
    building25.castShadow = true
    building25.position.y = 6.5
    building25.position.z = -50
    building25.position.x = 50
    scene.add(building25)

    const buildingGeom26 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building26 = new THREE.Mesh(buildingGeom26, buildingMat)
    building26.receiveShadow = true
    building26.castShadow = true
    building26.position.y = 10.5
    building26.position.z = 50
    building26.position.x = -40
    scene.add(building26)

    const buildingGeom27 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building27 = new THREE.Mesh(buildingGeom27, buildingMat)
    building27.receiveShadow = true
    building27.castShadow = true
    building27.position.y = -3.5
    building27.position.z = 80
    building27.position.x = 55
    scene.add(building27)

    const buildingGeom28 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building28 = new THREE.Mesh(buildingGeom28, buildingMat)
    building28.receiveShadow = true
    building28.castShadow = true
    building28.position.y = 5.5
    building28.position.z = -70
    building28.position.x = -58
    scene.add(building28)

    const buildingGeom29 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building29 = new THREE.Mesh(buildingGeom29, buildingMat)
    building29.receiveShadow = true
    building29.castShadow = true
    building29.position.y = 0.5
    building29.position.z = 60
    building29.position.x = 45
    scene.add(building29)

    const buildingGeom30 = new THREE.CapsuleGeometry(5, 30, 30, 32)
    const building30 = new THREE.Mesh(buildingGeom30, buildingMat)
    building30.receiveShadow = true
    building30.castShadow = true
    building30.position.y = 2
    building30.position.z = -70
    building30.position.x = -50
    scene.add(building30)
}

// Load characters
function loadModels() {
    const loader1 = new FBXLoader(loadManager)
    //character sourced from https://www.mixamo.com/
    loader1.load('assets/character.fbx', function (object) {
        const char1 = object
        mixer_1 = new THREE.AnimationMixer(object)
        const action_1 = mixer_1.clipAction(object.animations[0])
        action_1.play()

        char1.scale.setScalar(0.02)
        char1.position.set(-11, -.5, -11)
        char1.rotation.y = 1
        object.traverse(function (child) {
            child.castShadow = true
            child.receiveShadow = true
        })
        scene.add(object)

    })
    const loader2 = new FBXLoader(loadManager)
    //character sourced from https://www.mixamo.com/
    loader2.load('assets/character2.fbx', function (object) {
        const char2 = object
        mixer_2 = new THREE.AnimationMixer(object)
        const action_2 = mixer_2.clipAction(object.animations[0])
        action_2.play()

        char2.scale.setScalar(0.02)
        char2.position.set(-8, -.5, 8)
        char2.rotation.y = 825
        object.traverse(function (child) {
            child.castShadow = true
            child.receiveShadow = true
        })
        scene.add(object)

    })
    const loader3 = new FBXLoader(loadManager)
    //character sourced from https://www.mixamo.com/
    loader3.load('assets/character3.fbx', function (object) {
        const char3 = object
        mixer_3 = new THREE.AnimationMixer(object)
        const action_3 = mixer_3.clipAction(object.animations[0])
        action_3.play()

        char3.scale.setScalar(0.02)
        char3.position.set(11, -.5, -11)
        char3.rotation.y = 25
        object.traverse(function (child) {
            child.castShadow = true
            child.receiveShadow = true
        })
        scene.add(object)

    })
    const loader4 = new FBXLoader(loadManager)
    //character sourced from https://www.mixamo.com/
    loader4.load('assets/character4.fbx', function (object) {
        const char4 = object
        mixer_4 = new THREE.AnimationMixer(object)
        const action_4 = mixer_4.clipAction(object.animations[0])
        action_4.play()

        char4.scale.setScalar(0.02)
        char4.position.set(11, -.5, 11)
        char4.rotation.y = 17
        object.traverse(function (child) {
            child.castShadow = true
            child.receiveShadow = true
        })
        scene.add(object)

    })
}

/************************************************************************
 * Set up connection and emitters
 ***********************************************************************/

let myId = ''
let timestamp = 0
const clientSpheres: { [id: string]: THREE.Mesh } = {}
const socket = io()
socket.on('connect', function () {
    console.log('connect')
})
socket.on('disconnect', function (message: any) {
    console.log('disconnect ' + message)
})
socket.on('id', (id: any) => {
    myId = id
    setInterval(() => {
        socket.emit('update', {
            t: Date.now(),
            p: myObject3D.position,
            r: myObject3D.rotation,
        })
    }, 50)
})
socket.on('clients', (clients: any) => {
    let pingStatsHtml = 'Socket Ping Stats<br/><br/>'
    Object.keys(clients).forEach((p) => {
        timestamp = Date.now()
        pingStatsHtml += p + ' ' + (timestamp - clients[p].t) + 'ms<br/>'
        if (!clientSpheres[p]) {
            clientSpheres[p] = new THREE.Mesh(geometry, material)
            clientSpheres[p].name = p
            scene.add(clientSpheres[p])
        } else {
            if (clients[p].p) {
                new TWEEN.Tween(clientSpheres[p].position)
                    .to(
                        {
                            x: clients[p].p.x,
                            y: clients[p].p.y,
                            z: clients[p].p.z,
                        },
                        50
                    )
                    .start()
            }
            if (clients[p].r) {
                new TWEEN.Tween(clientSpheres[p].rotation)
                    .to(
                        {
                            x: clients[p].r._x,
                            y: clients[p].r._y,
                            z: clients[p].r._z,
                        },
                        50
                    )
                    .start()
            }
        }
    })
        ; (document.getElementById('pingStats') as HTMLDivElement).innerHTML =
            pingStatsHtml
})
socket.on('removeClient', (id: string) => {
    scene.remove(scene.getObjectByName(id) as THREE.Object3D)
})
socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`)
})

/************************************************************************
 * Set up stats and GUI
 ***********************************************************************/

// Construct Stats
const stats = Stats()
document.body.appendChild(stats.dom)

// Construct GUI
const gui = new GUI()
const cubeFolder = gui.addFolder('Cube')

// unused code
/*
var x = 0.0
var z = 0.0

function xChange() {
    var xNum = x
    myObject3D.position.x = xNum
    //myObject3D.rotation.x = xNum
}

function zChange() {
    var zNum = z
    myObject3D.position.z = zNum
    //myObject3D.rotation.x = zNum
}
*/

// set up Dat.GUI
const cubePositionFolder = cubeFolder.addFolder('Position')
cubePositionFolder.add(myObject3D.position, 'x', -20, 20)
cubePositionFolder.add(myObject3D.position, 'z', -20, 20)
// unused
//cubePositionFolder.add(x, 'x', -5, 5).onChange(xChange)
//cubePositionFolder.add(z, 'z', -5, 5).onChange(zChange)
cubePositionFolder.open()

const cubeRotationFolder = cubeFolder.addFolder('Rotation')
cubeRotationFolder.add(myObject3D.rotation, 'y', 0, Math.PI * 2, 0.01)
cubeRotationFolder.open()
cubeFolder.open()

// tone.context.resume button added in case of issue playing audio in browser
const toneFolder = gui.addFolder('Tone')
const tonePlay = {
    tonePlay: function () {
        Tone.start()
        Tone.context.resume()
    }
}
toneFolder.add(tonePlay, 'tonePlay')
toneFolder.open()

// unused attempt to change ToneJS intrument
//const AMSynth = 'AM Synth'
//const FMSynth = 'FM Synth'
//var any
// Create GUI dropdown list to allow user to change their ToneJS instrument
//var userInstrument = 'AM Synth'
//const instrumentOptions = {
 //   AM: AMSynth,
   // Duo: 'Duo Synth',
//    FM: FMSynth
   // Mem: 'Membrane Synth',
   // Met: 'Metal Synth',
  //  Mon: 'Mono Synth',
  //  Noi: 'Noise Synth',
   // Plu: 'Pluck Synth',
  //  Syn: 'Synth'
//}
//const instrumentList = {
//    Instrument: any
//}

//gui.add(instrumentList, 'Instrument', Object.keys(instrumentOptions)).onChange((value) => {
//    userInstrument = instrumentOptions[value]
//    console.log(userInstrument)
//})


/****************************************************************************
* MIDI
****************************************************************************/
/*
 Unused attempt to enable MIDI controller input in the browser

// Set up MIDI access in browser
navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure)

function onMIDISuccess(midiAccess: { inputs: any; outputs: any }) {
    console.log(midiAccess)

    
    for (var input of midiAccess.inputs.values()) 
        input.onmidimessage = getMIDIMessage(input.message)
    
}

function getMIDIMessage(midiMessage: any) {
    console.log(midiMessage)
}


function onMIDIFailure() {
    console.log('Could not access your MIDI devices.')
}
*/

//Set up list of keys to notes for ToneJS
const keyToPitch: { [key: string]: any } = {
    " ": " ",
    "z": "C3",
    "s": "C#3",
    "x": "D3",
    "d": "D#3",
    "c": "E3",
    "v": "F3",
    "g": "F#3",
    "b": "G3",
    "h": "G#3",
    "n": "A3",
    "j": "A#3",
    "m": "B3",
    ",": "C4",
    "q": "C4",
    "2": "C#4",
    "w": "D4",
    "3": "D#4",
    "e": "E4",
    "r": "F4",
    "5": "F#4",
    "t": "G4",
    "6": "G#4",
    "y": "A4",
    "7": "A#4",
    "u": "B4",
    "i": "C5",
    "9": "C#5",
    "o": "D5",
    "0": "D#5",
    "p": "E5",
    "[": "F5",
    "=": "F#5",
    "]": "G5",
    "Backspace": "G#5"
}

/********************************************************************************
 * Guide to Key to note
 * 
 * ------Key to note list
 * .key - .code - .keycode
 * space - Space - 32
 * z - KeyZ - 90
 * s - KeyS - 83
 * x - KeyX - 88
 * d - KeyD - 68
 * c - KeyC - 67
 * v - KeyV - 86
 * g - KeyG - 71
 * b - KeyB - 66
 * h - KeyH - 72
 * n - KeyN - 78
 * j - KeyJ - 74
 * m - KeyM - 77
 * , - Comma - 188
 * q - KeyQ - 81
 * 2 - Digit2 - 50
 * w - KeyW - 87
 * 3 - Digit3 - 51
 * e - KeyE - 69
 * r - KeyR - 82
 * 5 - Digit5 - 53
 * t - KeyT - 84
 * 6 - Digit6 - 54
 * y - KeyY - 89
 * 7 - Digit7 - 55
 * u - KeyU - 85
 * i - KeyI - 73
 * 9 - Digit9 - 57
 * o - KeyO - 79
 * 0 - Digit0 - 48
 * p - KeyP - 80
 * [ - BracketLeft - 219
 * = - Equal - 187
 * ] - BracketRight - 221
 * backspace - Backspace - 8
 ********************************************************************************/

//Create ToneJS Synth
var synth1 = new Tone.Synth()
synth1.oscillator.type = "triangle11"
synth1.toDestination()

//when key is pressed, string is sent to server with the value of the key
window.onkeydown = function (e) {
    switch (e.keyCode) {
        case 32:
            socket.emit("keydown", (" "))
            break
        case 90:
            socket.emit("keydown", ("z"))
            break
        case 83:
            socket.emit("keydown", ("s"))
            break
        case 88:
            socket.emit("keydown", ("x"))
            break
        case 68:
            socket.emit("keydown", ("d"))
            break
        case 67:
            socket.emit("keydown", ("c"))
            break
        case 86:
            socket.emit("keydown", ("v"))
            break
        case 71:
            socket.emit("keydown", ("g"))
            break
        case 66:
            socket.emit("keydown", ("b"))
            break
        case 72:
            socket.emit("keydown", ("h"))
            break
        case 78:
            socket.emit("keydown", ("n"))
            break
        case 74:
            socket.emit("keydown", ("j"))
            break
        case 77:
            socket.emit("keydown", ("m"))
            break
        case 188:
            socket.emit("keydown", (","))
            break
        case 81:
            socket.emit("keydown", ("q"))
            break
        case 50:
            socket.emit("keydown", ("2"))
            break
        case 87:
            socket.emit("keydown", ("w"))
            break
        case 51:
            socket.emit("keydown", ("3"))
            break
        case 69:
            socket.emit("keydown", ("e"))
            break
        case 82:
            socket.emit("keydown", ("r"))
            break
        case 53:
            socket.emit("keydown", ("5"))
            break
        case 84:
            socket.emit("keydown", ("t"))
            break
        case 54:
            socket.emit("keydown", ("7"))
            break
        case 89:
            socket.emit("keydown", ("y"))
            break
        case 55:
            socket.emit("keydown", ("7"))
            break
        case 85:
            socket.emit("keydown", ("u"))
            break
        case 73:
            socket.emit("keydown", ("i"))
            break
        case 57:
            socket.emit("keydown", ("9"))
            break
        case 79:
            socket.emit("keydown", ("o"))
            break
        case 48:
            socket.emit("keydown", ("0"))
            break
        case 80:
            socket.emit("keydown", ("p"))
            break
        case 219:
            socket.emit("keydown", ("["))
            break
        case 187:
            socket.emit("keydown", ("="))
            break
        case 221:
            socket.emit("keydown", ("]"))
            break
        case 8:
            socket.emit("keydown", ("Backspace"))
            break
    }
}

// when key is released on keyboard, message is sent to the server
window.onkeyup = function (e) {
    socket.emit("keyup", ("up"))
}

//message recieved from server with value of key pressed
socket.on("noteOn", (e) => {
    console.log('Key Value: ' + e + '  Note: ' + keyToPitch[e])
    Tone.context.resume()
    synth1.triggerAttack(keyToPitch[e])
    Tone.context.latencyHint = "interactive"
})

// message is recieved from server to indicate key has been released
socket.on("noteOff", (e) => {
    console.log(e)
    Tone.context.resume()
    synth1.triggerRelease()
})

// unused attempt to create positional audio, emitting sound from each user

// set up positional audio
////const listener = new THREE.AudioListener()
//camera.add(listener)
//var posSound = new THREE.PositionalAudio(listener)
//Tone.context = posSound.context
//posSound.setNodeSource(synth1)
//myObject3D.add(posSound)

// run functions
createFloor()

createObjects()

loadModels()

// variable for colours
var rmapped = 0

// animation function
const animate = function () {
    requestAnimationFrame(animate)

    controls.update()

    TWEEN.update()

    const delta = clock.getDelta()

    // update model mixers
    if (mixer_1) mixer_1.update(delta)
    if (mixer_2) mixer_2.update(delta)
    if (mixer_3) mixer_3.update(delta)
    if (mixer_4) mixer_4.update(delta)

    // look at user's object
    if (clientSpheres[myId]) {
        camera.lookAt(clientSpheres[myId].position)
    }

    // update light colour
    var h = rmapped * 0.01 % 1
    var s = 0.5
    var l = 0.5
    dLight.color.setHSL(h, s, l)
    rectLight.color.setHSL(h, s, l)

    render()

    stats.update()
}

const render = function () {
    renderer.render(scene, camera)

    // change light colour
    rmapped++
}

animate()