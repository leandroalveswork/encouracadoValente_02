import Posicao  from "./Posicao"
import './css/PosicaoContainerPrevia.css'

export interface PosicaoContainerPreviaProps {
    idPrefix: string;
    backgroundColor?: string;
}

const PosicaoContainerPrevia = ({idPrefix, backgroundColor}: PosicaoContainerPreviaProps) => {
    const calcularPosicoes = () => {
        const posicoes: Array<JSX.Element> = []
        for (let row = 0; row < 4; row++) {
            for (let column = 0; column < 7; column++) {
                posicoes.push(<Posicao idPosicao={`${row}${column}`} key={`${row}${column}`} onClick={() => {}} clickable={false} idPrefix={idPrefix} color={backgroundColor} />)
            }
        }
        return posicoes
    }

    return (
        <div className="posicao-container-previa" style={{ minWidth: '210px' }} >
            {calcularPosicoes()}
        </div>
    )

}

export default PosicaoContainerPrevia
