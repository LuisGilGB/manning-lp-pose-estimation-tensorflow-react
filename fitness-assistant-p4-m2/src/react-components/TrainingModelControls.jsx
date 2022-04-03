import {Button, FormControl, FormHelperText, InputLabel, NativeSelect, Toolbar, Typography} from "@mui/material";

const TrainingModelControls = ({
  isCollectingData,
  isTrainModelDisabled,
  onCollectDataClick,
  onTrainModelClick,
  onWorkoutSelect,
  selectedWorkout
}) => (
  <>
    <FormControl
      required
      sx={{
        margin: 1,
        minWidth: 120,
      }}
    >
      <InputLabel
        htmlFor="age-native-helper"
      >
        Workout
      </ InputLabel>
      <NativeSelect
        value={selectedWorkout}
        onChange={onWorkoutSelect}
      >
        <option>None</option>
        <option value="jumping_jacks">Jumping Jacks</option>
        <option value="wall-sit">Wall-Sit</option>
        <option value="lunges">Lunges</option>
      </NativeSelect>
      <FormHelperText>
        Select training data type
      </FormHelperText>
    </FormControl>
    <Toolbar>
      <Typography
        sx={{
          marginRight: 16
        }}
      >
        <Button
          variant="contained"
          color={isCollectingData ? 'secondary' : 'primary'}
          sx={{
            marginRight: 16
          }}
          onClick={onCollectDataClick}
        >
          {isCollectingData ? 'Stop' : 'Collect Data'}
        </Button>
        <Button
          variant="contained"
          disabled={isTrainModelDisabled}
          onClick={onTrainModelClick}
        >
          Train Model
        </Button>
      </Typography>
    </Toolbar>
  </>
);

export default TrainingModelControls;
