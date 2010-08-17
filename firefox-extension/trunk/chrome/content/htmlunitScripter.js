/*
  Written by Matt Gross
  06/2010
*/

/*
 Global variables
*/
const ConsoleService =
	Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);

const prefManager = 
	Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);

const LOGGING_VERBOSE = 2;
const LOGGING_ERROR = 1;

var isRecording = false;
const idsToIgnore = ["htmlunitScripterTextbox","urlbar","powerbutton-icon","closeIcon","clearTextbox","pauseButton","recordButton","currentVarTextbox","varAppendTextbox"];
const textFieldTypes = ["text","textarea","password"];

var codeBuffer = "";
var anchorBuffer = "";
var theBeginUrl = "";
var theEndUrl = "";
const tabs = "               ";
var urlBar = document.getElementById("urlbar");
var variableNumTextBox;
var variableAppendBox; 

/*
 Primary function starts here
*/
var htmlunitScripter = function () {
	return {
		start : function ()
		{
			var startButton = document.getElementById("powerbutton-icon");
			var closeButton = document.getElementById("close-icon");
			var mainWindow = document.getElementById("htmlunitScripterToolbar");
			var textbox = document.getElementById("htmlunitScripterTextbox");
			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");
			variableNumTextBox = document.getElementById("currentVarTextbox");
			variableAppendBox = document.getElementById("varAppendTextbox");

			pauseButton.disabled = true;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause-glow.png";

			recordButton.disabled = false;
			recordButton.image = "chrome://htmlunitscripter/skin/record.png";

			isRecording = false;
			variableNumTextBox.value = 1;

			startButton.hidden = true;
			closeButton.hidden = false;
			mainWindow.hidden = false;
			textbox.hidden = false;
			textbox.value = "";

			codeBuffer = "";
			anchorBuffer = "";
			theBeginUrl = "";
			theEndUrl = "";

		},

		close : function ()
		{
			var startButton = document.getElementById("powerbutton-icon");
			var closeButton = document.getElementById("close-icon");
			var mainWindow = document.getElementById("htmlunitScripterToolbar");
			var textbox = document.getElementById("htmlunitScripterTextbox");

			startButton.hidden = false;
			closeButton.hidden = true;
			mainWindow.hidden = true;
			textbox.hidden = true;
		},

		flush : function ()
		{
			var textbox = document.getElementById("htmlunitScripterTextbox");
			textbox.value = textbox.value + codeBuffer + anchorBuffer;
			codeBuffer = "";
			anchorBuffer = "";
		},

		clear : function ()
		{
			var textbox = document.getElementById("htmlunitScripterTextbox");
			textbox.value = "";

			var variableNumTextBox = document.getElementById("currentVarTextbox");
			variableNumTextBox.value = "1";

			codeBuffer = "";
			anchorBuffer = "";
			theBeginUrl = "";
			theEndUrl = "";
		},

		openJavaClassWindow : function ()
		{
			htmlunitScripter.flush();			

			var theWidth=window.screen.width-60;
			var theHeight=window.screen.height-200;
			var top = 25;
			var left = 25;
			var openProperties="width=" + theWidth + ",height=" + theHeight + ",top=" + top + ",left=" + left;
						
			var newWindow = window.openDialog("chrome://htmlunitscripter/content/generateJava.xul", 
								"", 
								openProperties,
								{beginUrl: theBeginUrl, endUrl: theEndUrl});
		},

		onPageLoad : function (event)
		{
			
			if(isRecording)
			{
				var textbox = document.getElementById("htmlunitScripterTextbox");

				// Write out the buffers now for the previous page
				textbox.value = textbox.value + codeBuffer + anchorBuffer;
				codeBuffer = "";
				anchorBuffer = "";

				// Print out the info for the newly loaded page
				if(event.originalTarget instanceof HTMLDocument)
				{
					var useMainFrameOnly = prefManager.getBoolPref("extensions.htmlunitscripter.useMainFrameOnly");

					// Based on the user preferences, filter out frames that are not the main frame. This prevents items
					// like ads in separate frames from showing up, but may prevent other websites from functioning properly.				
					if( (useMainFrameOnly && !event.originalTarget.defaultView.frameElement) || !useMainFrameOnly )
					{
						// Looking for "http" in the URL filters out internal chrome:// URLs
						if(event.originalTarget.URL.indexOf("http")>-1)
						{
							addProgressStatement("Current page: " + event.originalTarget.title);
							textbox.value = textbox.value + tabs + "// Current page:\n"
										+ tabs + "// Title=" + event.originalTarget.title + "\n"
										+ tabs + "// URL=" + event.originalTarget.URL + "\n\n";
						}
					}		
				}
			}				
		},
			
		record : function()
		{
			isRecording = true;

			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");
			var textbox = document.getElementById("htmlunitScripterTextbox");			 

			pauseButton.disabled = false;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause.png";

			recordButton.disabled = true;
			recordButton.image = "chrome://htmlunitscripter/skin/record-glow.png";
		},

		pause : function()
		{
			isRecording = false;

			var pauseButton = document.getElementById("pauseButton");
			var recordButton = document.getElementById("recordButton");

			pauseButton.disabled = true;
			pauseButton.image = "chrome://htmlunitscripter/skin/pause-glow.png";

			recordButton.disabled = false;
			recordButton.image = "chrome://htmlunitscripter/skin/record.png";
		},

		onMouseClick : function(event)
		{
			if(isRecording)
			{						
				var target = event.target;
				var targetAsString = target.toString();
				var linkIsInParent = false;
				var childNode;

				var url = urlBar.value;	
				if(theBeginUrl == "")
				{
					theBeginUrl = url;
				}


				theEndUrl = url;
			
				// There are a number of situations where there is something else inside the link, and the click event
				// reports that element instead of the link. So check if the parent node is the actual link.
				if(target.parentNode.href)
				{
					childNode = target;
					target = target.parentNode;
					linkIsInParent = true;
				}

				if(target.href)
				{												
					onHtmlLink(target, linkIsInParent, childNode);				
				}
				else if(target.type == "checkbox")
				{
					onCheckBox(target);				
				}
				else if(target.type == "radio")
				{
					onRadioButton(target);				
				}
				else if(target.type == "submit")
				{
					onSubmit(target);
				}			
				else if(targetAsString.indexOf("HTMLSelectElement") > -1)
				{
					// Ignore select lists. We are only interested in the option the user selected.
				}
				else if(targetAsString.indexOf("HTMLOptionElement") > -1)
				{
					onSelectOption(target);
				}
				// We don't know what the element is, but if it has an id, a name or a value, we can try to use it 
				// as a generic HtmlInput
				else if(targetAsString.indexOf("HTMLInputElement") >-1)
				{
					onHtmlInput(target);
				}

				// We can't figure how how to handle the element, so log the error if preferences indicate logging is requested
				else
				{
					if(!isSystemId(target.id))
					{				
						logMessage("Could not identify clicked element:" + target.toString(),LOGGING_VERBOSE);
					}
				}
			}
		},

		onChange : function(event)
		{
			if(isRecording)
			{			
				var textbox = document.getElementById("htmlunitScripterTextbox");
				var target = event.target;

				if(theBeginUrl == "")
				{
					theBeginUrl = urlBar.value;
				}


				if(target.type == "textarea")
				{
					onTextArea(target);				
				}
				else if(target.type == "text")
				{
					onText(target);
				}
				else if(target.type == "password")
				{
					onPassword(target);
				}
			}
		}
	};
}();

/*
 Event listeners here- need to be below main htmlunitScripter function
*/
//window.addEventListener("click", htmlunitScripter.onMouseClick, false);
window.addEventListener("mousedown", htmlunitScripter.onMouseClick, false);
window.addEventListener("change", htmlunitScripter.onChange, false);
window.addEventListener("DOMContentLoaded", htmlunitScripter.onPageLoad, false);

/* 
 onMouseDown functions (user click mouse on an item)
*/
function onHtmlLink(target, linkIsInParent, childNode)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.linkPreference");

	/*
	if href is first preference
	linkUseHref, linkUseIdOrName, linkUseText, linkUseParent

	else if id/name is first preference
	linkUseIdOrName, linkUseText, linkUseParent, linkUseHref

	else if text is first preference
	linkUseText, linkUseIdOrName, linkUseParent, linkUseHref

	else if XPath is first preference
	linkUseXPath

	*/

	if(prefString == "link-useText")
	{
		if(target.text && trim(target.text).length > 0)
		{
			linkUseText(target);	
		}
		else if(target.id)
		{
			linkUseId(target);
		}
		else if(target.name)
		{
			linkUseName(target);
		}
		else if(linkIsInParent)
		{
			linkUseParent(target, linkIsInParent, childNode);
		}
		else
		{
			linkUseHref(target);
		}
	}
	else if(prefString == "link-useHref")
	{
		if(target.href)
		{
			linkUseHref(target);
		}
		else if(target.id)
		{
			linkUseId(target);
		}
		else if(target.name)
		{
			linkUseName(target);
		}
		else if(linkIsInParent)
		{
			linkUseParent(target, linkIsInParent, childNode);
		}
		else if(target.text && trim(target.text).length > 0)
		{
			linkUseText(target);
		}
	}
	else if(prefString == "link-useXPath")
	{
		linkUseXPath(target);
	}
	else // Assume useIdOrName
	{
		if(target.id)
		{
			linkUseId(target);
		}
		else if(target.name)
		{
			linkUseName(target);
		}
		else if(target.text && trim(target.text).length > 0)
		{
			linkUseText(target);	
		}
		else if(linkIsInParent)
		{
			linkUseParent(target, linkIsInParent, childNode);
		}
		else
		{
			linkUseHref(target);
		}
	}

} // End onHtmlLink()

function linkUseText(target)
{
	var targetAsString = target.toString();
	var textbox = document.getElementById("htmlunitScripterTextbox");
	var url = urlBar.value;		

	var nextNum = getNextNum();					
	var nextNextNum = getNextNum();					
		
	var theCode = addSavePagesStatement(url);	
	theCode += tabs + "List<HtmlAnchor> anchors" + nextNum + " =  page.getAnchors();\n"
	theCode += tabs + "HtmlAnchor link" + nextNextNum + " = null;\n"
	theCode += tabs + "for(HtmlAnchor anchor: anchors" + nextNum + ")\n";
	theCode += tabs + "{\n";
	theCode += tabs + "     if(anchor.asText().indexOf(\"" + trim(target.text) + "\") > -1 )\n";
	theCode += tabs + "     {\n";
	theCode += tabs + "          link" + nextNextNum + " = anchor;\n";
	theCode += tabs + "          break;\n";
	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "page = link" + nextNextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function linkUseId(target)
{
	var targetAsString = target.toString();
	var textbox = document.getElementById("htmlunitScripterTextbox");
	var url = urlBar.value;	

	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);	
	theCode += tabs + "HtmlAnchor anchor" + nextNum + " = (HtmlAnchor) page.getElementById(\"" + target.id + "\");\n";
	theCode += tabs + "page = anchor" + nextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function linkUseName(target)
{
	var targetAsString = target.toString();
	var textbox = document.getElementById("htmlunitScripterTextbox");
	var url = urlBar.value;	

	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "HtmlAnchor anchor" + nextNum + " = (HtmlAnchor) page.getElementByName(\"" + target.name + "\");\n";
	theCode += tabs + "page = anchor" + nextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function linkUseParent(target, linkIsInParent, childNode)
{
	var targetAsString = target.toString();
	var textbox = document.getElementById("htmlunitScripterTextbox");
	var url = urlBar.value;		

	// Useful for when the clicked element (the child here) is an image, the parent href (the target here) is the actual link,
	// and the parent has neither an id nor a name to identify it.
	if(childNode.toString().indexOf("HTMLImageElement") > -1)
	{						
		var nextNum = getNextNum();
		var iterableNum = getNextNum();
		var iteratorNum = getNextNum();

		var theCode = addSavePagesStatement(url);
		theCode += tabs + "HtmlElement element" + nextNum + " = null;\n";
		theCode += tabs + "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
		theCode += tabs + "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
		theCode += tabs + "while(i" + iteratorNum + ".hasNext())\n";
		theCode += tabs + "{\n";
		theCode += tabs + "     HtmlElement anElement = i" + iteratorNum + ".next();\n";
		theCode += tabs + "     if(anElement instanceof HtmlImage)\n";
		theCode += tabs + "     {\n";
		theCode += tabs + "          HtmlImage input = (HtmlImage) anElement;\n";
		theCode += tabs + "          String[] elements = \"" + childNode.src + "\".split( \"/\" );\n";
        	theCode += tabs + "          if(input.getSrcAttribute().indexOf(elements[elements.length-1] )> -1 )\n";
		theCode += tabs + "          {\n";
		theCode += tabs + "               element" + nextNum + " = input;\n";
		theCode += tabs + "               break;\n";
		theCode += tabs + "          }\n";
		theCode += tabs + "     }\n";
		theCode += tabs + "}\n";
		theCode += tabs + "page = element" + nextNum + ".click();\n";
		anchorBuffer = theCode + "\n";
	}
}

function linkUseHref(target)
{
	var targetAsString = target.toString();
	var url = urlBar.value;	

	var nextNum = getNextNum();
	var listNum = getNextNum();
	var stringAnchorToFindNum = getNextNum();
	var stringElementsNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "HtmlAnchor theAnchor" + nextNum + " = null;\n";
	theCode += tabs + "List<HtmlAnchor> anchors" + listNum + " = page.getAnchors();\n";
	theCode += tabs + "String anchorToFind" + stringAnchorToFindNum + " = URLDecoder.decode(\"" + target.href + "\",\"utf-8\");\n";
	theCode += tabs + "\n";          				
	theCode += tabs + "for(HtmlAnchor anchor: anchors" + listNum + ")\n";		
	theCode += tabs + "{\n";	 
	theCode += tabs + "     String href = anchor.getHrefAttribute();\n";
        theCode += tabs + "\n";            
        theCode += tabs + "     if(href.startsWith(\"..\") )\n";
        theCode += tabs + "     {\n";
        theCode += tabs + "          href = href.substring(2);\n";
        theCode += tabs + "     }\n";
        theCode += tabs + "\n";            
        theCode += tabs + "     if(href.length() > 1 && anchorToFind" + stringAnchorToFindNum + ".indexOf(href) > -1)\n";	
	theCode += tabs + "\n";
	theCode += tabs + "     {\n";
	theCode += tabs + "          theAnchor" + nextNum + " = anchor;\n";
 	theCode += tabs + "          break;\n";
	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "page = theAnchor" + nextNum + ".click();\n";
		
	anchorBuffer = theCode + "\n";
}

function linkUseXPath(target)
{
	var url = urlBar.value;	

	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,false);

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";
        theCode += tabs + "HtmlElement element" + elementNum + " = elements" + listNum + ".get(0);\n";
        theCode += tabs + "page = element" + elementNum + ".click();\n";
	
	anchorBuffer = theCode + "\n";
}

function onCheckBox(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementPreference");

	if(prefString == "element-useValue")
	{
		if(target.value && target.value != "on")		
			checkboxByValue(target);
		else
		{			
			logMessage("Error: Value attribute unavailable for checkbox. Defaulting to XPath",LOGGING_ERROR);
			checkboxByXPath(target);
		}	
	}
	else if(prefString == "element-useIdOrName")
	{
		if(target.id)		
			checkboxById(target);
		else if(target.name)
			checkboxByName(target);	
		else
		{			
			logMessage("Error: Id and name attributes unavailable for checkbox. Defaulting to XPath", LOGGING_ERROR);
			checkboxByXPath(target);
		}
	}
	else // Default- use XPath
	{
		checkboxByXPath(target);
	}
} // End onCheckBox()

function checkboxByValue(target)
{ 					
	var nextNum = getNextNum();
	var iterableNum = getNextNum();
	var iteratorNum = getNextNum();

	var theCode = tabs + "HtmlInput checkbox" + nextNum + " = null;\n";	
	theCode += tabs + "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
	theCode += tabs + "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
	theCode += tabs + "while(i" + iteratorNum + ".hasNext())\n";
	theCode += tabs + "{\n";
 	theCode += tabs + "     HtmlElement element = i" + iteratorNum + ".next();\n";
 	theCode += tabs + "     if(element instanceof HtmlInput)\n";
 	theCode += tabs + "     {\n";
	theCode += tabs + "          HtmlInput input = (HtmlInput) element;\n";
	theCode += tabs + "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
	theCode += tabs + "          {\n";
	theCode += tabs + "               checkbox" + nextNum + " = input;\n";
	theCode += tabs + "               break;\n";
	theCode += tabs + "          }\n";
 	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "checkbox" + nextNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function checkboxById(target)
{
	var nextNum = getNextNum();					
		
	var theCode = tabs + "HtmlInput checkbox" + nextNum + " = (HtmlInput) page.getElementById(\"" + target.id + "\");\n";
	theCode += tabs + "checkbox" + nextNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function checkboxByName(target)
{
	var nextNum = getNextNum();					
		
	var theCode = tabs + "HtmlInput checkbox" + nextNum + " = (HtmlInput) page.getElementByName(\"" + target.name + "\");\n";
	theCode += tabs + "checkbox" + nextNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function checkboxByXPath(target)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";
        theCode += tabs + "HtmlInput checkbox" + elementNum + " = (HtmlInput) elements" + listNum + ".get(0);\n";
        theCode += tabs + "checkbox" + elementNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}


function onRadioButton(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementPreference");

	if(prefString == "element-useValue")
	{
		if(target.value)		
			radioButtonByValue(target);
		else
		{			
			logMessage("Error: Value attribute unavailable for radio button. Defaulting to XPath", LOGGING_ERROR);
			radioButtonByXPath(target);
		}
	}
	else if(prefString == "element-useIdOrName")
	{
		if(target.id)		
			radioButtonById(target);
		else if(target.name)
			radioButtonByName(target);
		else
		{			
			logMessage("Error: Id and name attributes unavailable for radio button. Defaulting to XPath", LOGGING_ERROR);
			radioButtonByXPath(target);
		}
	}
	else // Default- use XPath
	{
		radioButtonByXPath(target);
	}
} // End onRadioButton()

function radioButtonByValue(target)
{
	var nextNum = getNextNum();		
	var iterableNum = getNextNum();
	var iteratorNum = getNextNum();
	
	theCode = tabs + "HtmlRadioButtonInput radioButton" + nextNum + " = null;\n";
	theCode += tabs + "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
	theCode += tabs + "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
	theCode += tabs + "while(i" + iteratorNum + ".hasNext())\n";
	theCode += tabs + "{\n";
 	theCode += tabs + "     HtmlElement element = i" + iteratorNum + ".next();\n";
 	theCode += tabs + "     if(element instanceof HtmlRadioButtonInput)\n";
 	theCode += tabs + "     {\n";
	theCode += tabs + "          HtmlRadioButtonInput input = (HtmlRadioButtonInput) element;\n";
	theCode += tabs + "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
	theCode += tabs + "          {\n";
	theCode += tabs + "               radioButton" + nextNum + " = input;\n";
	theCode += tabs + "               break;\n";
	theCode += tabs + "          }\n";
 	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "radioButton" + nextNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function radioButtonById(target)
{
	var listNum = getNextNum();
	var radioButtonNum = getNextNum();					
		
	var theCode = tabs + "List<HtmlElement> radioButtons" + listNum + " = page.getElementsByIdAndOrName(\"" + target.id +  "\");\n";
        theCode += tabs + "HtmlInput radioButton" + radioButtonNum + " = null;\n";
        theCode += tabs + "for(HtmlElement element: radioButtons" + listNum + ")\n";
        theCode += tabs + "{\n";
        theCode += tabs + "     HtmlInput inputElement = (HtmlInput) element;\n";
        theCode += tabs + "     if( \"" + target.value + "\".equals( inputElement.getValueAttribute() ) )\n";
        theCode += tabs + "     {\n";
        theCode += tabs + "          radioButton" + radioButtonNum + " = inputElement;\n";
        theCode += tabs + "     }\n";
        theCode += tabs + "}\n";
	theCode += tabs + "radioButton" + radioButtonNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function radioButtonByName(target)
{
	var listNum = getNextNum();
	var radioButtonNum = getNextNum();					
		
	var theCode = tabs + "List<HtmlElement> radioButtons" + listNum + " = page.getElementsByIdAndOrName(\"" + target.name +  "\");\n";
        theCode += tabs + "HtmlInput radioButton" + radioButtonNum + " = null;\n";
        theCode += tabs + "for(HtmlElement element: radioButtons" + listNum + ")\n";
        theCode += tabs + "{\n";
        theCode += tabs + "     HtmlInput inputElement = (HtmlInput) element;\n";
        theCode += tabs + "     if( \"" + target.value + "\".equals( inputElement.getValueAttribute() ) )\n";
        theCode += tabs + "     {\n";
        theCode += tabs + "          radioButton" + radioButtonNum + " = inputElement;\n";
        theCode += tabs + "     }\n";
        theCode += tabs + "}\n";
	theCode += tabs + "radioButton" + radioButtonNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function radioButtonByXPath(target)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";
    	theCode += tabs + "HtmlInput radioButton" + elementNum + " = (HtmlInput) elements" + listNum + ".get(0);\n";
    	theCode += tabs + "radioButton" + elementNum + ".click();\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function onSubmit(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementPreference");
	var url = urlBar.value;	

	if(prefString == "element-useValue")
	{
		if(target.value)		
			submitByValue(target, url);
		else
		{			
			logMessage("Error: Value attribute unavailable for submit button. Defaulting to XPath", LOGGING_ERROR);
			submitByXPath(target,url);
		}

	}
	else if(prefString == "element-useIdOrName")
	{			
		if(target.id)		
			submitById(target,url);
		else if(target.name)
			submitByName(target,url);
		else
		{			
			logMessage("Error: Id and name attributes unavailable for submit button. Defaulting to XPath", LOGGING_ERROR);
			submitByXPath(target,url);
		}
	}
	else
	{
		submitByXPath(target,url);
	}
} // End onSubmit()

function submitByValue(target, url)
{
	var nextNum = getNextNum();
	var iterableNum = getNextNum();
	var iteratorNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "HtmlSubmitInput submitButton" + nextNum + " = null;\n";
	theCode += tabs + "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
	theCode += tabs + "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
	theCode += tabs + "while(i" + iteratorNum + ".hasNext())\n";
	theCode += tabs + "{\n";
 	theCode += tabs + "     HtmlElement element = i" + iteratorNum + ".next();\n";
 	theCode += tabs + "     if(element instanceof HtmlSubmitInput)\n";
 	theCode += tabs + "     {\n";
	theCode += tabs + "          HtmlSubmitInput input = (HtmlSubmitInput) element;\n";
	theCode += tabs + "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
	theCode += tabs + "          {\n";
	theCode += tabs + "               submitButton" + nextNum + " = input;\n";
	theCode += tabs + "               break;\n";
	theCode += tabs + "          }\n";
 	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "page = submitButton" + nextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function submitById(target,url)
{
	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	
	theCode += tabs + "HtmlSubmitInput submitButton" + nextNum + " = (HtmlSubmitInput) page.getElementById(\"" + target.id + "\");";
	theCode += tabs + "\n";
	theCode += tabs + "page = submitButton" + nextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function submitByName(target,url)
{
	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	
	theCode += tabs + "HtmlSubmitInput submitButton" + nextNum + " = (HtmlSubmitInput) page.getElementByName(\"" + target.name + "\");";
	theCode += tabs + "\n";
	theCode += tabs + "page = submitButton" + nextNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function submitByXPath(target,url)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";
    	theCode += tabs + "HtmlSubmitInput submitButton" + elementNum + " = (HtmlSubmitInput) elements" + listNum + ".get(0);\n";
    	theCode += tabs + "page = submitButton" + elementNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

function onSelectOption(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementWithoutValuePreference");
	var selectList = target.parentNode;	

	if(prefString == "element-useIdOrName")
	{
		if(selectList.id)		
			selectOptionById(target);
		else if(selectList.name)
			selectOptionByName(target);
		else
		{
			logMessage("Error: Id and name attributes unavailable for select list. Defaulting to XPath", LOGGING_ERROR);
			selectOptionByXPath(target);
		}
	}
	else
	{
		selectOptionByXPath(target);
	}
} // End onSelectOption

function selectOptionById(target)
{
	var selectList = target.parentNode;	
	var nextNum = getNextNum();
	var optionsNum = getNextNum();
	var theOptionNum = getNextNum();
	
	var theCode = tabs + "HtmlSelect selectField" + nextNum + " = (HtmlSelect) page.getElementById(\"" + selectList.id + "\");\n";		
	theCode += tabs + "List<HtmlOption> options" + optionsNum + " = selectField" + nextNum + ".getOptions();\n";
	theCode += tabs + "HtmlOption theOption" + theOptionNum + " = null;\n";
	theCode += tabs + "for(HtmlOption option: options" + optionsNum + ")\n";
	theCode += tabs + "{\n";
	theCode += tabs + "     if(option.getText().equals(\"" + target.text + "\") )\n";
	theCode += tabs + "     {\n";
	theCode += tabs + "          theOption" + theOptionNum + " = option;\n";
	theCode += tabs + "          break;\n";
	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "selectField" + nextNum + ".setSelectedAttribute(theOption" + theOptionNum + ", true );\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function selectOptionByName(target)
{
	var selectList = target.parentNode;
	var nextNum = getNextNum();
	var optionsNum = getNextNum();
	var theOptionNum = getNextNum();
	
	var theCode = tabs + "HtmlSelect selectField" + nextNum + " = (HtmlSelect) page.getElementByName(\"" + selectList.name + "\");\n";
	theCode += tabs + "List<HtmlOption> options" + optionsNum + " = selectField" + nextNum + ".getOptions();\n";
	theCode += tabs + "HtmlOption theOption" + theOptionNum + " = null;\n";
	theCode += tabs + "for(HtmlOption option: options" + optionsNum + ")\n";
	theCode += tabs + "{";
	theCode += tabs + "     if(option.getText().equals(\"" + target.text + "\") )\n";
	theCode += tabs + "     {\n";
	theCode += tabs + "          theOption" + theOptionNum + " = option;\n";
	theCode += tabs + "          break;\n";
	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "selectField" + nextNum + ".setSelectedAttribute(theOption" + theOptionNum + ", true );\n";
	
	codeBuffer = codeBuffer + theCode + "\n";
}

function selectOptionByXPath(target)
{
	var selectList = target.parentNode;
	var listNum = getNextNum();
	var elementNum = getNextNum();
	var optionsNum = getNextNum();
	var theOptionNum = getNextNum();

	var xPath = makeXPath(selectList, false);
	//var lastSlash = xPath.lastIndexOf("/");
	//var selectListXPath = xPath.substring(0,lastSlash);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";        
	theCode += tabs + "HtmlSelect selectField" + elementNum + " = (HtmlSelect) elements" + listNum + ".get(0);\n";		

	theCode += tabs + "List<HtmlOption> options" + optionsNum + " = selectField" + elementNum + ".getOptions();\n";
	theCode += tabs + "HtmlOption theOption" + theOptionNum + " = null;\n";
	theCode += tabs + "for(HtmlOption option: options" + optionsNum + ")\n";
	theCode += tabs + "{";
	theCode += tabs + "     if(option.getText().equals(\"" + target.text + "\") )\n";
	theCode += tabs + "     {\n";
	theCode += tabs + "          theOption" + theOptionNum + " = option;\n";
	theCode += tabs + "          break;\n";
	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "selectField" + elementNum + ".setSelectedAttribute(theOption" + theOptionNum + ", true );\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function onHtmlInput(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementPreference");
	var url = urlBar.value;	

	var foundTextFieldType = false;
	for (i in textFieldTypes) 
	{ 
   		if(textFieldTypes[i] == target.type)
		{
			foundTextFieldType = true;
			break;
		}
	}		

	// We don't ever want this to accidentally fire for text fields, for the case where neither the id nor the name was set on the text field. In
	// this case, it would try to pick up the value inside the text field, which could vary according to what the user typed.
	if(!foundTextFieldType)
	{
		if(prefString == "element-useIdOrName")
		{
			if(target.id)			
				htmlInputById(target,url);
			else if(target.name)
				htmlInputByName(target,url);
			else
			{				
				logMessage("Error: Id and name attributes unavailable for input. Defaulting to XPath", LOGGING_ERROR);
				htmlInputByXPath(target,url);
			}
		}
		else if(prefString == "element-useValue")
		{
			if(target.value)			
				htmlInputByValue(target,url);
			else
			{				
				logMessage("Error: Value attribute unavailable for input. Defaulting to XPath", LOGGING_ERROR);
				htmlInputByXPath(target,url);
			}
		}
		else
		{
			htmlInputByXPath(target,url);
		}
	}
	
} // End onHtmlInput

function htmlInputById(target, url)
{
	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "HtmlElement theElement" + nextNum + " = (HtmlElement) page.getElementById(\"" + target.id + "\");";
	theCode += tabs + "\n";
	theCode += tabs + "page = theElement" + nextNum + ".click();\n";
	anchorBuffer = anchorBuffer + theCode + "\n";
}

function htmlInputByName(target,url)
{
	var nextNum = getNextNum();

	var theCode = addSavePagesStatement(url);		
	theCode += tabs + "HtmlElement theElement" + nextNum + " = (HtmlElement) page.getElementByName(\"" + target.name + "\");";
	theCode += tabs + "\n";
	theCode += tabs + "page = theElement" + nextNum + ".click();\n";
	anchorBuffer = anchorBuffer + theCode + "\n";
}

function htmlInputByValue(target,url)
{
	var nextNum = getNextNum();		
	var iterableNum = getNextNum();
	var iteratorNum = getNextNum();

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "HtmlInput theElement" + nextNum + " = null;\n";
	theCode += tabs + "Iterable<HtmlElement> iterable" + iterableNum + " = page.getAllHtmlChildElements();\n";
	theCode += tabs + "Iterator<HtmlElement> i" + iteratorNum + " = iterable" + iterableNum + ".iterator();\n";
	theCode += tabs + "while(i" + iteratorNum + ".hasNext())\n";
	theCode += tabs + "{\n";
 	theCode += tabs + "     HtmlElement element = i" + iteratorNum + ".next();\n";
	theCode += tabs + "     if(element instanceof HtmlInput)\n";
  	theCode += tabs + "     {\n";
	theCode += tabs + "          HtmlInput input = (HtmlInput) element;\n";
	theCode += tabs + "          if(\"" + target.value + "\".equals(input.getValueAttribute() ) )\n";
    	theCode += tabs + "          {\n";
    	theCode += tabs + "               theElement" + nextNum + " = input;\n";
    	theCode += tabs + "               break;\n";
    	theCode += tabs + "          }\n";
  	theCode += tabs + "     }\n";
	theCode += tabs + "}\n";
	theCode += tabs + "page = theElement" + nextNum + ".click();\n";
	anchorBuffer = anchorBuffer + theCode + "\n";
}

function htmlInputByXPath(target,url)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = addSavePagesStatement(url);
	theCode += tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";
    	theCode += tabs + "HtmlInput input" + elementNum + " = (HtmlInput) elements" + listNum + ".get(0);\n";
    	theCode += tabs + "page = input" + elementNum + ".click();\n";
	anchorBuffer = theCode + "\n";
}

/*
 Onchange events (user adding text via keyboard)
*/
function onTextArea(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementWithoutValuePreference");
				
	if(prefString == "element-useIdOrName")
	{
		if(target.id)
		{
			if( !isSystemId(target.id) )
				textAreaById(target);
		}		
		else if(target.name)
			textAreaByName(target);
		else
		{			
			logMessage("Error: Id and name attributes unavailable for textarea. Defaulting to XPath", LOGGING_ERROR);
			textAreaByXPath(target);
		}
	}
	else
	{
		textAreaByXPath(target);
	}
} // End onTextArea

function textAreaById(target)
{
	var nextNum = getNextNum();					
		
	var theCode = tabs + "HtmlTextArea textArea" + nextNum + " = (HtmlTextArea) page.getElementById(\"" + target.id  + "\");\n";
	theCode += tabs + "textArea" + nextNum + ".setTextContent(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function textAreaByName(target)
{
	var nextNum = getNextNum();
		
	var theCode = tabs + "HtmlTextArea textArea" + nextNum + " = (HtmlTextArea) page.getElementByName(\"" + target.name  + "\");\n";
	theCode += tabs + "textArea" + nextNum + ".setTextContent(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function textAreaByXPath(target)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,false);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";        
	theCode += tabs + "HtmlTextArea textArea" + elementNum + " = (HtmlTextArea) elements" + listNum + ".get(0);\n";		
	theCode += tabs + "textArea" + elementNum + ".setTextContent(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function onText(target)
{
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementWithoutValuePreference");
			
	if(prefString == "element-useIdOrName")
	{
		if(target.id)
		{
			if( !isSystemId(target.id))		
				textById(target);
		}
		else if(target.name)
			textByName(target);
		else
		{			
			logMessage("Error: Id and name attributes unavailable for textbox. Defaulting to XPath", LOGGING_ERROR);
			textByXPath(target);
		}
	}
	else
	{
		textByXPath(target);
	}
} // End onText()

function textById(target)
{
	var nextNum = getNextNum();					
				
	var theCode = tabs + "HtmlTextInput textField" + nextNum + " = (HtmlTextInput) page.getElementById(\"" + target.id  + "\");\n";
	theCode += tabs + "textField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function textByName(target)
{
	var nextNum = getNextNum();					
	
	var theCode = tabs + "HtmlTextInput textField" + nextNum + " = (HtmlTextInput) page.getElementByName(\"" + target.name  + "\");\n";
	theCode += tabs + "textField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function textByXPath(target)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";        
	theCode += tabs + "HtmlTextInput textField" + elementNum + " = (HtmlTextInput) elements" + listNum + ".get(0);\n";		
	theCode += tabs + "textField" + elementNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function onPassword(target)
{			
	var prefString = prefManager.getCharPref("extensions.htmlunitscripter.elementWithoutValuePreference");
	
	if(prefString == "element-useIdOrName")
	{
		if(target.id)
		{
			if(!isSystemId(target.id))
				passwordById(target);
		}
		else if(target.name)
			passwordByName(target);
		else
		{			
			logMessage("Error: Id and name attributes unavailable for password box. Defaulting to XPath", LOGGING_ERROR);
			passwordByXPath(target);
		}
	}
	else
	{
		passwordByXPath(target);
	}
} // End onPassword()

function passwordById(target)
{
	var nextNum = getNextNum();					
	var theCode = tabs + "HtmlPasswordInput passwordField" + nextNum + " = (HtmlPasswordInput) page.getElementById(\"" + target.id  + "\");\n";
	theCode += tabs + "passwordField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function passwordByName(target)
{
	var nextNum = getNextNum();					
	var theCode = tabs + "HtmlPasswordInput passwordField" + nextNum + " = (HtmlPasswordInput) page.getElementByName(\"" + target.name  + "\");\n";
	theCode += tabs + "passwordField" + nextNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

function passwordByXPath(target)
{
	var listNum = getNextNum();
	var elementNum = getNextNum();

	var xPath = makeXPath(target,true);

	var theCode = tabs + "List<HtmlElement> elements" + listNum + " = (List<HtmlElement>) page.getByXPath(\"" + xPath + "\");\n";        
	theCode += tabs + "HtmlPasswordInput passwordField" + elementNum + " = (HtmlPasswordInput) elements" + listNum + ".get(0);\n";		
	theCode += tabs + "passwordField" + elementNum + ".setValueAttribute(\"" + target.value + "\");\n";
	codeBuffer = codeBuffer + theCode + "\n";
}

/*
 Auxilary functions
*/


function logMessage(aMessage, logLevel)
{
	var loggingPref = prefManager.getIntPref("extensions.htmlunitscripter.logging");   
	if(loggingPref >= logLevel)
		ConsoleService.logStringMessage(aMessage);
}

function trim(theString) 
{
    return theString.replace(/^\s*/, "").replace(/\s*$/, "");
}


function getNextNum()
{
	var variableAppendVal = variableAppendBox.value;
	var currentVariableNum = variableNumTextBox.value;
	var nextVariableNum = currentVariableNum;
	nextVariableNum++;
	variableNumTextBox.value = nextVariableNum;
	currentVariableNum +=  variableAppendVal;
	return currentVariableNum;
}


function isSystemId(theId)
{	
	var foundSystemId = false;
	for (i in idsToIgnore) 
	{ 
   		if(idsToIgnore[i] == theId)
		{
			foundSystemId = true;
			break;
		}
	}

	return foundSystemId;
}

function addProgressStatement(additionalText)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	if(addStatement)
	{
		var textbox = document.getElementById("htmlunitScripterTextbox");
		textbox.value = textbox.value + tabs + "System.out.println(\"" + additionalText + "\");\n\n";
	}
}

function addSavePagesStatement(url)
{
	var addStatement = prefManager.getBoolPref("extensions.htmlunitscripter.printProgress");

	var theCode = "";
	if(addStatement)
	{
		theCode = tabs + "if( savePagesLocally )\n";
		theCode += tabs + "{\n";
		theCode += tabs + "     url = \"" + url + "\";\n";  
		theCode += tabs + "     String fullPath = pageSaver.savePageLocally(page, url);\n";
		theCode += tabs + "     System.out.println(\"Page with title '\" + page.getTitleText() + \"' saved to \" + fullPath);\n";
		theCode += tabs + "}\n";
		theCode += "\n";
	}

	return theCode;
}

function makeXPath(target, useTargetType)
{
	var tagName = target.tagName.toLowerCase();

	var query;
	if(useTargetType)	
		query = "(//" + tagName + "[@type = '" + target.type + "'])";
	else
		query = "(//" + tagName + ")";

	var result = content.document.evaluate(query, content.document.documentElement, null,
                 XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

	for (var i=0, len=result.snapshotLength; i < len; i++) 
	{
		if(target == result.snapshotItem(i))
		{
			query += "[" + (i+1) + "]";
		}    		
	}

	if(result.snapshotLength == 0)
	{				
		if(useTargetType)
		{
			logMessage("Attempting to run 2nd XPath query without type attribute", LOGGING_VERBOSE);			
			query = "(//" + tagName + ")";

			result = content.document.evaluate(query, content.document.documentElement, null,
                 		XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

			for (var i=0, len=result.snapshotLength; i < len; i++) 
			{
				if(target == result.snapshotItem(i))
				{
					query += "[" + (i+1) + "]";
					logMessage("2nd XPath query: element was found, but type attribute is unavailable; query is " + query, LOGGING_VERBOSE);
				}    		
			}
			
			if(result.snapshotLength == 0)
			{
				logMessage("Numbered element could not be found after 2nd XPath query; 2nd query was " + query, LOGGING_ERROR);		
				query = "";
			}		
		}
		else
		{		
			logMessage("Numbered element could not be found after XPath query; query was " + query, LOGGING_ERROR);			
			query = "";
		}		
	}
		

	return query;	
}



