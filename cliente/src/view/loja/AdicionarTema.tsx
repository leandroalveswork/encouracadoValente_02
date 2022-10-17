import { Box, Button, styled, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
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
    const [idxTab, setIdxTab] = useState(0);
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
        for (let iDetalheTema of lNaviosTema) {
            let novoNavioTemaParaPush = new PostNovoNavioTema();
            novoNavioTemaParaPush.tamnQuadrados = iDetalheTema.tamnQuadrados;
            novoNavioTemaParaPush.nomePersonalizado = iDetalheTema.nomePersonalizado;
            novoNavioTemaParaPush.urlImagemNavio = iDetalheTema.urlImagemNavio;
            novoTema.naviosTema.push(novoNavioTemaParaPush);
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
            <span>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</span>
            <h1>Adicionar Tema</h1>
            
            <Box>
                <Tabs value={idxTab} onChange={(ev, nextIdxTab) => setIdxTab(_ => nextIdxTab)} aria-label="basic tabs example">
                    <Tab label="Dados de Resumo" />
                    <Tab label="Navios" />
                </Tabs>
            </Box>

            {idxTab == 0 && <>
                <div className="row g-0">
                    <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} />
                    <EncVnTextField label="Preço" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setPreco(_ => UtilNumber.parseFloatOrDefault(ev.target.value))} value={precoAsFormatado} />
                </div>
                <div className="row g-0">
                    <EncVnTextField multiline rows={4} label="Descrição" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setDescricao(_ => ev.target.value)} value={descricao} />
                </div>
            </>}
            {idxTab == 1 && <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} />}
            <div className="row g-0">
                <div className="col-6">
                    <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                </div>
                <div className="col-6">
                    <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                </div>

            </div>

            <SucessoModal estaAberto={sucessoAdicaoEstaAberto} onFechar={() => navigate('/loja')} mensagem='Tema adicionado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default AdicionarTema