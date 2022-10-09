import './css/Posicao.css'

export interface PosicaoProps {
    idPosicao: string;
    onClick: (event: any) => void;
    clickable: boolean;
    idPrefix: string;
}

export const Posicao = ({idPosicao, onClick, clickable, idPrefix}: PosicaoProps) => {
    return <div
    id={`${idPrefix}-${idPosicao}`}
    className='posicao'
    key={`${idPrefix}-${idPosicao}`}
    style={{ cursor: clickable ? 'pointer' : 'default' }}
    onClick={clickable ? onClick : undefined}>{idPosicao[0]}-{idPosicao[1]}</div>
}

export default Posicao