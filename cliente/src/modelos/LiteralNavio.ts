import { LtNavio } from "./LtNavio"

export class LiteralNavio {
    static PortaAviao: LtNavio = { tamnQuadrados: 4, nome: 'Porta-avião', }; // tamnQuadrados "funciona" como o id do navio
    static NavioTanque: LtNavio = { tamnQuadrados: 3, nome: 'Navio-tanque' };
    static Contratorpedeiro: LtNavio = { tamnQuadrados: 2, nome: 'Contratorpedeiro' };
    static Submarino: LtNavio = { tamnQuadrados: 1, nome: 'Submarino' };

    static listar = (): LtNavio[] => [ this.PortaAviao, this.NavioTanque, this.Contratorpedeiro, this.Submarino ];

    static obterPorTamnQuadradosOrDefault = (tamnQuadrados: number): LtNavio | null => {
        const navio = this.listar().find(x => x.tamnQuadrados == tamnQuadrados);
        return (navio == undefined) ? null : navio;
    }
}