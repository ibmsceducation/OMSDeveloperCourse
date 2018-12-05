scDefine([
	"dojo/text!./templates/WishListScreen.html",
	"scbase/loader!dijit/form/Button",
	"scbase/loader!dojo/_base/declare",
	"scbase/loader!idx/form/TextBox",
	"scbase/loader!idx/layout/ContentPane",
	"scbase/loader!sc/plat/dojo/utils/BaseUtils",
	"scbase/loader!sc/plat/dojo/utils/EventUtils",
	"scbase/loader!sc/plat/dojo/widgets/Label",
	"scbase/loader!sc/plat/dojo/widgets/Link",
	"scbase/loader!sc/plat/dojo/widgets/Screen",
	"scbase/loader!sc/plat/dojo/utils/ScreenUtils",
	"scbase/loader!sc/plat/dojo/utils/ModelUtils"
],
function(
	templateText,
	_dijitButton,
	_dojodeclare,
	_idxTextBox,
	_idxContentPane,
	_scBaseUtils,
	_scEventUtils,
	_scLabel,
	_scLink,
	_scScreen,
	_scScreenUtils,
	_scModelUtils
) {
    return _dojodeclare("extn.customer.wishlist.WishListScreen", [_scScreen], {
		templateString: templateText,
		uId: "customScreen",
		packageName: "extn.customer.wishlist",
		className: "WishListScreen",
     showRelatedTask: true,
		namespaces: {
			sourceBindingNamespaces: [{
				description: 'Initial input to screen',
				value: 'screenInput'
			}]
		},
		staticBindings: [],
		events: [],
		subscribers: {
			local: [{
				eventId: 'afterScreenInit',
				sequence: '30',
				handler: {
					methodName: "initializeScreen"
				}
			}]
		},
		
		initializeScreen: function(event, bEvent, ctrl, args) {
			console.log(args);
			//_scScreenUtils.setModel(this, "screenInput", args.screen.scEditorInput, null);
			
		}
	});
});
