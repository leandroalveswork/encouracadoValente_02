import './ImgNavioVertical.css';

interface ImgNavioVerticalProps {
    dadosBase64: string
    eSrcBase64: boolean
    srcImagem: string | undefined | null
    tamanhoQuadrados: number
    altImagem: string
    ePositionAbsolute: boolean
    cssLeftAsPx: number
    cssTopAsPx: number
}

const ImgNavioVertical = (props: ImgNavioVerticalProps) => {
    return (
        <>
            <img src={props.eSrcBase64 ? 'data:image/*;base64,' + props.dadosBase64 : (props.srcImagem ?? '')}
                width={(props.tamanhoQuadrados * 30).toString() + 'px'}
                height='30px'
                alt={props.altImagem}
                className='imagem-vertical'
                style={{
                    position: props.ePositionAbsolute ? 'absolute' : 'initial',
                    left: (props.cssLeftAsPx ?? '0') + 'px',
                    top: (props.cssTopAsPx ?? '0') + 'px'
                }} />
        </>
    )
}

export default ImgNavioVertical