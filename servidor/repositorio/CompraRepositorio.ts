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
    
    selectCompraEquipadaByIdUsuarioOrDefault = async (idUsuario: string) => {
        let query = this._modelMongo.findOne({ idUsuario: idUsuario, estaEquipado: true });
        return query;
    }
    
    selectCompraByIdTemaQueTenhaIdUsuarioOrDefault = async (idTema: string, idUsuario: string) => {
        let query = this._modelMongo.findOne({ idTema: idTema, idUsuario: idUsuario });
        return query;
    }
    
    equiparCompraById = async (id: string, idUsuarioOperador: string) => {
        let compraDb = await this.selectByIdOrDefault(id);
        if (compraDb == null)
            throw 'Erro no servidor';
        let lComprasDb = await this.selectMuitasComprasByIdUsuario(compraDb.idUsuarioComprador);
        let lComprasParaSalvar: HydratedDocument<DbCompra, {}, unknown>[] = [];
        for (let iCompraDb of lComprasDb) {
            if (iCompraDb.id == id && iCompraDb.estaEquipado) // Se estiver equipando o mesmo tema ja equipado, sair do metodo
                return;
            if (iCompraDb.id == id && !iCompraDb.estaEquipado) { // Equipar o tema
                let compraAtual = { ...iCompraDb };
                compraAtual.estaEquipado = true;
                compraAtual.idUsuarioFezInclusao = idUsuarioOperador;
                compraAtual.horaUltimaAtualizacao = new Date();
                let updateCompra = new this._modelMongo({ ...compraAtual });
                updateCompra.isNew = false;
                lComprasParaSalvar.push(updateCompra);
                continue;
            }
            if (iCompraDb.id != id && iCompraDb.estaEquipado) { // Tirar o equipamento do tema anterior
                let compraAtual = { ...iCompraDb };
                compraAtual.estaEquipado = false;
                compraAtual.idUsuarioFezInclusao = idUsuarioOperador;
                compraAtual.horaUltimaAtualizacao = new Date();
                let updateCompra = new this._modelMongo({ ...compraAtual });
                updateCompra.isNew = false;
                lComprasParaSalvar.push(updateCompra);
            }
        }
        await this._modelMongo.bulkSave(lComprasParaSalvar);
    }
}

export { CompraRepositorio };