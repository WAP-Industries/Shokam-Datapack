// ==UserScript==
// @name         Shokam Shellshockers Datapack
// @author       WAP Industries
// @namespace    http://tampermonkey.net/
// @match        *://shellshock.io/*
// @match        *://algebra.best/*
// @match        *://algebra.vip/*
// @match        *://biologyclass.club/*
// @match        *://deadlyegg.com/*
// @match        *://deathegg.world/*
// @match        *://eggcombat.com/*
// @match        *://egg.dance/*
// @match        *://eggfacts.fun/*
// @match        *://egghead.institute/*
// @match        *://eggisthenewblack.com/*
// @match        *://eggsarecool.com/*
// @match        *://geometry.best/*
// @match        *://geometry.monster/*
// @match        *://geometry.pw/*
// @match        *://geometry.report/*
// @match        *://hardboiled.life/*
// @match        *://hardshell.life/*
// @match        *://humanorganising.org/*
// @match        *://mathdrills.info/*
// @match        *://mathfun.rocks/*
// @match        *://mathgames.world/*
// @match        *://math.international/*
// @match        *://mathlete.fun/*
// @match        *://mathlete.pro/*
// @match        *://overeasy.club/*
// @match        *://scrambled.best/*
// @match        *://scrambled.tech/*
// @match        *://scrambled.today/*
// @match        *://scrambled.us/*
// @match        *://scrambled.world/*
// @match        *://shellshockers.club/*
// @match        *://shellshockers.site/*
// @match        *://shellshockers.us/*
// @match        *://shellshockers.world/*
// @match        *://softboiled.club/*
// @match        *://violentegg.club/*
// @match        *://violentegg.fun/*
// @match        *://yolk.best/*
// @match        *://yolk.life/*
// @match        *://yolk.rocks/*
// @match        *://yolk.tech/*
// @match        *://zygote.cafe/*
// @grant        none
// @run-at       document-start
// @icon         https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/logo.jpg
// ==/UserScript==

function changeTheme(){
    const css = `
        *{
            background-size: 100% 100%;   
        }
        :root{
            --ss-lightoverlay: url("https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/assets/themes/background.jpg");
            background-size: 100% 100%;
        }
    `
    document.head.innerHTML+=`<style>${css}</style>`
    ;[...document.querySelectorAll('link')]
        .filter(i=>i.href.includes("shellshock.io/favicon"))
        .map(i=>i.href="https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/assets/themes/icon.jpg")
    document.title = "Salakau Shockers"
}
(()=>(document.body ? changeTheme() : document.addEventListener("DOMContentLoaded", _=>changeTheme())))()

window.XMLHttpRequest = class extends window.XMLHttpRequest {
    open(_, url) {
        if (url.indexOf('shellshock.js') > - 1) 
            this.isScript = true;
        return super.open(...arguments);
    }

    get response(){
        if (this.isScript){
            const code = super.response

            const variables = {
                babylon: /this\.origin=new ([a-zA-Z]+)\.Vector3/.exec(code)?.[1],
                players: /([^,]+)=\[\],[^,]+=\[\],[^,]+=-1,vueApp.game.respawnTime=0/.exec(code)?.[1],
                myPlayer: /"fire":document.pointerLockElement&&([^&]+)&&/.exec(code)?.[1],
                scene: /createMapCells\(([^,]+),/.exec(code)?.[1],
                cullFunc: /=([a-zA-Z_$]+)\(this\.mesh,\.[0-9]+\)/.exec(code)?.[1],
                audioIndex: /"death_scream"\+([^,]+)/.exec(code)?.[1]
            }

            if (Object.values(variables).some(i=>!i))
                return void alert(`Script failed to inject\n\nVariables missing:\n${Object.keys(variables).filter(i=>!variables[i]).join('\n')}`)

            console.log('%cScript injected', 'color: red; background: black; font-size: 2em;', variables);

            return code.replace(
                    `console.log("startGame()");`,
                    `
                        console.log("startGame()");
                        (async ()=>{
                            await window.BAWK.loadSound(
                                "https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/assets/audio/death.wav",
                                "shokam_scream"
                            );
                        })();
                    `,
                )
                .replace(
                    `"death_scream"+${variables.audioIndex}`,
                    `"shokam_scream"`                
                )
                .replace(variables.scene + '.render()', `
                    window['${onUpdateFuncName}'](${variables.babylon},${variables.players},${variables.myPlayer}); 
                    ${variables.scene}.render()`)
                .replace(`function ${variables.cullFunc}`, `
                    function ${variables.cullFunc}() {return true;}
                    function someFunctionWhichWillNeverBeUsedNow`);
        }

        return super.response
    }
}


const onUpdateFuncName = btoa(Math.random().toString(32))

function changeSky(BABYLON, scene){
    const mesh = scene.getMeshByID("skyBox")
    
    if (!scene.modded){
        mesh.material.diffuseTexture = new BABYLON.Texture(
            "https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/assets/sky/texture.png", 
            scene
        )
        mesh.material.useAlphaFromDiffuseTexture = true
        mesh.material.emissiveColor = new BABYLON.Color3.White()
        mesh.material.reflectionTexture.level = 0

        const uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind)
        const faces = [
            [0.0, 0.2],
            [0.4, 0.6],
            [0.6, 0.8],
            [0.6, 0.8],
            [0.8, 1.0],
            [0.8, 1.0],
        ]

        for (let i=0;i<48;i+=8){
            uvs[i+2] = uvs[i+4] = faces[i/8][0]
            uvs[i] = uvs[i+6] = faces[i/8][1]
            
            uvs[i+1] = uvs[i+3] = 0
            uvs[i+5] = uvs[i+7] = 1
        }
        mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
        
        scene.modded = true
    }
}

function changePlayers(BABYLON, players){
    const randInt = (min, max)=> ~~(Math.random()*(max-min+1))+min;

    for (const player of players){
        if (!player) continue

        if (!player.modded) {
            player.actor.bodyMesh.setEnabled(false)

            function create_plane(image) {
                const material = function(){
                    const m = new BABYLON.StandardMaterial("", player.actor.scene)
                    m.emissiveColor = new BABYLON.Color3.White()
                    m.diffuseTexture = new BABYLON.Texture(image, player.actor.scene)
                    m.diffuseTexture.hasAlpha = true
                    m.useAlphaFromDiffuseTexture = true

                    return m
                }()

                const plane = BABYLON.MeshBuilder.CreatePlane("", {
                    width: 0.5,
                    height: 0.75,
                    sideOrientation: BABYLON.Mesh.DOUBLESIDE
                })
                plane.material = material
                plane.position.y = 0.4
                plane.parent = player.actor.mesh
                return plane
            }

            const index = randInt(1,7),
                dir = "https://raw.githubusercontent.com/WAP-Industries/Shokam-Datapack/main/assets/avatars/"
                p1 = create_plane(`${dir}${index}-front.png`),
                p2 = create_plane(`${dir}${index}-back.png`)
            p2.position.z = -0.01

            player.modded = true
        }
    }
}

window[onUpdateFuncName] = function(BABYLON, players, myPlayer){
    try{
        changeSky(BABYLON, myPlayer.actor.scene)
        changePlayers(BABYLON, players.filter(i=>i!=myPlayer))
    }
    catch(err){
        console.log(err)
    }
}
