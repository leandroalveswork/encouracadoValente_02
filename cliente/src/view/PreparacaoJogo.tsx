import { Button, Typography } from "@mui/material"
import PosicaoContainer from "../components/PosicaoContainer"
import './css/TelaJogo.css'
import React, { useEffect, useRef, useState } from "react";
import "../components/imagem/ImgNavioVertical.css"
import ClientRest from '../integracao/ClientRest';
import { MdResumoTema } from "../modelos/importarBack/MdResumoTema";

const PreparacaoJogo = () => {
    const barcoPequenoRef1 = useRef<any>()
    const barcoPequenoRef2 = useRef<any>()
    const barcoPequenoRef3 = useRef<any>()
    const barcoPequenoRef4 = useRef<any>()
    const barcoMedioRef1 = useRef<any>()
    const barcoMedioRef2 = useRef<any>()
    const barcoMedioRef3 = useRef<any>()
    const barcoGrandeRef1 = useRef<any>()
    const barcoGrandeRef2 = useRef<any>()
    const barcoGiganteRef1 = useRef<any>()

    const [podeSelecionarPosicoes, setPodeSelecionarPosicoes] = useState<boolean>(false);
    const [barcoSelecionado, setBarcoSelecionado] = useState<any>();
    const [posicoesJaMarcadasParaOBarcoAtual, setPosicoesJaMarcadasParaOBarcoAtual] = useState<Array<number>>([]);
    const [posicoesFinais, setPosicoesFinais] = useState<Array<Array<number>>>([]);
    const [posicaoParaMover, setPosicaoParaMover] = useState<any>()
    const [tamanhoBarcoAtual, setTamanhoBarcoAtual] = useState<number>(0)

    const [temaBarcoPequenoSrc, setTemaBarcoPequenoSrc] = useState<string>();
    const [temaBarcoMedioSrc, setTemaBarcoMedioSrc] = useState<string>();
    const [temaBarcoGrandeSrc, setTemaBarcoGrandeSrc] = useState<string>();
    const [temaBarcoGiganteSrc, setTemaBarcoGiganteSrc] = useState<string>();

    const fundoDefault = "#DFF4FF"
    const clientRest = new ClientRest()

    useEffect(() => { //TODO: Tratar para criar endpoint que busque somente o tema a partir do ID
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/compra/listarPorIdUsuarioLogado', []).then(async (response) => {
            const idTemaEquipado = await clientRest.callGetAutorizado<string>('/api/compra/obterIdTemaEquipadoUsuarioLogadoOrDefault', '');
            const temaEquipado = response.body!.find(x => x.id == idTemaEquipado.body)

            setTemaBarcoPequenoSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 1)?.arquivo?.dadosBase64)
            setTemaBarcoMedioSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 2)?.arquivo?.dadosBase64)
            setTemaBarcoGrandeSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 3)?.arquivo?.dadosBase64)
            setTemaBarcoGiganteSrc("data:image/*;base64," + temaEquipado?.previas.find(x => x.tamanhoQuadrados == 4)?.arquivo?.dadosBase64)
        })
    }, [])

    const calculaWidth = (tamanho: number) => {
        return `${tamanho * 30}px`
    }

    const handleBarcoOnClick = (barcoRef: React.MutableRefObject<any>, tamanhoBarco: number) => {
        barcoRef.current.style.border = '1px solid red'
        barcoRef.current.style.borderRadius = '5px'
        setPodeSelecionarPosicoes(true)
        setBarcoSelecionado(barcoRef.current)
        setTamanhoBarcoAtual(tamanhoBarco)
    }

    const resetFundoPosicoes = (posicoes: Array<number>) => {
        for (let posicao of posicoes) {
            const posicaoSelecionada = document.getElementById(`user-${posicao < 10 ? '0' + posicao : posicao}`)
            posicaoSelecionada!.style.backgroundColor = fundoDefault
        }
    }

    const handlePosicaoOnClick = (event: any) => {
        const idPosicaoSelecionada = Number(event.currentTarget.id.replace("user-", ""))
        let ePosicaoValida = true
        let errorMessage = null

        if (posicoesFinais.flat().includes(idPosicaoSelecionada)) {
            ePosicaoValida = false
            errorMessage = "Posição já ocupada por outra embarcação."
        } else if (posicoesJaMarcadasParaOBarcoAtual.length > 0) {
            const ultimaPosicaoMarcada = posicoesJaMarcadasParaOBarcoAtual[posicoesJaMarcadasParaOBarcoAtual.length - 1]

            if (posicoesJaMarcadasParaOBarcoAtual.length == 1) {
                ePosicaoValida = idPosicaoSelecionada == ultimaPosicaoMarcada + 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 10
                    || idPosicaoSelecionada == ultimaPosicaoMarcada + 1
                    || idPosicaoSelecionada == ultimaPosicaoMarcada - 1

                errorMessage = !ePosicaoValida ? "Posição inválida. Selecione uma posição adjacente à última posição selecionada." : errorMessage
            }

            if (posicoesJaMarcadasParaOBarcoAtual.includes(idPosicaoSelecionada)) {
                ePosicaoValida = false
                errorMessage = "Posicão já selecionada. Selecione uma posição não selecionada anteriormente."
            }

            if (posicoesJaMarcadasParaOBarcoAtual.length >= tamanhoBarcoAtual) {
                ePosicaoValida = false
                errorMessage = "Você já selecionou o número máximo de casas para essa embarcação ocupar."
            }
        }

        if (ePosicaoValida) {
            setPosicoesJaMarcadasParaOBarcoAtual(previousState => [...previousState, idPosicaoSelecionada])

            const clientX = event.clientX
            const clientY = event.clientY

            const tamanhoRetangulo = event.currentTarget.getBoundingClientRect()

            const localX = (clientX - tamanhoRetangulo.left)
            const localY = (clientY - tamanhoRetangulo.top)

            if (posicaoParaMover == null || posicoesJaMarcadasParaOBarcoAtual[0] > idPosicaoSelecionada) {
                setPosicaoParaMover({ x: localX, y: localY, event })
            }

            event.currentTarget.style.backgroundColor = 'red'
        }
        else {
            window.alert(errorMessage) //TODO: Trocar para uma notification mais adequada
        }
    }

    const handleEnviarNavioOnClick = () => {
        if (posicoesJaMarcadasParaOBarcoAtual.length < tamanhoBarcoAtual) {
            window.alert("Você ainda não selecionou todas as posições necessárias para comandar o envio desse navio para a posição.")
            return
        }
        const barcoMovido = document.createElement("img")
        barcoMovido.src = barcoSelecionado.src
        barcoMovido.style.height = '30px'
        barcoMovido.style.width = `${calculaWidth(tamanhoBarcoAtual)}`
        barcoMovido.style.left = posicaoParaMover.x + 15 + 'px'
        barcoMovido.style.top = posicaoParaMover.y + 'px'
        posicaoParaMover.event.target.style.zIndex = '1000'

        const ePosicaoVertical = posicoesJaMarcadasParaOBarcoAtual[0] + 10 == posicoesJaMarcadasParaOBarcoAtual[1] || posicoesJaMarcadasParaOBarcoAtual[0] - 10 == posicoesJaMarcadasParaOBarcoAtual[1]

        if (ePosicaoVertical) {
            barcoMovido.className = 'imagem-vertical'
        }

        posicaoParaMover.event.target.appendChild(barcoMovido)
        barcoSelecionado.style.border = 'none'
        barcoSelecionado.style.opacity = '0.2'
        setPodeSelecionarPosicoes(false)
        setBarcoSelecionado(null)
        setPosicaoParaMover(null)
        setPosicoesFinais(previousState => {
            return [...previousState, [...posicoesJaMarcadasParaOBarcoAtual]]
        })
        resetFundoPosicoes(posicoesJaMarcadasParaOBarcoAtual)
        setPosicoesJaMarcadasParaOBarcoAtual([])
    }
    //TODO: Tratar para carregar o tema de acordo com o escolhido pelo usuário
    //TODO: Tratar para organizar os elementos corretamente em tela
    return (
        <div>
            <div className='titulo-wrapper'>
                <h1>ENCOURAÇADO VALENTE</h1>
            </div>
            <div className="container-tabuleiros">
                <Typography textAlign="center" style={{ fontFamily: "bungee", color: "black" }}>É HORA DE PREPARAR A SUA ESTRATÉGIA</Typography>
                <div style={{ alignContent: 'center', paddingLeft: '5%', display: 'flex', flexDirection: 'row' }}>
                    <PosicaoContainer handlePosicaoOnClick={handlePosicaoOnClick} idPrefix='user' clickable={podeSelecionarPosicoes} />
                    <div>
                        <img id="barcoPequeno1" ref={barcoPequenoRef1} style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }} src={temaBarcoPequenoSrc} onClick={() => handleBarcoOnClick(barcoPequenoRef1, 1)} />
                        <img id="barcoPequeno2" ref={barcoPequenoRef2} style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }} src={temaBarcoPequenoSrc} onClick={() => handleBarcoOnClick(barcoPequenoRef2, 1)} />
                        <img id="barcoPequeno3" ref={barcoPequenoRef3} style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }} src={temaBarcoPequenoSrc} onClick={() => handleBarcoOnClick(barcoPequenoRef3, 1)} />
                        <img id="barcoPequeno4" ref={barcoPequenoRef4} style={{ height: '30px', width: calculaWidth(1), cursor: 'pointer' }} src={temaBarcoPequenoSrc} onClick={() => handleBarcoOnClick(barcoPequenoRef4, 1)} />
                        <img id="barcoMedio1" ref={barcoMedioRef1} style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }} src={temaBarcoMedioSrc} onClick={() => handleBarcoOnClick(barcoMedioRef1, 2)} />
                        <img id="barcoMedio2" ref={barcoMedioRef2} style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }} src={temaBarcoMedioSrc} onClick={() => handleBarcoOnClick(barcoMedioRef2, 2)} />
                        <img id="barcoMedio3" ref={barcoMedioRef3} style={{ height: '30px', width: calculaWidth(2), cursor: 'pointer' }} src={temaBarcoMedioSrc} onClick={() => handleBarcoOnClick(barcoMedioRef3, 2)} />
                        <img id="barcoGrande1" ref={barcoGrandeRef1} style={{ height: '30px', width: calculaWidth(3), cursor: 'pointer' }} src={temaBarcoGrandeSrc} onClick={() => handleBarcoOnClick(barcoGrandeRef1, 3)} />
                        <img id="barcoGrande2" ref={barcoGrandeRef2} style={{ height: '30px', width: calculaWidth(3), cursor: 'pointer' }} src={temaBarcoGrandeSrc} onClick={() => handleBarcoOnClick(barcoGrandeRef2, 3)} />
                        <img id="barcoGigante" ref={barcoGiganteRef1} style={{ height: '30px', width: calculaWidth(4), cursor: 'pointer' }} src={temaBarcoGiganteSrc} onClick={() => handleBarcoOnClick(barcoGiganteRef1, 4)} />
                    </div>
                </div>
                <Button disabled={!podeSelecionarPosicoes} onClick={handleEnviarNavioOnClick}> Enviar navio para a posição </Button>
            </div>
        </div>
    )
}

export default PreparacaoJogo