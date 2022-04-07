import {Button, FormControl, FormHelperText, InputLabel, NativeSelect, Toolbar, Typography} from "@mui/material";
import config from "../config";

const TrainingModelControls = ({
  canRequestDataCollection,
  isCollectDataDisabled,
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
        {Object.keys(config.TRAINING_TYPES).map(training => (
          <option value={training} key={training}>{config.TRAINING_TYPES[training].label}</option>
        ))}
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
          key="collect-data-btn"
          variant="contained"
          color={canRequestDataCollection ? 'primary' : 'secondary'}
          disabled={isCollectDataDisabled}
          sx={{
            marginRight: 16
          }}
          onClick={onCollectDataClick}
        >
          {canRequestDataCollection ? 'Collect Data' : 'Stop'}
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
