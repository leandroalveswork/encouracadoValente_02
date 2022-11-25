import { Button, Card, CardActions, CardContent, Icon, Pagination, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmacaoModal from '../../components/confirmacaoModal/ConfirmacaoModal';
import ErroModal from '../../components/erroModal/ErroModal';
import SucessoModal from '../../components/sucessoModal/SucessoModal';
import ClientRest from '../../integracao/ClientRest';
import UserState from '../../integracao/UserState';
import { MdDetalheNavioTema } from '../../modelos/importarBack/MdDetalheNavioTema';
import { MdResumoTema } from '../../modelos/importarBack/MdResumoTema';
import { UtilPagina } from '../../util/UtilPagina';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import { LiteralNavio } from '../../modelos/LiteralNavio';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageIcon from '@mui/icons-material/Image';
import AdicionarNavioTema from './AdicionarNavioTema';
import AlterarNavioTema from './AlterarNavioTema';
import ImgNavioHorizontal from '../../components/imagem/ImgNavioHorizontal';

const EncVnTextField = styled(TextField)({
    '& input + fieldset': {
        outerWidth: 340,
        borderColor: '#505050',
        borderWidth: 2,
    }
});

interface ManterListaNavioTemaProps {
    lNaviosTema: MdDetalheNavioTema[]
    setLNaviosTema: React.Dispatch<React.SetStateAction<MdDetalheNavioTema[]>>
    eListaBloqueada: boolean
}

type TpFormNavioTema = 'escondido' | 'adicionar' | 'alterar' ;

const ManterListaNavioTema = (props: ManterListaNavioTemaProps) => {
    // const navigate = useNavigate();

    // const userState = new UserState();
    // const clientRest = new ClientRest();
    const [naviosAdicionados, updateNaviosAdicionados] = useState<number[]>([])
    const [formNavioTema, setFormNavioTema] = useState<TpFormNavioTema>('escondido');
    const [idxNavioTemaAlteracaoPendente, setIdxNavioTemaAlteracaoPendente] = useState<number | null>(null);

    useEffect(() => {
        if (idxNavioTemaAlteracaoPendente != null) {
            setFormNavioTema(_ => 'alterar');
        }
    }, [idxNavioTemaAlteracaoPendente]);

    const handleClickExcluir = (idxNavioTema: number, tamNavio: number): void => {
        props.setLNaviosTema(_ => props.lNaviosTema.filter((el, idxEl) => idxEl != idxNavioTema));
        updateNaviosAdicionados(arr => arr.filter((item) => item != tamNavio))
    }

    const handleSalvarAdicao = (navioTema: MdDetalheNavioTema): void => {
        props.setLNaviosTema(_ => props.lNaviosTema.concat([ navioTema ]));
        setFormNavioTema(_ => 'escondido');
        updateNaviosAdicionados(arr => [...arr, navioTema.tamnQuadrados])
    }

    const handleSalvarAlteracao = (navioTema: MdDetalheNavioTema): void => {
        let copiaLNaviosTema = [ ...(props.lNaviosTema) ];
        if (idxNavioTemaAlteracaoPendente == null) {
            return;
        }
        copiaLNaviosTema[idxNavioTemaAlteracaoPendente] = navioTema;
        props.setLNaviosTema(_ => copiaLNaviosTema);
        setFormNavioTema(_ => 'escondido');
    }

    return (
        <>
            <h3>Lista de Personalizações</h3>
            {props.lNaviosTema.length > 0 && <>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} size="small" aria-label="Lista de personalizações">
                        <TableHead>
                            <TableRow>
                                <TableCell>Navio OG</TableCell>
                                <TableCell align="right">Nome</TableCell>
                                <TableCell align="right">Tamanho (qtd.)</TableCell>
                                <TableCell align="right">Imagem</TableCell>
                                <TableCell align="right"></TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.lNaviosTema.map((elNavioTema, idxNavioTema) => (
                                <TableRow
                                    key={idxNavioTema}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                <TableCell component="th" scope="row">
                                    {LiteralNavio.obterPorTamnQuadradosOrDefault(elNavioTema.tamnQuadrados)?.nome ?? ''}
                                </TableCell>
                                <TableCell align="right">{elNavioTema.nomePersonalizado}</TableCell>
                                <TableCell align="right">{elNavioTema.tamnQuadrados}</TableCell>
                                <TableCell align="right">
                                    {<ImgNavioHorizontal
                                        dadosBase64={elNavioTema.bytesParaUploadArquivo == null ? elNavioTema.arquivoImagemNavio?.dadosBase64 ?? '' : ''}
                                        eSrcBase64={elNavioTema.bytesParaUploadArquivo == null}
                                        srcImagem={elNavioTema.bytesParaUploadArquivo != null ? URL.createObjectURL(elNavioTema.bytesParaUploadArquivo) : ''}
                                        tamanhoQuadrados={elNavioTema.tamnQuadrados}
                                        altImagem='imagem'
                                        ePositionAbsolute={false}
                                        cssLeftAsPx={0}
                                        cssTopAsPx={0}
                                    />}
                                </TableCell>
                                <TableCell align="right">
                                    {!props.eListaBloqueada && <Button onClick={() => setIdxNavioTemaAlteracaoPendente(_ => idxNavioTema)}>
                                        <EditOutlinedIcon color="primary" className="me-3" />
                                    </Button>}
                                </TableCell>
                                <TableCell align="right">
                                    {!props.eListaBloqueada && <Button onClick={() => handleClickExcluir(idxNavioTema, elNavioTema.tamnQuadrados)}>
                                        <DeleteOutlinedIcon color="error" className="me-3" />
                                    </Button>}
                                </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>}
            {props.lNaviosTema.length == 0 && <span>Nenhuma personalização adicionada ainda.</span>}
            {!props.eListaBloqueada && <div className="d-flex justify-content-end pt-4">
                <Button size="medium" onClick={() => setFormNavioTema(_ => 'adicionar')}>Adicionar Personalização</Button>
            </div>}
            {formNavioTema == 'adicionar' && <AdicionarNavioTema onCancelar={() => setFormNavioTema(_ => 'escondido')} onSalvar={handleSalvarAdicao} naviosAdicionados={naviosAdicionados} />}
            {formNavioTema == 'alterar' && <AlterarNavioTema navioTemaInicial={props.lNaviosTema[idxNavioTemaAlteracaoPendente ?? 0]} onCancelar={() => setFormNavioTema(_ => 'escondido')} onSalvar={handleSalvarAlteracao} naviosAdicionados={naviosAdicionados} /> }
        </>
    )
}


export default ManterListaNavioTema
