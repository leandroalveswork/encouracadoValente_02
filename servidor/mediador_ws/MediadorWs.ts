import { IncomingMessage } from "http";
import { inject, injectable } from "inversify";
import WebSocket, { RawData, WebSocketServer } from "ws";
import { ConfigBack } from "../ConfigBack";
import { LiteralServico } from "../literais/LiteralServico";
import { WsEnvelope } from "../modelos/WsEnvelope";
import { UtilUrl } from "../UtilUrl";
import { UserWebSocket } from "./UserWebSocket";
import jsonwebtoken from "jsonwebtoken";
import { LiteralTipoAtualizacao } from "../literais/LiteralTipoAtualizacao";

@injectable()
class MediadorWs {
    private _configBack: ConfigBack
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        this._configBack = configBack;
    }
    prepararUserWebSocket = (ws: UserWebSocket, req: IncomingMessage)  => {
        const roomId = UtilUrl.obterParamPorKey(req.url ?? '', 'id');
        if (roomId !== undefined) {
            ws.roomId = roomId as string;
        } else {
            ws.roomId = '';
        }
    }
    reencaminharOutroClient = (wsServer: WebSocketServer, ws: UserWebSocket, req: IncomingMessage, dados: RawData, naoEBinario: boolean) => {
        
        // Extrair WsEnvelope
        const dadosAsString = naoEBinario ? dados : dados.toString();
        const payloadWs: WsEnvelope = JSON.parse(dadosAsString + '');
        
        if (this.obterIdUsuarioLogado(payloadWs.tokenAuth) == null)
            return;

        if (payloadWs.numeroTipoAtualizacao == LiteralTipoAtualizacao.ListagemSalas) {
            
            // Encaminhar para os outros clientes exceto a si mesmo
            const eOutroJogadorDaMesmaSala = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN;
            const outroJogadorDaSala = Array.from(wsServer.clients).find(client => eOutroJogadorDaMesmaSala(client as UserWebSocket));
            outroJogadorDaSala?.send(dadosAsString);
        } else {
            
            // Encaminhar para os outros clientes exceto a si mesmo na mesma roomId
            const eOutroJogadorDaMesmaSala = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN && client.roomId === ws.roomId;
            const outroJogadorDaSala = Array.from(wsServer.clients).find(client => eOutroJogadorDaMesmaSala(client as UserWebSocket));
            outroJogadorDaSala?.send(dadosAsString);
        }
    }
    private obterIdUsuarioLogado = (tokenAuth: string | undefined): string | null => {
        if (tokenAuth == undefined || tokenAuth == '')
            return null;
        try {
            const idUsuarioLogadoWrapper: any = jsonwebtoken.verify(tokenAuth as string, this._configBack.salDoJwt);
            return idUsuarioLogadoWrapper.id;
        } catch (exc) {
            return null;
        }
    }
}

export { MediadorWs };