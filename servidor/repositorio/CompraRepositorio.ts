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
        // console.log('dump lCompraDb.length = ' + lComprasDb.length);
        let lComprasParaSalvar: HydratedDocument<DbCompra, {}, unknown>[] = [];
        for (let iCompraDb of lComprasDb) {
            if (iCompraDb.id.toString() == id && iCompraDb.estaEquipado) // Se estiver equipando o mesmo tema ja equipado, sair do metodo
                return;
            if (iCompraDb.id.toString() == id && !iCompraDb.estaEquipado) { // Equipar o tema
                // console.log('equipando tema...');
                iCompraDb.estaEquipado = true;
                iCompraDb.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                iCompraDb.horaUltimaAtualizacao = new Date();
                lComprasParaSalvar.push(iCompraDb);
                continue;
            }
            if (iCompraDb.id.toString() != id && iCompraDb.estaEquipado) { // Tirar o equipamento do tema anterior
                // console.log('tirando equipamento tema...');
                iCompraDb.estaEquipado = false;
                iCompraDb.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                iCompraDb.horaUltimaAtualizacao = new Date();
                lComprasParaSalvar.push(iCompraDb);
            }
        }
        await this._modelMongo.bulkSave(lComprasParaSalvar);
    }
}

export { CompraRepositorio };