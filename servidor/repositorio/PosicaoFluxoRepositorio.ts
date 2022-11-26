import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, HydratedDocument, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbArquivo } from "../modelos/DbArquivo";
import { DbPosicaoFluxo } from "../modelos/DbPosicaoFluxo";
import { StringUteis } from "../uteis/StringUteis";

@injectable()
class PosicaoFluxoRepositorio extends RepositorioCrud<DbPosicaoFluxo> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbPosicaoFluxo>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            numeroRecuperacaoUrlSalaFluxo: { type: Number, required: true },
            idUsuarioEnviador: { type: String, required: true },
            tamanhoQuadradosNavio: { type: Number, required: true },
            numeroLinha: { type: Number, required: true },
            numeroColuna: { type: Number, required: true },
            orientacao: { type: Number, required: true }
        });
        this.inicializarMongo('PosicaoFluxo', schema);
    }
    
    updateByNumeroRecuperacaoUrlSala = async (numeroRecuperacaoUrlSala: number, posicoesEstrategia: DbPosicaoFluxo[], idUsuarioOperador: string): Promise<void> => {
        await this._modelMongo.deleteMany({ numeroRecuperacaoUrlSalaFluxo: numeroRecuperacaoUrlSala });
        await this.insertMuitosPorOperador(posicoesEstrategia, idUsuarioOperador);
    }

    selectByNumeroRecuperacaoUrlSalaFluxoQueTenhaIdUsuarioOrDefault = (numeroRecuperacaoUrlSalaFluxo: number, idUsuarioLogado: string) => {
        let query = this._modelMongo.find({ numeroRecuperacaoUrlSalaFluxo: numeroRecuperacaoUrlSalaFluxo, idUsuarioEnviador: idUsuarioLogado });
        return query;
    }
    
    insertMuitosPorOperador = async (muitasEstrategias: DbPosicaoFluxo[], idUsuarioOperador: string): Promise<string[]> => {
        let modelsSave: HydratedDocument<DbPosicaoFluxo, {}, unknown>[] = [];
        for (let iEstrategia of muitasEstrategias) {
            iEstrategia.idUsuarioFezInclusao = idUsuarioOperador;
            iEstrategia.horaInclusao = new Date();
            iEstrategia.idUsuarioFezUltimaAtualizacao = '';
            iEstrategia.horaUltimaAtualizacao = null;
            const inserido = new this._modelMongo({...iEstrategia});
            inserido.isNew = true;
            modelsSave.push(inserido);            
        }
        await this._modelMongo.bulkSave(modelsSave);
        return modelsSave.map(x => x.id);
    }
}

export { PosicaoFluxoRepositorio };