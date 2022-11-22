import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbTema } from "../modelos/DbTema";

@injectable()
class TemaRepositorio extends RepositorioCrud<DbTema> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbTema>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            nome: { type: String, required: true },
            preco: { type: Number, required: true },
            descricao: { type: String, required: true },
        });
        this.inicializarMongo('Tema', schema);
    }

    selectMuitosTemasByListaTemasId = async (listaTemasId: string[]) => {
        let query = this._modelMongo.find({ id: { $in: listaTemasId } });
        return query;
    }
}

export { TemaRepositorio };