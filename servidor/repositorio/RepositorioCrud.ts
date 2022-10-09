import { inject, injectable } from "inversify";
import "reflect-metadata";
import { StringUteis } from "../uteis/StringUteis";
import { LiteralServico } from "../literais/LiteralServico";
import { DbEncVn } from "../modelos/comum/DbEncVn";
import { ConfigBack } from "../ConfigBack";
import { model, Model, Schema, Types } from "mongoose";

@injectable()
class RepositorioCrud<TEntidade extends DbEncVn> {
    protected _configBack: ConfigBack;
    protected _nomeCollection: string;
    protected _schema: Schema<TEntidade>;
    protected _modelMongo: Model<TEntidade, {}, {}, {}, any>;
    protected static _bancoMock: Record<string, any[]> = {};
    constructor(
        configBack: ConfigBack,
    ) {
        this._configBack = configBack;
    }

    protected inicializarMongo = (nomeCollection: string, schema: Schema): void => {
        this._nomeCollection = nomeCollection;
        this._schema = schema;
        this._modelMongo = model<TEntidade>(this._nomeCollection, this._schema);
    }

    selectAll = () => {
        let query = this._modelMongo.find();
        return query;
    }
    selectByIdOrDefault = (id: string) => {
        let query = this._modelMongo.findOne({ id: id });
        return query;
    }
    insert = async (registro: TEntidade): Promise<string> => {
        const inserido = new this._modelMongo({...registro});
        inserido.isNew = true;
        await inserido.save();
        return inserido.id;
    }
    update = async (registro: TEntidade): Promise<void> => {
        let alteradoDb = await this.selectByIdOrDefault(registro.id);
        if (alteradoDb == null) {
            return Promise.reject('Not Found');
        }
        await this._modelMongo.findOneAndUpdate({ id: registro.id }, { ...registro });
    }
    deleteById = async (id: string): Promise<void> => {
        let excluidoDb = await this.selectByIdOrDefault(id);
        if (excluidoDb == null) {
            return Promise.reject('Not Found');
        }
        await this._modelMongo.findOneAndRemove({ id: id });
    }
    insertPorOperador = async (registro: TEntidade, idUsuarioOperador: string): Promise<string> => {
        registro.idUsuarioFezInclusao = idUsuarioOperador;
        registro.horaInclusao = new Date();
        registro.idUsuarioFezUltimaAtualizacao = '';
        registro.horaUltimaAtualizacao = null;
        const inserido = new this._modelMongo({...registro});
        inserido.isNew = true;
        await inserido.save();
        return inserido.id;
    }
    updatePorOperador = async (registro: TEntidade, idUsuarioOperador: string): Promise<void> => {
        let alteradoDb = await this.selectByIdOrDefault(registro.id);
        if (alteradoDb == null) {
            return Promise.reject('Not Found');
        }
        let registroAtual = { ...registro };
        registroAtual.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
        registroAtual.horaUltimaAtualizacao = new Date();
        await this._modelMongo.findOneAndUpdate({ id: registro.id }, { ...registroAtual });
    }
}

export { RepositorioCrud };