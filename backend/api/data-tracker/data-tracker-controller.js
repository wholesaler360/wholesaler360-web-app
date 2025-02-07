import { DataTracker } from "./data-tracker-model.js";

// --------------------- Service functions ---------------------- \\

const incrementTrackerService = async (trackerName, date, session) => {
    try {
        const year = date.getFullYear();
        const yearExist = await DataTracker.findOne({ year: year }).session(session);

        let updatedTracker;

        if (!yearExist) {
            updatedTracker = await DataTracker.create([{ year: year, tracker: { [trackerName]: 1 } }], { session });
            
        } else {
            yearExist.tracker[trackerName] += 1;
            updatedTracker = await yearExist.save({ session });
        }

        if (!updatedTracker) {
            return { success: false, errorType: "dataNotUpdated", message: "incrementTrackerService: Data not updated", data: null };
        }

        const data = { year: updatedTracker[0].year, [trackerName]: updatedTracker[0].tracker[trackerName] };

        return { success: true, errorType: null, message: "incrementTrackerService: Data updated successfully", data: data };

    } catch (error) {
        console.log("Error in incrementTrackerService: ", error);
        return { success: false, errorType: "dataNotUpdated", message: "incrementTrackerService: Unexpected error occurred", data: null };
    }
}

export { incrementTrackerService };