import { Box, Button, styled, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { MdDetalheTema } from '../../modelos/importarBack/MdDetalheTema';
import { PostNovoTema } from '../../modelos/importarBack/PostNovoTema';
import { PutNavioTema } from '../../modelos/importarBack/PutNavioTema';
import { PutTema } from '../../modelos/importarBack/PutTema';
import { UtilNumber } from '../../util/UtilNumber';
import ManterListaNavioTema from './ManterListaNavioTema';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const DetalheTema = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [nome, setNome] = useState('');
    const [preco, setPreco] = useState<number | null>(null);
    const [descricao, setDescricao] = useState('');
    const [idxTab, setIdxTab] = useState(0);
    const [lNaviosTema, setLNaviosTema] = useState<MdDetalheNavioTema[]>([]);

    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');
    const [sucessoAlteracaoEstaAberto, setSucessoAlteracaoEstaAberto] = useState(false);

    let eAlteracao = searchParams.get('eAlteracao') == 'S';
    useEffect(() => {
        const tryIdTema = searchParams.get('id');
        if (tryIdTema == null) {
            setProblemaErro(_ => 'Tema não encontrado');
            setErroEstaAberto(_ => true);
        } else {
            clientRest.callGetAutorizado<MdDetalheTema>('/api/tema/detalharPorId?id=' + tryIdTema, new MdDetalheTema())
                .then(rDetalhe => {
                    if (rDetalhe.eOk) {
                        const detalheTema = rDetalhe.body ?? new MdDetalheTema();
                        setNome(_ => detalheTema.nome);
                        setPreco(_ => detalheTema.preco);
                        setDescricao(_ => detalheTema.descricao);
                        setLNaviosTema(_ => detalheTema.naviosTema);
                    } else {
                        setProblemaErro(rDetalhe.problema);
                        setErroEstaAberto(_ => true);
                    }
                });
        }
    }, []);

    const formatarPreco = (precoRaw: number | null): string => {
        if (precoRaw == null) {
            return '';
        }
        return ('' + precoRaw);
    }

    let precoAsFormatado = formatarPreco(preco);
    // useEffect(() => { precoAsFormatado = formatarPreco(preco) }, [preco]);

    const handleClickSalvar = async () => {
        const tryIdTema = searchParams.get('id');
        if (tryIdTema == null) {
            setProblemaErro(_ => 'Tema não encontrado');
            setErroEstaAberto(_ => true);
            return;
        }
        let temaAlterado = new PutTema();
        temaAlterado.id = tryIdTema;
        temaAlterado.nome = nome;
        temaAlterado.preco = preco;
        temaAlterado.descricao = descricao;
        for (let iDetalheTema of lNaviosTema) {
            let navioTemaParaPush = new PutNavioTema();
            navioTemaParaPush.id = iDetalheTema.id;
            navioTemaParaPush.tamnQuadrados = iDetalheTema.tamnQuadrados;
            navioTemaParaPush.nomePersonalizado = iDetalheTema.nomePersonalizado;
            navioTemaParaPush.urlImagemNavio = iDetalheTema.urlImagemNavio;
            temaAlterado.naviosTema.push(navioTemaParaPush);
        }
        let rAlteracao = await clientRest.callPutAutorizado<undefined>('/api/tema/alterar', temaAlterado, undefined);
        if (rAlteracao.eOk) {
            setSucessoAlteracaoEstaAberto(_ => true);
        } else {
            setProblemaErro(_ => rAlteracao.problema);
            setErroEstaAberto(_ => true);
        }
    }

    const handleClickAlterar = () => {
        if (searchParams.has('eAlteracao')) {
            searchParams.set('eAlteracao', 'S');
        } else {
            searchParams.append('eAlteracao', 'S');
        }
        navigate(window.location.href.split('?')[0] + '?' + searchParams.toString());
    }

    return (
        <>
            <span>{`Olá usuário: ${userState.localStorageUser?.nome ?? 'indefinido'}`}</span>
            <h1>{eAlteracao ? 'Alterar Tema' : 'Detalhes Tema'}</h1>
            
            <Box>
                <Tabs value={idxTab} onChange={(ev, nextIdxTab) => setIdxTab(_ => nextIdxTab)} aria-label="basic tabs example">
                    <Tab label="Dados de Resumo" />
                    <Tab label="Navios" />
                </Tabs>
            </Box>
            
            {idxTab == 0 && <>
                <div className="row g-0">
                    <EncVnTextField label="Nome" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setNome(_ => ev.target.value)} value={nome} disabled={!eAlteracao} />
                    <EncVnTextField label="Preço" type="number" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setPreco(_ => UtilNumber.parseFloatOrDefault(ev.target.value))} value={precoAsFormatado} disabled={!eAlteracao} />
                </div>
                <div className="row g-0">
                    <EncVnTextField multiline rows={4} label="Descrição" variant="outlined" className="mt-4" sx={{ width: 350 }} onChange={ev => setDescricao(_ => ev.target.value)} value={descricao} disabled={!eAlteracao} />
                </div>
            </>}
            {idxTab == 1 && <ManterListaNavioTema lNaviosTema={lNaviosTema} setLNaviosTema={setLNaviosTema} />}
            <div className="row g-0">
                <div className="col-6">
                    <Button size="medium" onClick={() => window.history.back()}>Voltar</Button>
                </div>
                {eAlteracao && <div className="col-6">
                    <Button size="medium" variant="contained" onClick={() => handleClickSalvar()}>Salvar</Button>
                </div>}
                {!eAlteracao && <div className="col-6">
                    <Button size="medium" variant="contained" onClick={() => handleClickAlterar()}>Alterar</Button>
                </div>}

            </div>
            <SucessoModal estaAberto={sucessoAlteracaoEstaAberto} onFechar={() => navigate('/loja')} mensagem='Tema alterado com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </>
    )
}


export default DetalheTema