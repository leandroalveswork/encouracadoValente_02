import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbArquivo } from "../modelos/DbArquivo";
import { DbSalaFluxo } from "../modelos/DbSalaFluxo";

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
            horaCancelamentoSaidaPlayer2: Date
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
    
    insertMuitosPorOperador = async (muitasSalas: DbSalaFluxo[], idUsuarioOperador: string): Promise<string[]> => {
        let modelsSave: any[] = [];
        for (let iSala of muitasSalas) {
            iSala.idUsuarioFezInclusao = idUsuarioOperador;
            iSala.horaInclusao = new Date();
            iSala.idUsuarioFezUltimaAtualizacao = '';
            iSala.horaUltimaAtualizacao = null;
            const inserido = new this._modelMongo({...iSala});
            inserido.isNew = true;
            modelsSave.push(inserido);            
        }
        this._modelMongo.bulkSave(modelsSave);
        return modelsSave.map(x => x.id);
    }
}

export { SalaFluxoRepositorio };