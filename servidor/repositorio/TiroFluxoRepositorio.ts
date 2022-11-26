import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbTiroFluxo } from "../modelos/DbTiroFluxo";

@injectable()
class TiroFluxoRepositorio extends RepositorioCrud<DbTiroFluxo> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbTiroFluxo>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            numeroRecuperacaoUrlSalaFluxo: { type: Number, required: true },
            idUsuarioAlvo: { type: String, required: true },
            numeroLinha: { type: Number, required: true },
            numeroColuna: { type: Number, required: true },
        });
        this.inicializarMongo('TiroFluxo', schema);
    }

    selectByNumeroRecuperacaoUrlSalaFluxoQueTenhaIdUsuarioOrDefault = (numeroRecuperacaoUrlSalaFluxo: number, idUsuarioLogado: string) => {
        let query = this._modelMongo.find({ numeroRecuperacaoUrlSalaFluxo: numeroRecuperacaoUrlSalaFluxo, idUsuarioAlvo: idUsuarioLogado });
        return query;
    }
}

export { TiroFluxoRepositorio };