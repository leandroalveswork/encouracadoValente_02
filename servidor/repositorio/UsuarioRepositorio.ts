import { inject, injectable } from "inversify";
import "reflect-metadata";
import { LiteralServico } from "../literais/LiteralServico";
import { DbUsuario } from "../modelos/DbUsuario";
import { RepositorioCrud } from "./RepositorioCrud";
import { ConfigBack } from "../ConfigBack";

@injectable()
class UsuarioRepositorio extends RepositorioCrud<DbUsuario> {
    constructor(
        @inject(LiteralServico.ConfigBack) configBack: ConfigBack
    ) {
        super(configBack);
        this._nomeColecaoRegistrosMock = 'usuario';
        this.inicializarRegistrosMock();
    }
    selectByEmailOrDefaultAsync(email: string): Promise<DbUsuario | null> {
        const usuario = RepositorioCrud._bancoMock[this._nomeColecaoRegistrosMock].find(x => x.email == email);
        if (usuario == undefined) {
            return Promise.resolve(null);
        }
        return Promise.resolve(usuario);
    }
}

export { UsuarioRepositorio };