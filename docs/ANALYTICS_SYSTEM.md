# ApneDoctors Analytics System
## Production-Grade User Behavior Tracking Schema

---

# 📊 MASTER ANALYTICS ARCHITECTURE

## Overview
This document defines an enterprise-grade, event-level analytics system designed to track every meaningful user interaction across the ApneDoctors AI medical platform.

---

# 🗂️ EXCEL SHEET STRUCTURES

---

## Sheet 1: Users_Master

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| user_id | UUID | Unique user identifier | `usr_8f3a2b1c-4d5e-6f7g` |
| created_at | TIMESTAMP | Account creation timestamp | `2024-01-15T09:30:00Z` |
| email | STRING | User email (hashed for privacy) | `hash_abc123...` |
| auth_provider | ENUM | Authentication method | `email`, `google`, `apple` |
| user_role | ENUM | User type in system | `patient`, `doctor`, `admin` |
| plan_type | ENUM | Subscription tier | `free`, `pro`, `enterprise` |
| plan_started_at | TIMESTAMP | When current plan began | `2024-02-01T00:00:00Z` |
| lifetime_sessions | INT | Total sessions ever | `147` |
| lifetime_ai_prompts | INT | Total AI interactions | `892` |
| lifetime_assessments | INT | Total clinical assessments | `23` |
| lifetime_documents | INT | Total documents analyzed | `45` |
| first_ai_usage_at | TIMESTAMP | First AI feature usage | `2024-01-15T09:35:00Z` |
| last_active_at | TIMESTAMP | Most recent activity | `2024-03-20T14:22:00Z` |
| days_since_signup | INT | Account age in days | `64` |
| total_active_days | INT | Days with any activity | `42` |
| engagement_score | FLOAT | Calculated engagement (0-100) | `78.5` |
| power_user_index | FLOAT | AI power user score (0-100) | `85.2` |
| churn_risk_score | FLOAT | Likelihood to churn (0-1) | `0.12` |
| country | STRING | User location | `India` |
| timezone | STRING | User timezone | `Asia/Kolkata` |
| device_primary | STRING | Most used device type | `mobile` |
| browser_primary | STRING | Most used browser | `Chrome` |
| referred_by | STRING | Acquisition source | `google_ads`, `organic`, `referral` |
| referral_code | STRING | If referred by user | `REF_dr_sharma` |

---

## Sheet 2: Auth_Events

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| event_id | UUID | Unique event identifier | `evt_1a2b3c4d` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| timestamp | TIMESTAMP | Event timestamp (UTC) | `2024-03-20T14:22:00Z` |
| event_type | ENUM | Type of auth event | `login_attempt`, `login_success`, `login_failed`, `logout`, `password_reset_request`, `password_reset_complete`, `mfa_challenge`, `mfa_success`, `mfa_failed`, `session_refresh`, `session_expired`, `signup_started`, `signup_completed`, `signup_abandoned`, `email_verified`, `account_locked`, `account_unlocked` |
| auth_method | ENUM | Authentication method used | `email_password`, `google_oauth`, `magic_link` |
| ip_address | STRING | Anonymized IP hash | `hash_ip_xyz` |
| user_agent | STRING | Browser/device info | `Mozilla/5.0...` |
| device_type | ENUM | Device category | `desktop`, `mobile`, `tablet` |
| os | STRING | Operating system | `iOS 17.2`, `Windows 11` |
| browser | STRING | Browser name/version | `Chrome 122` |
| geo_country | STRING | Country from IP | `India` |
| geo_city | STRING | City from IP | `Mumbai` |
| failure_reason | STRING | If failed, why | `invalid_password`, `account_not_found`, `rate_limited` |
| attempt_count | INT | Sequential attempt number | `3` |
| time_to_complete_ms | INT | Time from start to success | `2340` |
| referrer_url | STRING | Where user came from | `https://google.com/search...` |
| landing_page | STRING | First page visited | `/` |
| utm_source | STRING | Campaign source | `google` |
| utm_medium | STRING | Campaign medium | `cpc` |
| utm_campaign | STRING | Campaign name | `clinical_ai_launch` |

---

## Sheet 3: Session_Tracking

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| session_id | UUID | Unique session identifier | `ses_9x8y7z6w` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| started_at | TIMESTAMP | Session start time | `2024-03-20T14:00:00Z` |
| ended_at | TIMESTAMP | Session end time | `2024-03-20T14:45:00Z` |
| duration_seconds | INT | Total session length | `2700` |
| active_duration_seconds | INT | Time actively engaged | `2100` |
| idle_duration_seconds | INT | Time idle (no interaction) | `600` |
| pages_viewed | INT | Total page views | `12` |
| unique_pages | INT | Unique pages visited | `7` |
| ai_interactions | INT | AI prompts sent | `8` |
| ai_tokens_consumed | INT | Total tokens used | `4520` |
| assessments_started | INT | Clinical assessments begun | `1` |
| assessments_completed | INT | Assessments finished | `1` |
| documents_uploaded | INT | Documents uploaded | `2` |
| documents_analyzed | INT | Documents processed by AI | `2` |
| live_sessions_started | INT | Live consultations begun | `1` |
| live_session_duration_s | INT | Time in live consultation | `480` |
| camera_enabled | BOOLEAN | Used camera feature | `true` |
| mic_enabled | BOOLEAN | Used voice feature | `true` |
| errors_encountered | INT | Errors during session | `0` |
| rage_clicks | INT | Frustrated rapid clicks | `0` |
| bounce | BOOLEAN | Single page then left | `false` |
| conversion_event | STRING | Key action completed | `assessment_completed` |
| device_type | ENUM | Device used | `mobile` |
| browser | STRING | Browser used | `Safari` |
| os | STRING | Operating system | `iOS 17.2` |
| screen_resolution | STRING | Screen size | `1170x2532` |
| viewport_size | STRING | Browser viewport | `390x844` |
| connection_type | STRING | Network type | `4g`, `wifi` |
| entry_page | STRING | First page of session | `/` |
| exit_page | STRING | Last page of session | `/clinical-assessment` |
| referrer | STRING | Traffic source | `direct` |

---

## Sheet 4: Page_Views

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| view_id | UUID | Unique view identifier | `vw_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| timestamp | TIMESTAMP | View timestamp | `2024-03-20T14:05:00Z` |
| page_path | STRING | URL path | `/clinical-assessment` |
| page_title | STRING | Page title | `Clinical Assessment - ApneDoctors` |
| page_category | ENUM | Page type | `landing`, `assessment`, `live`, `document`, `dashboard`, `settings`, `auth` |
| previous_page | STRING | Referrer page path | `/` |
| time_on_page_ms | INT | Time spent on page | `45000` |
| scroll_depth_percent | INT | Max scroll depth | `85` |
| scroll_depth_pixels | INT | Max scroll in pixels | `2400` |
| interactions_count | INT | Clicks/taps on page | `12` |
| form_interactions | INT | Form field touches | `8` |
| video_plays | INT | Videos played | `0` |
| visible_duration_ms | INT | Time page was in focus | `42000` |
| hidden_duration_ms | INT | Time page was in background | `3000` |
| load_time_ms | INT | Page load time | `1250` |
| first_contentful_paint | INT | FCP metric | `800` |
| largest_contentful_paint | INT | LCP metric | `1100` |
| cumulative_layout_shift | FLOAT | CLS metric | `0.05` |
| first_input_delay | INT | FID metric | `45` |
| is_bounce | BOOLEAN | User left after this page | `false` |
| is_exit | BOOLEAN | Last page of session | `false` |

---

## Sheet 5: Button_Clicks

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| click_id | UUID | Unique click identifier | `clk_xyz789` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| timestamp | TIMESTAMP | Click timestamp | `2024-03-20T14:10:00Z` |
| page_path | STRING | Page where click occurred | `/clinical-assessment` |
| element_id | STRING | DOM element ID | `btn-start-assessment` |
| element_class | STRING | CSS classes | `btn-primary cta-main` |
| element_text | STRING | Button text content | `Start Assessment` |
| element_type | ENUM | Element category | `button`, `link`, `card`, `icon`, `nav_item`, `form_submit`, `toggle`, `dropdown` |
| feature_area | ENUM | Feature category | `navigation`, `assessment`, `ai_chat`, `document`, `live`, `settings`, `auth` |
| action_type | ENUM | Action category | `navigation`, `submit`, `toggle`, `expand`, `ai_trigger`, `upload`, `download`, `copy`, `share` |
| click_x | INT | X coordinate | `245` |
| click_y | INT | Y coordinate | `680` |
| viewport_x | INT | Viewport width | `390` |
| viewport_y | INT | Viewport height | `844` |
| time_since_page_load_ms | INT | Time since page loaded | `5200` |
| time_since_last_click_ms | INT | Time since previous click | `1800` |
| hover_duration_ms | INT | Time hovered before click | `450` |
| is_rage_click | BOOLEAN | Part of rage click pattern | `false` |
| rage_click_sequence | INT | Position in rage sequence | `null` |
| resulted_in_navigation | BOOLEAN | Caused page change | `true` |
| resulted_in_error | BOOLEAN | Caused error | `false` |
| metadata | JSON | Additional context | `{"step": 2, "total_steps": 8}` |

---

## Sheet 6: AI_Usage_Events

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| ai_event_id | UUID | Unique AI event identifier | `ai_evt_123abc` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| timestamp | TIMESTAMP | Event timestamp | `2024-03-20T14:15:00Z` |
| ai_feature | ENUM | AI feature used | `clinical_triage`, `document_analysis`, `live_vision`, `symptom_analysis`, `emergency_check`, `report_generation`, `pose_analysis`, `object_detection` |
| event_type | ENUM | Event category | `prompt_sent`, `response_received`, `response_error`, `response_regenerated`, `response_copied`, `response_downloaded`, `response_shared`, `response_rated`, `response_dismissed` |
| prompt_text | STRING | User input (truncated) | `I have pain in my left knee...` |
| prompt_length_chars | INT | Input character count | `156` |
| prompt_tokens | INT | Estimated input tokens | `42` |
| response_length_chars | INT | Output character count | `1840` |
| response_tokens | INT | Output tokens used | `512` |
| response_time_ms | INT | Time to first token | `1250` |
| total_generation_time_ms | INT | Full response time | `3400` |
| model_used | STRING | AI model identifier | `gemini-2.5-pro` |
| confidence_score | FLOAT | AI confidence (0-1) | `0.87` |
| triage_level | ENUM | Medical triage result | `GREEN`, `AMBER`, `RED`, `null` |
| time_reading_response_ms | INT | Time user spent reading | `45000` |
| scroll_depth_in_response | INT | How much of response seen | `100` |
| response_helpful | BOOLEAN | User marked helpful | `true` |
| response_rating | INT | User rating (1-5) | `5` |
| follow_up_prompt | BOOLEAN | User sent follow-up | `true` |
| copy_to_clipboard | BOOLEAN | User copied response | `false` |
| download_response | BOOLEAN | User downloaded | `false` |
| share_response | BOOLEAN | User shared | `false` |
| error_type | STRING | If error, what type | `null` |
| error_message | STRING | Error details | `null` |
| retry_count | INT | Times user retried | `0` |
| context_data | JSON | Additional context | `{"body_part": "knee", "pain_level": 6}` |

---

## Sheet 7: Live_AI_Interactions

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| interaction_id | UUID | Unique interaction ID | `liv_int_456def` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| live_session_id | UUID | Live consultation ID | `live_789ghi` |
| timestamp | TIMESTAMP | Interaction timestamp | `2024-03-20T14:20:00Z` |
| interaction_type | ENUM | Type of interaction | `voice_input`, `voice_output`, `camera_frame_analyzed`, `vision_detection`, `triage_update`, `session_start`, `session_end`, `session_pause`, `session_resume` |
| voice_input_duration_ms | INT | Voice input length | `3500` |
| voice_input_text | STRING | Transcribed text | `My knee hurts when I walk` |
| voice_output_duration_ms | INT | AI voice response length | `5200` |
| voice_output_text | STRING | AI response text | `I understand you're experiencing...` |
| camera_active | BOOLEAN | Camera was on | `true` |
| vision_detections_count | INT | Objects/issues detected | `2` |
| vision_detection_types | ARRAY | Types detected | `["swelling", "redness"]` |
| vision_severity | ENUM | Detected severity | `moderate` |
| vision_confidence | FLOAT | Detection confidence | `0.82` |
| current_triage_level | ENUM | Triage at this point | `AMBER` |
| triage_changed | BOOLEAN | Triage level changed | `true` |
| triage_previous | ENUM | Previous triage level | `GREEN` |
| red_flags_detected | ARRAY | Medical red flags | `["limited_mobility"]` |
| symptoms_extracted | ARRAY | Symptoms mentioned | `["pain", "swelling", "difficulty_walking"]` |
| body_part_mentioned | STRING | Body part referenced | `left_knee` |
| latency_stt_ms | INT | Speech-to-text latency | `280` |
| latency_ai_ms | INT | AI processing latency | `850` |
| latency_tts_ms | INT | Text-to-speech latency | `320` |
| total_round_trip_ms | INT | Total interaction time | `1450` |
| user_interrupted | BOOLEAN | User interrupted AI | `false` |
| silence_duration_ms | INT | Silence before response | `2100` |
| background_noise_level | FLOAT | Audio quality metric | `0.15` |
| network_quality | ENUM | Connection quality | `good` |

---

## Sheet 8: Feature_Adoption

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| adoption_id | UUID | Unique record ID | `adp_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| feature_name | ENUM | Feature identifier | `clinical_assessment`, `document_analysis`, `live_consultation`, `ai_triage`, `vision_analysis`, `voice_input`, `report_generation`, `doctor_dashboard` |
| first_used_at | TIMESTAMP | First feature usage | `2024-01-20T10:30:00Z` |
| last_used_at | TIMESTAMP | Most recent usage | `2024-03-20T14:15:00Z` |
| total_uses | INT | Total times used | `45` |
| uses_last_7_days | INT | Uses in past week | `8` |
| uses_last_30_days | INT | Uses in past month | `23` |
| avg_uses_per_session | FLOAT | Average per session | `1.8` |
| avg_time_per_use_ms | INT | Average duration | `180000` |
| completion_rate | FLOAT | % completed successfully | `0.92` |
| error_rate | FLOAT | % resulted in error | `0.02` |
| abandonment_rate | FLOAT | % abandoned mid-flow | `0.06` |
| satisfaction_avg | FLOAT | Avg satisfaction rating | `4.5` |
| days_to_first_use | INT | Days from signup to use | `0` |
| is_power_feature | BOOLEAN | Advanced feature | `true` |
| discovery_source | STRING | How user found feature | `homepage_cta`, `navigation`, `ai_suggestion` |
| feature_depth_score | FLOAT | How deeply used (0-1) | `0.85` |

---

## Sheet 9: Time_Spent_Analytics

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| time_id | UUID | Unique record ID | `tm_xyz789` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| date | DATE | Calendar date | `2024-03-20` |
| total_time_ms | BIGINT | Total time in app | `2700000` |
| active_time_ms | BIGINT | Active engagement time | `2100000` |
| idle_time_ms | BIGINT | Idle/background time | `600000` |
| time_on_landing | INT | Time on landing page | `45000` |
| time_on_assessment | INT | Time in assessments | `480000` |
| time_on_live | INT | Time in live sessions | `720000` |
| time_on_documents | INT | Time on doc analysis | `360000` |
| time_on_dashboard | INT | Time on dashboard | `180000` |
| time_on_settings | INT | Time on settings | `60000` |
| time_reading_ai | INT | Time reading AI output | `420000` |
| time_inputting | INT | Time typing/speaking | `180000` |
| time_waiting_ai | INT | Time waiting for AI | `54000` |
| avg_session_duration | INT | Avg session length | `540000` |
| longest_session | INT | Longest session | `1200000` |
| sessions_count | INT | Number of sessions | `5` |
| peak_hour | INT | Most active hour (0-23) | `14` |
| weekday | INT | Day of week (1-7) | `3` |
| is_weekend | BOOLEAN | Weekend activity | `false` |

---

## Sheet 10: Error_Tracking

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| error_id | UUID | Unique error ID | `err_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| timestamp | TIMESTAMP | Error timestamp | `2024-03-20T14:25:00Z` |
| error_type | ENUM | Error category | `api_error`, `validation_error`, `network_error`, `auth_error`, `ai_error`, `upload_error`, `camera_error`, `mic_error`, `timeout`, `unknown` |
| error_code | STRING | Error code | `AI_GATEWAY_429` |
| error_message | STRING | Error message | `Rate limit exceeded` |
| error_stack | STRING | Stack trace (truncated) | `Error at handleSubmit...` |
| page_path | STRING | Page where error occurred | `/live` |
| feature_context | STRING | Feature in use | `live_vision_analysis` |
| action_attempted | STRING | What user tried to do | `analyze_camera_frame` |
| severity | ENUM | Error severity | `warning`, `error`, `critical` |
| is_blocking | BOOLEAN | Prevented user progress | `false` |
| user_action_after | ENUM | What user did next | `retry`, `abandon`, `contact_support`, `continue`, `refresh` |
| retry_count | INT | Times user retried | `2` |
| retry_successful | BOOLEAN | Retry worked | `true` |
| time_to_resolve_ms | INT | Time until resolved | `5000` |
| network_type | STRING | Network at error time | `4g` |
| browser | STRING | Browser at error | `Chrome 122` |
| os | STRING | OS at error | `Android 14` |
| device_memory_gb | FLOAT | Device memory | `8` |
| battery_level | FLOAT | Battery percentage | `0.45` |
| is_low_power_mode | BOOLEAN | Power saving on | `false` |

---

## Sheet 11: Funnel_Tracking

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| funnel_id | UUID | Unique funnel record | `fnl_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| session_id | UUID | Session identifier | `ses_9x8y7z6w` |
| funnel_name | ENUM | Funnel identifier | `signup_to_first_assessment`, `landing_to_live`, `document_upload_to_analysis`, `assessment_complete_flow`, `onboarding_flow` |
| started_at | TIMESTAMP | Funnel entry time | `2024-03-20T14:00:00Z` |
| completed_at | TIMESTAMP | Funnel completion time | `2024-03-20T14:35:00Z` |
| is_completed | BOOLEAN | Reached end | `true` |
| current_step | INT | Current/final step | `8` |
| total_steps | INT | Total steps in funnel | `8` |
| drop_off_step | INT | Step where dropped | `null` |
| drop_off_reason | STRING | Why user dropped | `null` |
| time_in_funnel_ms | INT | Total time in funnel | `2100000` |
| time_per_step | JSON | Time at each step | `{"1": 45000, "2": 60000, ...}` |
| steps_visited | ARRAY | Steps user visited | `[1, 2, 3, 4, 5, 6, 7, 8]` |
| steps_revisited | ARRAY | Steps visited twice | `[3]` |
| back_button_uses | INT | Times went back | `1` |
| errors_in_funnel | INT | Errors encountered | `0` |
| ai_assists_in_funnel | INT | AI interactions | `3` |
| entry_source | STRING | How user entered | `cta_hero`, `nav_menu`, `direct` |
| device_type | STRING | Device used | `mobile` |
| conversion_value | FLOAT | Revenue if converted | `0` |

---

## Sheet 12: Retention_Cohorts

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| cohort_id | STRING | Cohort identifier | `2024-W12` |
| cohort_type | ENUM | Cohort grouping | `weekly`, `monthly`, `feature_based`, `plan_based` |
| cohort_start_date | DATE | Cohort start | `2024-03-18` |
| user_id | UUID | User in cohort | `usr_8f3a2b1c` |
| signup_date | DATE | User signup date | `2024-03-18` |
| day_0_active | BOOLEAN | Active on signup day | `true` |
| day_1_active | BOOLEAN | Active day 1 | `true` |
| day_3_active | BOOLEAN | Active day 3 | `true` |
| day_7_active | BOOLEAN | Active day 7 | `true` |
| day_14_active | BOOLEAN | Active day 14 | `false` |
| day_30_active | BOOLEAN | Active day 30 | `true` |
| day_60_active | BOOLEAN | Active day 60 | `null` |
| day_90_active | BOOLEAN | Active day 90 | `null` |
| week_1_sessions | INT | Sessions in week 1 | `5` |
| week_2_sessions | INT | Sessions in week 2 | `3` |
| week_3_sessions | INT | Sessions in week 3 | `4` |
| week_4_sessions | INT | Sessions in week 4 | `2` |
| total_revenue | FLOAT | Revenue from user | `0` |
| plan_at_signup | STRING | Initial plan | `free` |
| current_plan | STRING | Current plan | `free` |
| upgraded | BOOLEAN | Ever upgraded | `false` |
| churned | BOOLEAN | Has churned | `false` |
| churned_at | DATE | Churn date | `null` |
| reactivated | BOOLEAN | Returned after churn | `false` |
| acquisition_source | STRING | How acquired | `organic_search` |
| first_feature_used | STRING | First feature | `clinical_assessment` |

---

## Sheet 13: Power_User_Scoring

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| score_id | UUID | Unique score record | `scr_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| calculated_at | TIMESTAMP | Score calculation time | `2024-03-20T23:59:00Z` |
| engagement_score | FLOAT | Overall engagement (0-100) | `78.5` |
| frequency_score | FLOAT | Visit frequency (0-100) | `72.0` |
| depth_score | FLOAT | Feature depth (0-100) | `85.0` |
| recency_score | FLOAT | Recency of activity (0-100) | `95.0` |
| ai_power_index | FLOAT | AI usage intensity (0-100) | `82.5` |
| feature_adoption_score | FLOAT | Features used (0-100) | `68.0` |
| stickiness_score | FLOAT | DAU/MAU ratio (0-100) | `45.0` |
| session_quality_score | FLOAT | Session engagement (0-100) | `88.0` |
| churn_risk_score | FLOAT | Likelihood to churn (0-1) | `0.12` |
| expansion_potential | FLOAT | Upgrade likelihood (0-1) | `0.65` |
| nps_score | INT | Net promoter score | `9` |
| user_segment | ENUM | User category | `power_user`, `regular`, `at_risk`, `dormant`, `churned` |
| days_active_last_30 | INT | Active days in month | `18` |
| sessions_last_30 | INT | Sessions in month | `25` |
| ai_prompts_last_30 | INT | AI uses in month | `89` |
| features_used_ever | INT | Total features used | `6` |
| features_used_last_30 | INT | Features used recently | `5` |
| avg_session_duration | INT | Avg session length (ms) | `720000` |
| longest_streak_days | INT | Longest daily streak | `12` |
| current_streak_days | INT | Current streak | `5` |

---

## Sheet 14: Revenue_Plan_Usage

| Column Name | Data Type | Description | Example Value |
|-------------|-----------|-------------|---------------|
| record_id | UUID | Unique record ID | `rev_abc123` |
| user_id | UUID | User identifier | `usr_8f3a2b1c` |
| date | DATE | Record date | `2024-03-20` |
| current_plan | ENUM | Active plan | `free`, `pro`, `enterprise` |
| plan_price_monthly | FLOAT | Plan price | `0` |
| mrr_contribution | FLOAT | Monthly recurring revenue | `0` |
| ltv_current | FLOAT | Lifetime value so far | `0` |
| ltv_predicted | FLOAT | Predicted LTV | `49.99` |
| ai_tokens_used_today | INT | Tokens consumed today | `2500` |
| ai_tokens_limit | INT | Daily token limit | `10000` |
| ai_tokens_percent_used | FLOAT | % of limit used | `0.25` |
| assessments_today | INT | Assessments today | `1` |
| assessments_limit | INT | Daily assessment limit | `3` |
| documents_today | INT | Documents today | `2` |
| documents_limit | INT | Daily document limit | `5` |
| live_minutes_today | INT | Live session minutes | `8` |
| live_minutes_limit | INT | Daily live limit | `15` |
| approaching_limit | BOOLEAN | Near usage limit | `false` |
| hit_limit | BOOLEAN | Hit usage limit | `false` |
| limit_type_hit | STRING | Which limit hit | `null` |
| upgrade_prompt_shown | BOOLEAN | Shown upgrade CTA | `false` |
| upgrade_prompt_clicked | BOOLEAN | Clicked upgrade | `false` |
| payment_method_on_file | BOOLEAN | Has payment method | `false` |
| trial_days_remaining | INT | Trial days left | `null` |

---

# 📊 AI USAGE INTELLIGENCE METRICS

## Calculated Metrics (Daily Aggregation)

| Metric Name | Formula | Description | Example |
|-------------|---------|-------------|---------|
| AI Prompts Per User Per Day | `COUNT(ai_events WHERE event_type='prompt_sent') / COUNT(DISTINCT user_id)` | Average AI interactions per active user | `3.2` |
| Avg Tokens Per Session | `SUM(prompt_tokens + response_tokens) / COUNT(DISTINCT session_id)` | Token consumption per session | `1,250` |
| Avg AI Response Read Time | `AVG(time_reading_response_ms) WHERE time_reading_response_ms > 0` | Time users spend reading AI output | `32,000 ms` |
| AI Dependency Score | `(AI_sessions / Total_sessions) * 100` | % of sessions using AI | `78%` |
| AI Engagement Depth | `AVG(ai_interactions_per_session) * AVG(time_reading_response)` | Composite depth metric | `45.6` |
| AI Fatigue Signal | `COUNT(sessions WHERE ai_prompts > 5 AND last_ai_response_ignored) / COUNT(sessions WHERE ai_prompts > 5)` | Users ignoring AI after heavy use | `0.15` |
| AI Regeneration Rate | `COUNT(response_regenerated) / COUNT(prompt_sent)` | How often users regenerate | `0.08` |
| AI Copy Rate | `COUNT(response_copied) / COUNT(response_received)` | How often users copy output | `0.22` |
| AI Satisfaction Rate | `COUNT(response_helpful=true) / COUNT(response_helpful IS NOT NULL)` | Positive feedback rate | `0.89` |
| Time to First AI Use | `AVG(first_ai_usage_at - created_at)` | Time from signup to first AI | `180 seconds` |

---

# 🏆 POWER USER & ENGAGEMENT SCORING FORMULAS

## Excel-Ready Formulas

### Engagement Score (0-100)
```excel
=MIN(100, (
  (Sessions_Last_30 / 30) * 25 +
  (Days_Active_Last_30 / 30) * 25 +
  (AI_Prompts_Last_30 / 100) * 25 +
  (Features_Used / Total_Features) * 25
))
```

### Stickiness Score (DAU/MAU)
```excel
=ROUND((Daily_Active_Users / Monthly_Active_Users) * 100, 1)
```

### Feature Adoption Score
```excel
=ROUND((Features_Used_By_User / Total_Available_Features) * 100, 1)
```

### AI Power User Index
```excel
=MIN(100, (
  (AI_Prompts_Last_30 / 50) * 30 +
  (Avg_Tokens_Per_Session / 2000) * 20 +
  (AI_Response_Read_Time_Avg / 60000) * 20 +
  (AI_Features_Used / Total_AI_Features) * 15 +
  IF(Uses_Live_AI, 15, 0)
))
```

### Churn Risk Score (0-1)
```excel
=MAX(0, MIN(1, (
  (1 - (Days_Since_Last_Active / 30)) * 0.3 +
  (1 - (Sessions_Last_30 / 10)) * 0.25 +
  (1 - (Engagement_Score / 100)) * 0.25 +
  (Error_Rate_Last_30 * 2) * 0.1 +
  IF(Hit_Usage_Limit, 0.1, 0)
)))
```

### Expansion Potential Score (0-1)
```excel
=MAX(0, MIN(1, (
  (AI_Prompts_Last_30 / 100) * 0.25 +
  (Features_Used / Total_Features) * 0.25 +
  IF(Approaching_Limit, 0.2, 0) +
  (Engagement_Score / 100) * 0.15 +
  (1 - Churn_Risk_Score) * 0.15
)))
```

### User Segment Classification
```excel
=IF(Churn_Risk_Score > 0.7, "churned",
  IF(Days_Since_Last_Active > 30, "dormant",
    IF(Churn_Risk_Score > 0.4, "at_risk",
      IF(Engagement_Score > 70, "power_user", "regular")
    )
  )
)
```

---

# 📈 DASHBOARD-READY VIEWS

## Key Metrics Dashboard

| Metric | Formula | Refresh Rate |
|--------|---------|--------------|
| Daily Active Users (DAU) | `COUNT(DISTINCT user_id) WHERE date = TODAY` | Real-time |
| Weekly Active Users (WAU) | `COUNT(DISTINCT user_id) WHERE date >= TODAY-7` | Hourly |
| Monthly Active Users (MAU) | `COUNT(DISTINCT user_id) WHERE date >= TODAY-30` | Daily |
| DAU/MAU Ratio | `DAU / MAU * 100` | Daily |
| Avg Session Duration | `AVG(session_duration_seconds)` | Hourly |
| AI Adoption Rate | `COUNT(users_with_ai_usage) / COUNT(all_users)` | Daily |
| Assessment Completion Rate | `COUNT(completed) / COUNT(started)` | Hourly |
| Error Rate | `COUNT(errors) / COUNT(all_events) * 100` | Real-time |
| New User Retention D1 | `COUNT(active_day_1) / COUNT(signups) * 100` | Daily |
| New User Retention D7 | `COUNT(active_day_7) / COUNT(signups) * 100` | Daily |
| New User Retention D30 | `COUNT(active_day_30) / COUNT(signups) * 100` | Daily |
| Power User % | `COUNT(power_users) / COUNT(active_users) * 100` | Daily |
| Churn Rate | `COUNT(churned_30d) / COUNT(active_30d_prior) * 100` | Weekly |

---

# 🔧 IMPLEMENTATION NOTES

## Event Collection Points

1. **Frontend (React)**
   - Page views, clicks, scroll depth
   - Form interactions, input timing
   - Error boundaries, network failures
   - Time on page, visibility changes

2. **Backend (Edge Functions)**
   - API call logging
   - AI response metrics
   - Processing times
   - Error tracking

3. **Database (Supabase)**
   - CRUD operations
   - User state changes
   - Session management

## Data Pipeline

```
Frontend Events → Edge Function → Analytics Table → Daily Aggregation → Dashboard
                                                  ↓
                                           Power BI / Tableau / Metabase
```

## Privacy Considerations

- Hash/anonymize PII (emails, IPs)
- Implement data retention policies
- Provide user opt-out mechanisms
- GDPR/HIPAA compliance for medical data

---

# 🎯 SUCCESS METRICS

This analytics system enables:

| Question | How to Answer |
|----------|---------------|
| Who is using the app? | Users_Master + Auth_Events |
| How often? | Session_Tracking + Time_Spent |
| Which features drive retention? | Feature_Adoption + Retention_Cohorts |
| How deeply users engage with AI? | AI_Usage_Events + Live_AI_Interactions |
| Where users drop off? | Funnel_Tracking + Error_Tracking |
| Who are power users? | Power_User_Scoring |
| How AI correlates with value? | AI_Usage + Revenue_Plan_Usage |

---

*This schema is designed to scale to millions of users and integrates directly with BI tools like Power BI, Tableau, Looker, and Metabase.*
