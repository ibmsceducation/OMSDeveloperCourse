angular.module("store").config(["iscCordovaProvider",function(iscCordovaProvider){
    // Cordova initialization start
    iscCordovaProvider.registerPluginInitialization(["iscBarcodeScanner",function(iscBarcodeScanner){
        if(window.Infinea){
            Infinea.init();
            Infinea.barcodeDataCallback = function(barcode, type, typeText){
                //alert(barcode);
                iscBarcodeScanner.placeBarcodeToElement(barcode);
            }
            Infinea.msrDataCallback = function(msrData){
                //alert(msrData);
                console.log(msrData);
            }
        }
    }]);
}]);



