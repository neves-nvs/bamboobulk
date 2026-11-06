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
let injecting = false
let done = false
const tryInject = async () => {
    const timeSheetEntriesContainer = document.querySelector(".TimesheetEntries")
    if (done) return true
    if (!timeSheetEntriesContainer || injecting) return false
    injecting = true
    try {
        await parseTimeSheetAndPopulateData()
        if (!(isTimesheetParsed() && isEditable)) return false
        const clockInAndSummariesContainer = timeSheetEntriesContainer.nextSibling?.firstChild ?? timeSheetEntriesContainer.nextSibling ?? timeSheetEntriesContainer
        clockInAndSummariesContainer.prepend(bulkContainer()) // bulk button and actions logic
        populateEachDay() // each day "del"/"add" buttons and logic
        return done = true
    } catch (e) {
        console.error("Bamboo Bulk inject failed", e)
        return false
    } finally {
        injecting = false
    }
}

// BambooHR mounts the timesheet as a code-split SPA chunk, so keep watching the DOM until it shows up.
const observer = new MutationObserver(async () => {
    if (await tryInject()) observer.disconnect()
})
tryInject().then(ok => ok || observer.observe(document.body, {childList: true, subtree: true}))

// Listen for messages from popup to get projects
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProjects") {
        const respond = () => sendResponse({projects: projects ?? []})
        projects?.length ? respond() : parseTimeSheetAndPopulateData().then(respond, respond)
        return true // Keep the message channel open for async response
    }
})
