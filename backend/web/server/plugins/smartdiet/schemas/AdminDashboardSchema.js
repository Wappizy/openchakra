const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const AdminDashboardSchema = new Schema({
  }, schemaOptions
);

AdminDashboardSchema.virtual('company', DUMMY_REF).get(function() { return null })
AdminDashboardSchema.virtual('diet', DUMMY_REF).get(function() { return null })
AdminDashboardSchema.virtual('start_date', DUMMY_REF).get(function() { return null })
AdminDashboardSchema.virtual('end_date', DUMMY_REF).get(function() { return null })
AdminDashboardSchema.virtual('webinars_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('average_webinar_registar', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('webinars_replayed_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('groups_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('messages_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('leads_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_men_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('user_women_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_no_gender_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`started_coachings`, DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`specificities_users`, DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`reasons_users`, DUMMY_REF).get(function() { return 0 })

AdminDashboardSchema.virtual(`coachings_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_finished`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_stopped`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_dropped`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_ongoing`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_appointments_coaching`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`nut_advices`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_stats`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`calls_stats`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_gender_unknown`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_gender_male`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_gender_female`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_gender_non_binary`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_renewed`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`jobs_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`jobs_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reasons_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reasons_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_stopped_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_dropped_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`leads_by_campain`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`webinars_by_company_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`webinars_by_company_total`, DUMMY_REF).get(function() {return 0})
module.exports = AdminDashboardSchema
