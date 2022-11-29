import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, HydratedDocument, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbArquivo } from "../modelos/DbArquivo";
import { DbSalaFluxo } from "../modelos/DbSalaFluxo";
import { StringUteis } from "../uteis/StringUteis";

@injectable()
class SalaFluxoRepositorio extends RepositorioCrud<DbSalaFluxo> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbSalaFluxo>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            numeroRecuperacaoUrl: { type: Number, required: true },
            idPlayer1: String,
            idPlayer2: String,
            player1CarregouFluxo: { type: Boolean, required: true },
            player2CarregouFluxo: { type: Boolean, required: true },
            horaCancelamentoSaidaPlayer1: Date,
            horaCancelamentoSaidaPlayer2: Date,
            horaUltimaConexaoPlayer1: Date,
            horaUltimaConexaoPlayer2: Date,
        });
        this.inicializarMongo('SalaFluxo', schema);
    }
    
    selectByUsuarioJogandoOrDefault = (idUsuarioJogando: string) => {
        let query = this._modelMongo.findOne({ $or: [
            { idPlayer1: idUsuarioJogando.toString() },
            { idPlayer2: idUsuarioJogando.toString() }
        ] });
        return query;
    }
    
    selectByNumeroRecuperacaoUrl = (numeroRecuperacaoUrl: number) => {
        let query = this._modelMongo.findOne({ numeroRecuperacaoUrl: numeroRecuperacaoUrl });
        return query;
    }
    
    consertarDb = async (idUsuarioOperador: string): Promise<void> => {
        const todosRegistros = await this.selectAll();
        if (todosRegistros.length == 0) {
            await this.popularSalas(idUsuarioOperador);
            return;
        }
        
        // Mapear mesmo idJogadores -> salas diferentes
        let dicionarioJogadores: { idJogador: string, registrosRelacionados: DbSalaFluxo[] }[] = [];
        for (let iRegistro of todosRegistros) {
            const p1NoDicionario = dicionarioJogadores.find(x => x.idJogador == iRegistro.idPlayer1);
            if (p1NoDicionario == undefined) {
                if (iRegistro.idPlayer1 != null)
                    dicionarioJogadores.push({ idJogador: iRegistro.idPlayer1, registrosRelacionados: [iRegistro] });
            } else {
                if (iRegistro.idPlayer1 != null)
                    p1NoDicionario.registrosRelacionados.push(iRegistro);
            }
            const p2NoDicionario = dicionarioJogadores.find(x => x.idJogador == iRegistro.idPlayer2);
            if (p2NoDicionario == undefined) {
                if (iRegistro.idPlayer2 != null)
                    dicionarioJogadores.push({ idJogador: iRegistro.idPlayer2, registrosRelacionados: [iRegistro] });
            } else {
                if (iRegistro.idPlayer2 != null)
                    p2NoDicionario.registrosRelacionados.push(iRegistro);
            }
        }
        
        // Remover presença das salas atualizadas mais antigas
        let registrosMarcados: HydratedDocument<DbSalaFluxo, {}, unknown>[] = [];
        for (let iJogadorRelacionado of dicionarioJogadores) {
            if (iJogadorRelacionado.registrosRelacionados.length >= 2) {
                const registroMaisRecente = iJogadorRelacionado.registrosRelacionados.sort((a, b) => b.horaUltimaAtualizacao?.getTime() ?? 0 - (a.horaUltimaAtualizacao?.getTime() ?? 0))[0];
                for (let iRegistroParaMarcar of iJogadorRelacionado.registrosRelacionados.filter(x => x.id.toString() != registroMaisRecente.id.toString())) {
                    if (iRegistroParaMarcar.idPlayer1 == iJogadorRelacionado.idJogador)
                        iRegistroParaMarcar.idPlayer1 = null;
                    else
                        iRegistroParaMarcar.idPlayer2 = null;
                    iRegistroParaMarcar.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                    iRegistroParaMarcar.horaUltimaAtualizacao = new Date();
                    registrosMarcados.push(new this._modelMongo(iRegistroParaMarcar));
                }
                
                // Validar se o usuario nao esta inativo por mais de 10 min
                if (registroMaisRecente.idPlayer1 == iJogadorRelacionado.idJogador) {
                    if (registroMaisRecente.horaUltimaConexaoPlayer1 == null || new Date().getTime() - registroMaisRecente.horaUltimaConexaoPlayer1.getTime() > 10 * 60 * 1000) {
                        registroMaisRecente.idPlayer1 = null;   
                        registroMaisRecente.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                        registroMaisRecente.horaUltimaAtualizacao = new Date();
                        registrosMarcados.push(new this._modelMongo(registroMaisRecente));                 
                    }
                } else {
                    if (registroMaisRecente.horaUltimaConexaoPlayer2 == null || new Date().getTime() - registroMaisRecente.horaUltimaConexaoPlayer2.getTime() > 10 * 60 * 1000) {
                        registroMaisRecente.idPlayer2 = null;                    
                        registroMaisRecente.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                        registroMaisRecente.horaUltimaAtualizacao = new Date();
                        registrosMarcados.push(new this._modelMongo(registroMaisRecente));
                    }
                }
            } else {
                
                // Validar se o usuario nao esta inativo por mais de 10 min
                const registroUnico = iJogadorRelacionado.registrosRelacionados[0];
                if (registroUnico.idPlayer1 == iJogadorRelacionado.idJogador) {
                    if (registroUnico.horaUltimaConexaoPlayer1 == null || new Date().getTime() - registroUnico.horaUltimaConexaoPlayer1.getTime() > 10 * 60 * 1000) {
                        registroUnico.idPlayer1 = null;   
                        registroUnico.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                        registroUnico.horaUltimaAtualizacao = new Date();
                        registrosMarcados.push(new this._modelMongo(registroUnico));                 
                    }
                } else {
                    if (registroUnico.horaUltimaConexaoPlayer2 == null || new Date().getTime() - registroUnico.horaUltimaConexaoPlayer2.getTime() > 10 * 60 * 1000) {
                        registroUnico.idPlayer2 = null;                    
                        registroUnico.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                        registroUnico.horaUltimaAtualizacao = new Date();
                        registrosMarcados.push(new this._modelMongo(registroUnico));
                    }
                }
            }
            
        }
        
        // Salvar
        await this._modelMongo.bulkSave(registrosMarcados);
    }
    
    private popularSalas = async (idUsuarioLogado: string): Promise<void> => {
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
        await this.insertMuitosPorOperador(saveSalas, idUsuarioLogado);
    }
    
    insertMuitosPorOperador = async (muitasSalas: DbSalaFluxo[], idUsuarioOperador: string): Promise<string[]> => {
        let modelsSave: HydratedDocument<DbSalaFluxo, {}, unknown>[] = [];
        for (let iSala of muitasSalas) {
            iSala.idUsuarioFezInclusao = idUsuarioOperador;
            iSala.horaInclusao = new Date();
            iSala.idUsuarioFezUltimaAtualizacao = '';
            iSala.horaUltimaAtualizacao = null;
            const inserido = new this._modelMongo({...iSala});
            inserido.isNew = true;
            modelsSave.push(inserido);            
        }
        await this._modelMongo.bulkSave(modelsSave);
        return modelsSave.map(x => x.id);
    }
    
    updateMuitosPorOperador = async (muitasSalas: DbSalaFluxo[], idUsuarioOperador: string): Promise<void> => {
        let modelsSave: HydratedDocument<DbSalaFluxo, {}, unknown>[] = [];
        for (let iSala of muitasSalas) {
            
            iSala.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
            iSala.horaUltimaAtualizacao = new Date();
            const atual = new this._modelMongo({...iSala});
            atual.isNew = false;
            modelsSave.push(atual);
        }
        await this._modelMongo.bulkSave(modelsSave);
    }
}

export { SalaFluxoRepositorio };