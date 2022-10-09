import { WebSocket } from 'ws'

export class UserWebSocket extends WebSocket {
    private _roomId: string

    constructor(url: string, protocols?: string | string[]) {
        super(url, protocols)
    }

    get roomId(): string {
        return this._roomId
    }

    set roomId(roomId: string) {
        if (!roomId)
            this._roomId = roomId
    }
}