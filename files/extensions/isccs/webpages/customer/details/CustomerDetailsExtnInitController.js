


scDefine(["scbase/loader!dojo/_base/declare","scbase/loader!dojo/_base/kernel","scbase/loader!dojo/text","scbase/loader!extn/customer/details/CustomerDetailsExtn","scbase/loader!sc/plat/dojo/controller/ExtnScreenController"]
 , function(			 
			    _dojodeclare
			 ,
			    _dojokernel
			 ,
			    _dojotext
			 ,
			    _extnCustomerDetailsExtn
			 ,
			    _scExtnScreenController
){

return _dojodeclare("extn.customer.details.CustomerDetailsExtnInitController", 
				[_scExtnScreenController], {

			
			 screenId : 			'extn.customer.details.CustomerDetailsExtn'

			
			
			
			
			
						,

			
			
			 mashupRefs : 	[
	 		{
		 sourceBindingOptions : 			''
,
		 sequence : 			''
,
		 mashupId : 			'customerDetails_getCompleteConsumerCustomerDetails'
,
		 sourceNamespace : 			'getCompleteCustomerDetails_output'
,
		 mashupRefId : 			'getCompleteCustomerDetails'
,
		 extnType : 			''
,
		 callSequence : 			''

	}

	]

}
);
});

