import { Button, Typography } from "@mui/material"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'
import React, { useRef, useState } from "react";

const PreparacaoJogo = () => {
    const barcoPequenoRef = useRef<any>(null)
    const barcosRef = [barcoPequenoRef]

    const [podeSelecionarPosicoes, setPodeSelecionarPosicoes] = useState<boolean>(false);
    const [barcoSelecionado, setBarcoSelecionado] = useState<any>();
    const [posicoesJaMarcadas, setPosicoesJaMarcadas] = useState<Array<number>>([]);
    const [posicoesParaMover, setPosicoesParaMover] = useState<any>()
    const [posicaoBackColor, setPosicaoBackColor] = useState<string>('rgb(223, 244, 255)')

    const handleBarcoOnClick = (barcoRef: React.MutableRefObject<any>) => {
        barcoRef.current.style.border = '1px solid red'
        barcoRef.current.style.borderRadius = '5px'
        setPodeSelecionarPosicoes(true)
        setBarcoSelecionado(barcoRef.current)
    }

    const handlePosicaoOnClick = (event: any) => {
        const idPosicaoSelecionada = Number(event.currentTarget.id.replace("user-", ""))
        let ePosicaoValida = true
        let errorMessage = null

        if (posicoesJaMarcadas.length > 0) {
            const ultimaPosicaoMarcada = posicoesJaMarcadas[posicoesJaMarcadas.length - 1]

            if (posicoesJaMarcadas.length == 1) {
                ePosicaoValida = idPosicaoSelecionada == ultimaPosicaoMarcada + 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada + 1
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 1

                errorMessage = !ePosicaoValida ? "Posição inválida. Selecione uma posição adjacente à última posição selecionada." : errorMessage
            }

            if (posicoesJaMarcadas.length >= 2) //TODO: Trocar para tamanho do barco selecionado
            {
                ePosicaoValida = false
                errorMessage = "Você já selecionou o número máximo de casas para essa embarcação ocupar."
            }
        }

        if (ePosicaoValida) {
            setPosicoesJaMarcadas(previousState => [...previousState, idPosicaoSelecionada])

            const clientX = event.clientX
            const clientY = event.clientY

            const tamanhoRetangulo = event.currentTarget.getBoundingClientRect()

            const localX = (clientX - tamanhoRetangulo.left)
            const localY = (clientY - tamanhoRetangulo.top)

            if (posicoesParaMover == null) {
                setPosicoesParaMover({ x: localX, y: localY, event })
            }


            event.currentTarget.style.backgroundColor = 'green'
            console.log(event.currentTarget.getBoundingClientRect())
        }
        else {
            window.alert(errorMessage) //TODO: Trocar para uma notification mais adequada
        }
    }

    const handleEnviarNavioOnClick = () => {
        const barcoMovido = document.createElement("img")
        barcoMovido.src = barcoSelecionado.src
        barcoMovido.style.height = '30px'
        barcoMovido.style.left = posicoesParaMover.x + 10 + 'px'
        barcoMovido.style.top = posicoesParaMover.y + 'px'
        posicoesParaMover.event.target.style.zIndex = '1000'

        if(posicoesJaMarcadas[0] + 10 == posicoesJaMarcadas[1])
        {
            barcoMovido.src = "/assets/barco_pequeno_vertical.png"
            barcoMovido.style.height = '50px'
        }


        posicoesParaMover.event.target.appendChild(barcoMovido)
        barcoSelecionado.style.border = 'none'
        setPodeSelecionarPosicoes(false)
        setBarcoSelecionado(null)
        setPosicaoBackColor("rgb(223, 244, 255)")
    }

    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DE PREPARAR A SUA ESTRATÉGIA</Typography>
                <div style={{ alignContent: 'center', paddingLeft: '5%' }}>
                    <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='user' clickable={podeSelecionarPosicoes} backgroundColor={posicaoBackColor} />
                    <div>
                        <img id="barcoPequeno" ref={barcoPequenoRef} style={{ height: '30px', cursor: 'pointer' }} src="/assets/barco_pequeno.png" onClick={() => handleBarcoOnClick(barcoPequenoRef)} />
                    </div>
                </div>
                <Button onClick={handleEnviarNavioOnClick}> Enviar navio para a posição </Button>
            </div>
        </div>
    )
}

export default PreparacaoJogo