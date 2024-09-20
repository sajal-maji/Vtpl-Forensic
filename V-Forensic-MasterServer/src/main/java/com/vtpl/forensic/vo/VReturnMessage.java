package com.vtpl.forensic.vo;


import java.util.Hashtable;

public class VReturnMessage implements VReturnValues {
	public static Hashtable<Integer, String> returnMessage = new Hashtable<Integer, String>();

	static{

		returnMessage.put(-1, "Call not implemented yet.");

		// GLOBAL
		returnMessage.put(SUCCESS , "SUCCESS!");

		// Va engine related
		returnMessage.put(VA_WARNING, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_ERROR, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_NULLPOINTER, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_SIZEMISMATCH, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARSINGFAILED, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_WRONGFORMAT, "Wrong format of response!\nPlease report the problem.");
		returnMessage.put(VA_OUTOFBOUND, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDVALUE, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_LOWBUFFERSIZE, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_DATAYETNOTPREPARED, "Data yet not prepared.");
		returnMessage.put(VA_LIBRARYYETNOTINITIALIZED, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_LIBRARYALREADYINITIALIZED, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_IMPROPERCALL, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_VA_DUPLICATEID, "Duplicate entry error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDID, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_VALUENOTASSIGNED, "VMS server error!\nPlease report the problem.");

		returnMessage.put(VA_PARAMETERNOTEXIST, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETEROUTOFBOUND, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETERNOTEDITABLE, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDPARAMETERVALUE, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_WRONGPARAMETERSTRINGFORMAT, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_MANDATORYPARAMETERSYETNOTSET, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INSUFFICIENTPARAMETERS, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_NULLPARAMETER, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETERNOTSENT, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETERRECEIVEDSUCCESSFULLY, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETERSPARTIALLYACCEPTED, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INCOMPATIBLEPARAMETERS, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_PARAMETERMULTIPLEDEFINITION, "VMS server error!\nPlease report the problem.");

		returnMessage.put(VA_INVALIDCOORDINATES, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDOPERATION, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDGRAPHICSTYPE, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_TOOMANYOBJECTS, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_INVALIDTOTALCONTROLPARAMETERS, "VMS server error!\nPlease report the problem.");

		returnMessage.put(VA_MEMORYOVERFLOW , "VMS server error!\nPlease report the problem.");

		returnMessage.put(VA_CHANNELNOTEXIST, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_DUPLICATECHANNEL, "VMS server error!\nPlease report the problem.");
		returnMessage.put(VA_CHANNELOVERFLOW, "Maximum number of video channels exceeded!");
		returnMessage.put(VA_CHANNEL_STREAM_END, "Stream ended for this channel.");

		returnMessage.put(VA_TRYAGAIN, "VMS server busy!\nPlease try again.");
		returnMessage.put(VA_WAIT, "VMS server busy!\nPlease try again.");
		returnMessage.put(VA_BUSY, "Analytic server busy!\nPlease try again.");
		returnMessage.put(VA_SEARCH_COMPLETE, "Search Completed.");

		returnMessage.put(VA_EVALUATION_PERIOD_OVER, "");
		returnMessage.put(VA_CONTINUOUS_EVALUATION_OVER, "");
		returnMessage.put(VA_SYSTEM_FILE_CORRUPTED, "");
		returnMessage.put(VA_INVALID_HARDWARE, "");
		returnMessage.put(VA_VALIDITY_EXPIRED, "");
		returnMessage.put(VA_SYS_DATE_ELAPSED, "");
		returnMessage.put(VA_BEYOND_INS, "");
		returnMessage.put(VA_NO_AVAI_LINS, "");
		returnMessage.put(VA_LICENSE_CHECK_FAILED, "");


		returnMessage.put(CALL_NOT_IMPLEMENTED, "Call not implemented.");
		returnMessage.put(CALL_NOT_ALLOWED_IN_DR, "This action is not allowed in DR/Auxiliary");

		// Database related
		returnMessage.put(DB_CONNECTION_ERROR, "DBMS connectivity failure!\n Please check whether DBMS is started or DBMS host is connected.");
		returnMessage.put(DB_STATEMENT_ERROR, "DBMS Statement error!\nPlease report the problem.");
		returnMessage.put(DB_UNKNOWN_ERROR, "DBMS Unknown error!\nPlease report the problem.");
		returnMessage.put(DB_DATA_FORMAT_ERROR, "DBMS data/json format error!\nPlease report the problem.");
		returnMessage.put(DB_DUPLICATE_KEY_ERROR, "DBMS Duplicate key error!\\nPlease report the problem.");

		// USER RELATED
		returnMessage.put(USER_ALREADY_LOGED_IN, "User already logged in the IVMS.\nPlease try again later");
		returnMessage.put(USER_INVALID_USERNAME_PASSWORD, "Invalid username and/or password.");
		returnMessage.put(USER_INVALID_SESSION, "IVMS user login session expired.\n");
		returnMessage.put(USER_PERMISSION_DENIED, "User permission denied to IVMS.\n Please contact administrator.");
		returnMessage.put(USER_DETAILS_NOT_AVAILABLE, "Login failed for user!\nInvalid username and/or password.");
		returnMessage.put(USER_INVALID_PROFILE_AUTHENTICATION, "User details does not match.\n Please enter valid informations.");
		returnMessage.put(USER_PENDING_MESSAGE, "User not online.\nMessage will be delivered at login time.");
		returnMessage.put(USER_INVALID_CLIENT_MACHINE, "Your are not allowed to login to the IVMS from this machine.\nContact Administrator.");
		returnMessage.put(PENDING_CHAT_MESSAGE, "User not online.\nMessage will be delivered once user gets logged-in.");
		returnMessage.put(USER_DEFAULT_USERNAME_PASSWORD, "Default password is being used");
		returnMessage.put(USER_PASSWORD_WEAK, "Your password must have at least eight characters \n One uppercase \n One lowercase character \n One numaric character\n One special character of !@#$&*");

		returnMessage.put(DC_DR_REPLICATOR_NOT_AVAILABLE, "DC-DR Replicator not available.\nRestart the server.");

		// PTZ RELATED
		returnMessage.put(PTZ_TOO_MANY_REQUEST, "Too many PTZ request.\nPlease try again later.");
		returnMessage.put(PTZ_SESSION_OCCUPIED, "Ptz session occupied.\nPlease try again later after 30 sec.");
		returnMessage.put(CAMERA_DRIVER_NOT_AVAILABLE, "Camera Driver not available.\nContact Administrator.");
		returnMessage.put(CAMERA_PARAMETER_NOT_SUPPORTED, "Camera parameter not supported.\nContact Administrator.");

		// CAMERA RELATED
		returnMessage.put(CHANNEL_NOT_AVAILABLE, "Channel info not available.\nPlease try again later.");
		returnMessage.put(CHANNEL_NUMBER_EXIST, "Channel number already exists.\nPlease try with different number.");
		returnMessage.put(CHANNEL_OVERFLOW, "Maximum Channel reached.\nContact Administrator.");
		returnMessage.put(DUPLICATE_CHANNEL_REQUEST, "Duplicate Channel request.\nPlease try with different channel.");
		returnMessage.put(SNAP_NOT_AVIALBLE, "Snap Not Avialable.\nTry after sometime.");

		//Recording details
		returnMessage.put(RECORDING_PROFILE_NOT_AVAILABLE, "Recording profile not available.");
		returnMessage.put(STORAGE_SERCHING_NOT_COMPLETED, "Storage search not completed successfully!\nTry again.");
		returnMessage.put(STORAGE_NOT_AVAILABLE, "Storage not available.");
		returnMessage.put(STORAGE_LOW, "Low Storage.");


		returnMessage.put(SSC_NULL_OBJECT_REQUEST, "Invalid request format.\nContact Administrator.");
		returnMessage.put(SSC_ARGUMENT_MISMATCH, "Invalid request format.\nContact Administrator.");
		returnMessage.put(SSC_TRUNCATED_OBJ_BYTES, "Invalid request format.\nContact Administrator.");
		returnMessage.put(SSC_INVALID_REQUEST_ID, "Invalid request ID.\nContact Administrator.");
		returnMessage.put(SSC_CONNECTION_ERROR, "Cannot connect the IVMS server.");
		returnMessage.put(SSC_SENDING_REQUEST_ERROR, "Failed to write request to the IVMS server.\n Please check network connectivity.");
		returnMessage.put(SSC_ACCESS_RESPONSE_ERROR, "Failed to read response from the IVMS server.\n Please check network connectivity.");
		returnMessage.put(SSC_SERIALIZABLE_ERROR, "Object transformation error.\nPlease try again.");
		returnMessage.put(SSC_FILE_NOT_FOUND, "File not available or invalid installation.");
		returnMessage.put(SSC_FILE_SIZE_OUT_OF_BOUND, "File size too long.\nContact administrator.");

		returnMessage.put(MEDIA_SERVER_CONNECTION_ERROR, "Cannot connect the media server.");
		returnMessage.put(MEDIA_SERVER_SENDING_REQUEST_ERROR, "Failed to write request to the media server.\n Please check network connectivity.");
		returnMessage.put(MEDIA_SERVER_ACCESS_RESPONSE_ERROR, "Failed to read response from the media server.\n Please check network connectivity.");

		returnMessage.put(SUMMARIZATION_SERVER_CONNECTION_ERROR, "Cannot connect the summarization server.");
		returnMessage.put(SUMMARIZATION_SERVER_SENDING_REQUEST_ERROR, "Failed to write request to the summarization server.\n Please check network connectivity.");
		returnMessage.put(SUMMARIZATION_SERVER_ACCESS_RESPONSE_ERROR, "Failed to read response from the summarization server.\n Please check network connectivity.");

		returnMessage.put(ATTRIBUTE_SEARCH_SERVER_CONNECTION_ERROR, "Cannot connect the attribute search server.");
		returnMessage.put(ATTRIBUTE_SEARCH_SERVER_SENDING_REQUEST_ERROR, "Failed to write request to the attribute search server.\n Please check network connectivity.");
		returnMessage.put(ATTRIBUTE_SEARCH_SERVER_ACCESS_RESPONSE_ERROR, "Failed to read response from the attribute search server.\n Please check network connectivity.");


		returnMessage.put(VA_CONNECTION_ERROR, "Cannot connect the analytic server.");
		returnMessage.put(VA_REQUEST_ERROR, "Failed to write request to the analytic server.\n Please check network connectivity.");
		returnMessage.put(VA_RESPONSE_ERROR, "Failed to read response from the analytic server.\n Please check network connectivity.");
		returnMessage.put(VA_WRAPPER_NOT_AVAILABLE, "Analytic server wrapper not available.\n Please check network connectivity.");

		// VMI_Session_Controller Related
		returnMessage.put(STREAMING_INVALID_REQUEST, "Invalid streaming request");
		returnMessage.put(STREAMING_INVALID_SESSION, "Streaming session not available.\nPlease try again after some time.");
		returnMessage.put(STREAMING_INVALID_REQUEST_FORMAT, "Invalid streaming request format.");
		returnMessage.put(SSC_VERSION_MISMATCH, "You are running an older version of client software. \nSoftware upgrade required.");		
		returnMessage.put(CAMERA_LOAD_BALANCING_IS_GOING_ON, "Camera load balancing is going on.");

		returnMessage.put(RECORD_NOT_AVAILABLE, "Record not available.");
		returnMessage.put(MATRIX_SIZE_MISMATCH, "Matrix Size Mismatch.");

		returnMessage.put(LICENSE_CHANNEL_OVER, "Maximum Licensed Camera Reached.\nContact administrator.");
		returnMessage.put(LICENSE_USER_OVER, "Maximum Licensed User Reached.\nContact administrator.");
		returnMessage.put(LICENSE_TIME_OVER, "License Expired.\nContact administrator.");
		returnMessage.put(WATCHDOG_CONNECTION_ERROR, "License Server connection error.\nContact administrator.");
		returnMessage.put(WATCHDOG_RESPONSE_ERROR, "License Server connection error..\nContact administrator.");


		returnMessage.put(INVALID_MEDIA_SERVER_ID, "Invalid media server id!");
		returnMessage.put(MEDIASERVER_NOT_AVAILABLE, "Invalid media server id or the media server is not available!");
		returnMessage.put(NO_MEDIA_SERVER_AVAILABLE, "No media server available!");
		returnMessage.put(NVR_MODE_OFFLINE, "This channel is in offline mode");
		returnMessage.put(NVR_CONF_NOT_FOUND, "NVR Configuration file not found in Server");
		returnMessage.put(NVR_CHANNEL_NOT_REGISTERED, "This channel is not registered in the NVR");

		returnMessage.put(INVALID_VMS_SERVER_ID, "Invalid vms server id!");

		//REST Specific

		returnMessage.put(SUCCESSFULLY_RETRIVED, "Successfully Retrieved!");
		returnMessage.put(SUCCESSFULLY_UPDATED, "Successfully Updated!");
		returnMessage.put(LOGIN_SUCCESSFUL, "Login Successful!");
		returnMessage.put(LOGOUT_SUCCESSFUL, "Logout Successful!");
		returnMessage.put(LOGOUT_FAILURE, "Logout Failure!");
		returnMessage.put(WADL_GENERATION_SUCCESS, "Successfully generated WADL definition!");
		returnMessage.put(SUCCESSFULLY_APPLIED, "Successfully Applied!");

		returnMessage.put(UNABLE_TO_RETRIVED, "Failed to Retrieved!");
		returnMessage.put(UNABLE_TO_PROCESS, "Failed to process! Please check your request parameters!");
		returnMessage.put(UNKNOWN_RESOURCE_EXCEPTION, "There is no resource to the requested path!");
		returnMessage.put(NOT_IMPLEMENTED, "The requested resource is not implemented!");
		returnMessage.put(NOT_FOUND, "The requested resource was not found!");
		returnMessage.put(CLASS_NOT_FOUND, "No class definition exception!");
		returnMessage.put(MISSING_REQUEST_PARAMETER, "Missing one or more mandatory request parameter(s)!");
		returnMessage.put(ILLEGAL_ARGUMENT, "Illegal argument exception was raised!");
		returnMessage.put(NULL_POINTER_EXCEPTION, "Null pointer exception was raised!");
		returnMessage.put(RUNTIME_EXCEPTION, "Runtime exception occurred!");
		returnMessage.put(HTTP_REST_CALL_EXCEPTION, "An REST call exception occurred!");

		returnMessage.put(MISSING_VMSSESSIONID, "VMSSESSIONID is invalid or not present in the request!");
		returnMessage.put(NO_PROFILE, "There is no profile defined in VMS or invalid profile id!");
		returnMessage.put(NO_LOCATION, "There is no location defined or invalid location id in Central Server!");
		returnMessage.put(NO_VMSIP, "VMS local ip and fixed ip not defined in Central Server!");
		returnMessage.put(NO_CHANNEL, "There is no channel or invalid channel id!");
		returnMessage.put(NO_ENTERPRISE, "There is no enterprise or invalid enterprise id!");
		returnMessage.put(NO_SITE, "There is no site or invalid site id!");
		returnMessage.put(INVALID_IP_ADDRESS, "Invalid ip address! ipv4 should be in xxx.xxx.xxx.xxx format!");
		returnMessage.put(INVALID_EMAIL_ADDRESS, "Invalid userid/email address! UserId/Email should be in xxxxx@xxxx.xxx format!");
		returnMessage.put(INVALID_PHONENUMBER, "Invalid phone/mobile number or country/std code!");
		returnMessage.put(INVALID_POSTALCODE, "Invalid postal code!");
		returnMessage.put(INVALID_USER_PASSWORD, "Invalid username and/or password!");
		returnMessage.put(CENTRAL_SESSION_ACTIVE, "Central session is active! Please logout first.");
		returnMessage.put(CENTRAL_SESSION_DISABLED, "Central session is disabled!\nContact administrator.");
		//returnMessage.put(SITE_SESSION_DISABLED, "Connection to site VMS is disabled!\nContact administrator.");
		returnMessage.put(INVALID_CENTRAL_SESSION, "Either missing JSESSIONID or VConnect session expired! Re-login required!");
		returnMessage.put(USER_NOT_ASSIGNED_TO_SITE, "User is not given access to the site!");
		returnMessage.put(NO_ACTIVE_SITE_SESSION, "No active IVMS session! Please connect to site first.");
		returnMessage.put(NOT_CENTRAL_ADMIN, "You are not a central administrator!");
		returnMessage.put(NOT_ENTERPRISE_ADMIN, "You are not the admin of this enterprise!");
		returnMessage.put(NOT_CENTRAL_OPERATOR, "You are not a central operator!");
		returnMessage.put(SUCCESSFULLY_CREATED, "Successfully created!");
		returnMessage.put(USER_EXISTS, "Can not create user! User id already exists.");
		returnMessage.put(NOT_ALLOWED_TO_MODIFY_ANOTHER_ADMIN, "Central admin is not allowed to modify another central admin!");
		returnMessage.put(PASSWORD_BLANK, "Password length should not be blank or null!");
		returnMessage.put(PASSWORD_MISMATCH, "New password and confirm password does not match!");
		returnMessage.put(CAN_NOT_DELETE_SELF, "You can not delete yourself!");
		returnMessage.put(SUCCESSFULLY_DELETED, "Successfully deleted!");
		returnMessage.put(CREATE_USER_ID_MISMATCH, "Failed to create user! The userid in url mismatch with payload.");
		returnMessage.put(NO_USER, "There is no user with the userid!");
		returnMessage.put(MISSING_EMAIL_ID, "Email id not found! Email id is mandatory.");
		returnMessage.put(MISSING_MOBILE_NUMBER, "Mobile number not found! Mobile number is mandatory.");
		returnMessage.put(MISSING_PHONE_NUMBER, "Phone number not found! Phone number is mandatory.");
		returnMessage.put(MISSING_VMSIP, "IVMS local ip address or redundant ip address not found! These are mandatory.");

		returnMessage.put(MISSING_DEVICE_NAME, "Device name not found! Device name is mandatory.");
		returnMessage.put(INVALID_MOBILE_NUMBER, "Invalid mobile number");
		returnMessage.put(INVALID_DEVICE_TYPE, "Unsupported ICMS device type!");
		returnMessage.put(USER_LOGIN_ALERT, "User is online using other device! \nContact Administrator.");
		returnMessage.put(PASSWORD_HISTORY_MATCH, "Given password is used before! Please give a new password.");

		returnMessage.put(PARTIALLY_ASSIGNED_SITES, "Partially added user to the sites! Please check the result and try again.");
		returnMessage.put(PARTIALLY_DELETED_SITES, "Partially deleted user from the sites! Please check the result and try again.");
		returnMessage.put(HTTP_METHOD_IS_NOT_ALLOWED, "The Http Method is not supported in central server!");
		returnMessage.put(USER_SITE_ASSIGNMENT_EXISTS, "User is already assigned to site(s)! Please revoke access from all sites first.");
		returnMessage.put(PARTIALLY_UPDATED_PASSWORD, "Could not update password in all VMS sites!");
		returnMessage.put(NOT_CENTRAL_SUPER_ADMIN, "You are not a super admin in the central server!");
		returnMessage.put(PARTIALLY_SUCCESSFUL_TO_DELETE, "Could not delete all! Please try again.");
		returnMessage.put(LOGOUT_PARTIAL, "Could not logout from all the VMS sites!");
		returnMessage.put(NO_VA_SERVER, "Video Analytics server not found or invalid analytic server id!");
		returnMessage.put(MISSING_VASIP, "VA server ip is mandatory!");
		returnMessage.put(MISSING_POST_BODY, "Required http POST request payload is not found!");
		returnMessage.put(FILE_SIZE_LIMIT_EXCEEDED, "Maximum file size limit exceeded! Please upload upto 500kb!");
		returnMessage.put(INVALID_IMAGE_FILE, "Invalid image file! We accept - \"gif\", \"png\", \"jpeg\", \"jpg\", \"jpe\", \"jiff\", \"bmp\", \"dib\"");
		returnMessage.put(NO_MAP, "There is no map or invalid map id!");
		returnMessage.put(RESOURCE_ALREADY_EXISTS, "The requested resource already exists!");
		returnMessage.put(INVALID_ANALYTIC_ID, "Please select valid analytic id!");
		returnMessage.put(MISSING_SITE_ID, "At least one valid site id required to schedule task!");
		returnMessage.put(MISSING_SCHEDULE_TYPE, "Missing 'schedule' type! Application schedule task types - DAILY, WEEKLY, MONTHLY.");
		returnMessage.put(MISSING_HOUR_MIN_SEC, "Exact hour, minute and second of the day required to schedule task!");
		returnMessage.put(MISSING_DAY_OF_WEEK, "Day of the week is required to schedule task!");
		returnMessage.put(MISSING_DAY_OR_MONTH, "Month and date are required to schedule task!");
		returnMessage.put(MISSING_MULTIPART_DATA, "There is no multipart data in the request!");
		returnMessage.put(NOT_ALLOWED, "You are not allowed to perform this operation!");
		returnMessage.put(NOT_ALLOWED_SITE_VMS_IP_UPDATE, "IVMS IP and Redundant VMS IP cannot be updated!");
		returnMessage.put(NOT_ALLOWED_ENTERPRISE_NAME_UPDATE, "Enterprise name can not be updated!");
		returnMessage.put(UNAUTHORIZED_RESOURCE_ACCESS, "Unauthorized access to resource!");
		returnMessage.put(INVALID_REPORT_TYPE, "Applicable report types are 'pdf' (Portable Document Format) and 'xls' (Excel Spreadsheet)!");
		returnMessage.put(MISSING_SCHEDULE_FROM_TO, "Missing start and end time duration, between which report should be generated!");
		returnMessage.put(INVALID_SCHEDULE_FROM_TO, "Invalid start and end time duration, from time should be less than to time!");
		returnMessage.put(SITE_NOT_ASSIGNED_TO_ENTERPRISE, "The site is not a site under the enterprise!");
		returnMessage.put(SITE_ALREADY_ASSIGNED, "The site is already assigned to enterprise!");
		returnMessage.put(USER_ALREADY_ASSIGNED, "The user is already assigned to enterprise/site!");
		returnMessage.put(CAN_NOT_CONNECT_VMS_OR_INVALID_VMSIP, "Can not connect to VMS or invalid VMS IP!");
		returnMessage.put(MISSING_SCHEDULE_PARAMETER, "Schedule Name and two dimensional array of 1/0 flags required for schedule[0-7][0-23]");
		returnMessage.put(SITE_VMS_IP_ALREADY_EXISTS, "VMS site with the ip/redundentip already exists");
		returnMessage.put(INVALID_ANALYTIC_SCHEDULE, "Invalid schedule parameters! Please define a schedule to start the analytics.");
		returnMessage.put(MISSING_ZONE_ROI, "Please draw a zone (ROI) to start analytics.");
		returnMessage.put(INVALID_ZONE_ROI, "No valid points zone or includes invalid points zone in Zone list!");
		returnMessage.put(CAMERA_SEARCH_SERVER_NOT_CONNECTED, "Failed to connect camera search server!");
		returnMessage.put(INVALID_CAMERA_SEARCH_PARAMETER, "Invalid camera search parameters!");
		returnMessage.put(FAILED_SEND_CAMERA_SEARCH_PARAMETER, "Failed to send search parameter to camera search server!");
		returnMessage.put(MISSING_ADD_ENTERPRISE_PARAMETER, "Missing one or more required parameter - name, addressline1, city, state, country, postalcode, stdcode, number, mobile, email, file (image file)!");
		returnMessage.put(INVALID_REQUEST_PARAMETER, "Invalid request! Please verify request parameter data type and submit again.");
		returnMessage.put(INVALID_PASSWORD_RESET_KEY, "Invalid/incorrect password reset key!");
		returnMessage.put(INVALID_PASSWORD_SEQURITY_QUES_ANS_SET, "The security question and answer set (set1 and set2) does not match with database!");
		returnMessage.put(INVALID_LOITERING_ZONE, "Invalid duration not between 1 second to 15 second, in Loitering Analytic Zone!");
		returnMessage.put(INVALID_UO_OR_ZONE, "Invalid duration not between 1 minute to 5 minute and invalid object width/height, in Unattended Object and Object Removed Analytic Zone!");
		returnMessage.put(LICENSE_ENTERPRISE_OVER, "Maximum Licensed Enterprise Reached.\nContact administrator.");
		returnMessage.put(MAX_ALLOWED_REPORT_QUERY_DAYS_EXCEEDED, "Maximum query duration exceeded!");
		returnMessage.put(MIN_ALLOWED_REPORT_QUERY_DAYS_EXCEEDED, "Minumim allowed query duration 1 day!");
		returnMessage.put(NOT_ALLOWED_FUTURE_DATE, "You are not allowed to enter future date time!");
		returnMessage.put(INVALID_DOWNTIME_HOURS, "Downtime can not be more than duration of query!");
		returnMessage.put(NOT_FOUND_CAMERA_REGISTRATION_MACID, "MAC id registraton yet not received for this camera!");
		returnMessage.put(ALREADY_CAMERA_REGISTRATION_EXISTS, "Camera registration already exists!");
		returnMessage.put(QR_CODE_NOT_FOUND, "No QR code found in the camera snap!");
		returnMessage.put(QR_CODE_INVALID, "Invalid QR code found in the camera snap!");
		returnMessage.put(QR_CODE_NOT_MATCHED, "QR code did not match with the QR code sent during camera registration!");
		returnMessage.put(QR_CODE_ALREADY_MATCHED, "QR code matched! Registration is complete and ready to be used!");
		returnMessage.put(QR_CODE_ALREADY_MATCHED_AND_CONNECTED_TO_VMS, "Camera has already been connected and services are running!");
		returnMessage.put(QR_CODE_GENERATION_ERROR, "QR code could not be generated! Please contact administrator.");
		returnMessage.put(NOT_AVAILAVLE_PASSWORD_RECOVERY_OPTIONS, "Password resovery options not available! Please login to update password recovery options or contact administrator.");
		returnMessage.put(NO_VIRTUAL_UNIT, "There is no virtual unit or invalid virtual unit id!");
		returnMessage.put(UNABLE_TO_SPAWN_NEW_VIRTUAL_UNIT, "Could not spawn new virtual unit to attach your camera!");
		returnMessage.put(SUBSCRIBER_CAMERA_SERVICES_NOT_RUNNING, "Camera services is not running. Please start the camera services first!");
		returnMessage.put(SUBSCRIBER_CAMERA_SERVICES_SUSPENDED, "Camera services suspended!");
		returnMessage.put(CLIP_DOWNLOAD_MAX_LIMIT_10MINS, "You can not download clip size more than 10 minutes!");
		returnMessage.put(ANALYTICS_EXISTS, "One or More Analytic job(s) running in this server!");
		returnMessage.put(ANALYTICS_SERVER_NOT_RUNNING, "Analytic server is not  responding!");
		returnMessage.put(ACCOUNT_ACTIVATION_PENDING, "Your account is not activated! Please contact administrator.");
		returnMessage.put(ACCOUNT_SUSPENDED, "Your account has been suspended! Please contact administrator.");
		returnMessage.put(INVALID_PORT, "Invalid Port.");
		returnMessage.put(NOT_ALLOWED_TO_MODIFY_USER_ACCOUNT, "You are not authorized to suspend/activate this user account.");
		returnMessage.put(STATUS_UPDATE_FAILED, "Failed to update status!");
		returnMessage.put(DB_REDIS_CONNECTION_ERROR, "Redis database connection error! Please contact administrator.");
		returnMessage.put(NO_EVENT_TAG, "There is no event tag or invalid event tag id!");
		returnMessage.put(SERVER_BUSY, "Server too busy: please try after some time.");
		returnMessage.put(STOP_REGISTRATION_REQUEST, "Stop registration request.");

		returnMessage.put(VDEVICE_SUCCESS, "Success.");
		returnMessage.put(VDEVICE_INVALID_CALL_ID, "This feature is not supported in this version.");
		returnMessage.put(VDEVICE_INVALID_DEVICE_ID, "Invalid device id.");
		returnMessage.put(VDEVICE_CALL_NOT_IMPLEMENTED, "Call not implemented.");
		returnMessage.put(VDEVICE_INVALID_STREAM_TYPE, "VDEVICE_INVALID_STREAM_TYPE");
		returnMessage.put(VDEVICE_INVALID_CODEC_TYPE, "VDEVICE_INVALID_CODEC_TYPE");
		returnMessage.put(VDEVICE_INVALID_WIDTH, "VDEVICE_INVALID_WIDTH");
		returnMessage.put(VDEVICE_INVALID_HEIGHT, "VDEVICE_INVALID_HEIGHT");
		returnMessage.put(VDEVICE_INVALID_IP_RATE, "VDEVICE_INVALID_IP_RATE");
		returnMessage.put(VDEVICE_INVALID_BIT_RATE_MODE, "VDEVICE_INVALID_BIT_RATE_MODE");
		returnMessage.put(VDEVICE_INVALID_FPS, "VDEVICE_INVALID_FPS");
		returnMessage.put(VDEVICE_INVALID_BITRATE, "VDEVICE_INVALID_BITRATE");
		returnMessage.put(VDEVICE_INVALID_BRIGHTNESS, "VDEVICE_INVALID_BRIGHTNESS");
		returnMessage.put(VDEVICE_INVALID_CONTRAST, "VDEVICE_INVALID_CONTRAST");
		returnMessage.put(VDEVICE_INVALID_HUE, "VDEVICE_INVALID_HUE");
		returnMessage.put(VDEVICE_INVALID_IRIS_MODE, "VDEVICE_INVALID_IRIS_MODE");
		returnMessage.put(VDEVICE_INVALID_SATURATION, "VDEVICE_INVALID_SATURATION");
		returnMessage.put(VDEVICE_INVALID_RESOLUTION, "VDEVICE_INVALID_RESOLUTION");
		returnMessage.put(VDEVICE_ERROR, "VDEVICE_ERROR");

		returnMessage.put(HLS_SERVER_WEB_ROOT_DIR_INVALID, "Could not start ts generation service. Invalid web root directory configured.");
		returnMessage.put(HLS_INVALID_SESSION, "Could not take any action on streaming. Invalid streaming session.");
		returnMessage.put(HLS_UNKNOWN_ERROR, "Could not start streaming. Contact admin.");
		returnMessage.put(HLS_STREAM_SOURCE_NOT_SUPPORTED, "Could not start ts generation service. Given stream source not supported. Only h264 video source is allowed.");
		returnMessage.put(HLS_STREAM_SOURCE_INACCESSIBLE, "Could not start ts generation service. Given stream source is not accessible right now. Try later.");
		returnMessage.put(STREAM_SOURCE_INACCESSIBLE, "Given stream source is not accessible right now. Try later.");
		returnMessage.put(HLS_IVMS_API_CONNECTION_ERROR, "Could not start streaming service.");

		returnMessage.put(ITMS_SITE_ASSIGNMENT_NOT_ALLOWED, "You can not assign more than one ITMS site to an operator!");

		// itms-apiserver
		returnMessage.put(REDIS_DB_CONNECTION_ERROR, "Redis database connectivity failure!\n Please check whether Redis server is started or Redis host is connected.");
		returnMessage.put(ITMS_TRIGGER_SEARCH_MAX_EVENTS_OVER, "You have selected more than allowed limit of events to trigger! Please select less events.");

		// RCS
		returnMessage.put(INVALID_RCS_SERVER_ID, "Invalid rcs server id!");
		returnMessage.put(RCS_NOT_AVAILABLE, "Invalid rcs server id or the rcs server is not available!");
		returnMessage.put(NO_RCS_SERVER_AVAILABLE, "No rcs server available!");
		returnMessage.put(ENCODING_SERVER_BUSY, "Encoding Server too busy: please try after some time.");
		returnMessage.put(CHANNEL_CAPACITY_NOT_AVAILABLE, "Channel Capacity is out of range! Please try with less no of camera(s) or contact adminstrator.");
		returnMessage.put(REGISTRATION_REQUEST_ACCEPTED, "Registration request accepted");

		// VOC 
		returnMessage.put(ALERT_MESSAGING_GROUP_IN_USE, "Alert Group is already in use.");
		returnMessage.put(STORAGE_COMPONENT_NOT_AVAILABLE, "Storage component not available.");
		returnMessage.put(PROBLEM_IN_REVOKE_ENTERPRISE, "Problem in revoke enterprise! Try again later.");
		returnMessage.put(ALL_EDGE_DEVICE_NOT_REVOKED, "First revoke all edge devices.");

		returnMessage.put(PROBLEM_IN_CREATING_BUCKET, "Problem in creating bucket.\nPlease check access credetionals and try with different name.");
		returnMessage.put(PROBLEM_IN_GETTING_BUCKET_LIST, "Problem in geting bucket list.\nPlease check access credetionals and try again.");
		returnMessage.put(NAME_ALREADY_IN_USE, "Name already in use.");
		returnMessage.put(INVALID_DATA_ACCESS_API_USAGE_EXCEPTION, "Invalid Data Access Api Usage Exception.");

		// PTZ Pattern 
		returnMessage.put(PATTERN_NAME_ALREADY_IN_USE, "Pattern name already in use.");
		returnMessage.put(PATTERN_NAME_MANDATORY, "Pattern name mandatory.");
		returnMessage.put(PATTERN_DOES_NOT_EXIST, "Pattern doesn't exist.");
		returnMessage.put(API_SERVER_NOT_CONFIGURED, "API Server not configured. Contact adminstrator!");
		
		returnMessage.put(DATA_ACCESS_EXCEPTION, "Failed to access data (Data Access Exception). Contact adminstrator!");
		returnMessage.put(NO_MEDIASERVER_LIVE, "No media server is online.");
		returnMessage.put(CAMERA_OFFLINE, "Camera is offline.");
		returnMessage.put(HIVE_MQ_CONNECTION_ERROR, "Hive MQ is not connected! Please contact adminstrator.");
		returnMessage.put(RABBIT_MQ_CONNECTION_ERROR, "Rabbit MQ is not connected! Please contact adminstrator.");
		

	}
}
