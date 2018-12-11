cordova.define("cordova-plugin-infinea.Infinea", function(require, exports, module) {
var exec = require('cordova/exec'),
cordova = require('cordova');

var Infinea = {

    /**
    Barcode scan modes
    */
    BarcodeScanMode :
    {
        /**
        The scan will be terminated after successful barcode recognition (default)
        */
        SINGLE_SCAN: 0,
        /**
        Scanning will continue unless either scan button is releasd, or stop scan function is called
        */
        MULTI_SCAN: 1,
        /**
        For as long as scan button is pressed or stop scan is not called the engine will operate in low power scan mode trying to detect objects entering the area, then will turn on the lights and try to read the barcode. Supported only on Code engine.
        */
        MOTION_DETECT: 2,
        /**
        Pressing the button/start scan will enter aim mode, while a barcode scan will actually be performed upon button release/stop scan.
        */
        SINGLE_SCAN_RELEASE: 3,
        /**
        Same as multi scan mode, but allowing no duplicate barcodes to be scanned
        */
        MULTI_SCAN_NO_DUPLICATES: 4
    },

    /**
    Barcode integer types
    */
    BarcodeType :
    {
        UPCA: 1,
        CODABAR: 2,
        CODE25_NI2OF5: 3,
        CODE25_I2OF5: 4,
        CODE39: 5,
        CODE93: 6,
        CODE128: 7,
        CODE11: 8,
        CPCBINARY: 9,
        DUN14: 10,
        EAN2: 11,
        EAN5: 12,
        EAN8: 13,
        EAN13: 14,
        EAN128: 15,
        GS1DATABAR: 16,
        ITF14: 17,
        LATENT_IMAGE: 18,
        PHARMACODE: 19,
        PLANET: 20,
        POSTNET: 21,
        INTELLIGENT_MAIL: 22,
        MSI_PLESSEY: 23,
        POSTBAR: 24,
        RM4SCC: 25,
        TELEPEN: 26,
        UK_PLESSEY: 27,
        PDF417: 28,
        MICROPDF417: 29,
        DATAMATRIX: 30,
        AZTEK: 31,
        QRCODE: 32,
        MAXICODE: 33,
        UPCA_2: 39,
        UPCA_5: 40,
        UPCE: 41,
        UPCE_2: 42,
        UPCE_5: 43,
        EAN13_2: 44,
        EAN13_5: 45,
        EAN8_2: 46,
        EAN8_5: 47,
        CODE39_FULL: 48,
        ITA_PHARMA: 49,
        CODABAR_ABC: 50,
        CODABAR_CX: 51,
        SCODE: 52,
        MATRIX_2OF5: 53,
        IATA: 54,
        KOREAN_POSTAL: 55,
        CCA: 56,
        CCB: 57,
        CCC: 58
    },

    /**
    Function to be called when barcode scanning is available or unavailable
    @param available boolean indicating weither barcode scanning is possible
    */
    barcodeStatusCallback : null,

    /**
    Function to be called when barcode data is available, parameters are:
    @param barcode barcode text
    @param type barcode type as number
    @param typeText barcode type as test for display
    */
    barcodeDataCallback : null,

    /**
    Function to be called when device button is pressed or released, parameters are:
    @param button index
    @param status
    */
    buttonPressedCallback : null,


    /**
    Function to be called when msr data is available, parameters are:
    @param data
    */
    msrDataCallback : null,

    /**
    Function to be called when rfid data is available, parameters are:
    @param data
    */
    rfidDataCallback : null,

    /**
    Initializes the plugin, call this function before any other. It is recommended to set the callbacks before calling this function so no event is missed
    */
    init: function (success, failure)
    {
        cordova.exec(null, null, 'Infinea', 'initWithCallbacks', [ 
            { 
                barcodeStatusCallback: "Infinea._onBarcodeStatus", 
                barcodeDataCallback: "Infinea._onBarcodeData", 
                buttonPressedCallback: "Infinea._onButtonPressed",
                msrDataCallback: "Infinea._onMSRData" ,
                rfidDataCallback: "Infinea._onRFIDData" 
            }]);
    },

    _onBarcodeStatus: function (available, rfid)
    {
        if(this.barcodeStatusCallback!=null)
            this.barcodeStatusCallback(available, rfid);
    },

    _onBarcodeData: function (barcode, type, typeText)
    {
        if(this.barcodeDataCallback!=null)
            this.barcodeDataCallback(barcode, type, typeText);
    },

    _onButtonPressed: function(button, status){
        if(this.buttonPressedCallback !=null)
            this.buttonPressedCallback(button, status);
    },

    _onMSRData: function(data){
        if(this.msrDataCallback !=null)
            this.msrDataCallback(data);
    },

    _onRFIDData: function(data){
        if(this.rfidDataCallback !=null)
            this.rfidDataCallback(data);
    },

    /**
    Set Auto Off Timeout
    @param success function to be called upon success
    @param failure function to be called upon faulure
    */
    deviceInfo: function (success, failure)
    {
        cordova.exec(success, failure, 'Infinea', 'deviceInfo', []);
    },
            
    /**
    Set Auto Off Timeout
    @param success function to be called upon success
    @param failure function to be called upon faulure
    @param on int value weither time to auto time out device
    */
    setAutoTimeout: function (success, failure, time)
    {
        cordova.exec(success, failure, 'Infinea', 'setAutoTimeout', [ time ]);
    },

    /**
    Set Pass Through Sync
    @param on bool value either turn on:true or off: false
    */
    setPassThrough: function (success, failure, on)
    {
        cordova.exec(success, failure, 'Infinea', 'setPassThrough', [ on ]);
    },

    /**
    Set Device Charge
    @param on bool value either turn on:true or off: false
    */
    setDeviceCharge: function (success, failure, on)
    {
        cordova.exec(success, failure, 'Infinea', 'setDeviceCharge', [ on ]);
    },

    /**
    Set Device Sound
    @param on bool value either turn on:true or off: false
    @param volume int value
    */
    setDeviceSound: function (success, failure, on, volume)
    {
        cordova.exec(success, failure, 'Infinea', 'setDeviceSound', [ on, volume ]);
    },
               

    /**
    Initiates barcode scan, the engine stays on until connection is lost or the function is called with 'off' argument
    @param on boolean value weither to start or stop the scan
    */
    barcodeScan: function (success, failure, on)
    {
        cordova.exec(success, failure, 'Infinea', 'barScan', [ on ]);
    },

    /**
    Sets the mode at which barcode engine operates. Not all modes are supported on all engines.
    @param mode barcode scan mode, one of the BarcodeScanMode constants
    */
    barcodeSetScanMode: function (success, failure, mode)
    {
        cordova.exec(success, failure, 'Infinea', 'barSetScanMode', [ mode ]);
    },

    /**
    Sets additional configuration parameters on opticon barcode engine. Use this function with EXTREME care,
    you can easily render your barcode engine useless. Refer to the barcode engine documentation on supported commands.

    @note The function encapsulates the data with the ESC and CR so you don't have to send them.

    <br>You can send multiple parameters with a single call if you format them as follows:
    - commands that take 2 symbols can be sent without any delimiters, like: "C1C2C3"
    - commands that take 3 symbols should be prefixed by [, like: "C1[C2AC3" (in this case commands are C1, C2A and C3
    - commands that take 4 symbols should be prefixed by ], like: "C1C2]C3AB" (in this case commands are C1, C2 and C3AB
    @param data configuration data, according to engine's documentation
    */
    barcodeOpticonSetCustomConfig: function (success, failure, data)
    {
        exec(success, failure, 'Infinea', 'barOpticonSetCustomConfig', [ data ]);
    },

    /**
    Sets additional configuration parameters on intermec barcode engine. Use this function with EXTREME care,
    you can easily render your barcode engine useless. Refer to the barcode engine documentation on supported commands.
    @param success function to be called upon success
    @param failure function to be called upon faulure
    @param data configuration data, according to engine's documentation
    */
    barcodeIntermecSetCustomConfig: function (success, failure, data)
    {
        exec(success, failure, 'Infinea', 'barIntermecSetCustomConfig', [ data ]);
    },

    /**
    Sets the value of a parameter inside code barcode engine. Use this function with EXTREME care,
    you can easily render your barcode engine useless. Refer to the barcode engine documentation on supported commands.
    @note first time you physically plug the iOS device into the sled, the engine takes about 11 seconds to initialize, and the function will fail
    @param success function to be called upon success
    @param failure function to be called upon faulure
    @param list an array of [parameter number, value], according to engine's documentation
    */
    barcodeCodeSetParams: function (success, failure, list)
    {
        exec(success, failure, 'Infinea', 'barCodeSetParams', [ list ]);
    }          
};

module.exports = Infinea;

});
