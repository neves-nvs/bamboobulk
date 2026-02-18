const bambooURL = () => `https://${location.hostname}/timesheet/clock/entries`
const projectsURL = () => `https://${location.hostname}/employees/timetracking/projects`

export const doOneDay = async (csrfToken, clockEntries) => {
    await fetch(bambooURL(), {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token": csrfToken,
        },
        body: JSON.stringify({entries: clockEntries}),
    });
}

export const deleteOneDayEntries = async (csrfToken, clockEntries) => {
    await fetch(bambooURL(), {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
            "X-Csrf-Token": csrfToken,
        },
        body: JSON.stringify({entries: clockEntries}),
    });
}

export const fetchProjects = async (csrfToken) => {
    try {
        const response = await fetch(projectsURL(), {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-Csrf-Token": csrfToken,
            },
        });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error("Failed to fetch projects:", error);
        return [];
    }
}