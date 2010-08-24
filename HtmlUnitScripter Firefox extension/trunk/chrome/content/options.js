/*
  Written by Matt Gross
  07/2010
*/
var prefManager = Components.classes["@mozilla.org/preferences-service;1"]
                .getService(Components.interfaces.nsIPrefBranch);

function loadPreferenceOptions()
{
	loadLinkPreferenceOptions();
	loadElementPreferenceOptions();
	loadLoggingOptions();
}

function loadLinkPreferenceOptions()
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.linkPreference");
	var radioGroup = document.getElementById("linkPreferences");

	if("link-useName" == prefString)
	{
		radioGroup.selectedIndex = 1;
	}
	else if("link-useText" == prefString)
	{
		radioGroup.selectedIndex = 2;
	}
	else if("link-useHref" == prefString)
	{
		radioGroup.selectedIndex = 3;
	}
	else if("link-useXPath" == prefString)
	{
		radioGroup.selectedIndex = 4;
	}
	else // Default- useId
	{
		radioGroup.selectedIndex = 0;
	}
}

function saveLinkPreferenceOptions()
{
	var selectedPref = "";

	var radioGroup = document.getElementById("linkPreferences");

	if(radioGroup.selectedIndex == 1)
	{
		selectedPref = "link-useName";
	}
	else if(radioGroup.selectedIndex == 2)
	{
		selectedPref = "link-useText";
	}
	else if(radioGroup.selectedIndex == 3)
	{
		selectedPref = "link-useHref";
	}
	else if(radioGroup.selectedIndex == 4)
	{
		selectedPref = "link-useXPath";
	}
	else
	{
		selectedPref = "link-useId";
	}

	return selectedPref;
}

function loadElementPreferenceOptions()
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementPreference");
	var radioGroup = document.getElementById("elementPreferences");

	if("element-useName" == prefString)
	{
		radioGroup.selectedIndex = 1;
	}
	else if("element-useXPath" == prefString)
	{
		radioGroup.selectedIndex = 2;
	}
	else // Default- useId
	{
		radioGroup.selectedIndex = 0;
	}
}


function saveElementPreferenceOptions()
{
	var selectedPref = "";

	var radioGroup = document.getElementById("elementPreferences");

	if(radioGroup.selectedIndex == 1)
	{
		selectedPref = "element-useName";
	}
	else if(radioGroup.selectedIndex == 2)
	{
		selectedPref = "element-useXPath";
	}
	else
	{
		selectedPref = "element-useId";
	}

	return selectedPref;
}

function loadLoggingOptions()
{
	var dropdown = document.getElementById("loggingDropdown");
	var pref = prefManager.getIntPref("extensions.htmlunitscripter.logging");

	dropdown.selectedIndex = pref;
}

function saveLoggingPreference()
{
	var dropdown = document.getElementById("loggingDropdown");
	return dropdown.selectedIndex;

}
