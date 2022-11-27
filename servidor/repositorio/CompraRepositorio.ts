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
import { LiteralPadroes } from "../literais/LiteralPadroes";
import { StringUteis } from "../uteis/StringUteis";

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
        let query = this._modelMongo.find({ idUsuarioComprador: idUsuario });
        return query;
    }
    
    selectCompraEquipadaByIdUsuarioOrDefault = async (idUsuario: string) => {
        let query = this._modelMongo.findOne({ idUsuarioComprador: idUsuario, estaEquipado: true });
        return query;
    }
    
    selectCompraByIdTemaQueTenhaIdUsuarioOrDefault = async (idTema: string, idUsuario: string) => {
        let query = this._modelMongo.findOne({ idTema: idTema, idUsuarioComprador: idUsuario });
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
    
    private parseInsertedHydratedDocument = (novaCompra: DbCompra, idOperador: string): HydratedDocument<DbCompra, {}, unknown> => {
        novaCompra.idUsuarioFezInclusao = idOperador;
        novaCompra.horaInclusao = new Date();
        novaCompra.idUsuarioFezUltimaAtualizacao = '';
        novaCompra.horaUltimaAtualizacao = null;
        let insertNavio = new this._modelMongo({ ...novaCompra });
        insertNavio.isNew = true;
        return insertNavio;
    }
    
    consertarDb = async (idUsuarioOperador: string): Promise<void> => {
        const todasCompras = await this.selectAll();
        let comprasMapeadasPorComprador: { idComprador: string, comprasRelacionadas: HydratedDocument<DbCompra, {}, unknown>[] }[] = [];
        for (let iCompra of todasCompras) {
            let mapaJaExistente = comprasMapeadasPorComprador.find(x => x.idComprador == iCompra.idUsuarioComprador);
            if (mapaJaExistente == undefined)
                comprasMapeadasPorComprador.push({ idComprador: iCompra.idUsuarioComprador, comprasRelacionadas: [ iCompra ] });
            else
                mapaJaExistente.comprasRelacionadas.push(iCompra);
        }
        let lComprasParaSalvar: HydratedDocument<DbCompra, {}, unknown>[] = [];
        for (let iMapa of comprasMapeadasPorComprador) {
            if (iMapa.comprasRelacionadas.length == 0) {
                let primeiraCompraTemaPadrao = new DbCompra();
                primeiraCompraTemaPadrao.id = StringUteis.gerarNovoIdDe24Caracteres();
                primeiraCompraTemaPadrao.idTema = LiteralPadroes.IdTemaPadrao;
                primeiraCompraTemaPadrao.idUsuarioComprador = iMapa.idComprador;
                primeiraCompraTemaPadrao.estaEquipado = true;
                lComprasParaSalvar.push(this.parseInsertedHydratedDocument(primeiraCompraTemaPadrao, idUsuarioOperador));
                continue;
            }
            const compraRelacionadaTemaPadrao = iMapa.comprasRelacionadas.find(x => x.idTema == LiteralPadroes.IdTemaPadrao);
            if (compraRelacionadaTemaPadrao != undefined) {
                if (iMapa.comprasRelacionadas.every(x => !x.estaEquipado)) {
                    compraRelacionadaTemaPadrao.estaEquipado = true;
                    compraRelacionadaTemaPadrao.idUsuarioFezUltimaAtualizacao = idUsuarioOperador;
                    compraRelacionadaTemaPadrao.horaUltimaAtualizacao = new Date();
                    lComprasParaSalvar.push(compraRelacionadaTemaPadrao);
                }
                continue;
            }
            let compraTemaPadrao = new DbCompra();
            compraTemaPadrao.id = StringUteis.gerarNovoIdDe24Caracteres();
            compraTemaPadrao.idTema = LiteralPadroes.IdTemaPadrao;
            compraTemaPadrao.idUsuarioComprador = iMapa.idComprador;
            compraTemaPadrao.estaEquipado = iMapa.comprasRelacionadas.every(x => !x.estaEquipado);
            lComprasParaSalvar.push(this.parseInsertedHydratedDocument(compraTemaPadrao, idUsuarioOperador));
        }
        await this._modelMongo.bulkSave(lComprasParaSalvar);
    }
    
    deleteMuitosByIdTema = async (idTema: string, idUsuarioOperador: string): Promise<void> => {
        await this._modelMongo.deleteMany({ idTema: idTema });
        await this.consertarDb(idUsuarioOperador);
    }
}

export { CompraRepositorio };