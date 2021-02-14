import path from 'path'

const Docker = require('dockerode');

export const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const CONTAINER_PORT = 8548;

export const PROVIDER_URL = `http://localhost:${CONTAINER_PORT}`

export class UMASnapshotContainer {
    container: any

    imageName: string = "defiacademy/uma-snapshot"

    async init() {
        const docker = new Docker({ socketPath: '/var/run/docker.sock' });

        return new Promise((resolve, reject) => {
            docker.createContainer({
                Image: this.imageName,
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                Tty: true,
                Cmd: [],
                OpenStdin: false,
                StdinOnce: false,
                ExposedPorts: { "8545/tcp": {} },
                PortBindings: { "8545/tcp": [{ "HostPort": `${CONTAINER_PORT}` }] },
                Env: []
            }).then((container) => {
                this.container = container;
                resolve(container)
            }).catch((err) => {
                console.log(err);
                reject(err)
            });
        })
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.container.start()
                .then((data) => {
                    console.log('container started');
                    resolve(data)
                }).catch((err) => {
                    console.log(err);
                    reject(err)
                });
        })
    }

    async stop() {
        return new Promise((resolve, reject) => {
            this.container.stop()
                .then((data) => {
                    console.log('container stopped');
                    return this.container.remove()
                })
                .then((data) => {
                    console.log('container removed');
                    resolve(data)
                })
                .catch((err) => {
                    console.log(err);
                    reject(err)
                });
        })
    }
}