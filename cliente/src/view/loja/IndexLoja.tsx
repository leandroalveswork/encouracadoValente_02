import { Button, Card, CardActions, CardContent, Fab, Pagination, styled, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmacaoModal from '../../components/confirmacaoModal/ConfirmacaoModal';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdResumoTema } from '../../modelos/importarBack/MdResumoTema';
import { UtilPagina } from '../../util/UtilPagina';
import AddIcon from '@mui/icons-material/Add';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

const WhitePagination = styled(Pagination)({
    color: 'white',
    backgroundColor: 'white',
    borderRadius: '10px'
})

const IndexLoja = () => {
    const navigate = useNavigate();

    const userState = new UserState();
    const clientRest = new ClientRest();

    const [lTemas, setLTemas] = useState<MdResumoTema[]>([]);
    const [pagina, setPagina] = useState(1);
    const [idTemaConfirmacaoExclusaoPendente, setIdTemaConfirmacaoExclusaoPendente] = useState('');

    const [confirmacaoExclusaoEstaAberto, setConfirmacaoExclusaoEstaAberto] = useState(false);
    const [sucessoExclusaoEstaAberto, setSucessoExclusaoEstaAberto] = useState(false);
    const [erroEstaAberto, setErroEstaAberto] = useState(false);
    const [problemaErro, setProblemaErro] = useState('');

    useEffect(() => {
        clientRest.callGetAutorizado<MdResumoTema[]>('/api/tema/listar', [])
            .then(rLista => {
                if (rLista.eOk) {
                    setLTemas(rLista.body ?? []);
                } else {
                    setProblemaErro(rLista.problema);
                    setErroEstaAberto(_ => true);
                }
            });
    }, []);

    let qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6);
    // useEffect(() => { qtPaginas = UtilPagina.calcularQtPaginas(lTemas.length, 6); }, [lTemas])

    let temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6);
    // useEffect(() => { temasPaginados = UtilPagina.recortarPagina(lTemas, pagina, 6); }, [lTemas, pagina])
    // console.log(qtPaginas);
    
    const handleClickExcluir = (idTema: string) => {
        setIdTemaConfirmacaoExclusaoPendente(_ => idTema);
        setConfirmacaoExclusaoEstaAberto(_ => true);
    }

    const handleClickConfirmarExclusao = async () => {
        // console.log('**f|inicio do rExclusao');
        
        const rExclusao = await clientRest.callDeleteAutorizado<undefined>('/api/tema/excluirPorId?id=' + idTemaConfirmacaoExclusaoPendente, undefined)
        // console.log('**f|rExclusao devolvido');
        
        setConfirmacaoExclusaoEstaAberto(_ => false);
        // console.log('**f|confirmacao fechado');
        
        if (rExclusao.eOk) {
            setSucessoExclusaoEstaAberto(_ => true);
        } else {
            setProblemaErro(rExclusao.problema);
            setErroEstaAberto(_ => true);
        }
    }
    
    return (
        <div>
            <h1 style={{color: 'white'}}>Loja</h1>
            {lTemas.length > 0 && <>
                <div className="row" >
                    {temasPaginados.map(iResumoTema => {
                        return (<div className='col-6' key={iResumoTema.id}>
                            <Card style={{marginTop: '10px'}}>
                                <CardContent >
                                    <h3 className="subtitulo">{iResumoTema.nome}</h3>
                                    <span>{iResumoTema.descricao}</span>
                                </CardContent>
                                <CardActions>
                                    <Button size="medium" variant="contained" onClick={() => {}}>{'Comprar - R$ ' + iResumoTema.preco}</Button>
                                    <Button size="medium" onClick={() => navigate('/loja/detalheTema?id=' + iResumoTema.id)}>Ver mais</Button>
                                    <Button size="medium" variant="contained" onClick={() => navigate('/loja/detalheTema?id=' + iResumoTema.id + '&eAlteracao=S')}>Alterar</Button>
                                    <Button size="medium" variant="contained" color="error" onClick={() => handleClickExcluir(iResumoTema.id)}>Excluir</Button>
                                </CardActions>
                            </Card>
                        </div>)
                    })}
                </div>
                <div className="d-flex justify-content-center pt-4">
                    <WhitePagination color='standard' variant='outlined' count={qtPaginas} page={pagina} onChange={(ev, pgn) => setPagina(_ => pgn)} />
                </div>
            </>}
            {lTemas.length == 0 && <span style={{color: 'white'}}>Nenhum tema adicionado ainda.</span>}
            <div className="d-flex justify-content-center pt-4">
                <Fab size="medium" variant='extended'  onClick={() => navigate('/loja/adicionarTema')}> Adicionar tema <AddIcon sx={{mr: 1}} style={{marginBottom: '5px'}}/></Fab>
            </div>

            <ConfirmacaoModal estaAberto={confirmacaoExclusaoEstaAberto} onFecharOuCancelar={() => setConfirmacaoExclusaoEstaAberto(_ => false)} onConfirmar={() => handleClickConfirmarExclusao()}
                mensagem='Deseja excluir este tema? Isso causará a exclusão dos navios deste tema.' />
            <SucessoModal estaAberto={sucessoExclusaoEstaAberto} onFechar={() => window.location.reload()} mensagem='Tema excluído com sucesso!' />
            <ErroModal estaAberto={erroEstaAberto} onFechar={() => setErroEstaAberto(_ => false)} problema={problemaErro} />
        </div>
    )
}


export default IndexLoja