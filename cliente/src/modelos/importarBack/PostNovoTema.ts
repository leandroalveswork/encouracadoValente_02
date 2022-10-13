import { PostNovoNavioTema } from "./PostNovoNavioTema";

export class PostNovoTema {
    nome: string = '';
    preco: number | null = null;
    descricao: string = '';
    naviosTema: PostNovoNavioTema[] = []
}