import { Box, Button, InputAdornment, styled, Tab, Tabs, TextField, Dialog, DialogContent, DialogActions } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { PostNovoNavioTema } from '../../modelos/importarBack/PostNovoNavioTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { UtilNumber } from '../../util/UtilNumber';
import ManterListaNavioTema from './ManterListaNavioTema';
import MdRespostaApi from '../../modelos/MdRespostaApi';
import '../css/AdicionarTema.css'

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const AdicionarTema = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState<number | null>(null);
    const [descricao, setDescricao] = useState('');
    // const [idxTab, setIdxTab] = useState(0);
    const [popupNaviosTemaEstaAberto, setPopupNaviosTemaEstaAberto] = useState(false);
    const [lNaviosTema, setLNaviosTema] = useState<MdDetalheNavioTema[]>([]);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    const [sucessoAdicaoEstaAberto, setSucessoAdicaoEstaAberto] = useState(false);

    const formatarPreco = (precoRaw: number | null): string => {
        if (precoRaw == null) {
            return '';
        }
        return ('' + precoRaw);
    }

    let precoAsFormatado = formatarPreco(preco);
    // useEffect(() => { precoAsFormatado = formatarPreco(preco) }, [preco]);

    const handleClickSalvar = async () => {
        let novoTema = new PostNovoTema();
        novoTema.nome = nome;
        novoTema.preco = preco;
        novoTema.descricao = descricao;
        let promisesParaResolver: Promise<MdRespostaApi<undefined>>[] = [];
        for (let iDetalheTema of lNaviosTema) {
            let novoNavioTemaParaPush = new PostNovoNavioTema();
            novoNavioTemaParaPush.tamnQuadrados = iDetalheTema.tamnQuadrados;
            novoNavioTemaParaPush.nomePersonalizado = iDetalheTema.nomePersonalizado;
            novoNavioTemaParaPush.numeroRecuperacaoArquivoImagemNavio = iDetalheTema.numeroRecuperacaoArquivoImagemNavio ?? '';
            if (iDetalheTema.bytesParaUploadArquivo == null) {
                setProblemaErro(_ => 'Falha ao carregar imagem de um dos navios.');
                setErroEstaAberto(_ => true);
                return;
            }
            promisesParaResolver.push(clientRest.callUploadArquivo(iDetalheTema.bytesParaUploadArquivo, iDetalheTema.numeroRecuperacaoArquivoImagemNavio ?? ''));
            novoTema.naviosTema.push(novoNavioTemaParaPush);
        }
        let listaRUpload = await Promise.all(promisesParaResolver);
        let rErroOrDefault = listaRUpload.find(x => !x.eOk);
        if (rErroOrDefault != undefined) {
            setProblemaErro(_ => rErroOrDefault?.problema ?? '');
            setErroEstaAberto(_ => true);
            return;
        }
        let rAdicao = await clientRest.callPostAutorizado<string>('/api/tema/adicionar', novoTema, '');
        if (rAdicao.eOk) {
            setSucessoAdicaoEstaAberto(_ => true);
        } else {
            setProblemaErro(_ => rAdicao.problema);
            setErroEstaAberto(_ => true);
        }
    }

    return (
        <>
            <h1>Adicionar Tema</h1>
            <Box className='box'>
                {/* <Tabs value={idxTab} onChange={(ev, nextIdxTab) => setIdxTab(_ => nextIdxTab)} aria-label="basic tabs example">
                    <Tab label="Dados de Resumo" />
                    <Tab label="Navios" />
                </Tabs> */}
                {/* {idxTab == 0 && <> */}
                    <div className="row g-0">
                        <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} />
                        <EncVnTextField label="Preço" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setPreco(_ => UtilNumber.parseFloatOrDefault(ev.target.value))} 
                        value={precoAsFormatado} InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }} />
                    </div>
                    <div className="row g-0">
                        <EncVnTextField multiline rows={4} label="Descrição" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setDescricao(_ => ev.target.value)} value={descricao} />
                    </div>
                {/* </>} */}
                {/* {idxTab == 1 && <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} />} */}
                <div className="row g-0" >
                    <div className="col-11" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => setPopupNaviosTemaEstaAberto(_ => true)}>Abrir Lista de Navios</Button>
                    </div>
                    <div className="col-6" style={{marginTop: '10px'}}>
                        <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                    </div>
                    <div className="col-5" style={{marginTop: '10px'}}>
                        <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                    </div>
                </div>
            </Box>
            
            {/* Pop Up com os NavioTema */}
            <Dialog
                open={popupNaviosTemaEstaAberto}
                onClose={() => setPopupNaviosTemaEstaAberto(_ => false)}
                fullWidth
                maxWidth='lg'
            >
                <DialogContent>
                    <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPopupNaviosTemaEstaAberto(_ => false)}>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Mensagens de sucesso e erro */}
            <SucessoModal estaAberto={sucessoAdicaoEstaAberto} onFechar={() => navigate('/loja')} mensagem='Tema adicionado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
            
        </>
    )
}


export default AdicionarTema