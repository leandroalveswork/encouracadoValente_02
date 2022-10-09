import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { DbUsuario } from "../modelos/DbUsuario";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";

@injectable()
class UsuarioRepositorio extends RepositorioCrud<DbUsuario> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbUsuario>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            nome: { type: String, required: true },
            email: { type: String, required: true },
            senha: String, // não pode ter required, porque contas integradas com Google não tem senha
            eSuperuser: { type: Boolean, required: true },
            eUsuarioGoogle: { type: Boolean, required: true }
        });
        this.inicializarMongo('Usuario', schema);
    }

    selectByEmailOrDefault = (email: string) => {
        let query = this._modelMongo.findOne({ email: email });
        return query;
    }
}

export { UsuarioRepositorio };