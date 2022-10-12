import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Icon } from "@mui/material";
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
interface PropsSucesso {
    estaAberto: boolean
    onFecharOuCancelar: () => void
    onConfirmar: () => void
    mensagem: string
}

const ConfirmacaoModal = (props: PropsSucesso) => {
    return (
        <Dialog
            open={props.estaAberto}
            onClose={props.onFecharOuCancelar}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
        <DialogContent>
          <div className="d-flex">
            <WarningAmberOutlinedIcon color="warning" className="me-3" />
            <DialogContentText id="alert-dialog-description">
              {props.mensagem}
            </DialogContentText>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onFecharOuCancelar} variant='contained' autoFocus color='secondary'>
            Não, voltar
          </Button>
          <Button onClick={props.onConfirmar} variant='contained' color='primary'>
            Sim, prosseguir
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export default ConfirmacaoModal;