/*******************************************************************************
 * IBM Confidential
 * OCO Source Materials
 * IBM Sterling Order Management Store (5725-D10)
 * (C) Copyright IBM Corp.  2015, 2016 All Rights Reserved.
 * The source code for this program is not published or otherwise divested of its trade secrets, irrespective of what has been deposited with the U.S. Copyright Office.
 ******************************************************************************/
/*
	This file is used to configure currency formatting information for various currency codes. Below are the formatting information for the ten
	currencies currently present in the YFS_CURRENCY table in the database. If a new currency is added to this table, add the formatting information for it here.
	
	'currencyCode' in the example JSON objects below should match the 'Currency' returned by the 'getCurrencyList' API.
	'currencyDescription' in the example JSON objects below are just for explanation. This key is not used anywhere else. 
	'NUMBER_FORMATS' for each of the currencies follow the angular i18n standards and the JSON objects below are copied from the respective angular-locale-<country_code>.js files present under angular-i18n folder. https://github.com/angular/angular.js/tree/master/i18n
	
	JSON objects are also added with currencyCode value as 'defaultPrefix' and 'defaultSuffix' in this file. Those two objects are used if no currency formatting information is found for a currency code returned by the 'getCurrencyList' API.

*/

angular.module('store').config(['iscCurrencyFormatProvider',function(iscCurrencyFormatProvider){
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "USD",
		"currencyDescription" : "US Dollar",
		"NUMBER_FORMATS" : {
			"CURRENCY_SYM": "$",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4",
				"negSuf": "",
				"posPre": "\u00a4",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
                "currencyCode" : "GBP",
                "NUMBER_FORMATS" : {
                        "CURRENCY_SYM": "\u00a3",
                        "currencyDescription" : "GBP",
                        "DECIMAL_SEP": ",",
                        "GROUP_SEP": ".",
                        "PATTERNS":
                        {
                                "gSize": 3,
                                "lgSize": 3,
                                "maxFrac": 2,
                                "minFrac": 2,
                                "minInt": 1,
                                "negPre": "-",
                                "negSuf": "\u00a0\u00a4",
                                "posPre": "",
                                "posSuf": "\u00a0\u00a4"
                        }
                }
        });
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "EUR",
		"NUMBER_FORMATS" : {
			"CURRENCY_SYM": "\u20ac",
			"currencyDescription" : "Euro",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": ".",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-",
				"negSuf": "\u00a0\u00a4",
				"posPre": "",
				"posSuf": "\u00a0\u00a4"
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "INR",
		"currencyDescription" : "Indian Rupee",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u20b9",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 2,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4\u00a0",
				"negSuf": "",
				"posPre": "\u00a4\u00a0",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "CNY",
		"currencyDescription" : "Chinese Yuan",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u00a5",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4\u00a0",
				"negSuf": "",
				"posPre": "\u00a4\u00a0",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "JPY",
		"currencyDescription" : "Japanese Yen",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u00a5",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4",
				"negSuf": "",
				"posPre": "\u00a4",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "KRW",
		"currencyDescription" : "South Korean Won",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u20a9",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4",
				"negSuf": "",
				"posPre": "\u00a4",
				"posSuf": ""
			}	
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "BRL",
		"currencyDescription" : "Brazilian Real",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "R$",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": ".",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4",
				"negSuf": "",
				"posPre": "\u00a4",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "PLN",
		"currencyDescription" : "Polish Zloty",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "z\u0142",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": "\u00a0",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-",
				"negSuf": "\u00a0\u00a4",
				"posPre": "",
				"posSuf": "\u00a0\u00a4"
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "TRY",
		"currencyDescription" : "Turkish Lira",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "TL",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": ".",
			"PATTERNS":
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-",
				"negSuf": "\u00a0\u00a4",
				"posPre": "",
				"posSuf": "\u00a0\u00a4"
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "RUB",
		"currencyDescription" : "Russian Ruble",
		"NUMBER_FORMATS": {
			"CURRENCY_SYM": "\u0440\u0443\u0431.",
			"DECIMAL_SEP": ",",
			"GROUP_SEP": "\u00a0",
			"PATTERNS":			  
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-",
				"negSuf": "\u00a0\u00a4",
				"posPre": "",
				"posSuf": "\u00a0\u00a4"
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "defaultPrefix",
		"currencyDescription" : "Default currency format with currency symbol as prefix",
		"NUMBER_FORMATS" : {
			"CURRENCY_SYM": "",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-\u00a4",
				"negSuf": "",
				"posPre": "\u00a4",
				"posSuf": ""
			}
		}
	});
	iscCurrencyFormatProvider.addCurrencyFormat({
		"currencyCode" : "defaultSuffix",
		"currencyDescription" : "Default currency format with currency symbol as suffix",
		"NUMBER_FORMATS" : {
			"CURRENCY_SYM": "",
			"DECIMAL_SEP": ".",
			"GROUP_SEP": ",",
			"PATTERNS": 
			{
				"gSize": 3,
				"lgSize": 3,
				"maxFrac": 2,
				"minFrac": 2,
				"minInt": 1,
				"negPre": "-",
				"negSuf": "\u00a0\u00a4",
				"posPre": "",
				"posSuf": "\u00a0\u00a4"
			}
		}
	});
}]);
