'use strict';

var isOpera = (navigator.userAgent.indexOf("Opera") != -1);
var isMSIE  = (navigator.userAgent.indexOf("MSIE") != -1) || (navigator.userAgent.indexOf("Trident") != -1) && (!isOpera);
if (isMSIE) {
    document.getElementById("allTargetsLiveInput").style.display = 'none';
    document.getElementById("allTargetsLiveLabel").style.display = 'none';

}

//Initialize the scan mode by retrieving the list of targets and info from the appliance
var globalVars,
    scanModeSession,    //This will be for our ScanModeManager instance
    i18nStrings = {
        'settings': 'Settings',
        'thumbnailSize': 'Thumbnail Size',
        'scanTime': 'Time per Server',
        'timeBetweenScans': 'Time between Servers',
        'seconds': 'seconds',
        'submitButton': 'Submit',
        'connecting': 'Connecting...',
        'errorTimeBetweenScans': "The time between servers value must be between 0 and 60 seconds.",
        'errorScanTime': "The time per server must be between 5 and 60 seconds.",
        'errorUnavailable': 'Unavailable',
        'errorSessionTerminated': 'The session was unexpectedly terminated.',
        'errorVideoStopped': 'No Signal.',
        'errorNoHtml5': 'Your browser is not compatible with HTML5.',
        'errorNoWebsockets': 'Your browser doesn\'t support websockets.',
        'errorPopupBlocker': 'Turn off your pop-up blocker and try again.',
        'errorUnsupportedFirmware': 'Feature not supported.',
        'okButton': 'OK'
    };
//alert("hello");
var isMSIE  = (window.navigator.userAgent.indexOf("MSIE") != -1) || (window.navigator.userAgent.indexOf("Trident") != -1);
var currentPageTitle = document.title;
var currentScanTimer;               //This will hold our current session's 'setTimeout' timer to be available to cancel
var currentBetweenScanTimer;
//var firstTarget ={id:11091469, appIp:"10.207.25.119",ipAddr:"192.168.10.100", name:"target1", port:2068, mode:"SCAN",mPort:4206,clientIp:"127.0.0.1"};
//var secondTarget ={id:8023308, appIp:"10.207.16.19",ipAddr:"192.168.10.100", name:"target2", port:2068, mode:"SCAN",mPort:443,clientIp:"127.0.0.1"};
//var thirdTarget ={id:11088909, appIp:"10.207.25.119",ipAddr:"192.168.10.101", name:"target3", port:2068, mode:"SCAN",mPort:4206,clientIp:"127.0.0.1"};
//var forthTarget ={id:11090189, appIp:"10.207.25.119",ipAddr:"192.168.10.102", name:"target4", port:2068, mode:"SCAN",mPort:4206,clientIp:"127.0.0.1"};
//var fifthTarget ={id:8071692, appIp:"10.207.24.206",ipAddr:"10.15.19.8", name:"target5", port:2068, mode:"SCAN",mPort:4206,clientIp:"127.0.0.1"};

//var targetInfo=[forthTarget,firstTarget,secondTarget,thirdTarget,fifthTarget];
//var targetInfo=[thirdTarget,fifthTarget];
var enableMouseAction=false;
var keepSessionsLiveDuringScan=false;
var strCert;
var mIPAddress;
var bUseCert = true;
//var mPort = 4206; //port;
//var getTargetListUrl = "/InitScanMode",
//    xhr = new XMLHttpRequest();

//xhr.open('GET', getTargetListUrl, true);
//xhr.onreadystatechange = function () {
//    if (xhr.readyState === 4) {         //Request is finished
//        if (xhr.status === 200) {
//            var responseData = JSON.parse(xhr.responseText),
//                applianceResponse = responseData.applianceInfo,
 //               targetResponse = responseData.targetInfo;

            globalVars = {
                webSocketTimeOutValue: 120000,
                path: "/dummy"
            };

            //if(responseData.i18nStrings){
            //    setI18nStrings(responseData.i18nStrings);
            //}

           // targetInfo = targetResponse;

       // }
       // else {
       //     console.log(xhr.status);
       //     alert("Error: Could not get targets from server.")
       // }
   // }
//};
//xhr.send();

//This event handler is used to start a KVM session to the target by double clicking on it.
// It is attached using ".bind(this)" so that the "this" keyword refers to the KvmTarget Object
// the user want to connect to
var doubleClickEventHandler = function(e){
    var target = this;

    //If we already started a full KVM session on this target, don't start another KVM Session request
    //if(target.hasFullKvmSession)
    //   return;

    scanModeSession.beginFullKvmSession(target);
    //target.setLoader();
    var name = target.name+" HTML5 Viewer";
    var features = 'location=yes,menubar=yes,scrollbars=yes,status=yes,tjoolbar=yes,resizable=yes';
    var singleurl = "/dsview/protected/html5kvm/index.jsp?oid="+target.id+"&clientip="+target.clientIp+"&targetname="+target.name+"&port="+target.mPort+"&umiq="+target.ipAddr+"&mode=0";
               if ( isMSIE )
	                {
	                    var win = window.open( singleurl, name, features );
	                    //win.execScript("if (!window.sessionLoaded) window.location.href= '"+szUrl+"';");
	                    win.focus();
                        //target.removeLoader();
	                }
	                else
	                {
	                    // to support Chrome&Safari browser's popup(Serial Session), modified by Jack lu Nov 29th 2011 - begin
	                    //    win = window.open("javascript:if(!window.sessionLoaded) window.location.href='"+szUrl+"';", name, features );

	                    var tmp;
	                    if (!window.sessionLoaded) {
	                        tmp = singleurl;
	                    }else
	                    {
	                        tmp = "_blank";
	                    }
	                    var win = window.open(tmp, name, features);
	                    win.focus();
	                    //target.removeLoader();

	                    // to support Chrome&Safari browser's popup(Serial Session), modified by Jack lu Nov 29th 2011 - end
                    }


};

function setI18nStrings(newStrings){
    //We may have received an incomplete list of strings to set, so make sure we keep our defaults as fallback for
    //     missing indices
    var i18nStringKeys = Object.keys(i18nStrings);

    for(var i=0;i<i18nStringKeys.length;i++){
        var keyToTest = i18nStringKeys[i];
        if(newStrings[keyToTest]){
            i18nStrings[keyToTest] = newStrings[keyToTest];
        }
    }

    //Set the visible HTML elements accordingly
    document.getElementById('settingsButton').innerHTML =
        document.getElementById('modalTitleBar').innerHTML = i18nStrings.settings;
    document.getElementById('scanTimeLabel').innerHTML = i18nStrings.scanTime;
    document.getElementById('timeBetweenScansLabel').innerHTML = i18nStrings.timeBetweenScans;

    //This will set the 'seconds' labels that follow the scan time and time between scans input boxes
    document.getElementById('scanModeTimeInput').nextElementSibling.innerHTML =
        document.getElementById('timeBetweenScansInput').nextElementSibling.innerHTML = i18nStrings.seconds;

    document.getElementById('thumbnailSizeLabel').innerHTML = i18nStrings.thumbnailSize;
    document.getElementById('settingsSubmit').innerHTML = i18nStrings.submitButton;
    document.getElementById('errorClose').innerHTML = i18nStrings.okButton;
}

// KvmTargets will be responsible for creating DOM elements for each viewer session as well as store
// session info
var KvmTarget = (function(){
    function KvmTarget(targetInfo, doubleClickEventHandler) {
        var id = targetInfo.id;
        var ipAddr = targetInfo.ipAddr;
        //alert(ipAddr);
        var targetPort=targetInfo.port;
        var mPort=targetInfo.mPort;
        //alert(targetPort);
        var name = targetInfo.name;
        //var internalId = targetInfo.internalId;
        var strCerts="";
        var appIp=targetInfo.appIp;
        var hasAcceptedCert=false;
        var clientIp=targetInfo.clientIp;
        //Initialize this markup when we create the object:
        //Markup Format is:
        //  <div id="targetIdContainer">
        //      <div id="targetIdBackground" class="kvmItem">
        //         <div id="targetIdLoaderDiv"></div>
        //         <div id="targetIdCanvasBackground" class="kvmBackground" display="none">
        //              <canvas id="targetIdCanvas"></canvas>
        //          </div>
        //          <div id="targetIdScreenshotBackground" class="kvmBackground">
        //              <canvas id="targetIdScreenshotCanvas">
        //          </div>
        //      </div>
        //      <div>
        //          <span id="targetIdSessionStatus"></span>
        //          <span>targetName</span>
        //      </div>
        //      <div id="targetIdError"></div>
        //  </div>
        var containerDiv = document.createElement("div");
        containerDiv.id = id + "Container";
        containerDiv.classList.add("kvmContainer", "noSelect");
        containerDiv.title = name;

        var contentDiv = document.createElement("div");
        contentDiv.id = id + "Background";
        contentDiv.className = "kvmItem";

        //Set our canvas' width x height to 320x240 by default
        var canvasDiv = document.createElement('div');
        canvasDiv.id = id + "CanvasBackground";
        canvasDiv.className = "kvmBackground";
        canvasDiv.style.display = "none";
        canvasDiv.style.width = "320px";
        canvasDiv.style.height = "240px";

        var loaderDiv = document.createElement("div");
        loaderDiv.id = id + "LoaderDiv";
        loaderDiv.classList.add("fillContainerWidthHeight");

        var kvmCanvas = document.createElement("canvas");
        kvmCanvas.id = id + "Canvas";
        kvmCanvas.style.background = "black";
        kvmCanvas.width = 320;
        kvmCanvas.height = 240;

        var screenshotDiv = document.createElement('div');
        screenshotDiv.id = id + "ScreenshotBackground";
        screenshotDiv.id = id + "ScreenshotBackground";
        screenshotDiv.className = "kvmBackground";
        screenshotDiv.style.width = "320px";
        screenshotDiv.style.height = "240px";

        var screenshotCanvas = document.createElement("canvas");
        screenshotCanvas.id = id + "ScreenshotCanvas";
        screenshotCanvas.style.background = "black";
        screenshotCanvas.width = 320;
        screenshotCanvas.height = 240;

        var sessionStatus = document.createElement('span');
        sessionStatus.id = id + "SessionStatus";

        var nameSpan = document.createElement("span"),
            textNode = document.createTextNode(name);
        nameSpan.id = name + "NameSpan";

        var nameContainer = document.createElement("div");

        var errorDiv = document.createElement("div");
        errorDiv.id = id + "Error";

        //Put it all together
        nameContainer.appendChild(sessionStatus);
        nameSpan.appendChild(textNode);
        nameContainer.appendChild(nameSpan);
        screenshotDiv.appendChild(screenshotCanvas);
        canvasDiv.appendChild(kvmCanvas);
        contentDiv.appendChild(loaderDiv);
        contentDiv.appendChild(canvasDiv);
        contentDiv.appendChild(screenshotDiv);
        containerDiv.appendChild(contentDiv);
        containerDiv.appendChild(nameContainer);
        containerDiv.appendChild(errorDiv);

        //Attach our doubleclick event handler to the container div. Use '.bind(this)' to ensure that the callback
        //  gets the proper reference to "this" (i.e. the KvmTarget Object)
        if(doubleClickEventHandler)
            //containerDiv.addEventListener("dblclick", doubleClickEventHandler.bind(this), false);
            nameContainer.addEventListener("dblclick", doubleClickEventHandler.bind(this), false);

        document.getElementById("scanModeContainer").appendChild(containerDiv);

        //Now initialize our member variables
        this.hasAcceptedCert=false;
        this.id = id;
        this.ipAddr = ipAddr;
        this.name = name;
        this.targetPort=targetPort;
        this.mPort=mPort;
        //this.internalId = internalId;
        this.strCerts=strCerts;
        this.appIp=appIp;
        this.clientIp=clientIp;
        this.active = false;                 //Signifies if the target is being scanned currently
        this.sessionEstablished = false;     //Signifies if a KVM connection has been established to the target
        this.hasFullKvmSession = false;       //This is used to prevent multiple double-clicked session attempts
        this.canvasInfo = {
            containerElement: containerDiv,
            canvas: kvmCanvas,
            canvasBackground: canvasDiv,
            loaderDiv: loaderDiv,
            nameSpan: nameSpan,
            screenshotBackground: screenshotDiv,
            screenshotCanvas: screenshotCanvas,
            sessionStatus: sessionStatus,
            errorContainer: errorDiv,
            viewerContext: null              //This will be set once the target session is launched
        };

        //Variables for session attempts:
        //xhrRequest will hold the xhr object to connect to this target so we can abort it if necessary
        //attemptingVoidraySession is to prevent a potential condition where the target may receive another session
        //  attempt after the XHR request is complete but the voidray session is still attempting to connect to the
        //  target.
        this.xhrRequest = null;
        this.attemptingVoidraySession = false;
    }

    KvmTarget.prototype.hideScreenshotCanvas = function(){
        var activeParentDiv = this.canvasInfo.canvasBackground,
            screenshotParentDiv = this.canvasInfo.screenshotBackground;

        activeParentDiv.style.display = '';
        screenshotParentDiv.style.display = 'none';
    };

    KvmTarget.prototype.showScreenshotCanvas = function(){
        var activeParentDiv = this.canvasInfo.canvasBackground,
            screenshotParentDiv = this.canvasInfo.screenshotBackground;

        activeParentDiv.style.display = 'none';
        screenshotParentDiv.style.display = '';
    };

    KvmTarget.prototype.setActive = function(){
        this.active = true;

        if(this.sessionEstablished){
            this.setSessionLiveIndicator();
        } else {
            this.setSessionConnectingIndicator();
        }
    };

    KvmTarget.prototype.setInactive = function(){
        this.active = false;

        this.clearSessionLiveIndicator();
        this.clearSessionConnectingIndicator();
    };

    KvmTarget.prototype.setSessionConnectingIndicator = function(){
        var sessionIndicatorDiv = this.canvasInfo.sessionStatus,
            targetName = this.canvasInfo.nameSpan;

        sessionIndicatorDiv.classList.add("sessionConnecting");
        targetName.classList.add("ellipsis");
    };

    KvmTarget.prototype.clearSessionConnectingIndicator = function(){
        var sessionIndicatorDiv = this.canvasInfo.sessionStatus,
            targetName = this.canvasInfo.nameSpan;

        sessionIndicatorDiv.classList.remove("sessionConnecting");
        targetName.classList.remove("ellipsis");
    };

    KvmTarget.prototype.setSessionLiveIndicator = function(){
        var sessionIndicatorDiv = this.canvasInfo.sessionStatus;
        sessionIndicatorDiv.classList.add("sessionLive");
    };

    KvmTarget.prototype.clearSessionLiveIndicator = function(){
        var sessionIndicatorDiv = this.canvasInfo.sessionStatus;
        sessionIndicatorDiv.classList.remove("sessionLive");
    };


    KvmTarget.prototype.getScreenshotOfSession = function(){
        //Chances are that we don't want a screenshot of the canvas if the session hasn't been established
        if(!this.sessionEstablished)
            return;

        var viewerCanvas = this.canvasInfo.canvas,
            screenshotCanvas = this.canvasInfo.screenshotCanvas;

        screenshotCanvas.width = viewerCanvas.width;
        screenshotCanvas.height = viewerCanvas.height;
        var screenshotContext = screenshotCanvas.getContext('2d');
        screenshotContext.drawImage(viewerCanvas, 0, 0);
    };

    KvmTarget.prototype.setRPViewerContext = function (context){
        this.canvasInfo.viewerContext = context;
    };

    KvmTarget.prototype.setError = function(errorMessage){
        var errorContainer = this.canvasInfo.errorContainer,
            sessionStatusIndicator = this.canvasInfo.sessionStatus;

        //Clear any previous error messages
        errorContainer.innerHTML = '';

        var testError = document.createTextNode(errorMessage);
        errorContainer.appendChild(testError);
        sessionStatusIndicator.classList.add("sessionError");
    };

    KvmTarget.prototype.clearError = function(){
        var errorContainer = this.canvasInfo.errorContainer,
            sessionStatusIndicator = this.canvasInfo.sessionStatus;

        sessionStatusIndicator.classList.remove("sessionError");
        errorContainer.innerHTML = "";
    };

    KvmTarget.prototype.endSession = function(){
        this.attemptingVoidraySession = false;

        var viewerContext = this.canvasInfo.viewerContext;
        if(viewerContext){
            viewerContext.closeRPViewerSession();
            this.sessionEstablished = false;
        }
        this.setInactive();
    };

    //This function only works if the width and height is provided in "widthxheight" format e.g. "360x240"
    KvmTarget.prototype.setThumbnailSize = function(newSize) {
        var xIndex = newSize.indexOf("x"),
            parsedWidth = parseInt(newSize.substring(0, xIndex)),
            parsedHeight = parseInt(newSize.substring(xIndex + 1, newSize.length)),
            oldscreenshotWidth = this.canvasInfo.screenshotBackground.style.width,
            oldscreenshotHeight = this.canvasInfo.screenshotBackground.style.height;

        if (this.canvasInfo.viewerContext)
            this.canvasInfo.viewerContext.setRPEmbeddedViewerSize(parsedWidth, parsedHeight);

        this.canvasInfo.canvasBackground.style.width =
            this.canvasInfo.screenshotBackground.style.width = parsedWidth + "px";
        this.canvasInfo.canvasBackground.style.height =
            this.canvasInfo.screenshotBackground.style.height = parsedHeight + "px";

        //Redraw the image this way because setting the width and height of the canvas clears it
        var screenshotCanvas = this.canvasInfo.screenshotCanvas,
            screenshotContext = screenshotCanvas.getContext('2d');

        screenshotContext.drawImage(screenshotCanvas,
            0, 0, oldscreenshotWidth, oldscreenshotHeight,  //Source rectangle
            0, 0, parsedWidth, parsedHeight);               //Destination rectangle

        //Add 30 pixels for the name and error divs
        var newContainerHeight = parsedHeight + 30;
        this.canvasInfo.containerElement.style.width = parsedWidth + 'px';
        this.canvasInfo.containerElement.style.height = newContainerHeight + 'px';
    };

    KvmTarget.prototype.setLoader = function(){
        this.canvasInfo.loaderDiv.classList.add("loader", "ellipsis");
    };

    KvmTarget.prototype.removeLoader = function(){
        this.canvasInfo.loaderDiv.classList.remove("loader", "ellipsis");
    };

    //This attempts to cancel a previous AJAX request so prevent session issues
    KvmTarget.prototype.abortPreviousRequest = function(){
        if(this.xhrRequest !== null) {
            this.xhrRequest.abort();
            this.xhrRequest = null;
        }
    };

    return KvmTarget;
})();


// This is the central handler for scan mode. This object keeps track of which target session is active
//    and will handle the target scan loop
var ScanModeManager = function (targetInfo, options) {
//function ScanModeManager(targetInfo, options) {
    
	console.log('options: ' + JSON.stringify(options,null, 2))
	var activeTargetIndex = 0;
    var numberOfTargets = targetInfo.length;
    console.log("Number of targets: " + numberOfTargets);
    //var hasAcceptedCert = false;    //Used to determine whether to display the cert popup
    var scanTime = 15;               //in seconds
    var timeBetweenScans = 10;       //in seconds

    var targetThumbnailSize = "320x240";
    var allTargetsLive = false;     //User setting to show all of the live targets simultaneously

    //Variable to keep the websocket connections live during the scans. By default, we will disconnect and connect
    //  for each scanned server
    keepSessionsLiveDuringScan = options.keepSessionsLive || false;
    //var keepSessionsLiveDuringScan=false;
    //Now we create our targets from the provided info and register them in the targetList array
    var targetList = [];
    for(var i=0;i<numberOfTargets;i++) {

        var newTarget = new KvmTarget(targetInfo[i], options.doubleClickEventHandler);
        targetList.push(newTarget);

        newTarget.setThumbnailSize(targetThumbnailSize);
    }

    // This is the entry point for our loop.
    var startScanMode = function () {
        var activeTarget = getActiveTarget();
        //alert('hello3');
        document.title = currentPageTitle +":"+ activeTarget.name;

        applyConfigCert(activeTarget.id);
        //var activeTarget = getActiveTarget();
        //scanTarget(activeTarget);
    };

    var startScanOnNextTarget = function(){
        incrementActiveTargetIndex();
        startScanMode();
    };

    var scanTarget = function(targetToLaunch){
        console.log("scanTarget");
        targetToLaunch.clearError();
        targetToLaunch.setActive();

        if(!targetToLaunch.sessionEstablished) {
            startSession(targetToLaunch);
        } else{
            targetToLaunch.hideScreenshotCanvas();
            window.clearTimeout(currentScanTimer);
            window.clearTimeout(currentBetweenScanTimer);

            executeScan(targetToLaunch);
        }
    };

    // This function will request to start a session by sending an AJAX request for the session OTK
    //  and then launch the HTML5 viewer
    var startSession = function (targetToLaunch) {
        //If we have tried to start a session to this target recently, abort it
        //if(targetToLaunch.attemptingVoidraySession){
        //   return;
        //}
        launchKvmViewer(targetToLaunch);

    };

    var incrementActiveTargetIndex = function(){
        activeTargetIndex++;
        //We want to wrap back around if we reach the final target
        if (activeTargetIndex >= numberOfTargets) {
            activeTargetIndex = 0;
        }
    };

    var getActiveTarget = function(){
        return targetList[activeTargetIndex];
    };

    //This function sets a window timer for the actual target scan
    var executeScan = function(target){
        currentScanTimer = setTimeout(function() {
                stopSessionOnTarget(target, false);
                scheduleNextTargetCycle();
            },
            scanTime * 1000
        );
    };

    //This function sets a window timer between the targets to scan
    var scheduleNextTargetCycle = function(){
        currentBetweenScanTimer = setTimeout(
            startScanOnNextTarget,
            timeBetweenScans * 1000
        );
    };

    // Launch a KVM Viewer Session
    // @param sessionKey    OTK from the server to grant us access to the target
    var launchKvmViewer = function (target) {
        // target.hideScreenshotCanvas();

        //Mark that we are attempting a KVM Session to this target
        target.attemptingVoidraySession = true;

        var canvasId = target.id + "Canvas";
        var viewer = new RPViewer(canvasId, viewerAPIErrorCallback);

        viewer.setRPDebugMode(true); // enabling this tells the API to log some debug messages to console
        viewer.setRPDebugLevel(2);
        var canvasInfo = target.canvasInfo,
            parentDiv = canvasInfo.canvasBackground;

        var viewerWidth = parentDiv.style.width,
            viewerHeight = parentDiv.style.height;

        //style.width will return the width + "px", so get just the number
        viewerWidth = parseInt(viewerWidth.substr(0, viewerWidth.length - 2));
        viewerHeight = parseInt(viewerHeight.substr(0, viewerHeight.length - 2));

        //Manually set the canvas' width and height because closing an RPSession that wasn't fully executed sets
        // the canvas' width & height to 0, which makes reinitializing it problematic
        canvasInfo.canvas.width = viewerWidth;
        canvasInfo.canvas.height = viewerHeight;

        if(target.hasAcceptedCert) {
            viewer.disableRPCertPopup();
        }
        //alert('hello2');
        // Configuration APIs
        viewer.setRPWebSocketTimeout(12);
        //htmlViewer.setRPWebSocketTimeout(12);
        //viewer.setRPCredential(globalVars.username, sessionKey);
        //console.log(' target CERT length : '+ target.strCerts.length +' :  ' + target.strCerts);
        viewer.setRPCertificateCredential(target.strCerts);
        viewer.setRPServerConfiguration(target.appIp, target.mPort);
        //viewer.setRPServerPath(globalVars.path);
        //viewer.setRPServerPath('kvmviewer?target=' + target.ipAddr + ' clientIpAddr=127.0.0.1');
        //viewer.setRPServerPath('kvmviewer?target=' + target.ipAddr);

        viewer.setRPServerPath('kvmviewer?target=' + target.ipAddr + ' clientIpAddr='+target.clientIp);

        //viewer.setRPServerPath('');

        viewer.setRPCertFileName('kvmviewer.html');
        viewer.setRPEmbeddedViewerSize(viewerWidth, viewerHeight);
        viewer.setRPMaintainAspectRatio(false);
        viewer.setRPInitialBackgroundColor('#666666');
        viewer.setRPInitialMessageColor('white'); // Vertiv orange (#FFAA00) might look ok too
        //viewer.setRPQueryString('target=' + target.ipAddr + ' clientIpAddr='+target.clientIp);
        viewer.setRPForAppliance(true); // enables behaviour needed to use the HTML5 viewer with an "appliance" (such as UMG)

        viewer.setRPInitialMessage(i18nStrings.connecting);

        // Setting Callbacks
        var callbacks = getCallbackFunctionsForTarget(target);
        viewer.registerRPLoginResponseCallback(callbacks.loginResponseCallback);
        viewer.registerRPSessionTerminationCallback(callbacks.sessionTermCallback);
        viewer.registerRPVideoStoppedCallback(callbacks.videoStoppedCallback);
        viewer.registerRPUIInitCallback(callbacks.kvmEstablishedCallback); // notification of KVM session being fully established

        //Save this context with our target list
        target.setRPViewerContext(viewer);

        //copied from html5 viewer launch
        //viewer.setRPUIUpdateWithChunkData(false);
        // viewer.setRPAllowSharingRequests(true);
        if(enableMouseAction)
	        viewer.setRPMouseInputSupport(true);
	        //viewer.setRPTouchInputSupport(true);
            //viewer.setRPKeyboardInputSupport(true);
        // Start executing this after the current call stack is finished since it can slow down the app
        setTimeout(function(){

            viewer.connectRPViewer();


        }, 0);




    };

    //This function will bind the target argument to each callback function
    var getCallbackFunctionsForTarget = function(target){
        var loginResponseCallback = function(loginStatus, loginInfo) {
            //No matter the outcome, the login response will mark the end of the attempted voidray session
            target.attemptingVoidraySession = false;
            //document.title = currentPageTitle +":"+ target.name;

            //alert(loginStatus);
            if (loginStatus === RPViewer.RP_LOGIN_RESULT.LOGIN_SUCCESS) {
                //We made it here, so we must have accepted the cert.
                target.hasAcceptedCert = true;

                //If we can connect to it, we will allow double-clicking on the target to start a full session
                target.hasFullKvmSession = false;
                target.sessionEstablished = true;

                return;
            }

            //There is some issue logging in, so end the KVM session attempt
            var errorMessage = reportLoginStatus(loginStatus, false); // report status via user exposed routine.
            target.setError(errorMessage);
            stopSessionOnTarget(target, true);
            console.log("login failed -- %s:%s", allTargetsLive, errorMessage);

            //Don't scan the next target if all of them are supposed to be live
            if(!allTargetsLive)
                startScanOnNextTarget();
        };

        // Callback on when the kvm session begins.
        var kvmEstablishedCallback = function () {
            target.clearSessionConnectingIndicator();
            target.setSessionLiveIndicator();
            target.hideScreenshotCanvas();

            //document.title = currentPageTitle +":"+ target.name;
            //We don't want to continue the scan mode if all of the targets are supposed to be live
            window.clearTimeout(currentScanTimer);
            window.clearTimeout(currentBetweenScanTimer);

            if(!allTargetsLive)
                executeScan(target);



            //Set the thumbnail size again because the voidray canvas' width and height will be automatically set
            target.setThumbnailSize(targetThumbnailSize);
        };

        // Callback function for session termination.
        // @param   reason  Reason for shutdown (RP_SHUTDOWN_REASON).
        var sessionTermCallback = function(reason) {
            //alert(reason);
            var errorMessage = reportTerminationReason(reason, true); // report status via user exposed routine.
            console.log("Target %s session has terminated with reason: %s" , target.id, errorMessage);

            target.setError(errorMessage);
            stopSessionOnTarget(target, true);
            window.clearTimeout(currentScanTimer);
            window.clearTimeout(currentBetweenScanTimer);
            //Don't scan the next target if all of them are supposed to be live
            if(!allTargetsLive)
                startScanOnNextTarget();
        };

        // Callback function to update message displayed within the canvas.
        var videoStoppedCallback = function(reason, xRes, yRes, colorDepth) {
            //console.log("Target %s video stopped Error -- Reason:%d", target.id, reason);

            var videoStoppedMsg = i18nStrings.errorVideoStopped;

            //We probably don't need this detailed error reporting for the scan mode, but comment it just in case...

             switch (reason) {
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_CALIBRATING:
                     videoStoppedMsg = "%i18n_props.voidray.viewer.video.stopped.reason.calibrating%";
                     break;
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_NO_SIGNAL:
                     videoStoppedMsg = i18nStrings.errorVideoStopped;
                     break;
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_OUT_OF_RANGE:
                     videoStoppedMsg = "%i18n_props.voidray.viewer.video.stopped.reason.out.of.range%";
                     break;
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_PERMISSION_DENIED:
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_BLOCKED:
                     videoStoppedMsg = "%i18n_props.voidray.viewer.video.stopped.reason.no.vkvm%";
                     break;
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_RESOLUTION_NOT_SUPPORTED:
                     videoStoppedMsg = "%i18n_props.voidray.viewer.video.stopped.reason.res.no.supported%"
                         + "\n"
                         + "%i18n_props.voidray.viewer.video.detected.resolution%";
                     videoStoppedMsg += " " + xRes + "x" + yRes;
                     break;
                 case RPViewer.RP_VIDEO_STOPPED_REASON.VIDEO_CAPTURE_FAILED:
                     videoStoppedMsg = "%i18n_props.voidray.viewer.video.stopped.reason.video.cap.failure%"
                         + "\n"
                         + "%i18n_props.voidray.viewer.video.detected.resolution%";
                     videoStoppedMsg += " " + xRes + "x" + yRes;
                     videoStoppedMsg += "\n%i18n_props.voidray.viewer.video.stopped.reason.detected.color.depth%" +
                         colorDepth + "bpp";
                     break;
                 default:
                     videoStoppedMsg = i18nStrings.errorVideoStopped;
                     break;
             }
            console.log("Target %s video stopped Error -- Reason:%d %s", target.id, reason,videoStoppedMsg);

            return videoStoppedMsg;
        };

        return {
            loginResponseCallback: loginResponseCallback,
            kvmEstablishedCallback: kvmEstablishedCallback,
            sessionTermCallback: sessionTermCallback,
            videoStoppedCallback: videoStoppedCallback
        }
    };

    // Callback function for RPViewer API errors.
    var viewerAPIErrorCallback = function(errorFunctionName, errorCode) {
        console.log("viewerAPI Errors -- %s:%d", errorFunctionName, errorCode);

        //Report relevant user errors via JavaScript alerts
        if (errorCode === RPViewer.RP_API_ERROR.HTML5_NOT_SUPPORTED_BY_BROWSER) {
            alert(i18nStrings.errorNoHtml5);
        }
        else if (errorCode === RPViewer.RP_API_ERROR.WEBSOCKET_NOT_SUPPORTED_BY_BROWSER) {
            alert(i18nStrings.errorNoWebsockets);
        }
        else if (errorCode === RPViewer.RP_API_ERROR.POPUP_BLOCKED) {
            alert(i18nStrings.errorPopupBlocker);
        }
        else if (errorCode === RPViewer.RP_API_ERROR.FEATURE_MAY_NOT_SUPPORTED_BY_FIRMWARE) {
            alert(i18nStrings.errorUnsupportedFirmware);
        }
        else{
            //alert(errorCode);
        }
        target.setError(errorCode);
        var stopTarget = scanModeSession.getActiveTarget();
        stopSessionOnTarget(stopTarget, true);
        window.clearTimeout(currentScanTimer);
        window.clearTimeout(currentBetweenScanTimer);
	if(!allTargetsLive)
          startScanOnNextTarget();
        //The rest of these are for devs -- Leave them commented just in case we need them

        // else if (errorCode === RPViewer.RP_API_ERROR.INVALID_CANVAS_ID) {
        //     alert("%i18n_props.voidray.viewer.invalid.canvas.id%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.NO_PRIVILEGE_AVAILABLE) {
        //     alert("%i18n_props.voidray.viewer.access.denied%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.CONSTRUCTOR_CALLBACK_FUNCTION_NOT_EXIST) {
        //     alert("%i18n_props.voidray.viewer.missing.callback%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.PARAMETER_IS_NULL_OR_EMPTY) {
        //     alert("%i18n_props.voidray.viewer.param.null.or.empty%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.INVALID_PARAMETER_TYPE) {
        //     alert("%i18n_props.voidray.viewer.param.type.invalid%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.FUNCTION_RETURNED_ERROR) {
        //     alert("%i18n_props.voidray.viewer.general.error%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.CALLBACK_FUNCTION_NOT_EXIST) {
        //     alert("%i18n_props.voidray.viewer.missing.callback%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.NOT_VALID_FOR_READ_ONLY_SESSION) {
        //     alert("%i18n_props.voidray.viewer.func.denied.readonly%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.MULTIPLE_INSTANCE_NOT_ALLOWED) {
        //     alert("%i18n_props.voidray.viewer.mult.viewer%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.HOST_NAME_OR_PORT_NOT_SET) {
        //     alert("%i18n_props.voidray.viewer.missing.name.or.port%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.USER_NAME_NAME_OR_PASSWORD_NOT_SET) {
        //     alert("%i18n_props.voidray.viewer.missing.credentials%");
        // }
        // else if (errorCode === RPViewer.RP_API_ERROR.TOKEN_NOT_SET) {
        //     alert("%i18n_props.voidray.viewer.token.not.set%");
        // }
        // else {
        //     alert("%i18n_props.voidray.viewer.api.error% \n\n%i18n_props.voidray.viewer.func.name%" +
        //         errorFunctionName + " \n%i18n_props.voidray.viewer.error.code%" + errorCode);
        // }
    };

    var stopSessionOnTarget = function (target, forceEndSession) {
        //Get screenshot of the canvas before we close the session

        //See if we need to end the KVM session before moving onto the next target
        //  We need to force this case if the user double clicks on a target to start a full KVM session
        //      or in the case of an error with the session
        //target.setInactive();
        if(forceEndSession || !keepSessionsLiveDuringScan){
			target.getScreenshotOfSession();
			target.showScreenshotCanvas();
			//target.setInactive();
            //end session will set inactive
            target.endSession();
        }
    };

    //This function is called after the user double clicks on a target to connect to a full KVM session with it
    var beginFullKvmSession = function(target){
        if(target.active) {

            //Even if the target is active, it may have an AJAX request live to get a session for it. Attempt to cancel
            target.abortPreviousRequest();

            //We had a timer set to stop the current session in place already, so cancel it immediately
             //window.clearTimeout(currentTimer);

            stopSessionOnTarget(target, true);

            //Don't schedule the next target if all targets are live
            //if(!allTargetsLive){
             //   scheduleNextTargetCycle();
            //}
       }
        window.clearTimeout(currentScanTimer);
        window.clearTimeout(currentBetweenScanTimer);

        scheduleNextTargetCycle();
        target.hasFullKvmSession = true;
    };

    var getTimeBetweenScans = function(){
        return timeBetweenScans;
    };

    //Time is in seconds
    var setTimeBetweenScans = function(newTime){
        timeBetweenScans = newTime;
    };

    var getScanTime = function(){
        return scanTime;
    };

    var setScanTime = function(newTime){
        scanTime = newTime;
    };

    var getTargetThumbnailSize = function(){
        return targetThumbnailSize;
    };

    var setTargetThumbnailSize = function(newSize){
        targetThumbnailSize = newSize;

        for(var x=0;x<targetList.length;x++){
            targetList[x].setThumbnailSize(targetThumbnailSize);
        }
    };

    var setAllTargetsLive = function(newAllLive,newMouseLive){
        //No change, so don't do anything
        if(keepSessionsLiveDuringScan === newAllLive && enableMouseAction===newMouseLive)
             return;

        if(newAllLive){
            //initiateAllLiveTargets();
            keepSessionsLiveDuringScan=newAllLive;
            if(newMouseLive!==enableMouseAction)
            {
				enableMouseAction=newMouseLive;
				endAllLiveTargets();

			}
        } else{

	        enableMouseAction=newMouseLive;
            if(keepSessionsLiveDuringScan!==newAllLive)
            {
				keepSessionsLiveDuringScan=newAllLive;
				endAllLiveTargets();
			}
        }

    };





    var initiateAllLiveTargets = function(){
        //Cancel the current scan timer
        window.clearTimeout(currentScanTimer);
        window.clearTimeout(currentBetweenScanTimer);

        for(var x=0;x<targetList.length;x++){
            var target = targetList[x];

            target.setActive();
            if(!target.sessionEstablished){
                startSession(target);
            } else {
                target.hideScreenshotCanvas();
            }
        }
    };

    var endAllLiveTargets = function(){
        for(var x=0;x<targetList.length;x++){
            var target = targetList[x];
            stopSessionOnTarget(target, true);
        }
        window.clearTimeout(currentScanTimer);
        window.clearTimeout(currentBetweenScanTimer);
        //Restart our scan
        startScanMode();
    };

    return {
        startScanMode: startScanMode,
        beginFullKvmSession: beginFullKvmSession,
        getScanTime: getScanTime,
        setScanTime: setScanTime,
        getTimeBetweenScans: getTimeBetweenScans,
        setTimeBetweenScans: setTimeBetweenScans,
        getTargetThumbnailSize: getTargetThumbnailSize,
        setTargetThumbnailSize: setTargetThumbnailSize,
        setAllTargetsLive: setAllTargetsLive,
        getActiveTarget: getActiveTarget,
        stopSessionOnTarget:stopSessionOnTarget,
        startScanOnNextTarget:startScanOnNextTarget,
        scanTarget:scanTarget
    };
};


initScanMode(window.targetInfo);

// Start the scan mode instance. This function is called after the targets are loaded.
function initScanMode(targetInfo) {

    var targetsToUse;
    if(isMSIE)
    {

	   targetsToUse=JSON.parse(localStorage.getItem("savedData"));
	   localStorage.removeItem("savedData")

    }
    else
    {
       targetsToUse = targetInfo;
    }

	console.log('TargetsToUse: ' + JSON.stringify(targetsToUse,null, 2))
    if(targetsToUse.length > 16){
        targetsToUse.splice(16, targetsToUse.length);
        alert("The maximum number of targets is 16. Only the first 16 targets will be used session.");
    }


    scanModeSession = new ScanModeManager(targetsToUse, {
        doubleClickEventHandler: doubleClickEventHandler,
        keepSessionsLive: false
    });
    scanModeSession.startScanMode();

    //Populate our settings
    setDefaultSettings();
}

// Report the login status (result).
function reportLoginStatus(loginStatus) {
    // report login exception status caught in notifications.js.  Reported
    // here to allow customized handling.  0 <= loginStatus <= 15
    console.log("Login failed. loginstatus: " + loginStatus);

    var message = i18nStrings.errorUnavailable;

    //We probably don't need this detailed error reporting for the scan mode, but comment it just in case...

    // var loginResult = RPViewer.RP_LOGIN_RESULT;
    // switch (loginStatus) {
    //     case loginResult.LOGIN_INVALID_USER:
    //     case loginResult.LOGIN_INVALID_PASSWORD:
    //     case loginResult.LOGIN_DENIED:
    //         message = "%i18n_props.voidray.viewer.error.access.denied%";
    //         break;
    //     case RPViewer.RP_LOGIN_RESULT.LOGIN_INUSE:
    //         message = "%i18n_props.voidray.viewer.error.in.use%";
    //         break;
    //     case loginResult.LOGIN_FAILED_PREEMPT_DENIED:
    //         message = "%i18n_props.voidray.viewer.error.preemption.rejected%";
    //         break;
    //     case loginResult.LOGIN_FULL:
    //         // SYNC -- the maximums below must match the actual values in KvmWebsocketsProxy.cpp. Otherwise,
    //         // the user error message below will be incorrect.
    //         message = "%i18n_props.voidray.viewer.error.max.sessions.reached%\n\n" +
    //             "%i18n_props.voidray.viewer.limits.are%\n" +
    //             "     %i18n_props.voidray.viewer.no.more.than%" + " 40 " + // MAX_KVM_SESSIONS
    //             "%i18n_props.voidray.viewer.sessions.total%.\n" +
    //             "     %i18n_props.voidray.viewer.no.more.than%" + " 40 " + // MAX_KVM_SESSIONS_PER_CLIENT
    //             "%i18n_props.voidray.viewer.sessions.per.client%.\n" +
    //             "     %i18n_props.voidray.viewer.only%" + " 1 " + // MAX_KVM_SESSIONS_PER_TARGET_FOR_CLIENT
    //             "%i18n_props.voidray.viewer.session.per.target.ea.client%.";
    //         break;
    //     case loginResult.LOGIN_INUSE_BY_EXCLUSIVE_USER:
    //         message = "%i18n_props.voidray.viewer.error.exclusive.in.use%";
    //         break;
    //     case loginResult.EXCLUSIVE_LOGIN_DENIED:
    //         message = "%i18n_props.voidray.viewer.error.exclusive.session.active%";
    //         break;
    //     case loginResult.LOGIN_NOSHARE:
    //         message = "%i18n_props.voidray.viewer.error.sharing.denied%";
    //         break;
    //     case loginResult.LOGIN_TIMEOUT:
    //         message = "%i18n_props.voidray.viewer.error.sharing.request.timed.out%";
    //         break;
    //     case loginResult.LOGIN_CERTIFICATE_NOT_VERIFIED:
    //         message = "%i18n_props.voidray.viewer.error.failed.to.connect.viewer%";
    //         break;
    //     case loginResult.LOGIN_CERTIFICATE_TIMEDOUT:
    //         message = "%i18n_props.voidray.viewer.error.certificate.verification.timed.out%"
    //             + "\n"
    //             + "%i18n_props.voidray.viewer.all.conn.will.be.closed%";
    //         break;
    //     case loginResult.LOGIN_WEBSOCKET_EXCEPTION:
    //         message = "%i18n_props.voidray.viewer.error.websocket.exception%";
    //         break;
    //     default:
    //         message = "%i18n_props.voidray.viewer.error.login.failed%";
    //         break;
    // }
    return message;
}

// Report the viewer's reason for termination.
function reportTerminationReason(messageNum) {
    //We probably don't need this detailed error reporting for the scan mode, but comment it just in case...
    // var shutdownReason = RPViewer.RP_SHUTDOWN_REASON;
    // var reason;
    // var isError = true;
    // switch (messageNum) {
    //     case shutdownReason.SHUTDOWN_ADMIN:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.admin%";
    //         isError = false;
    //         break;
    //     case shutdownReason.SHUTDOWN_TIMEOUT:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.idle.time.out%";
    //         break;
    //     case shutdownReason.SHUTDOWN_WEBSOCKET:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.net.dropped%";
    //         break;
    //     case shutdownReason.SHUTDOWN_REBOOT:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.appliance.reboot%";
    //         break;
    //     case shutdownReason.SHUTDOWN_UPGRADE:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.pending.firmware.upgrade%";
    //         break;
    //     case shutdownReason.SHUTDOWN_PREEMPT:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.local.user.channel.preemption%";
    //         isError = false;
    //         break;
    //     case shutdownReason.SHUTDOWN_UNSHARE:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.last.active.user.disc%";
    //         isError = false;
    //         break;
    //     case shutdownReason.SHUTDOWN_EXLUSIVE:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.primary.user.enter.exclusive%";
    //         isError = false;
    //         break;
    //     case shutdownReason.SHUTDOWN_OUT_OF_MEMORY:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.out.of.memory%";
    //         break;
    //     case shutdownReason.SHUTDOWN_EXCESSIVE_VIDEO_PAUSE:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.excess.video.pause%";
    //         break;
    //     default:
    //         reason = "%i18n_props.voidray.viewer.disc.reason.unknown%";
    //         break;
    // }

    // var message = "%i18n_props.voidray.viewer.client.shutdown%" + " ";
    // message += reason + ".";
    var message = i18nStrings.errorSessionTerminated;

    return message;
}

function setDefaultSettings(){
    document.getElementById("timeBetweenScansInput").value = scanModeSession.getTimeBetweenScans();
    document.getElementById("scanModeTimeInput").value = scanModeSession.getScanTime();
    document.getElementById("thumbnailSizeInput").value = scanModeSession.getTargetThumbnailSize();
}

//Click handlers for the topbar
var topbarButtonClickHandler = function(e){
    var modalDialog = document.getElementById("modalDialog");
    modalDialog.style.display = '';
    modalDialog.focus();
};
var topbarButtons = document.getElementsByClassName("topbarButton");
for(var i=0;i<topbarButtons.length;i++){
    topbarButtons[i].addEventListener('click', topbarButtonClickHandler, false);
}

var closeModalDialog = function(){
    //Don't close if there is an error changing the settings
    if(document.getElementById("modalErrorMessage").style.display !== 'none')
        return;

    setDefaultSettings();
    document.getElementById("modalDialog").style.display = 'none';

    //Reset the input's border color as well
    document.getElementById("timeBetweenScansInput").style.border = '';
    document.getElementById("scanModeTimeInput").style.border = '';
};
var closeButton = document.getElementById("modalClose");
closeButton.addEventListener("click", closeModalDialog, false);
document.addEventListener("keyup", function(e){
    if(e.key === "Escape" || e.key === "Esc"){  //Edge uses "Esc" for reasons
        closeModalDialog();
    }
    // else if(e.key === "Tab"){        TODO: make topbar more accessible for keyboard users
    //     document.getElementById("topbar").focus();
    // }
    else if(e.key === "Enter" && document.getElementById("modalDialog").style.display !== 'none'){
        //Close the error message div if it's open
        if(document.getElementById("modalErrorMessage").style.display !== 'none'){
            closeErrorMsg();
            return;
        }
        setInput();
    }
}, false);

//Put this event listener on the background so bubbling doesn't close the modal when the user clicks on the inputs
document.getElementById("modalBackground").addEventListener("click", closeModalDialog, false);

var setInput = function(){
    var timeBetweenScansInput = document.getElementById("timeBetweenScansInput"),
        scanTimeInput = document.getElementById("scanModeTimeInput"),
        newTimeBetweenScan = parseInt(timeBetweenScansInput.value),
        newScanTime = parseInt(scanTimeInput.value),
        newThumbnailSize = document.getElementById("thumbnailSizeInput").value,
        newAllTargetsLive = document.getElementById("allTargetsLiveInput").checked,
        newenableMouseAction=document.getElementById("mouseActionInput").checked;

    var timeBetweenScanIsValid = (typeof newTimeBetweenScan === "number" &&
            newTimeBetweenScan > -1 && newTimeBetweenScan < 61),
        scanTimeIsValid = (typeof newScanTime === "number" &&
            newScanTime > 4 && newScanTime < 61);

    //Reset the border CSS in case there was previously an error
    timeBetweenScansInput.style.border = '';
    scanTimeInput.style.border = '';
    var errorBorderCss = "1px solid red";
    if(!scanTimeIsValid && !timeBetweenScanIsValid) {
        timeBetweenScansInput.style.border = errorBorderCss;
        scanTimeInput.style.border = errorBorderCss;

        var errorMessage = i18nStrings.errorScanTime + "<br><br>" + i18nStrings.errorTimeBetweenScans;
        document.getElementById("errorMessage").innerHTML = errorMessage;
        document.getElementById("modalErrorMessage").style.display = '';
        return;
    } else if(!scanTimeIsValid){
        scanTimeInput.style.border = errorBorderCss;
        document.getElementById("errorMessage").innerHTML = i18nStrings.errorScanTime;
        document.getElementById("modalErrorMessage").style.display = '';
        return;
    } else if(!timeBetweenScanIsValid){
        timeBetweenScansInput.style.border = errorBorderCss;
        document.getElementById("errorMessage").innerHTML = i18nStrings.errorTimeBetweenScans;
        document.getElementById("modalErrorMessage").style.display = '';
        return;
    }

    scanModeSession.setTimeBetweenScans(newTimeBetweenScan);
    scanModeSession.setScanTime(newScanTime);
    scanModeSession.setTargetThumbnailSize(newThumbnailSize);
    scanModeSession.setAllTargetsLive(newAllTargetsLive,newenableMouseAction);


    closeModalDialog();
};
document.getElementById("settingsSubmit").addEventListener("click", setInput, false);

var closeErrorMsg = function(){
    document.getElementById("errorMessage").innerHTML = '';
    document.getElementById("modalErrorMessage").style.display = "none";
};
document.getElementById("errorClose").addEventListener("click", closeErrorMsg, false);



 function HandleCert(ipaddr, port, cert)
  {

 	  var activeTarget = scanModeSession.getActiveTarget();

 	if(ipaddr==''||port==''||cert=='')
 	{
		//error occured, scan next one
	   console.log('CERTError '+ activeTarget.name);
	   if(!keepSessionsLiveDuringScan)
           scanModeSession.stopSessionOnTarget(activeTarget, true);



           window.clearTimeout(currentScanTimer);
           window.clearTimeout(currentBetweenScanTimer);

           setTimeout(function(){

		        scanModeSession.startScanOnNextTarget();


        }, (scanModeSession.getTimeBetweenScans()+scanModeSession.getScanTime())*1000);


       return;

    }
 	console.log('CERT '+ cert);

         //alert(cert);
    strCert = b64DecodeUnicode(cert);
 	console.log('CERT length : '+ strCert.length +' :  ' + strCert);
 	mIPAddress = ipaddr;
        activeTarget.strCerts=b64DecodeUnicode(cert);;
        scanModeSession.scanTarget(activeTarget);
  }




 function applyConfigCert(tdid)
 {
 	bUseCert = true;
 	setiFaceCertCallback(HandleCert);
    var tempPostURL = "/dsview/protected/viewer.do"; // postURL
    var mode = 0; //normal
    if (!enableMouseAction)
    {

        mode = 7;  //scan
    }
 	getiFaceKVMCert(tempPostURL,tdid,mode);
 }



