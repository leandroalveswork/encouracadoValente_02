import { Button, Typography } from "@mui/material"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'
import Draggable from 'react-draggable';
import { useRef } from "react";

const PreparacaoJogo = () => {
    const barcoPequenoRef = useRef<any>(null)
    const barcosRef = [barcoPequenoRef]

    const handleOnClickBarco = (barcoRef: any) => {
        barcoRef.current.style.border = '1px solid red'
        barcoRef.current.style.borderRadius = '5px'
    }

    const handleOnClickRotacionar = () => {
        const estadoBordaBarcoSelecionado = '1px solid red'
        const barcoSelecionado = barcosRef?.find(x => x.current?.style.border == estadoBordaBarcoSelecionado)?.current
        barcoSelecionado!.rotacaoAtual = barcoSelecionado!.rotacaoAtual ? barcoSelecionado!.rotacaoAtual + 90 : 90

        barcoSelecionado!.style.transform = `rotate(${barcoSelecionado!.rotacaoAtual}deg)`
    }

    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DE PREPARAR A SUA ESTRATÉGIA</Typography>
                <div style={{ alignContent: 'center', paddingLeft: '5%' }}>
                    <PosicaoContainer handlePosicaoOnClick={() => { }} idPrefix='user' clickable={false} />
                    <Draggable>
                        <div>
                            <img ref={barcoPequenoRef} style={{ height: '30px' }} src="/assets/barco_pequeno.png" onClick={() => handleOnClickBarco(barcoPequenoRef)} />
                        </div>
                    </Draggable>
                    <Button onClick={handleOnClickRotacionar}>Rotacionar</Button>
                </div>
            </div>
        </div>
    )
}

export default PreparacaoJogo