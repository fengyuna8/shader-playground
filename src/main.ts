import FengScene from "./scene";

const bindEvent = (scene: FengScene) => {
    const button = document.querySelector('#id-button-run') as HTMLButtonElement
    button.addEventListener('click', (event) => {
        event.preventDefault()
        scene.gameLoop()
    })
}

const main = () => {
    const scene = new FengScene('#game-webgl', 'id-shader-vertex', 'id-shader-fragment')
    scene.gameLoop()

    bindEvent(scene)
}

main()