import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";
import { Document, HydratedDocument, Model, model, Query, Schema, Types } from "mongoose";
import { throws } from "assert";
import { config } from "dotenv";
import { DbNavioTema } from "../modelos/DbNavioTema";

@injectable()
class NavioTemaRepositorio extends RepositorioCrud<DbNavioTema> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        const schema = new Schema<DbNavioTema>({
            id: Types.ObjectId,
            idUsuarioFezInclusao: { type: String, required: true },
            horaInclusao: { type: Date, required: true },
            idUsuarioFezUltimaAtualizacao: String,
            horaUltimaAtualizacao: Date,
            idTema: { type: String, required: true },
            tamnQuadrados: { type: Number, required: true },
            nomePersonalizado: { type: String, required: true },
            urlImagemNavio: { type: String, required: true }
        });
        this.inicializarMongo('NavioTema', schema);
    }

    insertMuitosNaviosTema = async (lNaviosTema: DbNavioTema[], idUsuarioOperador: string): Promise<string[]> => {
        let lInsertNavio: HydratedDocument<DbNavioTema, {}, unknown>[] = [];
        for (let iNavioTema of lNaviosTema) {
            iNavioTema.idUsuarioFezInclusao = idUsuarioOperador;
            iNavioTema.horaInclusao = new Date();
            iNavioTema.idUsuarioFezUltimaAtualizacao = '';
            iNavioTema.horaUltimaAtualizacao = null;
            let insertNavio = new this._modelMongo({ ...iNavioTema });
            insertNavio.isNew = true;
            lInsertNavio.push(insertNavio);
        }
        await this._modelMongo.bulkSave(lInsertNavio);
        return lInsertNavio.map(x => x.id);
    }

    selectMuitosNaviosTemaByTemaId = async (idTema: string) => {
        let query = this._modelMongo.find({ idTema: idTema });
        return query;
    }

    deleteMuitosNaviosTemaByTemaId = async (idTema: string): Promise<void> => {
        await this._modelMongo.deleteMany({ idTema: idTema });
    }

    updateMuitosNaviosTemaByTemaId = async (idTema: string, naviosAtualizados: DbNavioTema[], idUsuarioOperador: string): Promise<void> => {
        let lNaviosTemaDb = await this.selectMuitosNaviosTemaByTemaId(idTema);
        let lNaviosParaSalvar: HydratedDocument<DbNavioTema, {}, unknown>[] = [];
        for (let iNavioTema of naviosAtualizados) {
            let navioTemaDb = (iNavioTema.id == undefined || iNavioTema.id == '') ? undefined : lNaviosTemaDb.find(x => x.id == iNavioTema.id);
            if (navioTemaDb == undefined) {
                // inserir navioTema caso a atualizaçao do tema envolva incluir esse navioTema
                iNavioTema.idUsuarioFezInclusao = idUsuarioOperador;
                iNavioTema.horaInclusao = new Date();
                iNavioTema.idUsuarioFezUltimaAtualizacao = '';
                iNavioTema.horaUltimaAtualizacao = null;
                let insertNavio = new this._modelMongo({ ...iNavioTema });
                insertNavio.isNew = true;
                lNaviosParaSalvar.push(insertNavio);
            } else {
                // atualizar navioTema caso a atualizaçao do tema envolva atualizar esse navioTema
                let iNavioTemaAtual = { ...iNavioTema };
                iNavioTemaAtual.idUsuarioFezInclusao = navioTemaDb.idUsuarioFezInclusao;
                iNavioTemaAtual.horaInclusao = navioTemaDb.horaInclusao;
                iNavioTemaAtual.idUsuarioFezInclusao = idUsuarioOperador;
                iNavioTemaAtual.horaUltimaAtualizacao = new Date();
                let updateNavio = new this._modelMongo({ ...iNavioTemaAtual });
                updateNavio.isNew = false;
                lNaviosParaSalvar.push(updateNavio);
            }
        }
        let lIdNaviosAtualizados = naviosAtualizados.map(x => x.id);
        // excluir os naviosTema caso a atualizaçao do tema envolva excluir esses navioTema 
        let naviosTemaExcluidos = lNaviosTemaDb.filter(x => !lIdNaviosAtualizados.includes(x.id));
        let lIdNaviosTemaExcluidos = naviosTemaExcluidos.map(x => x.id);
        await this._modelMongo.bulkSave(lNaviosParaSalvar);
        await this._modelMongo.deleteMany({ id: { $in: lIdNaviosTemaExcluidos } });
    }
}

export { NavioTemaRepositorio };