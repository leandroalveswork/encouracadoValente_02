import { MdDetalheNavioTema } from "./MdDetalheNavioTema"

export class MdDetalheTema {
    id: string = '';
    nome: string = '';
    preco: number = 0;
    descricao: string = '';
    naviosTema: MdDetalheNavioTema[] = [];
}