import MdRespostaApi from "../modelos/MdRespostaApi";
import UserState from "./UserState";
import axios, { AxiosResponse } from "axios";

class ClientRest {

    constructor() {
        this._userState = new UserState();
    }
    _userState: UserState;

    private handleRes = async <TRes>(r: Response, resExemplo: TRes) => {
        let rCompleto = new MdRespostaApi<TRes>();
        rCompleto.statusCode = r.status;
        if (!r.ok) {
            rCompleto.problema = await r.text();
            return rCompleto;
        }
        const bodyAsString = await r.text();
        // console.log(bodyAsString);
        if (typeof resExemplo == 'string') {
            rCompleto.body = ('' + bodyAsString) as TRes;
            return rCompleto;
        }
        if (bodyAsString.length > 0) {
            rCompleto.body = JSON.parse(bodyAsString);
        }
        return rCompleto;
    }

    callGet = async <TRes>(urlRelativa: string, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa);
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callPost = async <TRes>(urlRelativa: string, payload: any, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: { 'Content-type': 'application/json; charset=UTF-8' }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callPut = async <TRes>(urlRelativa: string, payload: any, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'put',
            body: JSON.stringify(payload),
            headers: { 'Content-type': 'application/json; charset=UTF-8' }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callDelete = async <TRes>(urlRelativa: string, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'delete'
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callGetAutorizado = async <TRes>(urlRelativa: string, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            headers: { 'x-access-token': this._userState.localStorageUser?.token ?? '' }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callPostAutorizado = async <TRes>(urlRelativa: string, payload: any, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'post',
            body: JSON.stringify(payload),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'x-access-token': this._userState.localStorageUser?.token ?? ''
            }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callPutAutorizado = async <TRes>(urlRelativa: string, payload: any, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'put',
            body: JSON.stringify(payload),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                'x-access-token': this._userState.localStorageUser?.token ?? ''
            }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    callDeleteAutorizado = async <TRes>(urlRelativa: string, resExemplo: TRes) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, {
            method: 'delete',
            headers: { 'x-access-token': this._userState.localStorageUser?.token ?? '' }
        });
        return await this.handleRes<TRes>(r, resExemplo);
    }

    private handleAxiosRes = <TRes>(r: AxiosResponse<TRes>) => {
        let rCompleto = new MdRespostaApi<TRes>();
        rCompleto.statusCode = r.status;
        if (!(r.status >= 200 && r.status <= 299)) {
            rCompleto.problema = r.statusText;
            return rCompleto;
        }
        rCompleto.body = r.data;
        return rCompleto;
    }
    
    callUploadArquivo = async (arquivoRaw: string | Blob, numeroRecuperacao: string): Promise<MdRespostaApi<undefined>> => {
        let formData = new FormData();

        formData.append("file", arquivoRaw);
    
        let r = await axios.postForm('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + '/api/arquivo/upload', formData, {
            headers: {
                "x-access-token": this._userState.localStorageUser?.token ?? '',
                "numero-recuperacao": numeroRecuperacao
            }
        });
        return this.handleAxiosRes<undefined>(r);
    }
}

export default ClientRest