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
        let lPosicoesEstrategiaParaSalvar: HydratedDocument<DbPosicaoFluxo, {}, unknown>[] = [];
        for (let iPosicaoEstrategia of posicoesEstrategia) {
            // Inserir posiçao
            iPosicaoEstrategia.idUsuarioFezInclusao = idUsuarioOperador;
            iPosicaoEstrategia.horaInclusao = new Date();
            iPosicaoEstrategia.idUsuarioFezUltimaAtualizacao = '';
            iPosicaoEstrategia.horaUltimaAtualizacao = null;
            let insertPosicaoEstrategia = new this._modelMongo({ ...iPosicaoEstrategia });
            insertPosicaoEstrategia.isNew = true;
            lPosicoesEstrategiaParaSalvar.push(insertPosicaoEstrategia);
        }
        await this._modelMongo.deleteMany({ numeroRecuperacaoUrlSalaFluxo: numeroRecuperacaoUrlSala });
        await this._modelMongo.bulkSave(lPosicoesEstrategiaParaSalvar);
    }

    selectByNumeroRecuperacaoUrlSalaFluxoQueTenhaIdUsuarioOrDefault = (numeroRecuperacaoUrlSalaFluxo: number, idUsuarioLogado: string) => {
        let query = this._modelMongo.find({ numeroRecuperacaoUrlSalaFluxo: numeroRecuperacaoUrlSalaFluxo, idUsuarioEnviador: idUsuarioLogado });
        return query;
    }

    deleteByListaNumerosRecuperacao = async (listaNumerosRecuperacao: string[]): Promise<void> => {
        await this._modelMongo.deleteMany({ numeroRecuperacao: { $in: listaNumerosRecuperacao } });
    }
}

export { PosicaoFluxoRepositorio };