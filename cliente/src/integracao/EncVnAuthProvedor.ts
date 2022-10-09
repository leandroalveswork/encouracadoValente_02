import { request } from "http";
import { inject, injectable } from "inversify";
import 'reflect-metadata';

import ClientRest from "./ClientRest";
import { MdUsuarioLogado } from "../modelos/importarBack/MdUsuarioLogado";
import { PostLoginUsuario } from "../modelos/importarBack/PostLoginUsuario";
import { PostCadastroUsuario } from "../modelos/importarBack/PostCadastroUsuario";
import MdRespostaApi from "../modelos/MdRespostaApi";
import { IUsuarioGoogle } from "../modelos/importarBack/IUsuarioGoogle";

@injectable()
class EncVnAuthProvedor {
    constructor() {
        this.clientRest = new ClientRest();
        try {
            this.usuarioLogado = JSON.parse(localStorage.user) as MdUsuarioLogado;
        } catch (er) {
            this.usuarioLogado = null;
        }
    }
    clientRest: ClientRest;

    usuarioLogado: MdUsuarioLogado | null = null;
    entrarUsuarioEncVn = async (loginUsuario: PostLoginUsuario): Promise<MdRespostaApi<MdUsuarioLogado>> => {
        const respostaApi = await this.clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/entrarUsuarioEncVn', loginUsuario);
        if (respostaApi.eOk) {
            this.usuarioLogado = respostaApi.body;
            localStorage.setItem('user', JSON.stringify(this.usuarioLogado));
        }
        return respostaApi;
    }
    entrarUsuarioGoogle = async (usuarioGoogle: IUsuarioGoogle): Promise<MdRespostaApi<MdUsuarioLogado>> => {
        const respostaApi = await this.clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/entrarUsuarioGoogle', usuarioGoogle);
        if (respostaApi.eOk) {
            this.usuarioLogado = respostaApi.body;
            localStorage.setItem('user', JSON.stringify(this.usuarioLogado));
        }
        return respostaApi;
    }
    cadastrarUsuarioEncVn = async (cadastroUsuario: PostCadastroUsuario): Promise<MdRespostaApi<MdUsuarioLogado>> => {
        const respostaApi = await this.clientRest.callPost<MdUsuarioLogado>('/api/autorizacao/cadastrarUsuarioEncVn', cadastroUsuario);
        if (respostaApi.eOk) {
            this.usuarioLogado = respostaApi.body;
            localStorage.setItem('user', JSON.stringify(this.usuarioLogado));
        }
        return respostaApi;
    }
}

export default EncVnAuthProvedor