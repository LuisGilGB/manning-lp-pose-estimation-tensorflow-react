import {AppBar, Button, Toolbar, Typography} from "@mui/material";

const TrainingAppBar = () => (
  <>
    <AppBar position="static" sx={{
      backgroundColor: '#1875d2'
    }}>
      <Toolbar variant="dense">
        <Typography
          variant="h6"
          color="inherit"
          sx={{
            flexGrow: 1,
            textAlign: 'left'
          }}
        >
          Fitness Assistant
        </Typography>
        <Button color="inherit">Start Workout</Button>
        <Button color="inherit">History</Button>
        <Button color="inherit">Reset</Button>
      </Toolbar>
    </AppBar>
  </>
)

export default TrainingAppBar;
