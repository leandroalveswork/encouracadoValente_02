import { IncomingMessage } from "http";
import { injectable } from "inversify";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { UtilUrl } from "../UtilUrl";
import { UserWebSocket } from "./UserWebSocket";

@injectable()
class MediadorWs {
    prepararUserWebSocket = (ws: UserWebSocket, req: IncomingMessage)  => {
        const roomId = UtilUrl.obterParamPorKey(req.url ?? '', 'id');
        ws.roomId = roomId as string;
    }
    reencaminharOutroClient = (wsServer: WebSocketServer, ws: UserWebSocket, req: IncomingMessage, dados: RawData, naoEBinario: boolean) => {
        // extrair WsMsng
        const dadosAsString = naoEBinario ? dados : dados.toString();
        // const payloadWs: WsMnsg = JSON.parse(dadosAsString + '');

        // encaminhar para os outros clientes exceto a si mesmo
        const eOutroJogadorDaMesmaSala = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN && client.roomId === ws.roomId;
        const outroJogadorDaSala = Array.from(wsServer.clients).find(client => eOutroJogadorDaMesmaSala(client as UserWebSocket));

        outroJogadorDaSala?.send(dadosAsString);
    }
}

export { MediadorWs };