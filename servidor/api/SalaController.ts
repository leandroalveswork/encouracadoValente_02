import { Router } from "express";
import { inject, injectable, postConstruct } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { MdExcecao } from "./MdExcecao";
import { StringUteis } from "../uteis/StringUteis";
import { ConfigBack } from "../ConfigBack";
import { ControllerBase } from "./ControllerBase";
import { SalaFluxoRepositorio } from "../repositorio/SalaFluxoRepositorio";
import { MdSalaDisponivel } from "../modelos/MdSalaDisponivel";
import { DbSalaFluxo } from "../modelos/DbSalaFluxo";
import { PutEntrarSala } from "../modelos/PutEntrarSala";

@injectable()
class SalaController extends ControllerBase {
    private _salaFluxoRepositorio: SalaFluxoRepositorio
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack,
        @inject(LiteralServico.SalaFluxoRepositorio) salaFluxoRepositorio: SalaFluxoRepositorio,
    ) {
        super(configBack);
        this._configBack = configBack;
        this._salaFluxoRepositorio = salaFluxoRepositorio;
        this.router = Router();
        this.router.get('/listarDisponiveis', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                const salasDisponiveis = await this.listarDisponiveis();
                res.send(salasDisponiveis);
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.put('/entrar', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.entrar(req.body, idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
        this.router.put('/cancelarProximaSaida', async (req, res) => {
            try {
                const idUsuarioLogado = await this.obterIdUsuarioLogado(req);
                await this.cancelarProximaSaida(idUsuarioLogado);
                res.send();
            } catch (exc) {
                MdExcecao.enviarExcecao(req, res, exc);
            }
        });
    }

    // codifique as actions:
    
    private retificarSalas = async (idUsuarioLogado: string): Promise<void> => {
        let indxSala = 1;
        let saveSalas: DbSalaFluxo[] = [];
        for (let _ of Array(10)) {
            let insertSala = new DbSalaFluxo();
            insertSala.id = StringUteis.gerarNovoIdDe24Caracteres();
            insertSala.numeroRecuperacaoUrl = indxSala;
            insertSala.idPlayer1 = null;
            insertSala.idPlayer2 = null;
            insertSala.player1CarregouFluxo = false;
            insertSala.player2CarregouFluxo = false;
            insertSala.horaCancelamentoSaidaPlayer1 = null;
            insertSala.horaCancelamentoSaidaPlayer2 = null;
            saveSalas.push(insertSala);
            indxSala++;
        }
        await this._salaFluxoRepositorio.insertMuitosPorOperador(saveSalas, idUsuarioLogado);
    }
    
    // autorizado
    // get
    listarDisponiveis = async (): Promise<MdSalaDisponivel[]> => {
        const salasDb = await this._salaFluxoRepositorio.selectAll();
        // if (salasDb.length === 0)
        //     await this.retificarSalas(idUsuarioLogado);
        let salasDisponiveis: MdSalaDisponivel[] = [];
        for (let iSalaDb of salasDb) {
            if (iSalaDb.idPlayer1 != null && iSalaDb.idPlayer2 != null)
                continue;
            if (iSalaDb.idPlayer1 != null || iSalaDb.idPlayer2 != null) {
                let salaCom1 = new MdSalaDisponivel();
                salaCom1.numeroRecuperacaoUrl = iSalaDb.numeroRecuperacaoUrl;
                salaCom1.totalJogadores = 1;
                salasDisponiveis.push(salaCom1);
                continue;
            }
            let salaVazia = new MdSalaDisponivel();
            salaVazia.numeroRecuperacaoUrl = iSalaDb.numeroRecuperacaoUrl;
            salaVazia.totalJogadores = 0;
            salasDisponiveis.push(salaVazia);
        }
        return salasDisponiveis;
    }
    
    // autorizado
    // put
    entrar = async (entrarSala: PutEntrarSala, idUsuarioLogado: string): Promise<void> => {
        
        // Validaçoes
        const salaDb = await this._salaFluxoRepositorio.selectByNumeroRecuperacaoUrl(entrarSala.numeroRecuperacaoUrl);
        if (salaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Sala nao encontrada';
            throw ex;
        }
        if (salaDb.idPlayer1 != null && salaDb.idPlayer2 != null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Sala cheia';
            throw ex;
        }
        
        // Salvar entrada de sala no mongodb
        if (salaDb.idPlayer1 != null) {
            
            // Entrar como player2
            let salaAtualP2 = new DbSalaFluxo();
            salaAtualP2 = salaDb;
            salaAtualP2.idPlayer2 = idUsuarioLogado;
            salaAtualP2.horaCancelamentoSaidaPlayer2 = null;
            salaAtualP2.player1CarregouFluxo = false;
            salaAtualP2.player2CarregouFluxo = false;
            await this._salaFluxoRepositorio.updatePorOperador(salaAtualP2, idUsuarioLogado);
            return;
        }
        
        // Entrar como player1
        let salaAtualP1 = new DbSalaFluxo();
        salaAtualP1 = salaDb;
        salaAtualP1.idPlayer1 = idUsuarioLogado;
        salaAtualP1.horaCancelamentoSaidaPlayer1 = null;
        await this._salaFluxoRepositorio.updatePorOperador(salaAtualP1, idUsuarioLogado);
    }
    
    // autorizado
    // put
    cancelarProximaSaida = async (idUsuarioLogado: string): Promise<void> => {
        
        // Validaçoes
        const salaDb = await this._salaFluxoRepositorio.selectByUsuarioJogandoOrDefault(idUsuarioLogado);
        if (salaDb == null) {
            let ex = new MdExcecao();
            ex.codigoExcecao = 400;
            ex.problema = 'Voce ainda nao entrou em uma sala';
            throw ex;
        }
        
        // Cancelar proxima saida de sala (provavelmente troca de rota no websocket) e salvar no mongodb
        if (salaDb.idPlayer1 == idUsuarioLogado) {
            
            // Cancelar proxima saida como player1
            let salaAtualP1 = new DbSalaFluxo();
            salaAtualP1 = salaDb;
            salaAtualP1.horaCancelamentoSaidaPlayer1 = new Date();
            await this._salaFluxoRepositorio.updatePorOperador(salaAtualP1, idUsuarioLogado);
            return;
        }
        
        // Cancelar proxima saida como player2
        let salaAtualP2 = new DbSalaFluxo();
        salaAtualP2 = salaDb;
        salaAtualP2.horaCancelamentoSaidaPlayer2 = new Date();
        await this._salaFluxoRepositorio.updatePorOperador(salaAtualP2, idUsuarioLogado);
    }
}

export { SalaController };
