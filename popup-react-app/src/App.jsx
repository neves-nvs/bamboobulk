import {useEffect, useState} from 'react'
import './App.css'
import {
    CssBaseline, Divider, IconButton, Stack, Typography, Button,
} from "@mui/material";
import {ThemeProvider, createTheme} from '@mui/material/styles';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {ClockEntry} from "./components/ClockEntry.jsx";
import {getClockEntriesFromStorage, setClockEntriesToStorage, getProjectsFromStorage, setProjectsToStorage} from "../../common/storage";
import AddIcon from '@mui/icons-material/Add';
import {SkipConfigs} from "./components/SkipConfigs";

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
    spacing: 2,
});

const defaultClockEntries = [
    {
        "id": "1d3b0dd0",
        "start": "09:00",
        "end": "12:00",
        "days": [1,2,3,4,5],
        "projectId": 8, // Dremio Working Hours
        "taskId": null
    },
    {
        "id": "93917561",
        "start": "12:00",
        "end": "13:00",
        "days": [1,2,3,4,5],
        "projectId": 11, // Break Time
        "taskId": null
    },
    {
        "id": "a8f3c2e1",
        "start": "13:00",
        "end": "18:00",
        "days": [1,2,3,4,5],
        "projectId": 8, // Dremio Working Hours
        "taskId": null
    }
]

const newClockEntry = () => {
    return {
        "id": crypto.randomUUID().split("-")[0],
        "start": "09:00",
        "end": "10:00",
        "days": [],
        "projectId": null,
        "taskId": null
    }
}

function App() {
    const [clockEntries, setClockEntries] = useState(defaultClockEntries);
    const [projects, setProjects] = useState([]);
    const [syncMessage, setSyncMessage] = useState("");

    useEffect(()=>{
        getClockEntriesFromStorage().then(clockEntriesLS=>{
            console.log(clockEntriesLS)
            if(clockEntriesLS){
                setClockEntries(clockEntriesLS)
            }else {
                setClockEntriesToStorage(defaultClockEntries)
            }
        })

        // Fetch projects from storage first
        getProjectsFromStorage().then(projectsLS=>{
            console.log("Projects from storage:", projectsLS)
            if(projectsLS && projectsLS.length > 0){
                setProjects(projectsLS)
            } else {
                // If no projects in storage, try to sync automatically
                syncProjects()
            }
        })
    }, [])

    const syncProjects = async () => {
        setSyncMessage("Syncing projects... Please make sure you have a BambooHR timesheet page open.");

        try {
            // Query the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url || !tab.url.includes('bamboohr.com/employees/timesheet')) {
                setSyncMessage("Please open a BambooHR timesheet page and try again.");
                return;
            }

            // Send message to content script to get projects
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getProjects" });

            if (response && response.projects) {
                setProjects(response.projects);
                setProjectsToStorage(response.projects);
                setSyncMessage(`Successfully synced ${response.projects.length} projects!`);
                setTimeout(() => setSyncMessage(""), 3000);
            } else {
                setSyncMessage("No projects found. Make sure time tracking projects are configured in BambooHR.");
            }
        } catch (error) {
            console.error("Error syncing projects:", error);
            setSyncMessage("Error syncing projects. Please make sure you're on a BambooHR timesheet page.");
        }
    }

    const onClockEntryUpdate = (updatedValue) => {
        setClockEntries((oldClockEntries) => {
            const updatedEntries = oldClockEntries.map( oneEntry => oneEntry.id === updatedValue.id ? updatedValue : oneEntry)
            setClockEntriesToStorage(updatedEntries)
            return updatedEntries
        })
    }

    const onClockEntryDelete = (clockEntryId) => {
        setClockEntries((oldClockEntries) => {
            const updatedEntries = oldClockEntries.filter( oneEntry => oneEntry.id !== clockEntryId)
            setClockEntriesToStorage(updatedEntries)
            return updatedEntries
        })
    }

    const addNewEntry = () => {
        setClockEntries((oldClockEntries) => {
            const updatedEntries = [...oldClockEntries, newClockEntry()]
            setClockEntriesToStorage(updatedEntries)
            return updatedEntries
        })
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline/>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack spacing={12}>
                    <SkipConfigs/>
                    <Divider/>

                    <Stack spacing={8} divider={<Divider orientation="horizontal" flexItem />}>
                        {clockEntries.map(oneEntry => {
                            return <ClockEntry
                                clockEntry={oneEntry}
                                key={oneEntry.id}
                                updateEntry={onClockEntryUpdate}
                                delEntry={onClockEntryDelete}
                                projects={projects}
                            />
                        })}
                    </Stack>

                    <Stack direction="row" justifyContent="center" alignItems="center">
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={addNewEntry}
                        >
                            Add Entry
                        </Button>
                    </Stack>

                </Stack>
            </LocalizationProvider>
        </ThemeProvider>
    )
}

export default App
