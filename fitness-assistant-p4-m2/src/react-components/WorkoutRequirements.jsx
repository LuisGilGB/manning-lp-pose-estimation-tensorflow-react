import {Card, CardContent, Toolbar, Typography} from "@mui/material";

const WorkoutRequirements = () => (
  <Toolbar style={{justifyContent: 'center'}}>
    {[{
      name: 'Jumping Jacks',
      value: 75,
    }, {
      name: 'Wall-sit',
      value: 200,
    }, {
      name: 'Lunges',
      value: 5,
    }].map(({name, value}) => (
      <Card
        key={name}
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
            {name}
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            color="secondary"
          >
            {value}
          </Typography>
        </CardContent>
      </Card>
    ))}
  </Toolbar>
);

export default WorkoutRequirements;
