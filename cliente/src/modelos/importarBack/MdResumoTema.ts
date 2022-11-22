import { MdPreviaNavio } from "./MdPreviaNavio"

export class MdResumoTema {
    id: string = ''
    nome: string = ''
    preco: number = 0
    descricao: string = ''
    previas: MdPreviaNavio[] = []
    foiCompradoPorUsuarioLogado: boolean = false
}