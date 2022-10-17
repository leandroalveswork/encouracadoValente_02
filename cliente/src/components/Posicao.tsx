import './css/Posicao.css'

export interface PosicaoProps {
    idPosicao: string;
    onClick: (event: any) => void;
    clickable: boolean;
    idPrefix: string;
    color?: string;
}

export const Posicao = ({idPosicao, onClick, clickable, idPrefix, color = '#DFF4FF'}: PosicaoProps) => {
    return <div
    id={`${idPrefix}-${idPosicao}`}
    className='posicao'
    key={`${idPrefix}-${idPosicao}`}
    style={{ cursor: clickable ? 'pointer' : 'default', backgroundColor: color }}
    onClick={clickable ? onClick : undefined}></div>
}

export default Posicao