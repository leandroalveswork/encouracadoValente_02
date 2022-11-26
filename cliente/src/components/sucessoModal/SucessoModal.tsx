import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Icon } from "@mui/material";
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
interface PropsSucesso {
    estaAberto: boolean
    onFechar: () => void
    mensagem: string
}

const SucessoModal = (props: PropsSucesso) => {
    return (
        <Dialog
            open={props.estaAberto}
            onClose={props.onFechar}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
        <DialogContent>
          <div className="d-flex">
            <CheckCircleOutlineOutlinedIcon color="success" className="me-3" />
            <DialogContentText id="alert-dialog-description">
              {props.mensagem}
            </DialogContentText>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onFechar} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export default SucessoModal;