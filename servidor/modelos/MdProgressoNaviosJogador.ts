import { MdTiro } from "./MdTiro";
import { PutPosicaoEstrategia } from "./PutPosicaoEstrategia";

export class MdProgressoNaviosJogador {
    tiros: MdTiro[] = [];
    naviosTotais: PutPosicaoEstrategia[] = [];
    estaNaVezDoJogador: boolean = false;
}