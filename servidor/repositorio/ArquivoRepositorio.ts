import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbArquivo } from "../modelos/DbArquivo";

@injectable()
class ArquivoRepositorio extends RepositorioCrud<DbArquivo> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbArquivo>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            nomeArquivo: String,
            nome: String,
            tipo: { type: String, required: true },
            buffer: { type: Buffer, required: true }
        });
        this.inicializarMongo('Arquivo', schema);
    }

    selectByNumeroRecuperacaoOrDefault = (numeroRecuperacao: string) => {
        let query = this._modelMongo.findOne({ numeroRecuperacao: numeroRecuperacao });
        return query;
    }
    
    selectByListaNumerosRecuperacao = (listaNumerosRecuperacao: string[]) => {
        let query = this._modelMongo.find({ numeroRecuperacao: { $in: listaNumerosRecuperacao } });
        return query;
    }
    
    deleteByListaNumerosRecuperacao = async (listaNumerosRecuperacao: string[]): Promise<void> => {
        await this._modelMongo.deleteMany({ numeroRecuperacao: { $in: listaNumerosRecuperacao } });
    }
}

export { ArquivoRepositorio };