import {Button, ButtonGroup, Divider, IconButton, Stack, FormControl, InputLabel, Select, MenuItem, TextField} from "@mui/material";
import {TimePicker} from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import styled from "@emotion/styled";
import DeleteIcon from '@mui/icons-material/Delete';

const PickersContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    margin: 8px 0 !important;
    padding: 4px;
`;

const DayBtn = ({dayNum, isDaySelected, updateDay}) => {
    return (<Button
        onClick={() => updateDay(dayNum, isDaySelected ? "del" : "add")}
        variant={isDaySelected ? "contained" : "outlined"}
    >
        {dayjs().day(dayNum).format("ddd")}
    </Button>)
}

export const ClockEntry = ({clockEntry, updateEntry, delEntry, projects = []}) => {
    const isDayInEntry = (dayNum) => clockEntry.days.includes(dayNum)

    const updateDay = (dayNum, action) => {
        console.log(dayNum, action)
        if(action==="del"){
            updateEntry({...clockEntry, days: clockEntry.days.filter(d => d !== dayNum)})
        }
        if(action==="add"){
            updateEntry({...clockEntry, days: [...clockEntry.days, dayNum]})
        }
    }

    const handleProjectChange = (event) => {
        const newProjectId = event.target.value === "" ? null : event.target.value
        updateEntry({...clockEntry, projectId: newProjectId, taskId: null})
    }

    return (<Stack style={{marginLeft: "24px"}} spacing={4}>
        <Stack direction="row" justifyContent="flex-start" spacing={2} flexWrap="wrap" sx={{ rowGap: 2 }}>
            <TimePicker
                label="Time Start"
                value={dayjs('2022-04-17T' + clockEntry.start)}
                onChange={(newValue) => updateEntry({...clockEntry, start: formatHHMM(newValue)})}
                slotProps={{
                    textField: {
                        size: 'small',
                        sx: { width: 140 }
                    }
                }}
            />
            <TimePicker
                className="time-end"
                label="Time End"
                value={dayjs('2022-04-17T' + clockEntry.end)}
                onChange={(newValue) => updateEntry({...clockEntry, end: formatHHMM(newValue)})}
                slotProps={{
                    textField: {
                        size: 'small',
                        sx: { width: 140 }
                    }
                }}
            />

            {projects.length > 0 && (
                <FormControl sx={{ minWidth: 240 }} size="small">
                    <InputLabel id={`project-label-${clockEntry.id}`}>Project</InputLabel>
                    <Select
                        labelId={`project-label-${clockEntry.id}`}
                        id={`project-select-${clockEntry.id}`}
                        value={clockEntry.projectId || ""}
                        label="Project"
                        onChange={handleProjectChange}
                    >
                        <MenuItem value="">
                            <em>None</em>
                        </MenuItem>
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            <IconButton color="primary" aria-label="delete clock entry" onClick={()=>delEntry(clockEntry.id)}>
                <DeleteIcon />
            </IconButton>
        </Stack>

        <Stack direction="row" justifyContent="flex-start" spacing={20}>
            <ButtonGroup variant="outlined" aria-label="Weekdays">
                {[1, 2, 3, 4, 5].map((dayNum) =>
                    <DayBtn key={dayNum} dayNum={dayNum} isDaySelected={isDayInEntry(dayNum)} updateDay={updateDay}/>)
                }
            </ButtonGroup>
            <ButtonGroup variant="outlined" aria-label="Weekends">
                {[6, 0].map((dayNum) =>
                    <DayBtn key={dayNum} dayNum={dayNum} isDaySelected={isDayInEntry(dayNum)} updateDay={updateDay}/>)
                }
            </ButtonGroup>
        </Stack>
    </Stack>)
}

const addZero = (i) => i < 10 ? "0" + i : i

function formatHHMM(val) {
    return addZero(val.$H) + ":" + addZero(val.$m)
}
