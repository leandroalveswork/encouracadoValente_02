import { request } from "http";
import { inject, injectable } from "inversify";
import 'reflect-metadata';

import MdRespostaApi from "../modelos/MdRespostaApi";

@injectable()
class ClientRest {
    private handleRes = async <TRes>(r: Response) => {
        let rCompleto = new MdRespostaApi<TRes>();
        rCompleto.statusCode = r.status;
        if (r.ok) {
            const bodyAsString = await r.text();
            // console.log(bodyAsString);
            if (bodyAsString.length > 0) {
                rCompleto.body = JSON.parse(bodyAsString);
            }
        } else {
            rCompleto.problema = await r.text();
        }
        return rCompleto;
    }

    callGet = async <TRes>(urlRelativa: string) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa);
        return await this.handleRes<TRes>(r);
    }

    callPost = async <TRes>(urlRelativa: string, payload: any) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, { method: 'post', body: JSON.stringify(payload), headers: { 'Content-type': 'application/json; charset=UTF-8' } });
        return await this.handleRes<TRes>(r);
    }

    callPut = async <TRes>(urlRelativa: string, payload: any) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, { method: 'put', body: JSON.stringify(payload), headers: { 'Content-type': 'application/json; charset=UTF-8' } });
        return await this.handleRes<TRes>(r);
    }

    callDelete = async <TRes>(urlRelativa: string) => {
        let r = await fetch('http://' + (process.env.REACT_APP_url_do_servidor_backend as string) + urlRelativa, { method: 'delete' });
        return await this.handleRes<TRes>(r);
    }
}

export default ClientRest