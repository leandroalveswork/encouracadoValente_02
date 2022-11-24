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
            player2CarregouFluxo: { type: Boolean, required: true }
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
}

export { SalaFluxoRepositorio };