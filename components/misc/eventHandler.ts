import mitt from "mitt"

type Events = {
    openPage: string
    closePage: string
    scenarioEvent: { name: string; detail?: any }
    terminalExec: string
}

const emitter = mitt<Events>();

export default emitter;
