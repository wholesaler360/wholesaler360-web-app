import { DataTracker } from "./data-tracker-model.js";

// --------------------- Service functions ---------------------- \\

const incrementTrackerService = async (trackerName, date, session) => {
    try {
        const year = date.getFullYear();
        const yearExist = await DataTracker.findOne({ year: year }).session(session);

        if (!yearExist) {
            const updatedTracker = await DataTracker.create([{ year: year, tracker: { [trackerName]: 1 } }], { session });
        } else {
            yearExist.tracker[trackerName] += 1;
            await yearExist.save({ session });
        }

    } catch (error) {
        console.log("Error in incrementTrackerService: ", error);
        return { success: false, errorType: "dataNotUpdated", message: "incrementTrackerService: Unexpected error occurred", data: null };
    }
}