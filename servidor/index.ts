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
import { TemaRepositorio } from './repositorio/TemaRepositorio';
import { TemaController } from './api/TemaController';
import { NavioTemaRepositorio } from './repositorio/NavioTemaRepositorio';
import { ArquivoRepositorio } from './repositorio/ArquivoRepositorio';
import { ArquivoController } from './api/ArquivoController';
import { CompraRepositorio } from './repositorio/CompraRepositorio';
import { CompraController } from './api/CompraController';
import { LiberacaoController } from './api/LiberacaoController';
import { SalaFluxoRepositorio } from './repositorio/SalaFluxoRepositorio';
import { PosicaoFluxoRepositorio } from './repositorio/PosicaoFluxoRepositorio';
import { TiroFluxoRepositorio } from './repositorio/TiroFluxoRepositorio';
import { FluxoMultiplayerController } from './api/FluxoMultiplayerController';
import { SalaController } from './api/SalaController';

const iocProvedor = new Container();
iocProvedor.bind<ConfigBack>(LiteralServico.ConfigBack).to(ConfigBack).inSingletonScope();

iocProvedor.bind<UsuarioRepositorio>(LiteralServico.UsuarioRepositorio).to(UsuarioRepositorio).inRequestScope();
iocProvedor.bind<TemaRepositorio>(LiteralServico.TemaRepositorio).to(TemaRepositorio).inRequestScope();
iocProvedor.bind<CompraRepositorio>(LiteralServico.CompraRepositorio).to(CompraRepositorio).inRequestScope();
iocProvedor.bind<NavioTemaRepositorio>(LiteralServico.NavioTemaRepositorio).to(NavioTemaRepositorio).inRequestScope();
iocProvedor.bind<ArquivoRepositorio>(LiteralServico.ArquivoRepositorio).to(ArquivoRepositorio).inRequestScope();
iocProvedor.bind<SalaFluxoRepositorio>(LiteralServico.SalaFluxoRepositorio).to(SalaFluxoRepositorio).inRequestScope();
iocProvedor.bind<PosicaoFluxoRepositorio>(LiteralServico.PosicaoFluxoRepositorio).to(PosicaoFluxoRepositorio).inRequestScope();
iocProvedor.bind<TiroFluxoRepositorio>(LiteralServico.TiroFluxoRepositorio).to(TiroFluxoRepositorio).inRequestScope();

iocProvedor.bind<MediadorWs>(LiteralServico.MediadorWs).to(MediadorWs).inRequestScope();

iocProvedor.bind<AutorizacaoController>(LiteralServico.AutorizacaoController).to(AutorizacaoController).inRequestScope();
iocProvedor.bind<TemaController>(LiteralServico.TemaController).to(TemaController).inRequestScope();
iocProvedor.bind<CompraController>(LiteralServico.CompraController).to(CompraController).inRequestScope();
iocProvedor.bind<LiberacaoController>(LiteralServico.LiberacaoController).to(LiberacaoController).inRequestScope();
iocProvedor.bind<ArquivoController>(LiteralServico.ArquivoController).to(ArquivoController).inRequestScope();
iocProvedor.bind<FluxoMultiplayerController>(LiteralServico.FluxoMultiplayerController).to(FluxoMultiplayerController).inRequestScope();
iocProvedor.bind<SalaController>(LiteralServico.SalaController).to(SalaController).inRequestScope();

const app = express();

const configBack = iocProvedor.get<ConfigBack>(LiteralServico.ConfigBack);
const mediadorWs = iocProvedor.get<MediadorWs>(LiteralServico.MediadorWs);
const autorizacaoController = iocProvedor.get<AutorizacaoController>(LiteralServico.AutorizacaoController);
const temaController = iocProvedor.get<TemaController>(LiteralServico.TemaController);
const compraController = iocProvedor.get<CompraController>(LiteralServico.CompraController);
const liberacaoController = iocProvedor.get<CompraController>(LiteralServico.LiberacaoController);
const arquivoController = iocProvedor.get<ArquivoController>(LiteralServico.ArquivoController);
const fluxoMultiplayerController = iocProvedor.get<FluxoMultiplayerController>(LiteralServico.FluxoMultiplayerController);
const salaController = iocProvedor.get<SalaController>(LiteralServico.SalaController);

mongoose.connect(configBack.conexaoMongodb, { dbName: 'EncVn' })
  .then(async () => {
    // app.get('/', (req: Request, res: Response) => {
    //   res.send(`Sal do Hash: ${_configuracaoBackend.getSalDoHash()}`);
    // });
    app.use(cors());
    app.use(express.json());
    
    app.use('/api/autorizacao', autorizacaoController.router);
    app.use('/api/tema', temaController.router);
    app.use('/api/compra', compraController.router);
    app.use('/api/liberacao', liberacaoController.router);
    app.use('/api/arquivo', arquivoController.router);
    app.use('/api/fluxoMultiplayer', fluxoMultiplayerController.router);
    app.use('/api/sala', salaController.router);
    // _gerenciadorRequisicoesApi.useTodasRouters(app);
    // app.use(ExControllerMiddleware.middleware);
    
    const portaDoHost = parseInt(configBack.hostDoBackend?.substring(configBack.hostDoBackend.indexOf(':') + 1));
    const server = app.listen(portaDoHost, () => {
      console.log('🚀 Servidor escutando na url: http://' + configBack.hostDoBackend);
    });
    
    const getWsServer = (server: Server, path = '/ws') => new WebSocketServer({ server, path });
    const wsServer = getWsServer(server);
    wsServer.on('connection', (ws: UserWebSocket, req: IncomingMessage) => {
      mediadorWs.prepararUserWebSocket(ws, req);
      ws.on('message', (dados: RawData, naoEBinario: boolean) => { mediadorWs.reencaminharOutroClient(wsServer, ws, req, dados, naoEBinario); })
      ws.on('error', (error) => console.error(error))
      ws.on('close', () => mediadorWs.limparDadosUsuarioDesconectado(wsServer, ws, req));
      // _gerenciadorConnecWs.onConnection(wsServer, ws, req);
    });
  });
