import {Alert, Snackbar as MuiSnackbar} from "@mui/material";

const Snackbar = ({
  children,
  isOpen,
  severity,
  onClose,
}) => (
  <MuiSnackbar
    open={isOpen}
    autoHideDuration={2000}
    onClose={onClose}
  >
    <Alert
      severity={severity}
      onClose={onClose}
    >
      {children}
    </Alert>
  </MuiSnackbar>
);

export default Snackbar;
