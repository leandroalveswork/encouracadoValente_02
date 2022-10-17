import { useMemo } from "react"
import Posicao  from "./Posicao"
import './css/PosicaoContainer.css'

export interface PosicaoContainerProps {
    clickable: boolean;
    idPrefix: string;
    handlePosicaoOnClick: (event: any) => void;
    backgroundColor?: string;
}

const PosicaoContainer = ({clickable, idPrefix, handlePosicaoOnClick, backgroundColor}: PosicaoContainerProps) => {
    const posicoes = useMemo(() => {
        const posicoes: Array<JSX.Element> = []
        for (let row = 0; row < 10; row++) {
            for (let column = 0; column < 10; column++) {
                posicoes.push(<Posicao idPosicao={`${row}${column}`} key={`${row}${column}`} onClick={handlePosicaoOnClick} clickable={clickable} idPrefix={idPrefix} color={backgroundColor} />)
            }
        }
        return posicoes
    }, [])

    return (
        <div className="posicao-container">
            {posicoes}
        </div>
    )

}

export default PosicaoContainer
