/*******************************************************************************
   IBM Confidential 
   OCO Source Materials 
   IBM Sterling Selling and Fullfillment Suite
   (c) Copyright IBM Corp. 2001, 2013 All Rights Reserved.
   The source code for this program is not published or otherwise divested of its trade secrets, 
   irrespective of what has been deposited with the U.S. Copyright Office. 
 *******************************************************************************/
Ext.namespace('sci.ide');

sci.ide.ExtnSourceGenerator = function() {
    var tplConfigOverlays = new Ext.XTemplate(
                                        '<tpl if="copyrightComments">',
                                        "/*********************************************************************************",
                                        "\n * {copyrightComments}\n",
                                        " *********************************************************************************/\n \n",
                                        '</tpl>',
                                        '<tpl if="pkg">',
                                        "Ext.namespace('{pkg}');\n",
                                        '</tpl>',
                                        "\n",
                                        "{class_name}ConfigOverlays = function() {\n",
                                           "\treturn {overlays};\n}"
                                        );
    tplConfigOverlays.compile();

    var tplExtension = new Ext.XTemplate(
                                '<tpl if="copyrightComments">',
                             "/*********************************************************************************",
                                "\n * {copyrightComments}\n",
                                " *********************************************************************************/\n \n",
                                '</tpl>',
                                '<tpl if="pkg">',
                                "Ext.namespace('{pkg}');\n",
                                '</tpl>',
                                "\n",
                                "{class_name} = function() {\n",
                                   "\t{class_name}.superclass.constructor.call(this);",
                                "\n}",
                                "\n",
                                "Ext.extend({class_name}, {superclassName}, {\n",
                                   "\tclassName: '{class_name}',\n",
                                   "\tgetConfigOverlays: {class_name}ConfigOverlays,\n",
                                   "\tnamespaces: {\n",
                                    "\t\ttarget: [", '<tpl for="target">', "'{.}'", '{[xindex !== xcount ? ", " : ""]}', '</tpl>', "],\n",
                                    "\t\tsource: [", '<tpl for="source">', "'{.}'", '{[xindex !== xcount ? ", " : ""]}', '</tpl>', "]\n",
                                    "\t},\n",
                                    "\tnamespacesDesc: {\n",
                                    "\t\ttargetDesc: [", '<tpl for="targetDesc">', "'{.}'", '{[xindex !== xcount ? ", " : ""]}', '</tpl>', "],\n",
                                    "\t\tsourceDesc: [", '<tpl for="sourceDesc">', "'{.}'", '{[xindex !== xcount ? ", " : ""]}', '</tpl>', "]\n",
                                    "\t}\n",
                                "});",
                                "sc.plat.ScreenExtnMgr.add('{screenClassName}', {class_name});"
                                );
    tplExtension.compile();
    
    function doSave(extensionContext) {
        var file = extensionContext.file;
        var osi = sci.ide.OS.getInterface();
        var SEP = osi.FILE_SEP;
        var name = file.name.substring(0, file.name.lastIndexOf('.'));
        var dirPath = file.getParent().path;
        
        var values = prepareValues(extensionContext);
        
        var src_configOverlays = tplConfigOverlays.apply(values);
        var src_extension = tplExtension.apply(values);
        
        if(typeof js_beautify === 'function') {
            src_configOverlays = js_beautify(src_configOverlays);
            src_extension = js_beautify(src_extension);
        }
        osi.getFile(dirPath, name + '_overlays.js').write(src_configOverlays);
        
        var extensionFile = osi.getFile(dirPath, name + '.js');
        if(extensionFile.exists()) {
            console.log(extensionFile.path, " already exists. writing to a sample file");
            extensionFile = osi.getFile(dirPath, name + '.js.sample');
        }
        extensionFile.write(src_extension);
    }
    function getNamespaces(extensionContext) {
        var overlaysArray = extensionContext.getOverlays();
        var namespaces = {
            'source': []
            , 'target': []
            , 'sourceDesc': []
            , 'targetDesc': []
        };
        for(var i = 0; i < overlaysArray.length; i++) {
            var anOverlay = overlaysArray[i];
            if(anOverlay.op === 'change') {
                if(!Ext.isEmpty(anOverlay.config.namespaces)) {
                    var ns = anOverlay.config.namespaces;
                    if(!Ext.isEmpty(ns.source)) {
                        var sourceArr = ns.source;
                        for(var j = 0; j < sourceArr.length; j++) {
                            var aSource = sourceArr[j];
                            Ext.isEmpty(aSource.name) ? namespaces['source'].push('') : namespaces['source'].push(aSource.name);
                            Ext.isEmpty(aSource.description) ? namespaces['sourceDesc'].push('') : namespaces['sourceDesc'].push(aSource.description);
                        }
                    }
                    if(!Ext.isEmpty(ns.target)) {
                        var targetArr = ns.target;
                        for(var j = 0; j < targetArr.length; j++) {
                            var aTarget = targetArr[j];
                            Ext.isEmpty(aTarget.name) ? namespaces['target'].push('') : namespaces['target'].push(aTarget.name);
                            Ext.isEmpty(aTarget.description) ? namespaces['targetDesc'].push('') : namespaces['targetDesc'].push(aTarget.description);
                        }
                    }
                }
            }
        }
        return namespaces;
    }
    function prepareValues(extensionContext) {
        var cpyrtCmt = sci.ide.PreferenceMgr.getValue('copyrightcomments');
        var extension = extensionContext.config.extension;
        var className = extension.className || '',
            superclassName = extension.superclassName || 'sc.plat.ui.Extension',
            screenClassName = extension.screenClassName || '',
            ns, arrey = className.split('.');
        if(arrey.length > 1) {
            arrey.pop();
            ns = arrey.join('.');
        }
        var namespaces = getNamespaces(extensionContext);
        return {
            copyrightComments: cpyrtCmt
            , pkg: ns
            , class_name:  className
            , overlays: extensionContext.toOverlaySrc()
            , superclassName: superclassName
            , screenClassName: screenClassName
            , target: namespaces.target || []
            , source: namespaces.source || []
            , targetDesc: namespaces.targetDesc || []
            , sourceDesc: namespaces.sourceDesc || []
        }
    }

    return {
        save: doSave
    }
}();