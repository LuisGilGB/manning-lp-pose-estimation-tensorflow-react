import {Card, CardContent, Toolbar, Typography} from "@mui/material";
import config from "../config";

const WorkoutRequirements = () => (
  <Toolbar style={{justifyContent: 'center'}}>
    {Object.values(config.TRAINING_TYPES).map(training => (
      <Card
        key={training.key}
        sx={{
          width: '250px',
          margin: '10px',
        }}
      >
        <CardContent>
          <Typography
            sx={{
              flexGrow: 1,
              textAlign: 'left'
            }}
            color="textSecondary"
            gutterBottom
          >
            {training.label}
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            color="secondary"
          >
            {training.goal}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Toolbar>
);

export default WorkoutRequirements;
