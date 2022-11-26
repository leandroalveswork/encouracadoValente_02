import { Box, Button, FormControl, InputLabel, MenuItem, Select, styled, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ImgNavioHorizontal from '../../components/imagem/ImgNavioHorizontal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { LiteralNavio } from '../../modelos/LiteralNavio';
import { StringUteis } from '../../util/StringUteis';
import { UtilNumber } from '../../util/UtilNumber';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

interface AdicionarNavioTemaProps {
    onCancelar: () => void;
    onSalvar: (navioTema: MdDetalheNavioTema) => void;
    naviosAdicionados: number[]
}

const AdicionarNavioTema = (props: AdicionarNavioTemaProps) => {
    // const navigate = useNavigate();

    // const userState = new UserState();
    // const clientRest = new ClientRest();
    const [tamnQuadradosAsString, setTamnQuadradosAsString] = useState('');
    const [nomePersonalizado, setNomePersonalizado] = useState('');
    const [bytesImagem, setBytesImagem] = useState<Blob | null>(null);
    const [numeroRecuperacaoImagem, setNumeroRecuperacaoImagem] = useState<string | null>(null);

    const calcularSrcImagemPrevia = (): string => {
        if (bytesImagem != null)
            return URL.createObjectURL(bytesImagem);
        return '';
    }
    const [srcImagemPrevia, setSrcImagemPrevia] = useState(calcularSrcImagemPrevia());
    useEffect(() => 
        setSrcImagemPrevia(_ => calcularSrcImagemPrevia()),
    [bytesImagem]);
    
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    
    const handleArquivoSelecionado = (event: any) => {
        setBytesImagem(_ => event.target.files[0]);
        setNumeroRecuperacaoImagem(_ => StringUteis.gerarNovoIdDe24Caracteres());
    }

    const naviosFiltrados = ()=>{
        if (props.naviosAdicionados.length == 0){
            return LiteralNavio.listar()
        }
        else{
            return LiteralNavio.listar().filter((navio) => {
                return !props.naviosAdicionados.includes(navio.tamnQuadrados)
            })
        }
    }

    const handleClickSalvar = async () => {

        // Validaçao
        let camposNulos: string[] = [];
        let tamnQuadradosAsNumber = 0;
        try {
            tamnQuadradosAsNumber = parseInt(tamnQuadradosAsString);
            if (LiteralNavio.obterPorTamnQuadradosOrDefault(tamnQuadradosAsNumber) == null) {
                camposNulos.push('Navio OG');
            }
        } catch (er) {
            camposNulos.push('Navio OG');
        }
        if (nomePersonalizado.length == 0) {
            camposNulos.push('Nome Personalizado');
        }
        if (numeroRecuperacaoImagem == null) {
            camposNulos.push('Imagem');
        }
        if (camposNulos.length > 0) {
            setProblemaErro(_ => 'Os campos ' + StringUteis.listarEmPt(camposNulos) + ' são obrigatórios');
            setErroEstaAberto(_ => true);
            return;
        }
        
        let novoNavioTema = new MdDetalheNavioTema();
        novoNavioTema.tamnQuadrados = tamnQuadradosAsNumber;
        novoNavioTema.nomePersonalizado = nomePersonalizado;
        novoNavioTema.numeroRecuperacaoArquivoImagemNavio = numeroRecuperacaoImagem;
        novoNavioTema.bytesParaUploadArquivo = bytesImagem;
        props.onSalvar(novoNavioTema);
    }

    return (
        <>
            <h1>Adicionar Personalização</h1>
            
                <div className="row g-0">
                    <FormControl>
                            <InputLabel>Navio OG</InputLabel>
                        <Select value={tamnQuadradosAsString} label="Navio OG" onChange={ev => setTamnQuadradosAsString(_ => (ev.target.value as string))} >
                            <MenuItem value="">
                                <span>Selecione...</span>
                            </MenuItem>
                            {naviosFiltrados().map(iNavioLt => {
                                    return (
                                        <MenuItem value={iNavioLt.tamnQuadrados.toString()}>
                                            {iNavioLt.nome}
                                        </MenuItem>
                                    )
                            })}
                        </Select>

                    </FormControl>
                    <EncVnTextField label="Tamanho (qtd.)" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} value={tamnQuadradosAsString} disabled />
                </div>
                <div className="row g-0">
                    <EncVnTextField label="Nome Personalizado" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNomePersonalizado(_ => ev.target.value)} value={nomePersonalizado} />
                    
                    {/* Botao de upload */}
                    <div className="d-flex mt-3 align-items-center">
                        <span>Imagem:</span>
                        <label htmlFor="btn-upload" className="ms-3">
                            <input
                            id="btn-upload"
                            name="btn-upload"
                            style={{ display: 'none' }}
                            type="file"
                            onChange={handleArquivoSelecionado} />
                            <Button
                            className="btn-choose"
                            variant="outlined"
                            component="span" >
                                Escolher Arquivo
                            </Button>
                        </label>
                        <strong className='ms-3'>Atenção! O tamanho máximo é de 0,97 MB</strong>
                    </div>
                    <div className="file-name mt-3">{bytesImagem != null ? (bytesImagem as File).name : null}</div>
                </div>
                <div>
                    {bytesImagem != null && tamnQuadradosAsString != '' && <ImgNavioHorizontal 
                        dadosBase64=''
                        eSrcBase64={false}
                        srcImagem={srcImagemPrevia}
                        tamanhoQuadrados={parseInt(tamnQuadradosAsString)}
                        altImagem='imagem'
                        ePositionAbsolute={false}
                        cssLeftAsPx={0}
                        cssTopAsPx={0}
                    />}
                </div>
                <div className="row g-0 mt-3">
                    <div className="col-6">
                        <Button size="medium" onClick={() => props.onCancelar()}>Cancelar</Button>
                    </div>
                    <div className="col-6">
                        <Button size="medium" variant="contained" onClick={() => handleClickSalvar()} style={{marginTop: '10px'}}>Confirmar Personalização</Button>
                    </div>

                </div>

            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default AdicionarNavioTema