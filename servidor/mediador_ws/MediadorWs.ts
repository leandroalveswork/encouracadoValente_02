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
import { SalaFluxoRepositorio } from "../repositorio/SalaFluxoRepositorio";
import { DbSalaFluxo } from "../modelos/DbSalaFluxo";

@injectable()
class MediadorWs {
    private _configBack: ConfigBack;
    private _salaFluxoRepositorio: SalaFluxoRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.SalaFluxoRepositorio) salaFluxoRepositorio: SalaFluxoRepositorio
    ) {
        this._configBack = configBack;
        this._salaFluxoRepositorio = salaFluxoRepositorio;
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
        
        // Validaçao e preenchimento do idUsuarioLogado
        const idUsuarioLogado = this.obterIdUsuarioLogado(payloadWs.tokenAuth);
        if (idUsuarioLogado == null || idUsuarioLogado == null || idUsuarioLogado == '')
            return;
        if (ws.idUsuarioLogado == undefined || ws.idUsuarioLogado == null || ws.idUsuarioLogado == '')
            ws.idUsuarioLogado = idUsuarioLogado; 
        console.log('ws.idUsuarioLogado = ' + ws.idUsuarioLogado);
        if (payloadWs.numeroTipoAtualizacao == LiteralTipoAtualizacao.PrepararUsuarioLogadoWs)
            return;
        console.table(payloadWs);
        if (payloadWs.numeroTipoAtualizacao == LiteralTipoAtualizacao.ListagemSalas) {
            
            // Encaminhar para os outros clientes exceto a si mesmo
            const eClient = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN;
            const outrosJogadores = Array.from(wsServer.clients).filter(client => eClient(client as UserWebSocket));
            outrosJogadores.forEach(x => x.send(dadosAsString));
        } else {
            
            // Encaminhar para os outros clientes exceto a si mesmo na mesma roomId
            const eOutroJogadorDaMesmaSala = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN && client.roomId === ws.roomId;
            const outroJogadorDaSala = Array.from(wsServer.clients).find(client => eOutroJogadorDaMesmaSala(client as UserWebSocket));
            outroJogadorDaSala?.send(dadosAsString);
        }
    }
    limparDadosUsuarioDesconectado = (wsServer: WebSocketServer, ws: UserWebSocket, req: IncomingMessage) => {
        console.log('iniciou limpar()');
        if (ws.idUsuarioLogado == undefined || ws.idUsuarioLogado == '')
            return;
        console.log('ws.idUsuarioLogado populado com ' + ws.idUsuarioLogado);
        this._salaFluxoRepositorio.selectByUsuarioJogandoOrDefault(ws.idUsuarioLogado)
            .then(async (salaDb) => {
                // console.log('salaDb found!');
                if (salaDb == null)
                    return;
                // console.log('salaDb not null');
                if (salaDb.idPlayer1 == ws.idUsuarioLogado) {
                    
                    // Usuario logado e player1
                    // Se houve cancelamento de saida ha 5 segs, nao sair
                    // console.log('verificando player1 se n houve cancelamento');
                    // console.log(new Date().getTime() - (salaDb.horaCancelamentoSaidaPlayer1 == undefined ? 0 : salaDb.horaCancelamentoSaidaPlayer1.getTime()));
                    if (salaDb.horaCancelamentoSaidaPlayer1 != null && new Date().getTime() - salaDb.horaCancelamentoSaidaPlayer1.getTime() < 5 * 1000)
                        return;
                    // console.log('n houve cancelamento');
                        
                    // Sair da sala
                    let salaAtual = new DbSalaFluxo();
                    salaAtual = salaDb;
                    salaAtual.horaCancelamentoSaidaPlayer1 = null;
                    salaAtual.idPlayer1 = null;
                    await this._salaFluxoRepositorio.updatePorOperador(salaAtual, ws.idUsuarioLogado);
                    // console.log('saiu da sala');
                    
                    // Notificar todos os clientes
                    const eClient = (client: UserWebSocket) => client.readyState == WebSocket.OPEN;
                    const todosClients = Array.from(wsServer.clients).filter(client => eClient(client as UserWebSocket));
                    let pedidoAtualizarListagemSala = new WsEnvelope();
                    pedidoAtualizarListagemSala.numeroTipoAtualizacao = LiteralTipoAtualizacao.ListagemSalas;
                    pedidoAtualizarListagemSala.tokenAuth = '';
                    let pedidoAtualizarStringified = JSON.stringify(pedidoAtualizarListagemSala);
                    todosClients.forEach(x => x.send(pedidoAtualizarStringified));
                    // console.log('notificando outros ws');
                    return;
                }
                    
                // Usuario logado e player2
                // Se houve cancelamento de saida ha 5 segs, nao sair
                // console.log('verificando player2 se n houve cancelamento');
                // console.log(new Date().getTime() - (salaDb.horaCancelamentoSaidaPlayer2 == undefined ? 0 : salaDb.horaCancelamentoSaidaPlayer2.getTime()));
                if (salaDb.horaCancelamentoSaidaPlayer2 != null && new Date().getTime() - salaDb.horaCancelamentoSaidaPlayer2.getTime() < 5 * 1000)
                    return;
                // console.log('n houve cancelamento');
                        
                // Sair da sala
                let salaAtualP2 = new DbSalaFluxo();
                salaAtualP2 = salaDb;
                salaAtualP2.horaCancelamentoSaidaPlayer2 = null;
                salaAtualP2.idPlayer2 = null;
                await this._salaFluxoRepositorio.updatePorOperador(salaAtualP2, ws.idUsuarioLogado ?? '');
                // console.log('saiu da sala');
                    
                // Notificar os outros clientes
                const eClientP2 = (client: UserWebSocket) => client !== ws && client.readyState == WebSocket.OPEN;
                const todosClientsP2 = Array.from(wsServer.clients).filter(client => eClientP2(client as UserWebSocket));
                let pedidoAtualizarListagemSalaP2 = new WsEnvelope();
                pedidoAtualizarListagemSalaP2.numeroTipoAtualizacao = LiteralTipoAtualizacao.ListagemSalas;
                pedidoAtualizarListagemSalaP2.tokenAuth = '';
                let pedidoAtualizarStringifiedP2 = JSON.stringify(pedidoAtualizarListagemSalaP2);
                todosClientsP2.forEach(x => x.send(pedidoAtualizarStringifiedP2));
                // console.log('notificando outros ws');
            });
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

export { MediadorWs }