import { WebSocket } from 'ws'

export class UserWebSocket extends WebSocket {
    private _roomId: string
    private _idUsuarioLogado: string

    constructor(url: string, protocols?: string | string[]) {
        super(url, protocols);
    }

    get roomId(): string {
        return this._roomId
    }

    set roomId(roomId: string) {
        if (!roomId)
            this._roomId = roomId
    }

    get idUsuarioLogado(): string {
        return this._idUsuarioLogado;
    }

    set idUsuarioLogado(value: string) {
        if (!value)
            this._idUsuarioLogado = value;
    }
}