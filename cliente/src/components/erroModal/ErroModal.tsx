import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Icon } from "@mui/material";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
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
          <div className="d-flex">
            <CancelOutlinedIcon color="error" className="me-3" />
            <DialogContentText id="alert-dialog-description">
              {propsErro.problema}
            </DialogContentText>
          </div>
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