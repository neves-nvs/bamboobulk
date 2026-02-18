import "./content-style.css"
import {
    isEditable,
    isTimesheetParsed,
    parseTimeSheetAndPopulateData,
    projects
} from "./timesheetData.js";
import {populateEachDay} from "./oneDay.js";
import {bulkContainer} from "./bulk.js";
import {fetchProjects} from "./api.js";

//TODO: refactor the logic not to be dependent on site design changes, but only on actual raw data
const timeSheetEntriesContainer = document.querySelector(".TimesheetEntries")

if(timeSheetEntriesContainer){
    parseTimeSheetAndPopulateData()

    if(isTimesheetParsed() && isEditable) {
        const clockInAndSummariesContainer = timeSheetEntriesContainer.nextSibling?.firstChild ?? timeSheetEntriesContainer.nextSibling ?? timeSheetEntriesContainer
        clockInAndSummariesContainer.prepend(bulkContainer()) // bulk button and actions logic
        populateEachDay() // each day "del"/"add" buttons and logic
    }
}

// Listen for messages from popup to get projects
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProjects") {
        // Return projects from parsed timesheet data or fetch them
        if (projects && projects.length > 0) {
            sendResponse({ projects: projects });
        } else {
            // Try to fetch projects from the page data
            const timesheetJsonEl = document.getElementById("js-timesheet-data");
            if (timesheetJsonEl) {
                const timesheetJson = JSON.parse(timesheetJsonEl.textContent);

                // Parse projectsWithTasks structure
                const projectsWithTasks = timesheetJson?.projectsWithTasks;
                let projectsData = [];

                if (projectsWithTasks && projectsWithTasks.byId) {
                    // Convert from byId object to array format
                    projectsData = Object.values(projectsWithTasks.byId).map(project => {
                        // Convert tasks from byId format to array
                        const tasks = project.tasks?.byId ? Object.values(project.tasks.byId) : [];
                        return {
                            id: project.id,
                            name: project.name,
                            tasks: tasks
                        };
                    });
                } else {
                    projectsData = timesheetJson?.projects || [];
                }

                sendResponse({ projects: projectsData });
            } else {
                sendResponse({ projects: [] });
            }
        }
        return true; // Keep the message channel open for async response
    }
});


