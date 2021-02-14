import { delay } from "./delay"
import { UMASnapshotContainer } from "./UMASnapshotContainer"

export const startUMASnapshotContainerOrSkip = async () => {
    if (process.env.REACT_APP_SKIP_DOCKER_RUN) {
        return Promise.resolve(undefined)
    }

    const umaSnapshotContainer = new UMASnapshotContainer()
    await umaSnapshotContainer.init()
    await umaSnapshotContainer.start()
    await delay(10000)
    return umaSnapshotContainer
}

export const stopUMASnapshotContainerOrSkip = async (instance) => {
    if (process.env.REACT_APP_SKIP_DOCKER_RUN) {
        return Promise.resolve(undefined)
    }
    await instance.stop()
}