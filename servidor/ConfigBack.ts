import { injectable } from "inversify";
import "reflect-metadata";
import dotenv from 'dotenv';

@injectable()
class ConfigBack {
    constructor() {
        dotenv.config();
        this.hostDoBackend = process.env['url_do_servidor'] ?? '';
        this.salDoJwt = process.env['sal_do_jwt'] ?? '';
        this.conexaoMongodb = process.env['conexao_string'] ?? '';
    }
    hostDoBackend: string;
    salDoJwt: string;
    conexaoMongodb: string;
}

export { ConfigBack };