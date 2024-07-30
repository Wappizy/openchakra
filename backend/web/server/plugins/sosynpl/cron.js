const customCron = require("../../utils/cron");
const { checkFreelanceInterest } = require("./mailing");

// Freelance whose availability date hasn't been changed for the past 45 days
customCron.schedule('0 9 * * * *', checkFreelanceInterest)