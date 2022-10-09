import express, { Request, Response, Router } from 'express';
import cors from "cors";
import { IncomingMessage, Server } from 'http';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { LiteralServico } from './literais/LiteralServico';
import { UserWebSocket } from './mediador_ws/UserWebSocket';
import { Container } from 'inversify';
import { ConfigBack } from './ConfigBack';
import { UtilUrl } from './UtilUrl';
import { MediadorWs } from './mediador_ws/MediadorWs';
import { UsuarioRepositorio } from './repositorio/UsuarioRepositorio';
import { AutorizacaoController } from './api/AutorizacaoController';
import mongoose from 'mongoose';

const iocProvedor = new Container();
iocProvedor.bind<ConfigBack>(LiteralServico.ConfigBack).to(ConfigBack).inSingletonScope();
iocProvedor.bind<MediadorWs>(LiteralServico.MediadorWs).to(MediadorWs).inRequestScope();
iocProvedor.bind<UsuarioRepositorio>(LiteralServico.UsuarioRepositorio).to(UsuarioRepositorio).inRequestScope();
iocProvedor.bind<AutorizacaoController>(LiteralServico.AutorizacaoController).to(AutorizacaoController).inRequestScope();

const app = express();

const configBack = iocProvedor.get<ConfigBack>(LiteralServico.ConfigBack);
const mediadorWs = iocProvedor.get<MediadorWs>(LiteralServico.MediadorWs);
const autorizacaoController = iocProvedor.get<AutorizacaoController>(LiteralServico.AutorizacaoController);



mongoose.connect(configBack.conexaoMongodb, { dbName: 'EncVn' })
  .then(async () => {
    // app.get('/', (req: Request, res: Response) => {
    //   res.send(`Sal do Hash: ${_configuracaoBackend.getSalDoHash()}`);
    // });
    app.use(cors());
    app.use(express.json());
    
    app.use('/api/autorizacao', autorizacaoController.router);
    // _gerenciadorRequisicoesApi.useTodasRouters(app);
    // app.use(ExControllerMiddleware.middleware);
    
    const portaDoHost = parseInt(configBack.hostDoBackend?.substring(configBack.hostDoBackend.indexOf(':') + 1));
    const server = app.listen(portaDoHost, () => {
      console.log('Servidor esta rodando em http://' + configBack.hostDoBackend);
    });
    
    const getWsServer = (server: Server, path = '/room') => new WebSocketServer({ server, path });
    const wsServer = getWsServer(server);
    wsServer.on('connection', (ws: UserWebSocket, req: IncomingMessage) => {
      mediadorWs.prepararUserWebSocket(ws, req);
      ws.on('message', (dados: RawData, naoEBinario: boolean) => { mediadorWs.reencaminharOutroClient(wsServer, ws, req, dados, naoEBinario); })
      ws.on('error', (error) => console.error(error))
      ws.on('close', () => console.log('conexão fechou'))
      // _gerenciadorConnecWs.onConnection(wsServer, ws, req);
    });
  });
