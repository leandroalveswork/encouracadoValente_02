import "./ErroModal.css";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";

interface PropsErro {
    estaAberto: boolean
    onFechar: () => void
    problema: string
}

const ErroModal = (propsErro: PropsErro) => {
    return (
        <Dialog
            open={propsErro.estaAberto}
            onClose={propsErro.onFechar}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {propsErro.problema}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={propsErro.onFechar} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    )
}

export default ErroModal;