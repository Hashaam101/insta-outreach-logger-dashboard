-- 001_mock_data.sql

-- ==========================================
-- 1. OPERATORS
-- ==========================================
INSERT INTO OPERATORS (OPR_ID, OPR_EMAIL, OPR_NAME, OPR_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('OPR-A1DC2A4B', 'hashaam@example.com', 'Hashaam Zahid', 'online', TO_TIMESTAMP('2025-12-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OPERATORS (OPR_ID, OPR_EMAIL, OPR_NAME, OPR_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('OPR-B2E3F4G5', 'alice.growth@example.com', 'Alice Jenkins', 'online', TO_TIMESTAMP('2025-12-05 09:30:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 11:45:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OPERATORS (OPR_ID, OPR_EMAIL, OPR_NAME, OPR_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('OPR-C3D4E5F6', 'bob.outreach@example.com', 'Bob Smith', 'offline', TO_TIMESTAMP('2025-12-10 08:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-28 18:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- ==========================================
-- 2. ACTORS (Instagram Handles)
-- ==========================================
-- Actor: fitness_guru (Shared by Alice and Hashaam)
INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('ACT-F1A2B3C4', 'fitness_guru', 'OPR-B2E3F4G5', 'Active', TO_TIMESTAMP('2025-12-05 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 11:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('ACT-F1A2B3C5', 'fitness_guru', 'OPR-A1DC2A4B', 'Active', TO_TIMESTAMP('2025-12-20 14:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Actor: tech_insider (Owned by Hashaam)
INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('ACT-T9Y8Z7W6', 'tech_insider', 'OPR-A1DC2A4B', 'Active', TO_TIMESTAMP('2025-12-01 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 09:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Actor: marketing_pro (Owned by Alice)
INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('ACT-M1N2O3P4', 'marketing_pro', 'OPR-B2E3F4G5', 'Active', TO_TIMESTAMP('2025-12-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-29 10:15:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Actor: crypto_whale (Owned by Bob - Suspended)
INSERT INTO ACTORS (ACT_ID, ACT_USERNAME, OPR_ID, ACT_STATUS, CREATED_AT, LAST_ACTIVITY)
VALUES ('ACT-C9B8A7D6', 'crypto_whale', 'OPR-C3D4E5F6', 'Suspended By Insta', TO_TIMESTAMP('2025-12-10 08:30:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-25 12:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- ==========================================
-- 3. TARGETS (Realistic Prospects)
-- ==========================================
INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-X1Y2Z3A4', 'john_doe_fitness', 'Replied', TO_TIMESTAMP('2025-12-20 10:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Interested in personal training program. Asked for pricing.', TO_TIMESTAMP('2025-12-28 15:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'john.doe@gmail.com', 'N/F', 'Hashtag Search');

INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-B5C6D7E8', 'sarah_styles', 'Booked', TO_TIMESTAMP('2025-12-22 11:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'Consultation call scheduled for Jan 5th.', TO_TIMESTAMP('2025-12-29 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'sarah.s@outlook.com', '+1-555-0199', 'Explore Page');

INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-F9G0H1I2', 'mike_travels', 'Cold No Reply', TO_TIMESTAMP('2025-12-25 14:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'Sent initial intro message.', TO_TIMESTAMP('2025-12-25 14:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'N/S', 'N/S', 'Competitor Followers');

INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-J3K4L5M6', 'emma_cooking', 'Warm', TO_TIMESTAMP('2025-12-26 16:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'High engagement on stories. Responded to poll.', TO_TIMESTAMP('2025-12-29 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'emma.cooks@yahoo.com', 'N/F', 'Location Tag: London');

INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-N7O8P9Q0', 'david_tech', 'Paid', TO_TIMESTAMP('2025-12-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Closed quarterly subscription.', TO_TIMESTAMP('2025-12-28 11:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'd.tech@enterprise.com', '+44-20-7946-0958', 'LinkedIn Cross-ref');

INSERT INTO TARGETS (TAR_ID, TAR_USERNAME, TAR_STATUS, FIRST_CONTACTED, NOTES, LAST_UPDATED, EMAIL, PHONE_NUM, CONT_SOURCE)
VALUES ('TAR-R1S2T3U4', 'lisa_yoga', 'Excluded', TO_TIMESTAMP('2025-12-10 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'Already a client via different channel.', TO_TIMESTAMP('2025-12-10 12:00:00', 'YYYY-MM-DD HH24:MI:SS'), 'lisa@yoga.com', 'N/S', 'Direct Website');

-- ==========================================
-- 4. EVENT_LOGS & OUTREACH_LOGS
-- ==========================================

-- Sequence 1: Hashaam finds and messages david_tech
INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
VALUES ('ELG-A1B2C3D4', 'System', 'ACT-T9Y8Z7W6', 'OPR-A1DC2A4B', 'TAR-N7O8P9Q0', 'Identified from tech summit hashtag.', TO_TIMESTAMP('2025-12-15 08:50:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
VALUES ('ELG-E5F6G7H8', 'Outreach', 'ACT-T9Y8Z7W6', 'OPR-A1DC2A4B', 'TAR-N7O8P9Q0', 'Initial proposal message.', TO_TIMESTAMP('2025-12-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
VALUES ('OLG-I9J0K1L2', 'ELG-E5F6G7H8', 'Hey David, saw your talk at the Tech Summit. Would love to show you how our CRM can help your team.', TO_TIMESTAMP('2025-12-15 09:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Sequence 2: Shared Actor Logic (fitness_guru)
-- Alice messages john_doe_fitness
INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
VALUES ('ELG-M3N4O5P6', 'Outreach', 'ACT-F1A2B3C4', 'OPR-B2E3F4G5', 'TAR-X1Y2Z3A4', 'Pitching fat loss plan.', TO_TIMESTAMP('2025-12-20 10:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
VALUES ('OLG-Q7R8S9T0', 'ELG-M3N4O5P6', 'Hi John! Loved your transformation post. We have a new advanced program starting next month.', TO_TIMESTAMP('2025-12-20 10:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Hashaam (also on fitness_guru) follows up
INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
VALUES ('ELG-U1V2W3X4', 'Outreach', 'ACT-F1A2B3C5', 'OPR-A1DC2A4B', 'TAR-X1Y2Z3A4', 'Follow up on Alice initial pitch.', TO_TIMESTAMP('2025-12-22 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
VALUES ('OLG-Y5Z6A7B8', 'ELG-U1V2W3X4', 'Hey John, just checking if you had a chance to look at that program Alice mentioned?', TO_TIMESTAMP('2025-12-22 15:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Sequence 3: sarah_styles booking
INSERT INTO EVENT_LOGS (ELG_ID, EVENT_TYPE, ACT_ID, OPR_ID, TAR_ID, DETAILS, CREATED_AT)
VALUES ('ELG-C9D0E1F2', 'Outreach', 'ACT-M1N2O3P4', 'OPR-B2E3F4G5', 'TAR-B5C6D7E8', 'Influencer collab request.', TO_TIMESTAMP('2025-12-22 11:30:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO OUTREACH_LOGS (OLG_ID, ELG_ID, MESSAGE_TEXT, SENT_AT)
VALUES ('OLG-G3H4I5J6', 'ELG-C9D0E1F2', 'Sarah, your style is incredible! We would love to collaborate on our upcoming spring collection.', TO_TIMESTAMP('2025-12-22 11:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- ==========================================
-- 5. DEMOCRATIC GOALS
-- ==========================================
-- Team Goal: 500 Messages/Day
INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, ASSIGNED_TO_OPR, ASSIGNED_TO_ACT, STATUS, SUGGESTED_BY, CREATED_AT, START_DATE)
VALUES ('GOL-T1E2A3M4', 'Total Messages Sent', 500, 'Daily', NULL, NULL, 'Active', 'OPR-A1DC2A4B', TO_TIMESTAMP('2025-12-01 09:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-01 09:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Hashaam Personal Override: 100 Warm Leads/Month
INSERT INTO GOALS (GOAL_ID, METRIC, TARGET_VALUE, FREQUENCY, ASSIGNED_TO_OPR, ASSIGNED_TO_ACT, STATUS, SUGGESTED_BY, CREATED_AT, START_DATE)
VALUES ('GOL-H1A2S3H4', 'Warm Leads Generated', 100, 'Monthly', 'OPR-A1DC2A4B', NULL, 'Active', 'OPR-A1DC2A4B', TO_TIMESTAMP('2025-12-01 09:05:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2025-12-01 09:05:00', 'YYYY-MM-DD HH24:MI:SS'));

-- ==========================================
-- 6. RULES
-- ==========================================
-- Frequency Cap: 30 messages per hour (3600s)
INSERT INTO RULES (RULE_ID, TYPE, METRIC, LIMIT_VALUE, TIME_WINDOW_SEC, SEVERITY, ASSIGNED_TO_OPR, ASSIGNED_TO_ACT, STATUS, SUGGESTED_BY, CREATED_AT)
VALUES ('RUL-S1A2F3E4', 'Frequency Cap', 'Total Messages Sent', 30, 3600, 'Soft Warning', NULL, NULL, 'Active', 'OPR-A1DC2A4B', TO_TIMESTAMP('2025-12-01 09:10:00', 'YYYY-MM-DD HH24:MI:SS'));