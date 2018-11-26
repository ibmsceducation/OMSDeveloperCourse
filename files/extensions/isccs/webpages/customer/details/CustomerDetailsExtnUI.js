
scDefine(["dojo/text!./templates/CustomerDetailsExtn.html","scbase/loader!dojo/_base/declare","scbase/loader!dojo/_base/kernel","scbase/loader!dojo/_base/lang","scbase/loader!dojo/text","scbase/loader!extn/customer/wishlist/WishListScreenInitController","scbase/loader!idx/layout/ContentPane","scbase/loader!sc/plat","scbase/loader!sc/plat/dojo/utils/BaseUtils","scbase/loader!sc/plat/dojo/widgets/ControllerWidget","scbase/loader!sc/plat/dojo/widgets/IdentifierControllerWidget"]
 , function(			 
			    templateText
			 ,
			    _dojodeclare
			 ,
			    _dojokernel
			 ,
			    _dojolang
			 ,
			    _dojotext
			 ,
			    _extnWishListScreenInitController
			 ,
			    _idxContentPane
			 ,
			    _scplat
			 ,
			    _scBaseUtils
			 ,
			    _scControllerWidget
			 ,
			    _scIdentifierControllerWidget
){
return _dojodeclare("extn.customer.details.CustomerDetailsExtnUI",
				[], {
			templateString: templateText
	
	
	
	
	
	
	
	
	,
	hotKeys: [ 
	]

,events : [
	]

,subscribers : {

local : [

{
	  eventId: 'extn_pnlWishList_onShow'

,	  sequence: '51'




,handler : {
methodName : "loadWishList"

 
}
}

]
}

});
});


