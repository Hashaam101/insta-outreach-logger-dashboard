// types/db.ts

export type ActStatus = 
  | "Active"
  | "Suspended By Team"
  | "Suspended By Insta"
  | "Discarded";

export type ElogType = 
  | "Outreach"
  | "Change in Tar Info"
  | "Tar Exception Toggle"
  | "User"
  | "System";

export type OprStatus = 
  | "online"
  | "offline";

export type TarStatus = 
  | "Cold No Reply"
  | "Replied"
  | "Warm"
  | "Booked"
  | "Paid"
  | "Tableturnerr Client"
  | "Excluded";

export type GoalFrequency = "Daily" | "Monthly";

export type GoalMetric = 
  | "Total Messages Sent"
  | "Unique Profiles Contacted"
  | "Replies Received"
  | "Warm Leads Generated"
  | "Bookings Made"
  | "Payments Received";

export type GoalStatus = "Active" | "Pending Suggestion" | "Rejected" | "Archived";

export type RuleType = "Frequency Cap" | "Interval Spacing";

export interface Operator {
  OPR_ID: string;
  OPR_EMAIL: string;
  OPR_NAME: string;
  OPR_STATUS: OprStatus;
  CREATED_AT: Date;
  LAST_ACTIVITY: Date;
}

export interface Actor {
  ACT_ID: string;
  ACT_USERNAME: string;
  OPR_ID: string;
  ACT_STATUS: ActStatus;
  CREATED_AT: Date;
  LAST_ACTIVITY: Date;
}

export interface Target {
  TAR_ID: string;
  TAR_USERNAME: string;
  TAR_STATUS: TarStatus;
  FIRST_CONTACTED: Date;
  NOTES: string;
  LAST_UPDATED: Date;
  EMAIL: string;
  PHONE_NUM: string;
  CONT_SOURCE: string;
}

export interface EventLog {
  ELG_ID: string;
  EVENT_TYPE: ElogType;
  ACT_ID: string;
  OPR_ID: string;
  TAR_ID: string;
  DETAILS?: string;
  CREATED_AT: Date;
}

export interface OutreachLog {
  OLG_ID: string;
  ELG_ID: string;
  MESSAGE_TEXT: string;
  SENT_AT: Date;
}

export interface Goal {
  GOAL_ID: string;
  METRIC: GoalMetric;
  TARGET_VALUE: number;
  FREQUENCY: GoalFrequency;
  ASSIGNED_TO_OPR?: string;
  ASSIGNED_TO_ACT?: string;
  STATUS: GoalStatus;
  SUGGESTED_BY?: string;
  CREATED_AT: Date;
  START_DATE: Date;
  END_DATE?: Date;
}

export interface Rule {
  RULE_ID: string;
  TYPE: RuleType;
  METRIC: GoalMetric;
  LIMIT_VALUE: number;
  TIME_WINDOW_SEC: number;
  SEVERITY: string;
  ASSIGNED_TO_OPR?: string;
  ASSIGNED_TO_ACT?: string;
  STATUS: GoalStatus;
  SUGGESTED_BY?: string;
  CREATED_AT: Date;
}
