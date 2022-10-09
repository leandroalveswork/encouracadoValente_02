import { inject, injectable } from "inversify";
import "reflect-metadata";
import { StringUteis } from "../uteis/StringUteis";
import { LiteralServico } from "../literais/LiteralServico";
import { DbEncVn } from "../modelos/comum/DbEncVn";
import { ConfigBack } from "../ConfigBack";

@injectable()
class RepositorioCrud<TEntidade extends DbEncVn> {
    protected _configBack: ConfigBack;
    protected _nomeColecaoRegistrosMock: string;
    protected static _bancoMock: Record<string, any[]> = {};
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        this._configBack = configBack;
        this._nomeColecaoRegistrosMock = '';
    }

    protected inicializarRegistrosMock(): void {
        if (RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock] == undefined) {
            RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock] = [];
        }
    }

    selectAllAsync(): Promise<TEntidade[]> {
        return Promise.resolve(RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock]);
    }
    selectByIdOrDefaultAsync(id: string): Promise<TEntidade | null> {
        // console.log('Dump param id = ' + id);
        const registro = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].find(x => x.id == id);
        if (registro == undefined) {
            return Promise.resolve(null);
        }
        return Promise.resolve(registro);
    }
    insertAsync(registro: TEntidade): Promise<string> {
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].push(registro);
        return Promise.resolve(registro.id);
    }
    updateAsync(registro: TEntidade): Promise<void> {
        let registroAnterior = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].find(x => x.id == registro.id);
        if (registroAnterior == undefined) {
            return Promise.reject('Not Found');
        }
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock] = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].filter(x => x.id != registro.id);
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].push({ ...registro });
        return Promise.resolve();
    }
    deleteByIdAsync(id: string): Promise<void> {
        let registroAnterior = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].find(x => x.id == id);
        if (registroAnterior == undefined) {
            return Promise.reject('Not Found');
        }
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock] = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].filter(x => x.id != id);
        return Promise.resolve();
    }
    insertLogadoAsync(registro: TEntidade, idDoUsuarioLogado: string): Promise<string> {
        registro.idUsuarioFezInclusao = idDoUsuarioLogado;
        registro.horaInclusao = new Date();
        registro.idUsuarioFezUltimaAtualizacao = '';
        registro.horaUltimaAtualizacao = null;
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].push(registro);
        return Promise.resolve(registro.id);
    }
    updateLogadoAsync(registro: TEntidade, idDoUsuarioLogado: string): Promise<void> {
        let registroAnterior = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].find(x => x.id == registro.id);
        if (registroAnterior == undefined) {
            return Promise.reject('Not Found');
        }
        let registroAtual = { ...registro };
        registroAtual.idUsuarioFezUltimaAtualizacao = idDoUsuarioLogado;
        registroAtual.horaUltimaAtualizacao = new Date();
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock] = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].filter(x => x.id != registro.id);
        RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].push(registroAtual);
        return Promise.resolve();
    }
}

export { RepositorioCrud };