import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, HydratedDocument, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbNavioTema } from "../modelos/DbNavioTema";
import { DbCompra } from "../modelos/DbCompra";

@injectable()
class CompraRepositorio extends RepositorioCrud<DbCompra> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbCompra>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            idTema: { type: String, required: true },
            idUsuarioComprador: { type: String, required: true },
            estaEquipado: { type: Boolean, required: true }
        });
        this.inicializarMongo('Compra', schema);
    }

    selectMuitasComprasByIdUsuario = async (idUsuario: string) => {
        let query = this._modelMongo.find({ idUsuario: idUsuario });
        return query;
    }
}

export { CompraRepositorio };